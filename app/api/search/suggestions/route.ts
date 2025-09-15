import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '8')
    const type = searchParams.get('type') || 'all' // 'all', 'products', 'categories', 'history'

    if (!q || q.trim().length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          suggestions: [],
          categories: [],
          trending: await getTrendingSearches(5)
        }
      })
    }

    const searchTerm = q.trim().toLowerCase()
    const suggestions: any[] = []

    // Get product name suggestions
    if (type === 'all' || type === 'products') {
      const productSuggestions = await getProductSuggestions(searchTerm, Math.ceil(limit * 0.6))
      suggestions.push(...productSuggestions.map(s => ({ ...s, type: 'product' })))
    }

    // Get category suggestions
    if (type === 'all' || type === 'categories') {
      const categorySuggestions = await getCategorySuggestions(searchTerm, Math.ceil(limit * 0.2))
      suggestions.push(...categorySuggestions.map(s => ({ ...s, type: 'category' })))
    }

    // Get search history suggestions
    if (type === 'all' || type === 'history') {
      const historySuggestions = await getSearchHistorySuggestions(searchTerm, Math.ceil(limit * 0.2))
      suggestions.push(...historySuggestions.map(s => ({ ...s, type: 'history' })))
    }

    // Sort by relevance and limit results
    const sortedSuggestions = suggestions
      .sort((a, b) => {
        // Prioritize exact matches
        if (a.text.toLowerCase().startsWith(searchTerm) && !b.text.toLowerCase().startsWith(searchTerm)) {
          return -1
        }
        if (!a.text.toLowerCase().startsWith(searchTerm) && b.text.toLowerCase().startsWith(searchTerm)) {
          return 1
        }
        // Then sort by popularity/relevance
        return (b.popularity || 0) - (a.popularity || 0)
      })
      .slice(0, limit)

    // Get related categories for the search term
    const relatedCategories = await getRelatedCategories(searchTerm)

    return NextResponse.json({
      success: true,
      data: {
        suggestions: sortedSuggestions,
        categories: relatedCategories,
        query: q,
        trending: suggestions.length === 0 ? await getTrendingSearches(5) : []
      }
    })
  } catch (error) {
    console.error('GET /api/search/suggestions error:', error)
    return NextResponse.json(
      { error: 'Failed to get search suggestions' },
      { status: 500 }
    )
  }
}

async function getProductSuggestions(searchTerm: string, limit: number) {
  const result = await query(`
    SELECT DISTINCT
      p.name as text,
      p.id,
      p.image_url as image,
      p.price,
      COUNT(*) OVER (PARTITION BY p.name) as popularity,
      ts_rank(p.search_vector, plainto_tsquery('english', $1)) as relevance
    FROM products p
    WHERE 
      p.search_vector @@ plainto_tsquery('english', $1)
      OR p.name ILIKE $2
    ORDER BY 
      ts_rank(p.search_vector, plainto_tsquery('english', $1)) DESC,
      popularity DESC,
      p.name ASC
    LIMIT $3
  `, [searchTerm, `%${searchTerm}%`, limit])

  return result.rows.map(row => ({
    text: row.text,
    id: row.id,
    image: row.image,
    price: parseFloat(row.price),
    popularity: parseInt(row.popularity),
    relevance: parseFloat(row.relevance || 0)
  }))
}

async function getCategorySuggestions(searchTerm: string, limit: number) {
  const result = await query(`
    SELECT 
      c.name as text,
      c.id,
      COUNT(p.id) as product_count,
      COUNT(p.id) as popularity
    FROM categories c
    LEFT JOIN product_categories pc ON c.id = pc.category_id
    LEFT JOIN products p ON pc.product_id = p.id
    WHERE c.name ILIKE $1
    GROUP BY c.id, c.name
    HAVING COUNT(p.id) > 0
    ORDER BY 
      CASE WHEN LOWER(c.name) LIKE $2 THEN 0 ELSE 1 END,
      COUNT(p.id) DESC,
      c.name ASC
    LIMIT $3
  `, [`%${searchTerm}%`, `${searchTerm}%`, limit])

  return result.rows.map(row => ({
    text: row.text,
    id: row.id,
    productCount: parseInt(row.product_count),
    popularity: parseInt(row.popularity)
  }))
}

async function getSearchHistorySuggestions(searchTerm: string, limit: number) {
  const result = await query(`
    SELECT 
      ss.query as text,
      ss.search_count as popularity,
      ss.is_trending,
      ss.last_searched_at,
      similarity(ss.query, $1) as similarity_score
    FROM search_suggestions ss
    WHERE 
      ss.query ILIKE $2
      OR ss.query % $1
    ORDER BY 
      CASE WHEN ss.query ILIKE $3 THEN 0 ELSE 1 END,
      ss.is_trending DESC,
      ss.search_count DESC,
      similarity(ss.query, $1) DESC
    LIMIT $4
  `, [searchTerm, `%${searchTerm}%`, `${searchTerm}%`, limit])

  return result.rows.map(row => ({
    text: row.text,
    popularity: parseInt(row.search_count),
    isTrending: row.is_trending,
    lastSearched: row.last_searched_at,
    similarity: parseFloat(row.similarity_score || 0)
  }))
}

async function getRelatedCategories(searchTerm: string) {
  const result = await query(`
    SELECT DISTINCT
      c.name,
      c.id,
      COUNT(p.id) as product_count
    FROM categories c
    JOIN product_categories pc ON c.id = pc.category_id
    JOIN products p ON pc.product_id = p.id
    WHERE 
      p.search_vector @@ plainto_tsquery('english', $1)
      OR p.name ILIKE $2
    GROUP BY c.id, c.name
    ORDER BY COUNT(p.id) DESC, c.name ASC
    LIMIT 5
  `, [searchTerm, `%${searchTerm}%`])

  return result.rows.map(row => ({
    name: row.name,
    id: row.id,
    productCount: parseInt(row.product_count)
  }))
}

async function getTrendingSearches(limit: number) {
  const result = await query(`
    SELECT 
      query as text,
      search_count as popularity,
      is_trending
    FROM search_suggestions
    WHERE search_count > 1
    ORDER BY 
      is_trending DESC,
      search_count DESC,
      last_searched_at DESC
    LIMIT $1
  `, [limit])

  return result.rows.map(row => ({
    text: row.text,
    popularity: parseInt(row.search_count),
    isTrending: row.is_trending
  }))
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query: searchQuery, action = 'select' } = body

    if (action === 'select' && searchQuery) {
      // Update search suggestion popularity when selected
      await query(`
        UPDATE search_suggestions 
        SET search_count = search_count + 1,
            last_searched_at = NOW()
        WHERE query = $1
      `, [searchQuery.toLowerCase()])

      // Mark as trending if it has high search count
      await query(`
        UPDATE search_suggestions 
        SET is_trending = true
        WHERE query = $1 AND search_count > 10
      `, [searchQuery.toLowerCase()])
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/search/suggestions error:', error)
    return NextResponse.json(
      { error: 'Failed to update search suggestion' },
      { status: 500 }
    )
  }
}
