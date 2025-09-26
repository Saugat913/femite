import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { query } from '@/lib/db'
import { emailService } from '@/lib/email-service'
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

    // Send order confirmation emails
    try {
      // Get user email
      const userResult = await query('SELECT email FROM users WHERE id = $1', [userId])
      if (userResult.rows.length > 0) {
        const userEmail = userResult.rows[0].email
        
        // Prepare order data for email
        const orderData = {
          orderId,
          orderNumber: orderId.slice(-8).toUpperCase(), // Use last 8 chars as order number
          customerEmail: userEmail,
          customerName: session.customer_details?.name || userEmail.split('@')[0],
          orderDate: new Date().toISOString(),
          total: totalAmount,
          shippingAddress,
          paymentStatus: 'paid',
          estimatedDelivery: '5-7 business days',
          items: lineItems.data.map(item => {
            const product = item.price?.product as Stripe.Product
            return {
              name: product.name,
              quantity: item.quantity || 1,
              price: item.amount_total ? item.amount_total / 100 : 0,
              size: product.metadata?.size || undefined
            }
          })
        }
        
        // Send customer confirmation email
        await emailService.sendOrderConfirmation(userEmail, orderData)
        console.log(`Order confirmation email sent to ${userEmail}`)
        
        // Send admin notification email
        await emailService.sendAdminOrderNotification(orderData)
        console.log('Admin order notification sent')
      }
    } catch (emailError) {
      console.error('Failed to send order confirmation emails:', emailError)
      // Don't fail the webhook if email sending fails
    }

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

    // Additional payment confirmation could be sent here if needed
    console.log(`Payment confirmation processed for payment intent: ${paymentIntent.id}`)
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

    // Send payment failure notification to admin
    console.log(`Payment failed for payment intent: ${paymentIntent.id} - admin should be notified`)
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}
