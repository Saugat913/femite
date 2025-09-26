import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

// This endpoint is only for development testing
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Test endpoint not available in production' }, { status: 404 })
  }

  try {
    const { type, email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    let result = false
    let message = ''

    switch (type) {
      case 'verification':
        result = await emailService.sendVerificationEmail(email, 'test-token-123')
        message = 'Email verification test sent'
        break
        
      case 'newsletter':
        result = await emailService.sendNewsletterWelcome(email)
        message = 'Newsletter welcome test sent'
        break
        
      case 'order':
        const testOrderData = {
          orderId: 'test-order-123',
          orderNumber: 'TEST123',
          customerEmail: email,
          customerName: email.split('@')[0],
          orderDate: new Date().toISOString(),
          total: 89.97,
          shippingAddress: '123 Test Street\nTest City, TS 12345\nUnited States',
          paymentStatus: 'paid',
          estimatedDelivery: '5-7 business days',
          items: [
            {
              name: 'Hemp Essential Tee',
              quantity: 1,
              price: 35.00,
              size: 'M'
            },
            {
              name: 'Organic Hemp Hoodie',
              quantity: 1,
              price: 54.97,
              size: 'L'
            }
          ]
        }
        result = await emailService.sendOrderConfirmation(email, testOrderData)
        message = 'Order confirmation test sent'
        break

      case 'admin-order':
        const testAdminOrderData = {
          orderId: 'test-admin-order-123',
          orderNumber: 'ADMIN123',
          customerEmail: email,
          customerName: 'Test Customer',
          orderDate: new Date().toISOString(),
          total: 129.95,
          shippingAddress: '456 Admin Test Lane\nAdmin City, AC 54321\nUnited States',
          paymentStatus: 'paid',
          items: [
            {
              name: 'Hemp Essential Tee',
              quantity: 2,
              price: 35.00,
              size: 'M'
            },
            {
              name: 'Organic Hemp Socks',
              quantity: 1,
              price: 59.95,
              size: 'One Size'
            }
          ]
        }
        result = await emailService.sendAdminOrderNotification(testAdminOrderData)
        message = 'Admin order notification test sent'
        break
        
      default:
        return NextResponse.json({ error: 'Invalid email type. Use: verification, newsletter, order, admin-order' }, { status: 400 })
    }

    return NextResponse.json({
      success: result,
      message: result ? message : 'Failed to send email (check server logs for details)',
      note: 'This is a test endpoint for development only'
    })
    
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 })
  }
}

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Test endpoint not available in production' }, { status: 404 })
  }

  return NextResponse.json({
    message: 'Email Test Endpoint',
    usage: 'POST to this endpoint with { "type": "verification|newsletter|order|admin-order", "email": "test@example.com" }',
    available_types: [
      'verification - Test email verification email',
      'newsletter - Test newsletter welcome email', 
      'order - Test customer order confirmation email',
      'admin-order - Test admin order notification email'
    ],
    note: 'This endpoint is only available in development mode'
  })
}