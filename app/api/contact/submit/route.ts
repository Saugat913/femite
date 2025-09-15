import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (name.length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters long' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    if (subject.length < 3) {
      return NextResponse.json(
        { error: 'Subject must be at least 3 characters long' },
        { status: 400 }
      )
    }

    if (message.length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters long' },
        { status: 400 }
      )
    }

    // Create contact_messages table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed')),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE
      )
    `)

    // Create index for better performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC)
    `)

    // Insert contact message
    const id = uuidv4()
    await query(
      'INSERT INTO contact_messages (id, name, email, subject, message) VALUES ($1, $2, $3, $4, $5)',
      [id, name.trim(), email.toLowerCase(), subject.trim(), message.trim()]
    )

    // In a real application, you might want to send an email notification here
    // or integrate with a service like SendGrid, Mailgun, etc.

    return NextResponse.json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you within 24-48 hours.',
      data: { id }
    })
  } catch (error) {
    console.error('POST /api/contact/submit error:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    )
  }
}
