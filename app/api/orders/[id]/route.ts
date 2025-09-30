import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'

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

    // Get order details with enhanced information
    const orderResult = await query(`
      SELECT 
        o.id,
        COALESCE(o.total_amount, o.total) as total,
        COALESCE(o.status_v2, o.status) as status,
        o.created_at,
        o.updated_at,
        o.user_id,
        o.stripe_session_id,
        o.stripe_payment_intent_id,
        o.shipping_address,
        o.tracking_number,
        o.notes
      FROM orders o
      WHERE o.id = $1 AND o.user_id = $2
    `, [orderId, session.userId])

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    const order = orderResult.rows[0]

    // Get order items
    const itemsResult = await query(`
      SELECT 
        oi.id,
        oi.quantity,
        oi.price,
        oi.product_id,
        COALESCE(oi.product_name, p.name) as name,
        p.image_url,
        p.description
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [orderId])

    const items = itemsResult.rows.map(item => ({
      id: item.id,
      productId: item.product_id,
      name: item.name,
      description: item.description,
      image: item.image_url,
      quantity: item.quantity,
      price: parseFloat(item.price),
      subtotal: parseFloat(item.price) * item.quantity
    }))

    // Payment information from order fields
    const payment = order.stripe_session_id ? {
      stripeSessionId: order.stripe_session_id,
      stripePaymentIntentId: order.stripe_payment_intent_id,
      method: 'stripe',
      status: order.status
    } : null

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        total: parseFloat(order.total),
        status: order.status,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        trackingNumber: order.tracking_number,
        notes: order.notes,
        shippingAddress: order.shipping_address ? JSON.parse(order.shipping_address) : null,
        items,
        payment,
        summary: {
          subtotal: items.reduce((sum, item) => sum + item.subtotal, 0),
          total: parseFloat(order.total),
          itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
        }
      }
    })
  } catch (error) {
    console.error('GET /api/orders/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to get order details' },
      { status: 500 }
    )
  }
}

// PUT /api/orders/[id] - Update order status (admin only in a real system)
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
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    const validStatuses = [
      'cart', 'pending_payment', 'payment_processing', 'paid', 
      'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
    ]

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Check if order exists and belongs to user
    const orderResult = await query(
      'SELECT id FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, session.userId]
    )

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Update order status
    const updateResult = await query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, status',
      [status, orderId]
    )

    const updatedOrder = updateResult.rows[0]

    return NextResponse.json({
      success: true,
      data: {
        id: updatedOrder.id,
        status: updatedOrder.status
      },
      message: 'Order status updated successfully'
    })
  } catch (error) {
    console.error('PUT /api/orders/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    )
  }
}
