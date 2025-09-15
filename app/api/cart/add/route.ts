import { NextRequest, NextResponse } from 'next/server'
import { query, getClient } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

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
    const { productId, quantity = 1 } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      )
    }

    // Check if product exists and has sufficient stock
    const productResult = await client.query(
      'SELECT id, name, price, stock, image_url FROM products WHERE id = $1',
      [productId]
    )

    if (productResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const product = productResult.rows[0]

    if (product.stock < quantity) {
      await client.query('ROLLBACK')
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      )
    }

    // Get or create user's cart
    let cartResult = await client.query(
      'SELECT id FROM carts WHERE user_id = $1',
      [session.userId]
    )

    let cartId
    if (cartResult.rows.length === 0) {
      // Create new cart
      cartId = uuidv4()
      await client.query(
        'INSERT INTO carts (id, user_id) VALUES ($1, $2)',
        [cartId, session.userId]
      )
    } else {
      cartId = cartResult.rows[0].id
    }

    // Check if item already exists in cart
    const existingItemResult = await client.query(
      'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
      [cartId, productId]
    )

    if (existingItemResult.rows.length > 0) {
      // Update existing item quantity
      const existingItem = existingItemResult.rows[0]
      const newQuantity = existingItem.quantity + quantity

      if (product.stock < newQuantity) {
        await client.query('ROLLBACK')
        return NextResponse.json(
          { error: 'Insufficient stock for requested quantity' },
          { status: 400 }
        )
      }

      await client.query(
        'UPDATE cart_items SET quantity = $1 WHERE id = $2',
        [newQuantity, existingItem.id]
      )
    } else {
      // Add new item to cart
      const itemId = uuidv4()
      await client.query(
        'INSERT INTO cart_items (id, cart_id, product_id, quantity) VALUES ($1, $2, $3, $4)',
        [itemId, cartId, productId, quantity]
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
      message: 'Item added to cart'
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('POST /api/cart/add error:', error)
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
