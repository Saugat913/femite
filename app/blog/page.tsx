import Image from 'next/image'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { blogService } from '@/services/blog-service'

export default async function Blog() {
  const blogPosts = await blogService.getBlogPosts()
  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <span>Blog</span>
        </div>
        
        <div className="text-center mb-12 mt-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Our Blog</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the world of sustainable fashion, hemp benefits, styling tips, and our journey towards a more sustainable future.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <Link href={`/blog/${post.slug}`}>
                <Image
                  src={post.image}
                  alt={post.title}
                  width={400}
                  height={240}
                  className="w-full h-60 object-cover hover:scale-105 transition-transform duration-300"
                />
              </Link>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-hemp-green-dark font-semibold bg-hemp-green-light px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                  <time className="text-sm text-gray-500">
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3 hover:text-hemp-green-dark transition-colors">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                <Link 
                  href={`/blog/${post.slug}`}
                  className="text-hemp-green-dark font-semibold hover:underline inline-flex items-center"
                >
                  Read More
                  <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
        
        {/* Newsletter CTA */}
        <div className="mt-16 bg-hemp-green-light rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-hemp-text mb-4">Stay Updated</h2>
          <p className="text-hemp-accent mb-6">
            Subscribe to our newsletter to get the latest articles, sustainability tips, and exclusive offers.
          </p>
          <form className="max-w-md mx-auto">
            <div className="flex items-center">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 rounded-l-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-hemp-green-dark"
              />
              <button
                type="submit"
                className="bg-hemp-green-dark text-white px-6 py-3 rounded-r-full hover:bg-opacity-90 transition-colors"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
