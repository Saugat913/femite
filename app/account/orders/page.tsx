'use client'

import Layout from '@/components/Layout'
import OrdersTab from '@/components/OrdersTab'
import Link from 'next/link'

export default function AccountOrdersPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <Link href="/account">Account</Link>
          <span className="breadcrumb-separator">/</span>
          <span>Orders</span>
        </div>

        <div className="mt-6">
          <OrdersTab />
        </div>
      </div>
    </Layout>
  )
}