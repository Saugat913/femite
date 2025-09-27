'use client'

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'

interface EnhancedImageProps extends Omit<ImageProps, 'src'> {
  src: string
  productId?: string
  cacheBust?: boolean
  fallbackSrc?: string
}

/**
 * Enhanced Image component with cache busting capabilities
 * 
 * This component automatically adds cache-busting parameters to Cloudinary URLs
 * and provides better error handling for product images.
 */
export default function EnhancedImage({ 
  src, 
  productId, 
  cacheBust = false, 
  fallbackSrc = '/placeholder-image.jpg',
  ...props 
}: EnhancedImageProps) {
  const [imageSrc, setImageSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  // Generate cache-busted URL for Cloudinary images
  const getCacheBustedUrl = (url: string): string => {
    if (!cacheBust || !url) return url

    try {
      // For Cloudinary URLs, add transformation parameters for cache busting
      if (url.includes('res.cloudinary.com')) {
        const urlParts = url.split('/upload/')
        if (urlParts.length === 2) {
          const timestamp = Math.floor(Date.now() / 60000) // Update every minute
          const cacheBustParam = `c_scale,q_auto,f_auto,t_${timestamp}`
          
          // If there are existing transformations, prepend our cache bust
          const [baseUrl, pathAndTransform] = urlParts
          const transformMatch = pathAndTransform.match(/^([^/]+)\/(.+)$/)
          
          if (transformMatch) {
            const [, existingTransforms, imagePath] = transformMatch
            return `${baseUrl}/upload/${cacheBustParam},${existingTransforms}/${imagePath}`
          } else {
            return `${baseUrl}/upload/${cacheBustParam}/${pathAndTransform}`
          }
        }
      }
      
      // For other URLs, add timestamp query parameter
      const separator = url.includes('?') ? '&' : '?'
      const timestamp = Math.floor(Date.now() / 60000)
      return `${url}${separator}_t=${timestamp}`
    } catch (error) {
      console.warn('Failed to generate cache-busted URL:', error)
      return url
    }
  }

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImageSrc(fallbackSrc)
    }
  }

  const handleLoad = () => {
    setHasError(false)
  }

  const finalSrc = getCacheBustedUrl(imageSrc)

  return (
    <Image
      {...props}
      src={finalSrc}
      onError={handleError}
      onLoad={handleLoad}
      // Add cache tags for better revalidation
      {...(productId && { 'data-product-id': productId })}
      // Disable Next.js image optimization caching for cache-busted images
      {...(cacheBust && { unoptimized: false, priority: false })}
    />
  )
}