import { NextRequest, NextResponse } from 'next/server'
import { query, getClient } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

// GET /api/addresses - Get user's addresses
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // shipping, billing, or both

    let queryText = `
      SELECT 
        id, type, name, company, address_line_1, address_line_2,
        city, state, zip_code, country, phone, is_default,
        created_at, updated_at
      FROM user_addresses 
      WHERE user_id = $1
    `
    const queryParams = [session.userId]

    if (type && ['shipping', 'billing', 'both'].includes(type)) {
      queryParams.push(type)
      queryText += ` AND type = $${queryParams.length}`
    }

    queryText += ` ORDER BY is_default DESC, created_at DESC`

    const result = await query(queryText, queryParams)

    const addresses = result.rows.map(row => ({
      id: row.id,
      type: row.type,
      name: row.name,
      company: row.company,
      addressLine1: row.address_line_1,
      addressLine2: row.address_line_2,
      city: row.city,
      state: row.state,
      zipCode: row.zip_code,
      country: row.country,
      phone: row.phone,
      isDefault: row.is_default,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))

    return NextResponse.json({
      success: true,
      data: addresses
    })
  } catch (error) {
    console.error('GET /api/addresses error:', error)
    return NextResponse.json(
      { error: 'Failed to get addresses' },
      { status: 500 }
    )
  }
}

// POST /api/addresses - Create new address
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      type = 'shipping',
      name,
      company,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country = 'US',
      phone,
      isDefault = false
    } = body

    // Validation
    if (!name || !addressLine1 || !city || !state || !zipCode) {
      await client.query('ROLLBACK')
      return NextResponse.json(
        { error: 'Name, address line 1, city, state, and zip code are required' },
        { status: 400 }
      )
    }

    if (!['shipping', 'billing', 'both'].includes(type)) {
      await client.query('ROLLBACK')
      return NextResponse.json(
        { error: 'Invalid address type' },
        { status: 400 }
      )
    }

    const addressId = uuidv4()

    // If this is the user's first address, make it default
    const existingAddressResult = await client.query(
      'SELECT COUNT(*) as count FROM user_addresses WHERE user_id = $1 AND type = $2',
      [session.userId, type]
    )
    
    const isFirstAddress = parseInt(existingAddressResult.rows[0].count) === 0
    const shouldBeDefault = isDefault || isFirstAddress

    const insertResult = await client.query(`
      INSERT INTO user_addresses (
        id, user_id, type, name, company, address_line_1, address_line_2,
        city, state, zip_code, country, phone, is_default
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      addressId, session.userId, type, name, company, addressLine1, addressLine2,
      city, state, zipCode, country, phone, shouldBeDefault
    ])

    await client.query('COMMIT')

    const newAddress = insertResult.rows[0]

    return NextResponse.json({
      success: true,
      data: {
        id: newAddress.id,
        type: newAddress.type,
        name: newAddress.name,
        company: newAddress.company,
        addressLine1: newAddress.address_line_1,
        addressLine2: newAddress.address_line_2,
        city: newAddress.city,
        state: newAddress.state,
        zipCode: newAddress.zip_code,
        country: newAddress.country,
        phone: newAddress.phone,
        isDefault: newAddress.is_default,
        createdAt: newAddress.created_at,
        updatedAt: newAddress.updated_at
      },
      message: 'Address created successfully'
    }, { status: 201 })

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('POST /api/addresses error:', error)
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}
