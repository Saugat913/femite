import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { emailService } from '@/lib/email-service'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Create newsletter table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        active BOOLEAN NOT NULL DEFAULT true
      )
    `)

    // Check if already subscribed
    const existingResult = await query(
      'SELECT id, active FROM newsletter_subscriptions WHERE email = $1',
      [email.toLowerCase()]
    )

    let isNewSubscription = false
    
    if (existingResult.rows.length > 0) {
      const existing = existingResult.rows[0]
      if (existing.active) {
        return NextResponse.json(
          { error: 'Email is already subscribed to our newsletter' },
          { status: 409 }
        )
      } else {
        // Reactivate subscription
        await query(
          'UPDATE newsletter_subscriptions SET active = true, subscribed_at = now() WHERE id = $1',
          [existing.id]
        )
        isNewSubscription = true // Treat reactivation as new for email purposes
      }
    } else {
      // Add new subscription
      await query(
        'INSERT INTO newsletter_subscriptions (email) VALUES ($1)',
        [email.toLowerCase()]
      )
      isNewSubscription = true
    }
    
    // Send welcome email for new subscriptions
    if (isNewSubscription) {
      try {
        await emailService.sendNewsletterWelcome(email)
        console.log(`Newsletter welcome email sent to ${email}`)
      } catch (error) {
        console.error('Failed to send newsletter welcome email:', error)
        // Continue even if email fails - subscription is still recorded
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter! Thank you for joining our sustainable fashion community.'
    })
  } catch (error) {
    console.error('POST /api/newsletter/subscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    )
  }
}
