'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Store, ShoppingBag, User, Heart } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

export default function BottomNav() {
  const pathname = usePathname()
  const { itemCount } = useCart()

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Home',
      isActive: pathname === '/'
    },
    {
      href: '/shop',
      icon: Store,
      label: 'Shop',
      isActive: pathname === '/shop' || pathname?.startsWith('/shop/')
    },
    {
      href: '/cart',
      icon: ShoppingBag,
      label: 'Cart',
      isActive: pathname === '/cart',
      badge: itemCount > 0 ? itemCount : undefined
    },
    {
      href: '/account',
      icon: User,
      label: 'Account',
      isActive: pathname === '/account'
    }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-100 z-50 md:hidden safe-bottom shadow-lg">
      <nav className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-300 min-w-0 flex-1 mx-1 min-h-[60px] ${
                item.isActive
                  ? 'text-hemp-green-dark bg-hemp-green-light/50 shadow-sm scale-105'
                  : 'text-hemp-muted hover:text-hemp-green-dark hover:bg-hemp-green-light/20 hover:scale-105 active:scale-95'
              }`}
              aria-label={`Navigate to ${item.label}`}
            >
              <div className="relative mb-1">
                <Icon className={`transition-all duration-300 ${
                  item.isActive ? 'w-6 h-6' : 'w-5 h-5'
                }`} />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-hemp-green-dark text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium shadow-sm animate-pulse">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`font-medium leading-none truncate transition-all duration-300 ${
                item.isActive ? 'text-xs' : 'text-xs opacity-75'
              }`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
