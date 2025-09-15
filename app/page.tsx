import Image from 'next/image'
import Link from 'next/link'
import { Sun, TrendingUp, Shield, Leaf, Droplets, Wind, Recycle, Activity, Heart, ArrowRight } from 'lucide-react'
import Layout from '@/components/Layout'
import ProductCard from '@/components/ProductCard'
import { productService } from '@/services/product-service'

export default async function Home() {
  const { products: featuredProducts } = await productService.getProducts({ limit: 6 })

  return (
    <Layout>
      {/* Hero Section */}
      {/* <section className="relative min-h-[60vh] sm:min-h-[80vh] lg:min-h-[100vh] overflow-hidden bg-hemp-beige">
        <div className="container mx-auto px-6 sm:px-12 h-full flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-12 py-8 sm:py-16 lg:py-0">
          <div className="text-center lg:text-left max-w-xl space-y-6 animate-fade-in-up">
            <h1 className="font-extrabold text-4xl sm:text-5xl lg:text-7xl text-hemp-text leading-tight">
              Conscious Comfort.
              <br />
              <span className="text-hemp-green-dark">Worn with Purpose.</span>
            </h1>
            <p className="text-lg sm:text-xl text-hemp-accent max-w-md mx-auto lg:mx-0 animate-fade-in-up animate-delay-1">
              Experience the soft embrace of nature with our ethically sourced hemp apparel.
            </p>
            <div className="animate-fade-in-up animate-delay-2">
              <Link 
                href="/shop"
                className="inline-block bg-hemp-green-dark text-white font-semibold py-3 px-8 rounded-full hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-hemp-green-light focus:ring-opacity-50 transition duration-300 group"
              >
                Explore Collection
                <span className="inline-block transition-transform duration-300 group-hover:translate-x-2 ml-2">→</span>
              </Link>
            </div>
          </div>
          <div className="relative w-full max-w-lg aspect-[4/5] lg:aspect-auto lg:h-[70vh] transform rotate-3 hover:rotate-1 transition-transform duration-700 ease-out animate-fade-in-up animate-delay-3">
            <div className="absolute inset-0 bg-gradient-to-tr from-hemp-green-dark/20 via-transparent to-hemp-beige/30 z-10"></div>
            <div className="absolute -inset-2 bg-gradient-to-r from-hemp-green-light to-hemp-green-dark opacity-75 blur-xl animate-pulse"></div>
            <div className="relative h-full w-full overflow-hidden">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCj3zSb1JSApo8kLuexTmmzstpLX5n2iC4w7vLdgU0mr7wHNNV_sAiyEgqYP0h7MgCKTEQW8Vh0m1-ZVH_TlJfJtnZWLSUHNMuT6Sv5Og0RV4scWteO7n5lPagovDhZgNdxbVEscNUonMrXYpliT_aHOYyz7pU4Yr_zR44gd9AgMuRqUosjZj7Fw6adBw52Sowyq-AVmbV39jKtiB5EPb0v-sbVCrdj1IAP91Bm93kRNMrmhM300Ku9RuJjdDpyVlYRVNHf-pvtigw"
                alt="Woman wearing hemp clothing in a minimalist setting"
                fill
                className="object-cover hover:scale-105 transition-transform duration-700 ease-out"
                priority
              />
            </div>
          </div>
        </div>
      </section> */}

      <section className="relative h-screen min-h-[700px] overflow-hidden">
        <div className="absolute inset-0 bg-hemp-beige"></div>
        <div className="container mx-auto px-6 h-full flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
            <div className="relative z-10 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-hemp-text leading-tight mb-6 animate-fade-in-up">
                Conscious Comfort.
                <br />
                <span className="text-hemp-green-dark">Worn with Purpose.</span>
              </h1>
              <p className="text-lg sm:text-xl lg:text-xl text-hemp-accent mb-10 max-w-lg mx-auto lg:mx-0 animate-fade-in-up animate-delay-1">
                Experience the soft embrace of nature with our ethically sourced hemp apparel.
              </p>
              <div className="animate-fade-in-up animate-delay-2">
                <Link 
                  href="/shop" 
                  className="bg-hemp-green-dark text-white font-bold py-4 px-10 rounded-full hover:bg-opacity-90 transition duration-300 inline-block group"
                >
                  Explore Collection
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-2 ml-2">→</span>
                </Link>
              </div>
            </div>
            <div className="relative h-[60vh] lg:h-[80vh] w-full">
              <div className="absolute inset-0 -right-1/4 -bottom-1/4 -top-10">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCj3zSb1JSApo8kLuexTmmzstpLX5n2iC4w7vLdgU0mr7wHNNV_sAiyEgqYP0h7MgCKTEQW8Vh0m1-ZVH_TlJfJtnZWLSUHNMuT6Sv5Og0RV4scWteO7n5lPagovDhZgNdxbVEscNUonMrXYpliT_aHOYyz7pU4Yr_zR44gd9AgMuRqUosjZj7Fw6adBw52Sowyq-AVmbV39jKtiB5EPb0v-sbVCrdj1IAP91Bm93kRNMrmhM300Ku9RuJjdDpyVlYRVNHf-pvtigw"
                  alt="Woman wearing hemp clothing in a minimalist setting"
                  fill
                  className="object-cover hero-image-clip animate-fade-in-up animate-delay-3"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-hemp-beige via-transparent to-transparent lg:bg-gradient-to-r"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent"></div>
      </section>
      {/* Scientific Benefits Section - Modern Flat Layout */}
      <section className="py-16 sm:py-20 lg:py-32 bg-hemp-beige/50">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          {/* Mobile Layout: Single Column */}
          <div className="lg:hidden">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-hemp-text mb-4">Science-Backed Performance</h2>
              <p className="text-hemp-accent max-w-2xl mx-auto leading-relaxed">Discover why leading athletes, professionals, and conscious consumers choose hemp apparel</p>
            </div>
            
            {/* Hemp Showcase Image */}
            <div className="relative mb-12">
              <div className="aspect-[4/5] max-w-xs sm:max-w-sm mx-auto relative rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpWKvMBot6SQO-sGqUZs2PTYrNDCKPhkAiFQe2FJjpkC-TBrMXdVwIVCbprkTM1z84BO_8mAp5uOKP3dChbVAp4crUUoeO2Tq3pLj4glkUWPBaIojsaaX6kshKbInOHxgSAoaYGsiIMvoxwSR1czXJlFh6dq48hpMjHhzzN8seXfzUWFO3yOZWyzS_usu_WPfnKIrcJ4r6IyVY-lv6Q38eWtzaSLYGk4lZjLuWdpYV59-XprHT3X7VKinmUwi4TByBY4VnpWEQOq8"
                  alt="Professional hemp clothing demonstration - superior performance and comfort"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  priority
                />
              </div>
            </div>

            {/* Feature Blocks Stacked Below */}
            <div className="space-y-6">
              <div className="card hover:shadow-md transition-all duration-300">
                <div className="card-padding">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-3 bg-hemp-green-light rounded-lg">
                      <Sun className="h-6 w-6 text-hemp-green-dark" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-hemp-text mb-2">Clinical UV Protection</h3>
                      <p className="text-hemp-accent leading-relaxed text-sm sm:text-base">Laboratory-tested SPF 50+ protection. Blocks 98% of harmful UV rays naturally - no chemical treatments needed. Perfect for outdoor professionals and active lifestyles.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card hover:shadow-md transition-all duration-300">
                <div className="card-padding">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-3 bg-hemp-green-light rounded-lg">
                      <Droplets className="h-6 w-6 text-hemp-green-dark" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-hemp-text mb-2">Advanced Moisture Management</h3>
                      <p className="text-hemp-accent leading-relaxed text-sm sm:text-base">Superior wicking technology keeps you 40% drier than cotton. Regulates temperature naturally - stays cool in summer, warm in winter. Ideal for athletes and busy professionals.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card hover:shadow-md transition-all duration-300">
                <div className="card-padding">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-3 bg-hemp-green-light rounded-lg">
                      <Shield className="h-6 w-6 text-hemp-green-dark" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-hemp-text mb-2">Triple-Strength Durability</h3>
                      <p className="text-hemp-accent leading-relaxed text-sm sm:text-base">3x stronger tensile strength than cotton. Resists wear, stretching, and fading. Average lifespan: 5-7 years with regular use. Your investment pays for itself.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card hover:shadow-md transition-all duration-300">
                <div className="card-padding">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-3 bg-hemp-green-light rounded-lg">
                      <Leaf className="h-6 w-6 text-hemp-green-dark" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-hemp-text mb-2">Certified Organic Purity</h3>
                      <p className="text-hemp-accent leading-relaxed text-sm sm:text-base">GOTS-certified organic hemp. Zero pesticides, herbicides, or synthetic chemicals. Hypoallergenic and safe for sensitive skin. Certified by independent third parties.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card hover:shadow-md transition-all duration-300">
                <div className="card-padding">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-3 bg-hemp-green-light rounded-lg">
                      <Activity className="h-6 w-6 text-hemp-green-dark" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-hemp-text mb-2">Natural Antimicrobial Defense</h3>
                      <p className="text-hemp-accent leading-relaxed text-sm sm:text-base">Inherent antimicrobial properties eliminate 99.9% of bacteria and fungi. Reduces odor naturally - less washing required. Clinically proven hygienic protection.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout: Cross-like Asymmetric Three Column */}
          <div className="hidden lg:grid lg:grid-cols-12 lg:gap-16 items-stretch min-h-[800px]">
            {/* Left Feature Blocks - Top Aligned with bottom spacing */}
            <div className="col-span-4 flex flex-col justify-start space-y-12 pt-8 pb-32">
              <div className="bg-white border-l-4 border-hemp-green-dark p-8 hover:bg-hemp-green-light/20 transition-colors duration-300">
                <div className="flex items-start space-x-5">
                  <div className="flex-shrink-0 mt-1">
                    <Sun className="h-6 w-6 text-hemp-green-dark stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-hemp-text mb-4">UV Protection</h3>
                    <p className="text-hemp-accent leading-relaxed text-base">Hemp fabric naturally filters harmful UV rays, keeping you protected outdoors.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-l-4 border-hemp-green-dark p-8 hover:bg-hemp-green-light/20 transition-colors duration-300">
                <div className="flex items-start space-x-5">
                  <div className="flex-shrink-0 mt-1">
                    <Droplets className="h-6 w-6 text-hemp-green-dark stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-hemp-text mb-4">Moisture Control</h3>
                    <p className="text-hemp-accent leading-relaxed text-base">Superior breathability and moisture-wicking properties for all-day comfort.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-l-4 border-hemp-green-dark p-8 hover:bg-hemp-green-light/20 transition-colors duration-300">
                <div className="flex items-start space-x-5">
                  <div className="flex-shrink-0 mt-1">
                    <Shield className="h-6 w-6 text-hemp-green-dark stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-hemp-text mb-4">Durability</h3>
                    <p className="text-hemp-accent leading-relaxed text-base">Hemp fibers are three times stronger than cotton, ensuring longevity.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Hemp Showcase - Centered */}
            <div className="col-span-4 flex flex-col justify-center">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-hemp-text mb-3">The Hemp Advantage</h2>
                <p className="text-hemp-accent max-w-sm mx-auto">Discover why hemp is nature's perfect fiber for sustainable clothing</p>
              </div>
              <div className="aspect-[4/5] relative">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpWKvMBot6SQO-sGqUZs2PTYrNDCKPhkAiFQe2FJjpkC-TBrMXdVwIVCbprkTM1z84BO_8mAp5uOKP3dChbVAp4crUUoeO2Tq3pLj4glkUWPBaIojsaaX6kshKbInOHxgSAoaYGsiIMvoxwSR1czXJlFh6dq48hpMjHhzzN8seXfzUWFO3yOZWyzS_usu_WPfnKIrcJ4r6IyVY-lv6Q38eWtzaSLYGk4lZjLuWdpYV59-XprHT3X7VKinmUwi4TByBY4VnpWEQOq8"
                  alt="Hemp clothing showcase - sustainable, comfortable, and eco-friendly fashion"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Right Feature Blocks - Bottom Aligned with top spacing */}
            <div className="col-span-4 flex flex-col justify-end space-y-12 pt-32 pb-8">
              <div className="bg-white border-r-4 border-hemp-green-dark p-8 hover:bg-hemp-green-light/20 transition-colors duration-300 text-right">
                <div className="flex items-start space-x-5 flex-row-reverse">
                  <div className="flex-shrink-0 mt-1">
                    <Leaf className="h-6 w-6 text-hemp-green-dark stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-hemp-text mb-4">100% Organic</h3>
                    <p className="text-hemp-accent leading-relaxed text-base">Grown without harmful pesticides, fertilizers, or genetic modification.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-r-4 border-hemp-green-dark p-8 hover:bg-hemp-green-light/20 transition-colors duration-300 text-right">
                <div className="flex items-start space-x-5 flex-row-reverse">
                  <div className="flex-shrink-0 mt-1">
                    <Wind className="h-6 w-6 text-hemp-green-dark stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-hemp-text mb-4">Natural Comfort</h3>
                    <p className="text-hemp-accent leading-relaxed text-base">Soft texture that improves with each wash, naturally breathable fabric.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-r-4 border-hemp-green-dark p-8 hover:bg-hemp-green-light/20 transition-colors duration-300 text-right">
                <div className="flex items-start space-x-5 flex-row-reverse">
                  <div className="flex-shrink-0 mt-1">
                    <Activity className="h-6 w-6 text-hemp-green-dark stroke-[1.5]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-hemp-text mb-4">Antimicrobial</h3>
                    <p className="text-hemp-accent leading-relaxed text-base">Natural resistance to odors, bacteria, and mold for lasting freshness.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20 sm:py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-hemp-text mb-6">Featured Collection</h2>
            <p className="text-lg sm:text-xl text-hemp-accent leading-relaxed">Discover our curated selection of premium hemp clothing. Each piece is crafted with care for comfort, style, and sustainability.</p>
          </div>
          <div className="product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-12">
            <Link href="/shop" className="btn-primary py-4 px-8 text-lg">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Blog Posts Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-hemp-beige/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-hemp-text mb-6">From The Blog</h2>
            <p className="text-lg sm:text-xl text-hemp-accent max-w-2xl mx-auto">Discover sustainable living tips, hemp care guides, and the latest in eco-fashion.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Featured Blog Post 1 */}
            <article className="card hover:shadow-lg transition-all duration-300">
              <div className="card-padding">
                <div className="mb-6">
                  <span className="bg-hemp-green-dark text-white px-4 py-2 text-sm font-semibold rounded-full">
                    Sustainability
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-hemp-text mb-4">
                  Why Hemp is the Future of Sustainable Fashion
                </h3>
                <p className="text-hemp-accent mb-8 leading-relaxed">
                  Discover how hemp clothing is revolutionizing the fashion industry with its eco-friendly properties, durability, and incredible comfort that gets better with every wear.
                </p>
                <Link
                  href="/blog/hemp-future-sustainable-fashion"
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>

            {/* Featured Blog Post 2 - With Image */}
            <article className="card hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="aspect-[16/10] bg-hemp-green-light relative overflow-hidden">
                <Image
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFuNJJrwQOyqipgGbanjvsNSIpnoIQaUhObImnNGYK4JTi89LqVJOttcVYO5e0WZ1MM5DGsvoAwIs0ejz1N8MTQ8Zb97Jq_YrbrKhMhd-4PBQblx6YBtNazc4vm0FLqqdAi2-TH3XzhzcimtE1MH6B8Ps7-f_xhA9hdK6L1fXJUxOLfkqv2vS2x_MO4EdHPzIWWvx9iunc9KlRkH4o_NDZi5kaCXCK7K0A-4nxRrx4ly8qiBP48KAvasE-3SWM1QLsWUBTakO5Vs0"
                  alt="Hemp care guide and longevity tips"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-4 left-4">
                  <span className="bg-white/90 text-hemp-text px-3 py-2 text-sm font-semibold rounded-full backdrop-blur-sm">
                    Care Guide
                  </span>
                </div>
              </div>
              <div className="card-padding">
                <h3 className="text-xl sm:text-2xl font-bold text-hemp-text mb-3">
                  Three Key Steps to Hemp Care & Longevity
                </h3>
                <p className="text-hemp-accent mb-6 leading-relaxed">
                  Learn the essential care techniques that will keep your hemp garments looking fresh and feeling soft for years to come.
                </p>
                <Link
                  href="/blog/hemp-clothing-care-tips"
                  className="btn-secondary inline-flex items-center space-x-2"
                >
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Summer Collection Promotion */}
      <section className="py-16 sm:py-20 lg:py-24 bg-hemp-green-light">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="bg-hemp-green-dark overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch">
              {/* Content Section */}
              <div className="p-6 sm:p-8 lg:p-12 text-white">
                <div className="mb-6">
                  <span className="bg-white text-hemp-green-dark px-4 py-2 text-sm font-bold">
                    25% OFF
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Summer Collection</h2>
                <p className="text-hemp-green-light mb-8 text-base sm:text-lg leading-relaxed">
                  Beat the heat with our breathable hemp summer essentials. Lightweight, UV-protective, and naturally cooling.
                </p>
                <Link
                  href="/shop?category=summer"
                  className="bg-white text-hemp-green-dark px-6 sm:px-8 py-3 font-semibold hover:bg-hemp-beige transition-colors duration-200 inline-flex items-center space-x-2"
                >
                  <span>Shop Summer Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Product Showcase */}
              <div className="p-6 sm:p-8 lg:p-12 bg-white bg-opacity-10">
                <div className="bg-white p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="aspect-square bg-hemp-green-light flex items-center justify-center">
                      <div className="w-16 h-16 bg-hemp-green-dark flex items-center justify-center">
                        <Sun className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="aspect-square bg-hemp-green-light flex items-center justify-center">
                      <div className="w-16 h-16 bg-hemp-green-dark flex items-center justify-center">
                        <Wind className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-hemp-text text-lg mb-2">Summer Essentials Bundle</h3>
                    <p className="text-hemp-accent text-sm mb-4">Tee + Shorts + Tank Top</p>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-2xl font-bold text-hemp-green-dark">$98</span>
                      <span className="text-base text-hemp-accent line-through">$130</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hemp Rose Collection Feature */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="bg-hemp-beige overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch">
              {/* Image Section */}
              <div className="relative order-2 lg:order-1">
                <div className="aspect-[4/3] lg:aspect-auto lg:h-full bg-hemp-green-light relative">
                  <Image
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpWKvMBot6SQO-sGqUZs2PTYrNDCKPhkAiFQe2FJjpkC-TBrMXdVwIVCbprkTM1z84BO_8mAp5uOKP3dChbVAp4crUUoeO2Tq3pLj4glkUWPBaIojsaaX6kshKbInOHxgSAoaYGsiIMvoxwSR1czXJlFh6dq48hpMjHhzzN8seXfzUWFO3yOZWyzS_usu_WPfnKIrcJ4r6IyVY-lv6Q38eWtzaSLYGk4lZjLuWdpYV59-XprHT3X7VKinmUwi4TByBY4VnpWEQOq8"
                    alt="Hemp Rose Collection - Natural rose-dyed sustainable hemp clothing"
                    fill
                    className="object-cover"
                  />
                  {/* Decorative Elements */}
                  <div className="absolute top-6 right-6 opacity-30">
                    <Heart className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute bottom-6 left-6 opacity-20">
                    <Leaf className="w-16 h-16 text-white transform rotate-12" />
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 sm:p-8 lg:p-12 order-1 lg:order-2">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-hemp-green-dark flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-hemp-green-dark font-semibold">Femite Organic Collection</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-hemp-text mb-6">Hemp Rose</h2>

                <p className="text-hemp-accent mb-8 text-base sm:text-lg leading-relaxed">
                  Our signature rose-dyed hemp fabric combines natural beauty with sustainable luxury.
                  Each piece is hand-dyed using organic rose extracts for a unique, gentle color that's kind to your skin.
                </p>

                {/* Feature Highlights */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-hemp-green-dark"></div>
                    <span className="text-hemp-accent text-sm">Hand-dyed with organic rose extracts</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-hemp-green-dark"></div>
                    <span className="text-hemp-accent text-sm">Gentle on sensitive skin</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-hemp-green-dark"></div>
                    <span className="text-hemp-accent text-sm">Unique color variations in each piece</span>
                  </div>
                </div>

                <Link
                  href="/shop?collection=hemp-rose"
                  className="bg-hemp-green-dark text-white px-6 sm:px-8 py-3 font-semibold hover:bg-hemp-green-dark/90 transition-colors duration-200 inline-flex items-center space-x-2"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-hemp-green-dark">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center text-white">
            <div className="mb-8">
              <div className="w-20 h-20 bg-white/10 mx-auto mb-6 flex items-center justify-center rounded-2xl backdrop-blur-sm">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">Join Our Community</h2>
              <p className="text-hemp-green-light text-lg sm:text-xl leading-relaxed">
                Subscribe to our newsletter for exclusive offers, new arrivals, and sustainability tips. Be part of the sustainable fashion movement.
              </p>
            </div>

            <form className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  className="flex-1 px-6 py-4 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white text-base placeholder-hemp-green-light backdrop-blur-sm"
                  placeholder="Enter your email address"
                  type="email"
                  required
                />
                <button
                  type="submit"
                  className="bg-white text-hemp-green-dark font-semibold px-8 py-4 rounded-lg hover:bg-hemp-beige transition-colors duration-300 inline-flex items-center justify-center space-x-2"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-hemp-green-light text-sm mt-6 opacity-80">
                No spam, just sustainable fashion updates. Unsubscribe anytime.
              </p>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  )
}
