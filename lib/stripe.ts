import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// Client-side Stripe instance
let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!)
  }
  return stripePromise
}

// Stripe webhook verification
export const verifyWebhookSignature = (
  body: string,
  signature: string,
  secret: string
) => {
  return stripe.webhooks.constructEvent(body, signature, secret)
}

// Format price for Stripe (convert to cents)
export const formatPriceForStripe = (price: number): number => {
  return Math.round(price * 100)
}

// Format price for display (convert from cents)
export const formatPriceFromStripe = (price: number): number => {
  return price / 100
}

// Create payment intent
export const createPaymentIntent = async (
  amount: number,
  currency: string = 'usd',
  metadata?: Record<string, string>
) => {
  return await stripe.paymentIntents.create({
    amount: formatPriceForStripe(amount),
    currency,
    metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  })
}

// Create customer
export const createCustomer = async (
  email: string,
  name?: string,
  metadata?: Record<string, string>
) => {
  return await stripe.customers.create({
    email,
    name,
    metadata,
  })
}

// Retrieve customer
export const retrieveCustomer = async (customerId: string) => {
  return await stripe.customers.retrieve(customerId)
}

// Create checkout session
export const createCheckoutSession = async (params: {
  customer_email: string
  line_items: Array<{
    price_data: {
      currency: string
      product_data: {
        name: string
        images?: string[]
        metadata?: Record<string, string>
      }
      unit_amount: number
    }
    quantity: number
  }>
  mode: 'payment' | 'subscription'
  success_url: string
  cancel_url: string
  metadata?: Record<string, string>
}) => {
  return await stripe.checkout.sessions.create(params)
}

export default stripe
