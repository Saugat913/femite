#!/usr/bin/env node

// Simple test script to verify revalidation API
// Usage: node test-revalidation.js

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const SECRET = process.env.REVALIDATION_SECRET || 'test-secret-key'

async function testRevalidationAPI() {
  console.log('🧪 Testing Revalidation API...\n')
  
  // Test 1: Check endpoint availability
  console.log('1. Testing endpoint availability...')
  try {
    const response = await fetch(`${BASE_URL}/api/revalidate`, {
      method: 'GET'
    })
    const data = await response.json()
    console.log('✅ Endpoint is active:', data.message)
  } catch (error) {
    console.log('❌ Endpoint test failed:', error.message)
    return
  }

  // Test 2: Test product revalidation
  console.log('\n2. Testing product revalidation...')
  try {
    const response = await fetch(`${BASE_URL}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: SECRET,
        type: 'product',
        id: 'test-product-123'
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      console.log('✅ Product revalidation successful')
      console.log('   Revalidated paths:', data.paths)
    } else {
      console.log('❌ Product revalidation failed:', data.error)
    }
  } catch (error) {
    console.log('❌ Product revalidation request failed:', error.message)
  }

  // Test 3: Test blog revalidation
  console.log('\n3. Testing blog revalidation...')
  try {
    const response = await fetch(`${BASE_URL}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: SECRET,
        type: 'blog',
        id: 'test-blog-post'
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      console.log('✅ Blog revalidation successful')
      console.log('   Revalidated paths:', data.paths)
    } else {
      console.log('❌ Blog revalidation failed:', data.error)
    }
  } catch (error) {
    console.log('❌ Blog revalidation request failed:', error.message)
  }

  // Test 4: Test all pages revalidation
  console.log('\n4. Testing all pages revalidation...')
  try {
    const response = await fetch(`${BASE_URL}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: SECRET,
        type: 'all'
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      console.log('✅ All pages revalidation successful')
      console.log('   Revalidated paths:', data.paths)
    } else {
      console.log('❌ All pages revalidation failed:', data.error)
    }
  } catch (error) {
    console.log('❌ All pages revalidation request failed:', error.message)
  }

  // Test 5: Test invalid secret
  console.log('\n5. Testing security (invalid secret)...')
  try {
    const response = await fetch(`${BASE_URL}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: 'invalid-secret',
        type: 'all'
      })
    })
    
    const data = await response.json()
    
    if (response.status === 401) {
      console.log('✅ Security test passed - invalid secret rejected')
    } else {
      console.log('❌ Security test failed - invalid secret accepted')
    }
  } catch (error) {
    console.log('❌ Security test request failed:', error.message)
  }

  console.log('\n🎉 Revalidation API tests completed!')
  console.log('\n📝 For your admin panel, use:')
  console.log(`   URL: ${BASE_URL}/api/revalidate`)
  console.log(`   Secret: ${SECRET}`)
}

// Run the test
testRevalidationAPI().catch(console.error)