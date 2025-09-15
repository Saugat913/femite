import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { v4 as uuidv4 } from 'uuid'

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    // Get all categories with product counts
    const result = await query(`
      SELECT 
        c.id,
        c.name,
        c.description,
        c.created_at,
        COUNT(pc.product_id) as product_count
      FROM categories c
      LEFT JOIN product_categories pc ON c.id = pc.category_id
      GROUP BY c.id, c.name, c.description, c.created_at
      ORDER BY c.name
    `)

    const categories = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      productCount: parseInt(row.product_count),
      createdAt: row.created_at
    }))

    return NextResponse.json({
      success: true,
      data: categories
    })
  } catch (error) {
    console.error('GET /api/categories error:', error)
    return NextResponse.json(
      { error: 'Failed to get categories' },
      { status: 500 }
    )
  }
}

// POST /api/categories - Create new category (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const userResult = await query(
      'SELECT role FROM users WHERE id = $1',
      [session.userId]
    )

    if (userResult.rows.length === 0 || userResult.rows[0].role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    // Check if category already exists
    const existingResult = await query(
      'SELECT id FROM categories WHERE name = $1',
      [name]
    )

    if (existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 409 }
      )
    }

    // Create category
    const id = uuidv4()
    const result = await query(
      'INSERT INTO categories (id, name, description) VALUES ($1, $2, $3) RETURNING *',
      [id, name, description]
    )

    const category = result.rows[0]

    return NextResponse.json({
      success: true,
      data: {
        id: category.id,
        name: category.name,
        description: category.description,
        productCount: 0,
        createdAt: category.created_at
      },
      message: 'Category created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/categories error:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
