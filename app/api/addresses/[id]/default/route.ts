import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '@/lib/db'
import { getSession } from '@/lib/auth'

// PUT /api/addresses/[id]/default - Set address as default
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await getClient()

  try {
    await client.query('BEGIN')

    const session = await getSession()
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if address exists and belongs to user
    const existingResult = await client.query(
      'SELECT * FROM user_addresses WHERE id = $1 AND user_id = $2',
      [params.id, session.userId]
    )

    if (existingResult.rows.length === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      )
    }

    const address = existingResult.rows[0]

    // If it's already the default, no need to do anything
    if (address.is_default) {
      await client.query('ROLLBACK')
      return NextResponse.json({
        success: true,
        message: 'Address is already the default',
        data: {
          id: address.id,
          type: address.type,
          name: address.name,
          company: address.company,
          addressLine1: address.address_line_1,
          addressLine2: address.address_line_2,
          city: address.city,
          state: address.state,
          zipCode: address.zip_code,
          country: address.country,
          phone: address.phone,
          isDefault: address.is_default,
          createdAt: address.created_at,
          updatedAt: address.updated_at
        }
      })
    }

    // First, unset any existing default addresses of the same type
    await client.query(
      'UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1 AND type = $2',
      [session.userId, address.type]
    )

    // Then set this address as default
    const result = await client.query(
      'UPDATE user_addresses SET is_default = TRUE, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *',
      [params.id, session.userId]
    )

    await client.query('COMMIT')

    const updatedAddress = result.rows[0]

    return NextResponse.json({
      success: true,
      data: {
        id: updatedAddress.id,
        type: updatedAddress.type,
        name: updatedAddress.name,
        company: updatedAddress.company,
        addressLine1: updatedAddress.address_line_1,
        addressLine2: updatedAddress.address_line_2,
        city: updatedAddress.city,
        state: updatedAddress.state,
        zipCode: updatedAddress.zip_code,
        country: updatedAddress.country,
        phone: updatedAddress.phone,
        isDefault: updatedAddress.is_default,
        createdAt: updatedAddress.created_at,
        updatedAt: updatedAddress.updated_at
      },
      message: 'Default address updated successfully'
    })

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('PUT /api/addresses/[id]/default error:', error)
    return NextResponse.json(
      { error: 'Failed to set default address' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
