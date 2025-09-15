import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user's cart
    const cartResult = await query(
      'SELECT id FROM carts WHERE user_id = $1',
      [session.userId]
    )

    if (cartResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Cart not found' },
        { status: 404 }
      )
    }

    const cartId = cartResult.rows[0].id

    // Clear all items from cart
    await query(
      'DELETE FROM cart_items WHERE cart_id = $1',
      [cartId]
    )

    return NextResponse.json({
      success: true,
      data: {
        items: [],
        total: 0,
        itemCount: 0
      },
      message: 'Cart cleared successfully'
    })
  } catch (error) {
    console.error('POST /api/cart/clear error:', error)
    return NextResponse.json(
      { error: 'Failed to clear cart' },
      { status: 500 }
    )
  }
}
