import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const result = await query(`
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
        bp.created_at,
        bp.updated_at,
        u.email as author_name
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      WHERE bp.slug = $1 AND bp.is_published = true
    `, [slug])

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
    }

    const post = result.rows[0]
    const blogPost = {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      image: post.image || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=600&fit=crop&crop=center',
      category: post.category || 'General',
      slug: post.slug,
      publishedAt: post.published_at,
      author: post.author_name || 'Hemp Clothing Co.',
      metaTitle: post.meta_title,
      metaDescription: post.meta_description,
      createdAt: post.created_at,
      updatedAt: post.updated_at
    }

    return NextResponse.json({ blogPost })
  } catch (error) {
    console.error('GET /api/blog/[slug] error:', error)
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 })
  }
}
