// Blog Service for Hemp Fashion E-commerce
// This service would handle blog data operations via backend API
// For now, it includes sample data structure

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
}

export class BlogService {
  private getBaseUrl() {
    // For server-side rendering, use the full URL
    if (typeof window === 'undefined') {
      return process.env.NEXTAUTH_URL || 'http://localhost:3000'
    }
    // For client-side, use relative URLs
    return ''
  }
  
  // Get all blog posts
  async getBlogPosts(limit?: number, category?: string): Promise<BlogPost[]> {
    try {
      const params = new URLSearchParams()
      if (limit) params.append('limit', limit.toString())
      if (category) params.append('category', category)
      
      const url = `${this.getBaseUrl()}/api/blog${params.toString() ? '?' + params.toString() : ''}`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.blogPosts || []
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      // Return empty array on error to prevent page crashes
      return []
    }
  }

  // Get single blog post by slug
  async getBlogPost(slug: string): Promise<BlogPost | null> {
    try {
      const url = `${this.getBaseUrl()}/api/blog/${slug}`
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
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
