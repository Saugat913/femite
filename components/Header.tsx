'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, User, ShoppingCart, Menu, X, LogOut } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useSearch } from '@/lib/search-context'
import { useAuth } from '@/lib/auth-context'

export default function Header() {
  const { itemCount } = useCart()
  const { search, results, query, clearSearch, isSearching } = useSearch()
  const { user, isAuthenticated, logout, loading } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const searchRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const mobileSearchInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchInput(value)
    
    // Add slight delay for mobile to prevent excessive API calls
    const isMobile = window.innerWidth < 768
    const delay = 0
    
    if (delay > 0) {
      setTimeout(() => {
        if (value.trim() && value === searchInput) {
          search(value)
        } else if (!value.trim()) {
          clearSearch()
        }
      }, delay)
    } else {
      if (value.trim()) {
        search(value)
      } else {
        clearSearch()
      }
    }
  }

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchInput)}`)
      setIsSearchOpen(false)
      setSearchInput('')
      clearSearch()
    }
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
      setIsUserMenuOpen(false)
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus mobile search input when opened
  useEffect(() => {
    if (isSearchOpen && mobileSearchInputRef.current) {
      // Small delay to ensure the overlay is rendered
      setTimeout(() => {
        mobileSearchInputRef.current?.focus()
      }, 100)
    }
  }, [isSearchOpen])

  // Prevent body scroll when mobile search is open
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isSearchOpen])

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img 
              src="/femite-logo-compact.svg" 
              alt="Femite - Sustainable Hemp Fashion" 
              className="h-10 sm:h-12 lg:h-14 w-auto"
            />
          </Link>
        </div>
        
        <nav className="hidden lg:flex space-x-8">
          <Link href="/shop" className="text-hemp-accent hover:text-hemp-green-dark font-medium transition-colors">
            Shop
          </Link>
          <Link href="/about" className="text-hemp-accent hover:text-hemp-green-dark font-medium transition-colors">
            About
          </Link>
          <Link href="/blog" className="text-hemp-accent hover:text-hemp-green-dark font-medium transition-colors">
            Blog
          </Link>
          <Link href="/contact" className="text-hemp-accent hover:text-hemp-green-dark font-medium transition-colors">
            Contact
          </Link>
        </nav>
        
        {/* Desktop Search Bar */}
        <div className="hidden md:flex flex-1 max-w-lg mx-6 lg:mx-8">
          <div className="relative w-full" ref={searchRef}>
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchInput}
                  onChange={handleSearchChange}
                  placeholder="Search hemp products..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hemp-green-dark focus:border-transparent transition-all duration-200"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('')
                      clearSearch()
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </form>
            
            {/* Desktop Search Results Dropdown */}
            {searchInput && (
              <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
                {/* Desktop Debug Info
                {process.env.NODE_ENV === 'development' && (
                  <div className="p-2 bg-blue-100 text-xs border-b">
                    <strong>Desktop Debug:</strong> Input: "{searchInput}" | Searching: {isSearching ? 'Yes' : 'No'} | Results: {results.length}
                  </div>
                )} */}
                {isSearching ? (
                  <div className="p-6 text-center text-gray-500">
                    <div className="animate-pulse">Searching...</div>
                  </div>
                ) : results.length > 0 ? (
                  <>
                    <div className="max-h-80 overflow-y-auto">
                      {results.slice(0, 6).map((product, index) => (
                        <Link
                          key={product.id}
                          href={`/shop/${product.id}`}
                          onClick={() => {
                            setSearchInput('')
                            clearSearch()
                          }}
                          className="flex items-center p-4 hover:bg-hemp-green-light/30 transition-colors border-b border-gray-50 last:border-b-0"
                        >
                          <div className="w-16 h-16 bg-hemp-beige rounded-lg overflow-hidden flex-shrink-0 mr-4">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                            <p className="text-sm text-gray-500 mb-1">{product.category}</p>
                            <p className="text-hemp-green-dark font-bold">${product.price}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    {results.length > 6 && (
                      <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <button
                          onClick={() => {
                            router.push(`/shop?search=${encodeURIComponent(searchInput)}`)
                            setSearchInput('')
                            clearSearch()
                          }}
                          className="w-full text-center text-hemp-green-dark hover:text-hemp-green-dark/80 font-semibold py-2 hover:bg-hemp-green-light/20 transition-all"
                        >
                          View all {results.length} results →
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-lg font-medium mb-1">No products found</p>
                    <p className="text-sm">Try searching for "hemp shirt" or "organic"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Desktop Auth UI */}
          <div className="hidden md:block relative" ref={userMenuRef}>
            {loading ? (
              <div className="p-2 flex items-center">
                <img 
                  src="/femite-icon.svg" 
                  alt="Loading" 
                  className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 opacity-50 animate-pulse"
                />
              </div>
            ) : isAuthenticated && user ? (
              <div>
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-hemp-green-dark transition-colors p-2"
                >
                  <User className="h-6 w-6" />
                  <span className="text-sm font-medium">{user.name}</span>
                </button>
                
                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link 
                        href="/account" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-hemp-green-light/30 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        My Account
                      </Link>
                      <Link 
                        href="/orders" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-hemp-green-light/30 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        My Orders
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  href="/login" 
                  className="text-gray-600 hover:text-hemp-green-dark transition-colors px-3 py-2 text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="bg-hemp-green-dark text-white hover:bg-hemp-green-dark/90 transition-colors px-4 py-2 rounded text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
          <Link href="/cart" className="hidden md:block text-gray-600 hover:text-hemp-green-dark transition-colors relative p-2">
            <ShoppingCart className="h-6 w-6" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-hemp-green-dark text-white text-xs h-5 w-5 flex items-center justify-center font-medium">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>
          
          {/* Mobile Icons */}
          <div className="flex items-center space-x-1 md:hidden">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-gray-600 hover:text-hemp-green-dark transition-colors p-2"
            >
              <Search className="h-6 w-6" />
            </button>
            <Link href="/cart" className="text-gray-600 hover:text-hemp-green-dark transition-colors relative p-2">
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-hemp-green-dark text-white text-xs h-5 w-5 flex items-center justify-center font-medium">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>
            <button 
              className="text-gray-600 p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Search Overlay - FIXED VERSION */}
      {isSearchOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-50" 
          onClick={() => setIsSearchOpen(false)}
        >
          <div 
            className="bg-white h-full flex flex-col relative" 
            onClick={e => e.stopPropagation()}
            style={{
              height: '100vh',
              overflow: 'hidden'
            }}
          >
            {/* Mobile Search Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-800">Search Products</h2>
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Mobile Search Input */}
            <div className="p-4 flex-shrink-0">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input
                    ref={mobileSearchInputRef}
                    type="text"
                    value={searchInput}
                    onChange={handleSearchChange}
                    placeholder="Search hemp products..."
                    className="mobile-search-input w-full pl-12 pr-16 py-4 text-base bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-hemp-green-dark focus:border-hemp-green-dark focus:bg-white transition-all duration-200"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput('')
                        clearSearch()
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </form>
            </div>
            
            {/* Mobile Search Results */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-4 pb-6">
                {/* Debug Panel */}
                {/* {process.env.NODE_ENV === 'development' && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-xs">
                    <div><strong>Mobile Debug Info:</strong></div>
                    <div>Search Input: "{searchInput}"</div>
                    <div>Is Searching: {isSearching ? 'Yes' : 'No'}</div>
                    <div>Results Count: {results.length}</div>
                    <div>Query: "{query}"</div>
                    <div>Search Open: {isSearchOpen ? 'Yes' : 'No'}</div>
                    {results.length > 0 && (
                      <div>First Result: {results[0]?.name}</div>
                    )}
                  </div>
                )} */}

                {!searchInput ? (
                  <div className="text-center py-12">
                    <div className="bg-hemp-beige/30 border border-hemp-green-light/50 rounded-xl p-8">
                      <Search className="h-16 w-16 text-hemp-green-medium mx-auto mb-4" />
                      <p className="text-hemp-text text-lg mb-2 font-semibold">Start typing to search</p>
                      <p className="text-hemp-accent text-sm">Try "hemp shirt", "organic", or "sustainable"</p>
                    </div>
                  </div>
                ) : isSearching ? (
                  <div className="text-center py-12">
                    <div className="bg-hemp-green-light/30 border border-hemp-green-medium/50 rounded-xl p-8">
                      <div className="animate-pulse text-hemp-text text-lg font-semibold">Searching...</div>
                      <p className="text-hemp-accent text-sm mt-2">Please wait while we find your products</p>
                    </div>
                  </div>
                ) : results.length > 0 ? (
                  <div className="space-y-3">
                    <div className="bg-hemp-green-light/20 border border-hemp-green-light rounded-xl p-3 mb-4">
                      <p className="text-sm text-hemp-text font-semibold text-center">Found {results.length} products</p>
                    </div>
                    <div className="space-y-3">
                      {results.slice(0, 8).map((product, index) => (
                        <Link
                          key={`mobile-${product.id}-${index}`}
                          href={`/shop/${product.id}`}
                          onClick={() => {
                            setIsSearchOpen(false)
                            setSearchInput('')
                            clearSearch()
                          }}
                          className="mobile-search-result flex items-center p-4 bg-white border border-gray-200 rounded-xl hover:border-hemp-green-medium hover:bg-hemp-green-light/20 transition-all shadow-sm"
                        >
                          <div className="w-16 h-16 bg-hemp-beige rounded-lg overflow-hidden flex-shrink-0 mr-4">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  if (target.parentElement) {
                                    target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></div>';
                                  }
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Search className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 truncate mb-1 text-base">{product.name}</h3>
                            <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                            <p className="text-hemp-green-dark font-bold text-lg">${product.price}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                    {results.length > 8 && (
                      <div className="mt-4">
                        <button
                          onClick={() => {
                            router.push(`/shop?search=${encodeURIComponent(searchInput)}`)
                            setIsSearchOpen(false)
                            setSearchInput('')
                            clearSearch()
                          }}
                          className="w-full p-4 bg-hemp-green-dark text-white rounded-xl font-semibold hover:bg-hemp-green-dark/90 transition-colors shadow-md"
                        >
                          View all {results.length} results →
                        </button>
                      </div>
                    )}
                  </div>
                ) : searchInput ? (
                  <div className="text-center py-12">
                    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                      <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-700 text-lg mb-2 font-semibold">No products found</p>
                      <p className="text-gray-500 text-sm mb-6">Try searching for "hemp shirt" or "organic"</p>
                      <button
                        onClick={() => {
                          router.push('/shop')
                          setIsSearchOpen(false)
                          setSearchInput('')
                          clearSearch()
                        }}
                        className="bg-hemp-green-dark text-white px-6 py-3 rounded-xl font-semibold hover:bg-hemp-green-dark/90 transition-colors shadow-md"
                      >
                        Browse All Products
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="px-4 sm:px-6 py-4 space-y-4">
            <Link 
              href="/shop" 
              className="block text-gray-600 hover:text-hemp-green-dark transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Shop
            </Link>
            <Link 
              href="/about" 
              className="block text-gray-600 hover:text-hemp-green-dark transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/blog" 
              className="block text-gray-600 hover:text-hemp-green-dark transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link 
              href="/contact" 
              className="block text-gray-600 hover:text-hemp-green-dark transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            
            {/* Mobile Auth Menu */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              {loading ? (
                <div className="py-2 flex items-center space-x-2">
                  <img 
                    src="/femite-icon.svg" 
                    alt="Loading" 
                    className="h-5 w-5 opacity-50 animate-pulse"
                  />
                  <span className="text-hemp-muted text-sm">Loading...</span>
                </div>
              ) : isAuthenticated && user ? (
                <div className="space-y-2">
                  <div className="py-2 border-b border-gray-100 mb-2">
                    <p className="text-sm font-medium text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <Link 
                    href="/account" 
                    className="flex items-center text-gray-600 hover:text-hemp-green-dark transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    My Account
                  </Link>
                  <Link 
                    href="/orders" 
                    className="flex items-center text-gray-600 hover:text-hemp-green-dark transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    My Orders
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout()
                      setIsMobileMenuOpen(false)
                    }}
                    className="flex items-center text-red-600 hover:text-red-700 transition-colors py-2 w-full text-left"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link 
                    href="/login" 
                    className="block text-gray-600 hover:text-hemp-green-dark transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/register" 
                    className="block bg-hemp-green-dark text-white hover:bg-hemp-green-dark/90 transition-colors px-4 py-2 rounded text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}