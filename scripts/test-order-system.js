#!/usr/bin/env node

/**
 * Test Order System Integration
 * 
 * This script tests the complete order flow from creation to retrieval
 * Run: node scripts/test-order-system.js
 */

const { Client } = require('pg')
require('dotenv').config({ path: '.env.local' })

// Handle SSL for cloud databases
if (process.env.DATABASE_URL?.includes('aivencloud.com')) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

const db = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('aivencloud.com') ? {
    rejectUnauthorized: false
  } : false
})

async function testOrderSystem() {
  try {
    console.log('🔍 Testing Order System Integration...')
    
    await db.connect()
    
    // 1. Check database schema
    console.log('\n1️⃣ Checking database schema...')
    
    const tablesCheck = await db.query(`
      SELECT table_name, column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name IN ('orders', 'order_items', 'order_status_history')
      ORDER BY table_name, ordinal_position
    `)
    
    const tablesByName = {}
    tablesCheck.rows.forEach(row => {
      if (!tablesByName[row.table_name]) {
        tablesByName[row.table_name] = []
      }
      tablesByName[row.table_name].push({
        column: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable
      })
    })
    
    console.log('📊 Database schema:')
    Object.keys(tablesByName).forEach(tableName => {
      console.log(`  ${tableName}:`)
      tablesByName[tableName].forEach(col => {
        console.log(`    - ${col.column}: ${col.type}${col.nullable === 'NO' ? ' (required)' : ''}`)
      })
    })
    
    // 2. Check existing orders
    console.log('\n2️⃣ Checking existing orders...')
    
    const ordersCount = await db.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_orders,
        COUNT(CASE WHEN status_v2 = 'paid' THEN 1 END) as paid_orders_v2,
        COUNT(CASE WHEN stripe_session_id IS NOT NULL THEN 1 END) as stripe_orders
      FROM orders
    `)
    
    const stats = ordersCount.rows[0]
    console.log('📈 Order statistics:')
    console.log(`  Total orders: ${stats.total_orders}`)
    console.log(`  Paid orders (old): ${stats.paid_orders}`)
    console.log(`  Paid orders (new): ${stats.paid_orders_v2}`)
    console.log(`  Stripe orders: ${stats.stripe_orders}`)
    
    // 3. Check recent orders with details
    if (parseInt(stats.total_orders) > 0) {
      console.log('\n3️⃣ Recent orders:')
      
      const recentOrders = await db.query(`
        SELECT 
          o.id,
          o.user_id,
          COALESCE(o.total_amount, o.total) as total,
          COALESCE(o.status_v2, o.status) as status,
          o.created_at,
          o.stripe_session_id,
          COUNT(oi.id) as item_count
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id, o.user_id, o.total_amount, o.total, o.status_v2, o.status, o.created_at, o.stripe_session_id
        ORDER BY o.created_at DESC
        LIMIT 5
      `)
      
      recentOrders.rows.forEach((order, index) => {
        console.log(`  ${index + 1}. Order ${order.id.slice(-8)}:`)
        console.log(`     Status: ${order.status}`)
        console.log(`     Total: $${parseFloat(order.total).toFixed(2)}`)
        console.log(`     Items: ${order.item_count}`)
        console.log(`     User: ${order.user_id}`)
        console.log(`     Date: ${order.created_at}`)
        if (order.stripe_session_id) {
          console.log(`     Stripe: ${order.stripe_session_id}`)
        }
        console.log('')
      })
    }
    
    // 4. Test API endpoints (if running)
    console.log('4️⃣ API endpoint status:')
    console.log('  📝 To test APIs, ensure your Next.js server is running:')
    console.log('     npm run dev')
    console.log('')
    console.log('  🔗 Test these endpoints:')
    console.log('     GET /api/orders (requires auth)')
    console.log('     GET /api/orders/[id] (requires auth)')
    console.log('     POST /api/webhooks/stripe (Stripe webhook)')
    console.log('     GET /api/checkout/session-details (requires auth)')
    
    // 5. Check user accounts
    console.log('\n5️⃣ User accounts check:')
    
    const usersCount = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users
      FROM users
    `)
    
    const userStats = usersCount.rows[0]
    console.log(`  Total users: ${userStats.total_users}`)
    console.log(`  Admin users: ${userStats.admin_users}`)
    
    // 6. Final recommendations
    console.log('\n✅ System Status Summary:')
    
    if (parseInt(stats.total_orders) === 0) {
      console.log('⚠️  No orders found - this is expected for a fresh setup')
      console.log('💡 Create a test order by:')
      console.log('   1. Register/login as a user')
      console.log('   2. Add products to cart')
      console.log('   3. Complete checkout with Stripe test card')
    } else {
      console.log('✅ Orders found in database')
      console.log('🔄 Check if orders appear in:')
      console.log('   - Account page (/account → Orders tab)')
      console.log('   - Admin panel (if connected)')
    }
    
    console.log('\n🔧 Next steps:')
    console.log('1. Start your dev server: npm run dev')
    console.log('2. Test the complete order flow')
    console.log('3. Check Stripe webhook logs in dashboard')
    console.log('4. Verify orders appear in both client and admin')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  } finally {
    await db.end()
  }
}

// Run the test
if (require.main === module) {
  testOrderSystem()
}

module.exports = { testOrderSystem }