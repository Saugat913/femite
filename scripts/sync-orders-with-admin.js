#!/usr/bin/env node

/**
 * Sync Orders with Admin Panel Database
 * 
 * This script helps synchronize orders between your client database (femite)
 * and admin database (femite-admin) to ensure orders show up in both systems.
 */

const { Client } = require('pg')
require('dotenv').config({ path: '.env.local' })

// Client database (where orders are created)
const clientDb = new Client({
  connectionString: process.env.DATABASE_URL,
})

// Admin database (where admin panel looks for orders)  
const adminDb = new Client({
  connectionString: process.env.ADMIN_DATABASE_URL || process.env.DATABASE_URL,
})

async function syncOrders() {
  try {
    console.log('🔄 Starting order synchronization...')
    
    await clientDb.connect()
    await adminDb.connect()
    
    // Get all orders from client database
    const clientOrders = await clientDb.query(`
      SELECT 
        o.*,
        array_agg(
          json_build_object(
            'id', oi.id,
            'product_id', oi.product_id,
            'product_name', COALESCE(oi.product_name, p.name),
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `)
    
    console.log(`📊 Found ${clientOrders.rows.length} orders in client database`)
    
    // Check which orders exist in admin database
    const existingAdminOrders = await adminDb.query(`
      SELECT id FROM orders
    `)
    
    const existingIds = new Set(existingAdminOrders.rows.map(row => row.id))
    console.log(`📊 Found ${existingIds.size} orders in admin database`)
    
    let syncedCount = 0
    
    for (const order of clientOrders.rows) {
      if (!existingIds.has(order.id)) {
        console.log(`🔄 Syncing order ${order.id}...`)
        
        // Insert order into admin database
        await adminDb.query(`
          INSERT INTO orders (
            id, user_id, total_amount, status, 
            stripe_session_id, shipping_address, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO NOTHING
        `, [
          order.id,
          order.user_id,
          order.total_amount || order.total,
          order.status_v2 || order.status,
          order.stripe_session_id,
          order.shipping_address,
          order.created_at
        ])
        
        // Insert order items
        if (order.items && order.items[0]) {
          for (const item of order.items) {
            if (item.id) {
              await adminDb.query(`
                INSERT INTO order_items (
                  id, order_id, product_id, product_name,
                  quantity, price, created_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (id) DO NOTHING
              `, [
                item.id,
                order.id,
                item.product_id,
                item.product_name,
                item.quantity,
                item.price,
                order.created_at
              ])
            }
          }
        }
        
        syncedCount++
      }
    }
    
    console.log(`✅ Successfully synced ${syncedCount} new orders to admin database`)
    console.log(`📈 Total orders now: ${clientOrders.rows.length}`)
    
  } catch (error) {
    console.error('❌ Sync failed:', error)
    process.exit(1)
  } finally {
    await clientDb.end()
    await adminDb.end()
  }
}

// Run the sync
if (require.main === module) {
  syncOrders()
}

module.exports = { syncOrders }