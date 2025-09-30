import { NextRequest, NextResponse } from 'next/server'
import { query, getClient } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/orders - Get user's orders
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Get user's orders with items
    const ordersResult = await query(`
      SELECT 
        o.id,
        COALESCE(o.total_amount, o.total) as total,
        COALESCE(o.status_v2, o.status) as status,
        o.created_at,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.id, o.total_amount, o.total, o.status_v2, o.status, o.created_at
      ORDER BY o.created_at DESC
      LIMIT $2 OFFSET $3
    `, [session.userId, limit, offset])

    const orders = []
    
    for (const order of ordersResult.rows) {
      // Get order items
      const itemsResult = await query(`
        SELECT 
          oi.id,
          oi.quantity,
          oi.price,
          oi.product_id,
          COALESCE(oi.product_name, p.name) as name,
          p.image_url
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = $1
      `, [order.id])

      const items = itemsResult.rows.map(item => ({
        id: item.id,
        productId: item.product_id,
        name: item.name,
        image: item.image_url,
        quantity: item.quantity,
        price: parseFloat(item.price)
      }))

      orders.push({
        id: order.id,
        total: parseFloat(order.total),
        status: order.status,
        createdAt: order.created_at,
        itemCount: parseInt(order.item_count),
        items
      })
    }

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) as total FROM orders WHERE user_id = $1',
      [session.userId]
    )

    const total = parseInt(countResult.rows[0].total)

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          hasMore: offset + orders.length < total
        }
      }
    })
  } catch (error) {
    console.error('GET /api/orders error:', error)
    return NextResponse.json(
      { error: 'Failed to get orders' },
      { status: 500 }
    )
  }
}

// POST /api/orders - Create new order from cart
export async function POST(request: NextRequest) {
  const client = await getClient()
  
  try {
    await client.query('BEGIN')
    
    const session = await getSession()
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user's cart and customer email
    const cartResult = await client.query(
      'SELECT id FROM carts WHERE user_id = $1',
      [session.userId]
    )

    // Get customer email
    const userResult = await client.query(
      'SELECT email FROM users WHERE id = $1',
      [session.userId]
    )
    const customerEmail = userResult.rows[0]?.email

    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      )
    }

    const cartId = cartResult.rows[0].id

    // Get cart items
    const cartItemsResult = await client.query(`
      SELECT 
        ci.product_id,
        ci.quantity,
        p.name,
        p.price,
        p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
    `, [cartId])

    if (cartItemsResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    const cartItems = cartItemsResult.rows

    // Check stock availability
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await client.query('ROLLBACK')
        return NextResponse.json(
          { error: `Insufficient stock for ${item.name}` },
          { status: 400 }
        )
      }
    }

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0)

    // Create order
    const orderId = uuidv4()
    await client.query(
      'INSERT INTO orders (id, user_id, total, status) VALUES ($1, $2, $3, $4)',
      [orderId, session.userId, total, 'pending_payment']
    )

    // Create order items and update stock
    for (const item of cartItems) {
      const orderItemId = uuidv4()
      
      // Add order item
      await client.query(
        'INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4, $5)',
        [orderItemId, orderId, item.product_id, item.quantity, item.price]
      )

      // Update product stock
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      )

      // Log inventory change
      const logId = uuidv4()
      await client.query(`
        INSERT INTO inventory_logs (id, product_id, change_type, quantity_change, previous_stock, new_stock, reference_id, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [logId, item.product_id, 'sold', -item.quantity, item.stock, item.stock - item.quantity, orderId, 'Order created'])
    }

    // Clear cart
    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId])

    await client.query('COMMIT')

    // Get created order
    const newOrderResult = await client.query(`
      SELECT 
        o.id,
        o.total,
        o.status,
        o.created_at
      FROM orders o
      WHERE o.id = $1
    `, [orderId])

    const order = newOrderResult.rows[0]

    // Send admin notification (don't block order creation if email fails)
    try {
      const { emailService } = await import('@/lib/email-service')
      await emailService.sendAdminOrderNotification({
        orderId: order.id,
        orderNumber: order.id.slice(0, 8), // Use first 8 chars as order number
        total: parseFloat(order.total),
        customerEmail,
        items: cartItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: parseFloat(item.price)
        }))
      })
      console.log('Admin notification sent for order:', order.id)
    } catch (error) {
      console.error('Failed to send admin notification for order:', order.id, error)
      // Don't fail the order creation if email fails
    }

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        total: parseFloat(order.total),
        status: order.status,
        createdAt: order.created_at,
        items: cartItems.map(item => ({
          productId: item.product_id,
          name: item.name,
          quantity: item.quantity,
          price: parseFloat(item.price)
        }))
      },
      message: 'Order created successfully'
    }, { status: 201 })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('POST /api/orders error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
