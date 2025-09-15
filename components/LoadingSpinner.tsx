import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  className?: string
}

export default function LoadingSpinner({ 
  size = 'md', 
  text = 'Loading...', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-20 h-10',
    md: 'w-32 h-16', 
    lg: 'w-48 h-24',
    xl: 'w-64 h-32'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg', 
    xl: 'text-xl'
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        <img 
          src="/femite-logo-animated.svg"
          alt="Femite Loading"
          className="w-full h-full object-contain"
        />
      </div>
      {text && (
        <p className={`text-hemp-accent font-medium ${textSizes[size]} animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  )
}
