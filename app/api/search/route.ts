import { NextRequest, NextResponse } from 'next/server'
import { query, getClient } from '@/lib/db'
import { getSession } from '@/lib/auth'

// Force dynamic rendering - prevent static generation
export const dynamic = 'force-dynamic'
export const revalidate = 0

interface SearchFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  sizes?: string[]
  colors?: string[]
  materials?: string[]
  brands?: string[]
  inStock?: boolean
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'oldest' | 'name_asc' | 'name_desc'
}

interface SearchOptions extends SearchFilters {
  query?: string
  page?: number
  limit?: number
}

export async function GET(request: NextRequest) {
  const client = await getClient()
  
  try {
    const { searchParams } = new URL(request.url)
    const searchQuery = searchParams.get('q') || searchParams.get('query') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    // Parse filters
    const filters: SearchFilters = {
      category: searchParams.get('category') || undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      sizes: searchParams.get('sizes') ? searchParams.get('sizes')!.split(',') : undefined,
      colors: searchParams.get('colors') ? searchParams.get('colors')!.split(',') : undefined,
      materials: searchParams.get('materials') ? searchParams.get('materials')!.split(',') : undefined,
      brands: searchParams.get('brands') ? searchParams.get('brands')!.split(',') : undefined,
      inStock: searchParams.get('inStock') === 'true' ? true : undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'relevance'
    }

    // Log search analytics
    await logSearchQuery(searchQuery, filters, request)

    // Build the search query
    const searchResult = await performAdvancedSearch({
      query: searchQuery,
      ...filters,
      page,
      limit
    })

    return NextResponse.json({
      success: true,
      data: {
        products: searchResult.products,
        total: searchResult.total,
        page,
        limit,
        hasMore: searchResult.total > page * limit,
        filters: await getAvailableFilters(searchQuery),
        searchQuery,
        appliedFilters: filters
      }
    })
  } catch (error) {
    console.error('GET /api/search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  } finally {
    client.release()
  }
}

async function performAdvancedSearch(options: SearchOptions) {
  const { query: searchQuery, page = 1, limit = 12, ...filters } = options
  const offset = (page - 1) * limit

  let baseQuery = `
    FROM product_search_view p
    WHERE 1=1
  `
  const queryParams: any[] = []
  let paramCount = 0

  // Full-text search
  if (searchQuery && searchQuery.trim()) {
    paramCount++
    queryParams.push(searchQuery.trim().replace(/\s+/g, ' & '))
    baseQuery += ` AND p.search_vector @@ plainto_tsquery('english', $${paramCount})`
  }

  // Category filter
  if (filters.category) {
    paramCount++
    queryParams.push(`%${filters.category}%`)
    baseQuery += ` AND p.categories ILIKE $${paramCount}`
  }

  // Price range filter
  if (filters.minPrice !== undefined) {
    paramCount++
    queryParams.push(filters.minPrice)
    baseQuery += ` AND p.price >= $${paramCount}`
  }

  if (filters.maxPrice !== undefined) {
    paramCount++
    queryParams.push(filters.maxPrice)
    baseQuery += ` AND p.price <= $${paramCount}`
  }

  // Stock filter
  if (filters.inStock) {
    baseQuery += ` AND p.stock > 0`
  }

  // Attribute filters (sizes, colors, materials, brands)
  const attributeFilters = [
    { key: 'sizes', type: 'size' },
    { key: 'colors', type: 'color' },
    { key: 'materials', type: 'material' },
    { key: 'brands', type: 'brand' }
  ]

  for (const { key, type } of attributeFilters) {
    const values = filters[key as keyof SearchFilters] as string[]
    if (values && values.length > 0) {
      paramCount++
      queryParams.push(values)
      baseQuery += ` AND EXISTS (
        SELECT 1 FROM product_attributes pa 
        WHERE pa.product_id = p.id 
        AND pa.attribute_type = '${type}' 
        AND pa.attribute_value = ANY($${paramCount})
      )`
    }
  }

  // Build ORDER BY clause
  let orderBy = 'ORDER BY '
  if (searchQuery && searchQuery.trim()) {
    // If there's a search query, default to relevance
    if (filters.sortBy === 'relevance' || !filters.sortBy) {
      orderBy += `ts_rank(p.search_vector, plainto_tsquery('english', $1)) DESC, p.created_at DESC`
    }
  }

  // Override with specific sort options
  if (filters.sortBy && filters.sortBy !== 'relevance') {
    switch (filters.sortBy) {
      case 'price_asc':
        orderBy = 'ORDER BY p.price ASC'
        break
      case 'price_desc':
        orderBy = 'ORDER BY p.price DESC'
        break
      case 'newest':
        orderBy = 'ORDER BY p.created_at DESC'
        break
      case 'oldest':
        orderBy = 'ORDER BY p.created_at ASC'
        break
      case 'name_asc':
        orderBy = 'ORDER BY p.name ASC'
        break
      case 'name_desc':
        orderBy = 'ORDER BY p.name DESC'
        break
      default:
        if (!searchQuery || !searchQuery.trim()) {
          orderBy = 'ORDER BY p.created_at DESC'
        }
    }
  } else if (!searchQuery || !searchQuery.trim()) {
    orderBy = 'ORDER BY p.created_at DESC'
  }

  // Get total count
  const countQuery = `SELECT COUNT(*) as total ${baseQuery}`
  const countResult = await query(countQuery, queryParams)
  const total = parseInt(countResult.rows[0].total)

  // Get products with pagination
  const selectQuery = `
    SELECT 
      p.id,
      p.name,
      p.description,
      p.price,
      p.stock,
      p.image_url,
      p.created_at,
      p.categories,
      p.attributes
      ${searchQuery && searchQuery.trim() ? `, ts_rank(p.search_vector, plainto_tsquery('english', $1)) as relevance_score` : ''}
    ${baseQuery}
    ${orderBy}
    LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
  `

  queryParams.push(limit, offset)
  const result = await query(selectQuery, queryParams)

  // Format products
  const products = result.rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    price: parseFloat(row.price),
    stock: row.stock,
    image: row.image_url,
    category: row.categories.split(', ')[0] || 'Uncategorized',
    categories: row.categories.split(', '),
    attributes: row.attributes || [],
    isNew: false,
    createdAt: row.created_at,
    relevanceScore: row.relevance_score || 0
  }))

  return { products, total }
}

async function getAvailableFilters(searchQuery?: string) {
  // Get available categories
  const categoriesResult = await query(`
    SELECT DISTINCT c.name, COUNT(p.id) as count
    FROM categories c
    LEFT JOIN product_categories pc ON c.id = pc.category_id
    LEFT JOIN products p ON pc.product_id = p.id
    WHERE p.id IS NOT NULL
    GROUP BY c.name
    ORDER BY count DESC, c.name ASC
  `)

  // Get available attributes
  const attributesResult = await query(`
    SELECT attribute_type, attribute_value, COUNT(*) as count
    FROM product_attributes pa
    JOIN products p ON pa.product_id = p.id
    GROUP BY attribute_type, attribute_value
    ORDER BY attribute_type, count DESC, attribute_value ASC
  `)

  // Get price range
  const priceRangeResult = await query(`
    SELECT MIN(price) as min_price, MAX(price) as max_price
    FROM products
  `)

  const categories = categoriesResult.rows.map(row => ({
    name: row.name,
    count: parseInt(row.count)
  }))

  const attributes = attributesResult.rows.reduce((acc, row) => {
    if (!acc[row.attribute_type]) {
      acc[row.attribute_type] = []
    }
    acc[row.attribute_type].push({
      value: row.attribute_value,
      count: parseInt(row.count)
    })
    return acc
  }, {} as any)

  const priceRange = priceRangeResult.rows[0] || { min_price: 0, max_price: 200 }

  return {
    categories,
    attributes,
    priceRange: {
      min: parseFloat(priceRange.min_price) || 0,
      max: parseFloat(priceRange.max_price) || 200
    }
  }
}

async function logSearchQuery(searchQuery: string, filters: SearchFilters, request: NextRequest) {
  try {
    // Get user session if available
    const session = await getSession().catch(() => null)
    
    // Get IP address and user agent
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Generate session ID from request if user not logged in
    const sessionId = session?.userId || request.headers.get('x-session-id') || `anon-${Date.now()}`

    if (searchQuery && searchQuery.trim()) {
      // Log the search query
      await query(`
        INSERT INTO search_queries (query, user_id, ip_address, user_agent, session_id, filters)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        searchQuery.trim().toLowerCase(),
        session?.userId || null,
        ipAddress,
        userAgent,
        sessionId,
        JSON.stringify(filters)
      ])

      // Update search suggestions
      await query(`
        INSERT INTO search_suggestions (query, search_count, last_searched_at)
        VALUES ($1, 1, NOW())
        ON CONFLICT (query) 
        DO UPDATE SET 
          search_count = search_suggestions.search_count + 1,
          last_searched_at = NOW()
      `, [searchQuery.trim().toLowerCase()])
    }
  } catch (error) {
    console.error('Error logging search query:', error)
    // Don't fail the search if logging fails
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query: searchQuery, clickedProductId } = body

    if (searchQuery && clickedProductId) {
      // Log the click for analytics
      await query(`
        UPDATE search_queries 
        SET clicked_product_id = $2
        WHERE query = $1 AND clicked_product_id IS NULL
        ORDER BY created_at DESC
        LIMIT 1
      `, [searchQuery.toLowerCase(), clickedProductId])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/search error:', error)
    return NextResponse.json(
      { error: 'Failed to log search interaction' },
      { status: 500 }
    )
  }
}
