import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { path, paths, tag, tags, secret, type, id, imageUpdate, timestamp } = body

    // Verify the secret to prevent unauthorized revalidation
    if (!secret || secret !== process.env.REVALIDATION_SECRET) {
      console.log('Invalid revalidation secret provided')
      return NextResponse.json({ error: 'Invalid or missing secret' }, { status: 401 })
    }

    // Log enhanced revalidation request
    console.log(`🔄 Enhanced revalidation request: type=${type}, id=${id}, imageUpdate=${imageUpdate}, timestamp=${timestamp}`)

    const revalidatedPaths: string[] = []
    const revalidatedTags: string[] = []
    let imagesCacheBusted = false
    
    // Get configurable revalidation interval
    const revalidationInterval = parseInt(process.env.REVALIDATION_INTERVAL || '0') // 0 = immediate

    // Handle multiple paths
    if (paths && Array.isArray(paths)) {
      for (const p of paths) {
        revalidatePath(p)
        revalidatedPaths.push(p)
        console.log(`Revalidated path: ${p}`)
      }
    }

    // Handle single path
    if (path) {
      revalidatePath(path)
      revalidatedPaths.push(path)
      console.log(`Revalidated path: ${path}`)
    }

    // Handle multiple tags
    if (tags && Array.isArray(tags)) {
      for (const t of tags) {
        revalidateTag(t)
        revalidatedTags.push(t)
        console.log(`Revalidated tag: ${t}`)
      }
    }

    // Handle single tag
    if (tag) {
      revalidateTag(tag)
      revalidatedTags.push(tag)
      console.log(`Revalidated tag: ${tag}`)
    }

    // Handle type-based revalidation (for admin panel convenience)
    if (type) {
      switch (type) {
        case 'product':
          const productPaths = [
            '/', // Homepage shows featured products
            '/shop'
          ]
          if (id) {
            productPaths.push(`/shop/${id}`)
          }
          
          // Enhanced revalidation with cache control
          for (const p of productPaths) {
            revalidatePath(p, 'page') // Specify type for better cache control
            revalidatedPaths.push(p)
            console.log(`Revalidated product path: ${p}${imageUpdate ? ' (with image cache busting)' : ''}`)
          }
          
          // If this is an image update, also revalidate image cache
          if (imageUpdate && id) {
            // Revalidate Next.js image cache by using tags
            const imageTags = [`product-image-${id}`, `product-${id}`]
            for (const imageTag of imageTags) {
              revalidateTag(imageTag)
              revalidatedTags.push(imageTag)
            }
            imagesCacheBusted = true
            console.log(`🖼️ Cache busted product images for product ${id}`)
          }
          break
        
        case 'blog':
          const blogPaths = [
            '/', // Homepage might show featured blog posts
            '/blog'
          ]
          if (id) {
            blogPaths.push(`/blog/${id}`)
          }
          for (const p of blogPaths) {
            revalidatePath(p)
            revalidatedPaths.push(p)
            console.log(`Revalidated blog path: ${p}`)
          }
          break
        
        case 'all':
          const allPaths = ['/', '/shop', '/blog']
          for (const p of allPaths) {
            revalidatePath(p)
            revalidatedPaths.push(p)
            console.log(`Revalidated path: ${p}`)
          }
          break
        
        default:
          console.log(`Unknown revalidation type: ${type}`)
      }
    }

    // If no specific revalidation provided, revalidate common pages
    if (!path && !paths && !tag && !tags && !type) {
      const defaultPaths = ['/', '/shop', '/blog']
      for (const p of defaultPaths) {
        revalidatePath(p)
        revalidatedPaths.push(p)
        console.log(`Revalidated default path: ${p}`)
      }
    }

    // Apply revalidation interval if configured
    if (revalidationInterval > 0) {
      console.log(`⏱️ Applying revalidation interval: ${revalidationInterval}ms`)
      await new Promise(resolve => setTimeout(resolve, revalidationInterval))
    }

    return NextResponse.json({ 
      success: true,
      revalidated: true, 
      timestamp: new Date().toISOString(),
      paths: revalidatedPaths,
      tags: revalidatedTags,
      type: type || null,
      id: id || null,
      imagesCacheBusted,
      revalidationInterval,
      message: `Revalidated ${revalidatedPaths.length} paths${revalidatedTags.length ? ` and ${revalidatedTags.length} tags` : ''}${imageUpdate ? ' with image cache busting' : ''}`
    })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Error during revalidation',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }

}

// GET method to check revalidation endpoint status
export async function GET() {
  return NextResponse.json({ 
    message: 'Revalidation endpoint is active',
    timestamp: new Date().toISOString(),
    usage: {
      method: 'POST',
      requiredFields: ['secret'],
      optionalFields: [
        'path', 'paths', 'tag', 'tags', 'type', 'id'
      ],
      examples: {
        singlePath: { secret: 'your-secret', path: '/shop' },
        multiplePaths: { secret: 'your-secret', paths: ['/', '/shop', '/blog'] },
        typeBasedProduct: { secret: 'your-secret', type: 'product', id: 'product-id' },
        typeBasedBlog: { secret: 'your-secret', type: 'blog', id: 'blog-slug' },
        allPages: { secret: 'your-secret', type: 'all' }
      }
    }
  })
}
