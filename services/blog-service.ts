// Blog Service for Hemp Fashion E-commerce

// Dynamic import for server-side database access to avoid client bundle issues
const getDbQuery = async () => {
  if (typeof window !== 'undefined') {
    throw new Error('Database access not available on client side')
  }
  const { query } = await import('@/lib/db')
  return query
}

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content?: string
  image: string
  category: string
  slug: string
  publishedAt: string
  author?: string
  metaTitle?: string
  metaDescription?: string
}

export class BlogService {
  private async getFromDatabase(queryText: string, params: any[] = []): Promise<any[]> {
    try {
      const query = await getDbQuery()
      const result = await query(queryText, params)
      return result.rows.map(post => ({
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
        metaDescription: post.meta_description
      }))
    } catch (error) {
      console.error('Database query error in blog service:', error)
      return []
    }
  }

  private async getFromAPI(endpoint: string): Promise<any> {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }
  
  // Get all blog posts
  async getBlogPosts(limit?: number, category?: string): Promise<BlogPost[]> {
    try {
      // For server-side rendering, query database directly
      if (typeof window === 'undefined') {
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
        
        if (limit) {
          queryParams.push(limit)
          queryText += ` LIMIT $${queryParams.length}`
        }

        return await this.getFromDatabase(queryText, queryParams)
      }
      
      // For client-side, use API
      const params = new URLSearchParams()
      if (limit) params.append('limit', limit.toString())
      if (category) params.append('category', category)
      
      const url = `/api/blog${params.toString() ? '?' + params.toString() : ''}`
      const data = await this.getFromAPI(url)
      return data.blogPosts || []
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      return []
    }
  }

  // Get single blog post by slug
  async getBlogPost(slug: string): Promise<BlogPost | null> {
    try {
      // For server-side rendering, query database directly
      if (typeof window === 'undefined') {
        const queryText = `
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
          WHERE bp.slug = $1 AND bp.is_published = true
        `
        
        const posts = await this.getFromDatabase(queryText, [slug])
        return posts.length > 0 ? posts[0] : null
      }
      
      // For client-side, use API
      const url = `/api/blog/${slug}`
      const data = await this.getFromAPI(url)
      return data.blogPost || null
    } catch (error) {
      console.error('Error fetching blog post:', error)
      return null
    }
  }

  // Get featured blog posts
  async getFeaturedPosts(limit: number = 3): Promise<BlogPost[]> {
    const posts = await this.getBlogPosts()
    return posts.slice(0, limit)
  }
}

// Export singleton instance
export const blogService = new BlogService()
