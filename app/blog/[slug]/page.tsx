import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Layout from '@/components/Layout'
import { blogService } from '@/services/blog-service'

// Use ISR with revalidation for optimal performance
export const revalidate = 300 // Revalidate every 5 minutes

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = params
  const blogPost = await blogService.getBlogPost(slug)

  if (!blogPost) {
    notFound()
  }

  return (
    <Layout>
      <article className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <div className="breadcrumb mb-6">
          <Link href="/">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <Link href="/blog">Blog</Link>
          <span className="breadcrumb-separator">/</span>
          <span>{blogPost.title}</span>
        </div>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm text-hemp-green-dark font-semibold bg-hemp-green-light px-3 py-1 rounded-full">
              {blogPost.category}
            </span>
            <time className="text-sm text-gray-500">
              {new Date(blogPost.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
            {blogPost.title}
          </h1>
          
          {blogPost.excerpt && (
            <p className="text-xl text-gray-600 leading-relaxed mb-6">
              {blogPost.excerpt}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>By {blogPost.author || 'Hemp Clothing Co.'}</span>
          </div>
        </header>

        {/* Featured Image */}
        {blogPost.image && (
          <div className="mb-8">
            <Image
              src={blogPost.image}
              alt={blogPost.title}
              width={800}
              height={500}
              className="w-full h-[400px] md:h-[500px] object-cover rounded-lg"
            />
          </div>
        )}

        {/* Article Content */}
        <div 
          className="prose prose-lg max-w-none
                     prose-headings:text-gray-800 prose-headings:font-semibold
                     prose-p:text-gray-700 prose-p:leading-relaxed
                     prose-a:text-hemp-green-dark prose-a:no-underline hover:prose-a:underline
                     prose-ul:text-gray-700 prose-li:text-gray-700
                     prose-strong:text-gray-800"
          dangerouslySetInnerHTML={{ __html: blogPost.content || '' }}
        />

        {/* Social Sharing */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Share this article</h3>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
              Twitter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </button>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-800 mb-8">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* You could implement related articles here */}
            <div className="text-center py-8">
              <p className="text-gray-500">More articles coming soon!</p>
              <Link href="/blog" className="text-hemp-green-dark hover:underline font-medium">
                Browse all articles →
              </Link>
            </div>
          </div>
        </div>

        {/* Back to Blog */}
        <div className="mt-12 text-center">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-hemp-green-dark hover:text-hemp-green-dark/80 font-medium"
          >
            ← Back to Blog
          </Link>
        </div>
      </article>
    </Layout>
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = params
  const blogPost = await blogService.getBlogPost(slug)

  if (!blogPost) {
    return {
      title: 'Blog Post Not Found | Hemp Clothing Co.',
      description: 'The requested blog post could not be found.'
    }
  }

  return {
    title: blogPost.metaTitle || `${blogPost.title} | Hemp Clothing Co.`,
    description: blogPost.metaDescription || blogPost.excerpt,
    openGraph: {
      title: blogPost.title,
      description: blogPost.excerpt,
      images: [blogPost.image],
      type: 'article',
      publishedTime: blogPost.publishedAt,
    },
    twitter: {
      card: 'summary_large_image',
      title: blogPost.title,
      description: blogPost.excerpt,
      images: [blogPost.image],
    },
  }
}
