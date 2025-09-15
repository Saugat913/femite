import { NextRequest, NextResponse } from 'next/server'
import { query, getClient } from '@/lib/db'
import { getSession } from '@/lib/auth'

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

    const body = await request.json()
    const { productId } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Get user's cart
    const cartResult = await client.query(
      'SELECT id FROM carts WHERE user_id = $1',
      [session.userId]
    )

    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      )
    }

    const cartId = cartResult.rows[0].id

    // Remove item from cart
    const deleteResult = await client.query(
      'DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartId, productId]
    )

    if (deleteResult.rowCount === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json(
        { error: 'Item not found in cart' },
        { status: 404 }
      )
    }

    await client.query('COMMIT')

    // Get updated cart
    const cartItemsResult = await client.query(`
      SELECT 
        ci.id as item_id,
        ci.product_id,
        ci.quantity,
        p.name,
        p.price,
        p.image_url,
        p.stock
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.cart_id = $1
      ORDER BY ci.id DESC
    `, [cartId])

    const items = cartItemsResult.rows.map(row => ({
      id: row.item_id,
      productId: row.product_id,
      name: row.name,
      price: parseFloat(row.price),
      image: row.image_url,
      quantity: row.quantity,
      stock: row.stock
    }))

    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

    return NextResponse.json({
      success: true,
      data: {
        items,
        total,
        itemCount
      },
      message: 'Item removed from cart'
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('POST /api/cart/remove error:', error)
    return NextResponse.json(
      { error: 'Failed to remove item from cart' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
