import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/lib/cart-context'
import { SearchProvider } from '@/lib/search-context'
import { AuthProvider } from '@/lib/auth-context'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'Femite - Revolutionary Hemp Fashion | Sustainable Comfort',
  description: 'Discover scientifically superior hemp clothing that outperforms cotton. 3x stronger, naturally antimicrobial, UV protective. Join 50,000+ customers choosing conscious fashion.',
  keywords: 'femite, hemp clothing, sustainable fashion, organic hemp, antimicrobial clothing, UV protection, eco-friendly fashion, hemp apparel',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} bg-gray-50 antialiased`}>
        <AuthProvider>
          <SearchProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </SearchProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
