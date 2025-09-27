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
      
      // During build time, return static fallback blog posts
      if (error instanceof Error && error.message?.includes('Database not available during static build phase')) {
        return this.getStaticFallbackPosts()
      }
      
      return []
    }
  }
  
  // Static fallback data for build time
  private getStaticFallbackPosts(): any[] {
    return [
      {
        id: '1',
        title: 'Why Hemp is the Future of Sustainable Fashion',
        excerpt: 'Learn about the incredible benefits of hemp fabric and why it\'s a game-changer for the fashion industry.',
        content: '<p>Hemp is rapidly emerging as one of the most promising materials in sustainable fashion. Unlike conventional cotton, hemp requires significantly less water to grow and actually improves soil health through its cultivation process.</p>',
        image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=600&fit=crop&crop=center',
        category: 'Sustainability',
        slug: 'hemp-future-sustainable-fashion',
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        author: 'Hemp Clothing Co.',
        metaTitle: 'Why Hemp is the Future of Sustainable Fashion | Hemp Clothing Co.',
        metaDescription: 'Discover how hemp fabric is revolutionizing sustainable fashion with superior environmental benefits and fabric properties.'
      },
      {
        id: '2',
        title: 'Hemp Clothing Care Tips',
        excerpt: 'Hemp is durable, but proper care ensures your clothes last even longer. Read our expert tips.',
        content: '<p>Hemp clothing is incredibly durable and actually gets better with age, but following proper care instructions will ensure your garments last for decades.</p>',
        image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800&h=600&fit=crop&crop=center',
        category: 'Care & Tips',
        slug: 'hemp-clothing-care-tips',
        publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        author: 'Hemp Clothing Co.',
        metaTitle: 'Hemp Clothing Care Tips | Hemp Clothing Co.',
        metaDescription: 'Learn expert tips for washing, drying, and caring for your hemp clothing to ensure maximum durability and comfort.'
      },
      {
        id: '3',
        title: 'The Environmental Impact of Hemp vs Cotton',
        excerpt: 'Discover how hemp farming benefits the environment compared to traditional cotton production.',
        content: '<p>When comparing hemp to conventional cotton, the environmental benefits of hemp become immediately clear. Let\'s examine the key differences in environmental impact.</p>',
        image: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800&h=600&fit=crop&crop=center',
        category: 'Environment',
        slug: 'hemp-vs-cotton-environment',
        publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        author: 'Hemp Clothing Co.',
        metaTitle: 'Hemp vs Cotton: Environmental Impact Comparison | Hemp Clothing Co.',
        metaDescription: 'Compare the environmental impact of hemp vs cotton farming - water usage, pesticides, soil health, and carbon footprint.'
      }
    ]
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
      return data.posts || []
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
