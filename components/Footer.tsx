import Link from 'next/link'
import { Facebook, Twitter, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-hemp-text text-white">
      <div className="container mx-auto py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div>
            <div className="mb-6">
              <img 
                src="/femite-logo-white.svg" 
                alt="Femite - Sustainable Hemp Fashion" 
                className="h-12 sm:h-14 lg:h-16 w-auto"
              />
            </div>
            <p className="text-gray-300 leading-relaxed">Pioneering sustainable hemp fashion. Experience revolutionary comfort with our ethically sourced, scientifically superior hemp apparel.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-6">Shop</h3>
            <ul className="space-y-3">
              <li><Link href="/shop?category=T-Shirts" className="text-gray-300 hover:text-hemp-green-light font-medium transition-colors">T-Shirts</Link></li>
              <li><Link href="/shop?category=Hoodies" className="text-gray-300 hover:text-hemp-green-light font-medium transition-colors">Hoodies</Link></li>
              <li><Link href="/shop?category=Pants" className="text-gray-300 hover:text-hemp-green-light font-medium transition-colors">Pants</Link></li>
              <li><Link href="/shop?category=Accessories" className="text-gray-300 hover:text-hemp-green-light font-medium transition-colors">Accessories</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-6">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-gray-300 hover:text-hemp-green-light font-medium transition-colors">Our Story</Link></li>
              <li><Link href="/sustainability" className="text-gray-300 hover:text-hemp-green-light font-medium transition-colors">Sustainability</Link></li>
              <li><Link href="/blog" className="text-gray-300 hover:text-hemp-green-light font-medium transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-hemp-green-light font-medium transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-6">Connect</h3>
            <p className="text-gray-300 mb-4 text-sm">Follow us for sustainable fashion tips and updates</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-hemp-green-light transition-colors p-2 rounded-lg hover:bg-white/10">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-hemp-green-light transition-colors p-2 rounded-lg hover:bg-white/10">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-hemp-green-light transition-colors p-2 rounded-lg hover:bg-white/10">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-600 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-300">
          <p>&copy; 2024 Femite. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Crafted with 🌱 for a sustainable tomorrow</p>
        </div>
      </div>
    </footer>
  )
}
