import { NextRequest, NextResponse } from 'next/server'
import { query, getClient } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET /api/addresses/[id] - Get specific address
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const result = await query(`
      SELECT 
        id, type, name, company, address_line_1, address_line_2,
        city, state, zip_code, country, phone, is_default,
        created_at, updated_at
      FROM user_addresses 
      WHERE id = $1 AND user_id = $2
    `, [params.id, session.userId])

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      )
    }

    const address = result.rows[0]

    return NextResponse.json({
      success: true,
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
  } catch (error) {
    console.error('GET /api/addresses/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to get address' },
      { status: 500 }
    )
  }
}

// PUT /api/addresses/[id] - Update address
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

    const body = await request.json()
    const {
      type,
      name,
      company,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country,
      phone,
      isDefault
    } = body

    // Validation
    if (name && !name.trim()) {
      await client.query('ROLLBACK')
      return NextResponse.json(
        { error: 'Name cannot be empty' },
        { status: 400 }
      )
    }

    if (type && !['shipping', 'billing', 'both'].includes(type)) {
      await client.query('ROLLBACK')
      return NextResponse.json(
        { error: 'Invalid address type' },
        { status: 400 }
      )
    }

    // Build dynamic update query
    const updates = []
    const values = []
    let paramCount = 0

    if (type !== undefined) {
      paramCount++
      updates.push(`type = $${paramCount}`)
      values.push(type)
    }

    if (name !== undefined) {
      paramCount++
      updates.push(`name = $${paramCount}`)
      values.push(name)
    }

    if (company !== undefined) {
      paramCount++
      updates.push(`company = $${paramCount}`)
      values.push(company)
    }

    if (addressLine1 !== undefined) {
      paramCount++
      updates.push(`address_line_1 = $${paramCount}`)
      values.push(addressLine1)
    }

    if (addressLine2 !== undefined) {
      paramCount++
      updates.push(`address_line_2 = $${paramCount}`)
      values.push(addressLine2)
    }

    if (city !== undefined) {
      paramCount++
      updates.push(`city = $${paramCount}`)
      values.push(city)
    }

    if (state !== undefined) {
      paramCount++
      updates.push(`state = $${paramCount}`)
      values.push(state)
    }

    if (zipCode !== undefined) {
      paramCount++
      updates.push(`zip_code = $${paramCount}`)
      values.push(zipCode)
    }

    if (country !== undefined) {
      paramCount++
      updates.push(`country = $${paramCount}`)
      values.push(country)
    }

    if (phone !== undefined) {
      paramCount++
      updates.push(`phone = $${paramCount}`)
      values.push(phone)
    }

    if (isDefault !== undefined) {
      paramCount++
      updates.push(`is_default = $${paramCount}`)
      values.push(isDefault)
    }

    if (updates.length === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    // Always update the updated_at timestamp
    paramCount++
    updates.push(`updated_at = $${paramCount}`)
    values.push(new Date())

    // Add WHERE conditions
    paramCount++
    values.push(params.id)
    paramCount++
    values.push(session.userId)

    const updateQuery = `
      UPDATE user_addresses 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount - 1} AND user_id = $${paramCount}
      RETURNING *
    `

    const result = await client.query(updateQuery, values)

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
      message: 'Address updated successfully'
    })

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('PUT /api/addresses/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}

// DELETE /api/addresses/[id] - Delete address
export async function DELETE(
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

    const addressToDelete = existingResult.rows[0]

    // If deleting the default address, check if there are other addresses
    if (addressToDelete.is_default) {
      const otherAddressesResult = await client.query(
        'SELECT id FROM user_addresses WHERE user_id = $1 AND type = $2 AND id != $3 LIMIT 1',
        [session.userId, addressToDelete.type, params.id]
      )

      // If there are other addresses, make one of them default
      if (otherAddressesResult.rows.length > 0) {
        await client.query(
          'UPDATE user_addresses SET is_default = TRUE WHERE id = $1',
          [otherAddressesResult.rows[0].id]
        )
      }
    }

    // Delete the address
    await client.query(
      'DELETE FROM user_addresses WHERE id = $1 AND user_id = $2',
      [params.id, session.userId]
    )

    await client.query('COMMIT')

    return NextResponse.json({
      success: true,
      message: 'Address deleted successfully'
    })

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('DELETE /api/addresses/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
