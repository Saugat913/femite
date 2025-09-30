'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface OrderPageProps {
  params: {
    id: string
  }
}

// Redirect component to redirect old /orders/[id] URLs to new /account/orders/[id] URLs
export default function OrderDetailsPageRedirect({ params }: OrderPageProps) {
  const router = useRouter()

  useEffect(() => {
    // Redirect to new route
    router.replace(`/account/orders/${params.id}`)
  }, [params.id, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>Redirecting...</p>
      </div>
    </div>
  )
}
