import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { query } from '@/lib/db'

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    // Get user session
    const userSession = await getSession()
    if (!userSession || !userSession.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Retrieve the Stripe session
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId)

    // Verify session belongs to current user
    if (stripeSession.metadata?.user_id !== userSession.userId) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Get order details from database with enhanced information
    const orderResult = await query(
      `SELECT 
        o.id, 
        COALESCE(o.total_amount, o.total) as total_amount, 
        COALESCE(o.status_v2, o.status) as status, 
        o.created_at,
        o.tracking_number,
        o.notes
      FROM orders o 
      WHERE o.stripe_session_id = $1`,
      [sessionId]
    )

    if (orderResult.rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = orderResult.rows[0]

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        total: parseFloat(order.total_amount),
        status: order.status,
        created_at: order.created_at,
        tracking_number: order.tracking_number,
        notes: order.notes,
        stripe_session: {
          id: stripeSession.id,
          payment_status: stripeSession.payment_status,
          amount_total: stripeSession.amount_total ? stripeSession.amount_total / 100 : 0,
        },
      },
    })
  } catch (error) {
    console.error('GET /api/checkout/session-details error:', error)
    return NextResponse.json({ error: 'Failed to fetch session details' }, { status: 500 })
  }
}
