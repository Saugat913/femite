import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { query } from '@/lib/db'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-08-27.basil',
})

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic'
export const revalidate = 0

const formatPriceForStripe = (price: number) => Math.round(price * 100)

interface CheckoutItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
}

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getSession()
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { items, shipping_address, success_url, cancel_url } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Items are required' }, { status: 400 })
    }

    // Get user email from database
    const userResult = await query('SELECT email FROM users WHERE id = $1', [session.userId])
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userEmail = userResult.rows[0].email

    // Prepare line items for Stripe
    const lineItems = items.map((item: CheckoutItem) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : undefined,
          metadata: {
            product_id: item.id,
          },
        },
        unit_amount: formatPriceForStripe(item.price),
      },
      quantity: item.quantity,
    }))

    // Calculate total amount for metadata
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      line_items: lineItems,
      mode: 'payment',
      success_url: success_url || `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      metadata: {
        user_id: session.userId,
        total_amount: totalAmount.toString(),
        shipping_address: shipping_address ? JSON.stringify(shipping_address) : '',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        session_id: checkoutSession.id,
        url: checkoutSession.url,
      },
    })
  } catch (error) {
    console.error('POST /api/checkout/create-session error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
