import React from 'react'
import LoadingSpinner from './LoadingSpinner'

interface PageLoadingProps {
  title?: string
  description?: string
}

export default function PageLoading({ 
  title = "Loading", 
  description = "Please wait while we prepare your sustainable fashion experience..." 
}: PageLoadingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-hemp-beige/30 to-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <LoadingSpinner size="xl" text="" />
        <h2 className="text-2xl sm:text-3xl font-bold text-hemp-text mt-6 mb-4">
          {title}
        </h2>
        <p className="text-hemp-accent leading-relaxed">
          {description}
        </p>
        
        {/* Optional decorative elements */}
        <div className="flex justify-center space-x-2 mt-8">
          <div className="w-2 h-2 bg-hemp-green-light rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-hemp-green-medium rounded-full animate-pulse delay-100"></div>
          <div className="w-2 h-2 bg-hemp-green-dark rounded-full animate-pulse delay-200"></div>
        </div>
      </div>
    </div>
  )
}
