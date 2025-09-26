import { NextRequest, NextResponse } from 'next/server'
import { query, getClient } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/cart - Get user's cart
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user's cart with items
    const result = await query(`
      SELECT 
        c.id as cart_id,
        ci.id as item_id,
        ci.product_id,
        ci.quantity,
        p.name,
        p.price,
        p.image_url,
        p.stock
      FROM carts c
      LEFT JOIN cart_items ci ON c.id = ci.cart_id
      LEFT JOIN products p ON ci.product_id = p.id
      WHERE c.user_id = $1
      ORDER BY ci.id DESC
    `, [session.userId])

    const items = result.rows
      .filter(row => row.product_id) // Filter out empty cart
      .map(row => ({
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
      }
    })
  } catch (error) {
    console.error('GET /api/cart error:', error)
    return NextResponse.json(
      { error: 'Failed to get cart' },
      { status: 500 }
    )
  }
}
