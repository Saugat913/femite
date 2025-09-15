export interface Product {
  id: string
  name: string
  price: number
  description: string
  image: string
  category: string
  sizes: string[]
  colors: string[]
  features?: string[]
  isNew?: boolean
  stock?: number
  createdAt?: string
}

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  image: string
  size: string
  color: string
  quantity: number
}

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  image: string
  category: string
  slug: string
  content?: string
  publishedAt: string
}
