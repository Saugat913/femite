import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const result = await query(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.image_url,
        p.created_at,
        COALESCE(
          STRING_AGG(c.name, ', '),
          'Uncategorized'
        ) as categories
      FROM products p
      LEFT JOIN product_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id
      WHERE p.id = $1
      GROUP BY p.id, p.name, p.description, p.price, p.stock, p.image_url, p.created_at
    `, [id])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const productData = result.rows[0]
    const product = {
      id: productData.id,
      name: productData.name,
      description: productData.description,
      price: parseFloat(productData.price),
      stock: productData.stock,
      image: productData.image_url,
      category: productData.categories.split(', ')[0] || 'Uncategorized',
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], // Hemp clothing standard sizes
      colors: ['Natural', 'Forest Green', 'Earth Brown', 'Sage Green', 'Charcoal'], // Hemp natural colors
      features: ['UV Protection', 'Moisture Control', 'Durable Fabric', 'Antimicrobial', '100% Organic'],
      isNew: false, // Could be determined by created_at date
      createdAt: productData.created_at
    }

    return NextResponse.json({ 
      success: true,
      data: product 
    })
  } catch (error) {
    console.error('GET /api/products/[id] error:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

// PUT and DELETE methods removed - managed by admin panel
// Admin panel should use the /api/revalidate endpoint after making changes
