import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const orderId = params.id
    const body = await request.json()
    const { status, tracking_number, notes } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Define valid status transitions
    const validStatuses = [
      'pending', 'pending_payment', 'paid', 'processing', 
      'shipped', 'delivered', 'cancelled', 'failed'
    ]

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Check if order exists and belongs to user
    const orderResult = await query(
      'SELECT id, status, user_id FROM orders WHERE id = $1',
      [orderId]
    )

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const order = orderResult.rows[0]
    
    // For now, allow users to update their own orders (in production, restrict to admins)
    // In a real system, you'd check for admin role here
    if (order.user_id !== session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized to update this order' },
        { status: 403 }
      )
    }

    // Prevent invalid status transitions
    const currentStatus = order.status
    const invalidTransitions: Record<string, string[]> = {
      'delivered': ['pending', 'pending_payment', 'paid', 'processing', 'shipped'],
      'cancelled': ['paid', 'processing', 'shipped', 'delivered']
    }

    if (invalidTransitions[currentStatus]?.includes(status)) {
      return NextResponse.json(
        { error: `Cannot change status from ${currentStatus} to ${status}` },
        { status: 400 }
      )
    }

    // Update order status
    const updateFields = ['status = $2']
    const updateValues = [orderId, status]
    let paramCount = 2

    if (tracking_number && status === 'shipped') {
      paramCount++
      updateFields.push(`tracking_number = $${paramCount}`)
      updateValues.push(tracking_number)
    }

    if (notes) {
      paramCount++
      updateFields.push(`notes = $${paramCount}`)
      updateValues.push(notes)
    }

    const updateQuery = `
      UPDATE orders 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = $1 
      RETURNING id, status, tracking_number, notes, updated_at
    `

    const updateResult = await query(updateQuery, updateValues)
    const updatedOrder = updateResult.rows[0]

    // Create status history entry
    await query(`
      INSERT INTO order_status_history (id, order_id, status, notes, created_at)
      VALUES (gen_random_uuid(), $1, $2, $3, NOW())
    `, [orderId, status, notes || `Status changed to ${status}`])

    // TODO: Send notification email to customer about status change
    // TODO: Send SMS notification if phone number available
    // TODO: Create internal notification for order fulfillment team

    return NextResponse.json({
      success: true,
      data: {
        id: updatedOrder.id,
        status: updatedOrder.status,
        tracking_number: updatedOrder.tracking_number,
        notes: updatedOrder.notes,
        updated_at: updatedOrder.updated_at
      },
      message: `Order status updated to ${status}`
    })
  } catch (error) {
    console.error('PUT /api/orders/[id]/status error:', error)
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const orderId = params.id

    // Get order status history
    const historyResult = await query(`
      SELECT 
        osh.id,
        osh.status,
        osh.notes,
        osh.created_at,
        o.user_id
      FROM order_status_history osh
      JOIN orders o ON osh.order_id = o.id
      WHERE osh.order_id = $1 AND o.user_id = $2
      ORDER BY osh.created_at DESC
    `, [orderId, session.userId])

    if (historyResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found or no status history available' },
        { status: 404 }
      )
    }

    const statusHistory = historyResult.rows.map(row => ({
      id: row.id,
      status: row.status,
      notes: row.notes,
      timestamp: row.created_at
    }))

    return NextResponse.json({
      success: true,
      data: {
        order_id: orderId,
        status_history: statusHistory
      }
    })
  } catch (error) {
    console.error('GET /api/orders/[id]/status error:', error)
    return NextResponse.json(
      { error: 'Failed to get order status history' },
      { status: 500 }
    )
  }
}
