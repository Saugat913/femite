import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { query } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent)
        break
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('Processing completed checkout session:', session.id)

    if (!session.metadata?.user_id) {
      console.error('No user_id in session metadata')
      return
    }

    // Create order in database
    const orderId = uuidv4()
    const userId = session.metadata.user_id
    const totalAmount = parseFloat(session.metadata.total_amount || '0')
    const shippingAddress = session.metadata.shipping_address || null

    // Get line items from the session
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price.product']
    })

    // Create the order
    await query(
      `INSERT INTO orders (
        id, user_id, total_amount, status, 
        stripe_session_id, shipping_address, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [orderId, userId, totalAmount, 'paid', session.id, shippingAddress]
    )

    // Create order items
    for (const item of lineItems.data) {
      const product = item.price?.product as Stripe.Product
      await query(
        `INSERT INTO order_items (
          id, order_id, product_id, product_name, 
          quantity, price, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          uuidv4(),
          orderId,
          product.metadata?.product_id || product.id,
          product.name,
          item.quantity,
          item.amount_total ? item.amount_total / 100 : 0
        ]
      )

      // Update product stock if product_id exists in metadata
      if (product.metadata?.product_id) {
        await query(
          'UPDATE products SET stock = GREATEST(stock - $1, 0) WHERE id = $2',
          [item.quantity, product.metadata.product_id]
        )
      }
    }

    console.log('Order created successfully:', orderId)

    // TODO: Send order confirmation email
    // TODO: Trigger order fulfillment process

  } catch (error) {
    console.error('Error handling checkout completion:', error)
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment succeeded:', paymentIntent.id)
    
    // Update order status if needed
    if (paymentIntent.metadata?.order_id) {
      await query(
        'UPDATE orders SET status = $1, stripe_payment_intent_id = $2 WHERE id = $3',
        ['paid', paymentIntent.id, paymentIntent.metadata.order_id]
      )
    }

    // TODO: Send payment confirmation
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment failed:', paymentIntent.id)
    
    // Update order status if needed
    if (paymentIntent.metadata?.order_id) {
      await query(
        'UPDATE orders SET status = $1, stripe_payment_intent_id = $2 WHERE id = $3',
        ['failed', paymentIntent.id, paymentIntent.metadata.order_id]
      )
    }

    // TODO: Send payment failure notification
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}
