import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let queryText = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.image_url,
        p.created_at,
        COALESCE(
          STRING_AGG(DISTINCT c.name, ', '),
          'Uncategorized'
        ) as categories
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE 1=1
    `
    const queryParams: any[] = []

    if (category) {
      queryParams.push(category)
      queryText += ` AND c.name ILIKE $${queryParams.length}`
    }

    if (search) {
      queryParams.push(`%${search}%`)
      queryText += ` AND (p.name ILIKE $${queryParams.length} OR p.description ILIKE $${queryParams.length})`
    }

    queryText += ` GROUP BY p.id, p.name, p.description, p.price, p.stock, p.image_url, p.created_at`
    queryText += ` ORDER BY p.created_at DESC`
    
    queryParams.push(limit, offset)
    queryText += ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`

    const result = await query(queryText, queryParams)

    // Format products for frontend
    const products = result.rows.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      stock: product.stock,
      image: product.image_url,
      category: product.categories.split(', ')[0] || 'Uncategorized',
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Natural', 'Forest Green', 'Earth Brown', 'Sage Green', 'Charcoal'],
      features: ['UV Protection', 'Moisture Control', 'Durable Fabric', 'Antimicrobial', '100% Organic'],
      isNew: false,
      createdAt: product.created_at
    }))

    const res = NextResponse.json({ products, total: products.length })
    res.headers.set('Cache-Control', 'no-store')
    return res
  } catch (error) {
    console.error('GET /api/products error:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// POST, PUT, DELETE methods removed - managed by admin panel
// Admin panel should use the /api/revalidate endpoint after making changes
