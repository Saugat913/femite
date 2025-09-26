import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')
    const category = searchParams.get('category')

    let queryText = `
      SELECT 
        bp.id,
        bp.title,
        bp.excerpt,
        bp.content,
        bp.image_url as image,
        bp.category,
        bp.slug,
        bp.published_at,
        bp.meta_title,
        bp.meta_description,
        u.email as author_name
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      WHERE bp.is_published = true
    `
    const queryParams: any[] = []

    if (category) {
      queryParams.push(category)
      queryText += ` AND bp.category ILIKE $${queryParams.length}`
    }

    queryText += ` ORDER BY bp.published_at DESC`
    
    queryParams.push(limit, offset)
    queryText += ` LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`

    const result = await query(queryText, queryParams)

    // Format blog posts for frontend
    const blogPosts = result.rows.map(post => ({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      image: post.image || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=240&fit=crop&crop=center',
      category: post.category || 'General',
      slug: post.slug,
      publishedAt: post.published_at,
      author: post.author_name || 'Hemp Clothing Co.',
      metaTitle: post.meta_title,
      metaDescription: post.meta_description
    }))

    const res = NextResponse.json({ 
      blogPosts, 
      total: blogPosts.length,
      limit,
      offset 
    })
    res.headers.set('Cache-Control', 'no-store')
    return res
  } catch (error) {
    console.error('GET /api/blog error:', error)
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 })
  }
}

// POST, PUT, DELETE methods removed - managed by admin panel
// Admin panel should use the /api/revalidate endpoint after making changes
