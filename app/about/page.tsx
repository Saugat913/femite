import Image from 'next/image'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { Leaf, Users, Award, Heart } from 'lucide-react'

export default function About() {
  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <span>About</span>
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="bg-hemp-beige py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-hemp-text mb-4 sm:mb-6">
            Our Story
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-hemp-accent max-w-3xl mx-auto leading-relaxed">
            Hemp Co. was born from a simple belief: fashion should feel good, look good, and do good. 
            We're committed to creating sustainable apparel that doesn't compromise on style or comfort.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-12">
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">
                Fashion with Purpose
              </h2>
              <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                Hemp has been used for clothing for thousands of years, but it's only recently that we've begun to appreciate 
                its incredible potential as a sustainable alternative to conventional fabrics. Our hemp clothing is not only 
                environmentally friendly but also incredibly durable, breathable, and comfortable.
              </p>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                Every piece in our collection is designed with both you and the planet in mind. We work directly with farmers 
                who use sustainable growing practices, and our manufacturing processes are designed to minimize environmental impact 
                while maximizing quality and comfort.
              </p>
            </div>
            <div className="relative order-1 lg:order-2">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFuNJJrwQOyqipgGbanjvsNSIpnoIQaUhObImnNGYK4JTi89LqVJOttcVYO5e0WZ1MM5DGsvoAwIs0ejz1N8MTQ8Zb97Jq_YrbrKhMhd-4PBQblx6YBtNazc4vm0FLqqdAi2-TH3XzhzcimtE1MH6B8Ps7-f_xhA9hdK6L1fXJUxOLfkqv2vS2x_MO4EdHPzIWWvx9iunc9KlRkH4o_NDZi5kaCXCK7K0A-4nxRrx4ly8qiBP48KAvasE-3SWM1QLsWUBTakO5Vs0"
                alt="Hemp field showcasing sustainable farming practices"
                width={600}
                height={400}
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Our Values
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything we do is guided by our core values of sustainability, quality, transparency, and community.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-hemp-green-light rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Leaf className="h-8 w-8 text-hemp-green-dark" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Sustainability</h3>
              <p className="text-gray-600">
                Hemp requires 50% less water than cotton and naturally enriches soil without pesticides.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-hemp-green-light rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Award className="h-8 w-8 text-hemp-green-dark" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Quality</h3>
              <p className="text-gray-600">
                Hemp fiber becomes softer with each wash and can last for decades with proper care.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-hemp-green-light rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-8 w-8 text-hemp-green-dark" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Transparency</h3>
              <p className="text-gray-600">
                We believe in complete transparency about our supply chain, materials, and manufacturing processes.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-hemp-green-light rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-hemp-green-dark" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Community</h3>
              <p className="text-gray-600">
                We support local communities and fair labor practices throughout our supply chain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Our Impact
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Since our founding, we've been committed to making a positive impact on both people and planet.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-hemp-green-dark mb-2">500K+</div>
              <div className="text-gray-600">Liters of water saved compared to conventional cotton</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-hemp-green-dark mb-2">50+</div>
              <div className="text-gray-600">Farming families supported worldwide</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-hemp-green-dark mb-2">100%</div>
              <div className="text-gray-600">Renewable energy used in our facilities</div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
