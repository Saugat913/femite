#!/usr/bin/env node

const { Pool } = require('pg')
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')

async function seedDatabase() {
  console.log('🌱 Starting database seeding...')
  
  // Database connection
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required')
  }
  
  const requiresSSL = connectionString.includes('aivencloud.com') || 
                     connectionString.includes('sslmode=require') ||
                     process.env.NODE_ENV === 'production'
  
  const pool = new Pool({
    connectionString,
    ssl: requiresSSL 
      ? { rejectUnauthorized: false, checkServerIdentity: false } 
      : false,
  })
  
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')

    // 1. Create categories
    console.log('📂 Creating categories...')
    const categories = [
      { id: uuidv4(), name: 'T-Shirts', description: 'Comfortable hemp t-shirts for everyday wear' },
      { id: uuidv4(), name: 'Hoodies', description: 'Warm and cozy hemp hoodies' },
      { id: uuidv4(), name: 'Pants', description: 'Durable hemp pants and trousers' },
      { id: uuidv4(), name: 'Dresses', description: 'Elegant hemp dresses for all occasions' },
      { id: uuidv4(), name: 'Accessories', description: 'Hemp bags, hats, and accessories' }
    ]

    for (const category of categories) {
      await client.query(
        'INSERT INTO categories (id, name, description) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
        [category.id, category.name, category.description]
      )
    }

    // 2. Create admin and test users
    console.log('👥 Creating users...')
    const users = [
      {
        id: uuidv4(),
        email: 'admin@hempfashion.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        id: uuidv4(),
        email: 'customer@test.com',
        password: 'password123',
        role: 'client'
      },
      {
        id: uuidv4(),
        email: 'jane.doe@example.com',
        password: 'jane123',
        role: 'client'
      }
    ]

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 12)
      await client.query(
        'INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING',
        [user.id, user.email, hashedPassword, user.role]
      )
    }

    // 3. Create products
    console.log('👕 Creating products...')
    const products = [
      {
        id: uuidv4(),
        name: 'Organic Hemp Basic T-Shirt',
        description: 'Ultra-soft organic hemp t-shirt. Made from 100% hemp fiber for maximum comfort and durability. Perfect for everyday wear.',
        price: 29.99,
        stock: 150,
        image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center',
        category: 'T-Shirts'
      },
      {
        id: uuidv4(),
        name: 'Hemp Classic Hoodie',
        description: 'Cozy hemp hoodie with kangaroo pocket. Breathable, moisture-wicking, and naturally antimicrobial.',
        price: 79.99,
        stock: 75,
        image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop&crop=center',
        category: 'Hoodies'
      },
      {
        id: uuidv4(),
        name: 'Sustainable Hemp Jeans',
        description: 'Durable hemp-blend jeans. 3x stronger than cotton with natural UV protection and temperature regulation.',
        price: 89.99,
        stock: 100,
        image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop&crop=center',
        category: 'Pants'
      },
      {
        id: uuidv4(),
        name: 'Hemp Summer Dress',
        description: 'Lightweight hemp dress perfect for summer. Naturally wrinkle-resistant and gets softer with each wash.',
        price: 69.99,
        stock: 60,
        image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop&crop=center',
        category: 'Dresses'
      },
      {
        id: uuidv4(),
        name: 'Hemp Long Sleeve Tee',
        description: 'Versatile hemp long sleeve tee. Perfect for layering or wearing alone. UV protection and odor resistance.',
        price: 39.99,
        stock: 120,
        image_url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop&crop=center',
        category: 'T-Shirts'
      },
      {
        id: uuidv4(),
        name: 'Hemp Cargo Shorts',
        description: 'Durable hemp cargo shorts with multiple pockets. Perfect for outdoor adventures.',
        price: 49.99,
        stock: 90,
        image_url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=400&fit=crop&crop=center',
        category: 'Pants'
      },
      {
        id: uuidv4(),
        name: 'Hemp Zip-Up Hoodie',
        description: 'Comfortable hemp zip-up hoodie. Great for workouts or casual wear. Moisture-wicking and breathable.',
        price: 84.99,
        stock: 65,
        image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&crop=center',
        category: 'Hoodies'
      },
      {
        id: uuidv4(),
        name: 'Eco-Friendly Hemp Tote Bag',
        description: 'Sturdy hemp tote bag for shopping and daily use. 100% biodegradable and machine washable.',
        price: 24.99,
        stock: 200,
        image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center',
        category: 'Accessories'
      },
      {
        id: uuidv4(),
        name: 'Hemp Button-Up Shirt',
        description: 'Professional hemp button-up shirt. Wrinkle-resistant and perfect for office or casual wear.',
        price: 59.99,
        stock: 80,
        image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop&crop=center',
        category: 'T-Shirts'
      },
      {
        id: uuidv4(),
        name: 'Hemp Maxi Dress',
        description: 'Elegant hemp maxi dress. Flow beautifully and perfect for special occasions or casual elegance.',
        price: 89.99,
        stock: 45,
        image_url: 'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=400&h=400&fit=crop&crop=center',
        category: 'Dresses'
      }
    ]

    for (const product of products) {
      await client.query(
        'INSERT INTO products (id, name, description, price, stock, image_url) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
        [product.id, product.name, product.description, product.price, product.stock, product.image_url]
      )
    }

    // 4. Link products to categories
    console.log('🔗 Linking products to categories...')
    for (const product of products) {
      const categoryResult = await client.query(
        'SELECT id FROM categories WHERE name = $1',
        [product.category]
      )
      
      if (categoryResult.rows.length > 0) {
        const categoryId = categoryResult.rows[0].id
        await client.query(
          'INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [product.id, categoryId]
        )
      }
    }

    // 5. Create sample carts for test users (optional)
    console.log('🛒 Creating sample carts...')
    const testUser = users.find(u => u.email === 'customer@test.com')
    if (testUser) {
      const cartId = uuidv4()
      await client.query(
        'INSERT INTO carts (id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [cartId, testUser.id]
      )

      // Add a few items to the test cart
      const sampleProducts = products.slice(0, 2) // First 2 products
      for (const product of sampleProducts) {
        const cartItemId = uuidv4()
        await client.query(
          'INSERT INTO cart_items (id, cart_id, product_id, quantity) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
          [cartItemId, cartId, product.id, 1]
        )
      }
    }

    await client.query('COMMIT')

    console.log('✅ Database seeding completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   • ${categories.length} categories created`)
    console.log(`   • ${users.length} users created`)
    console.log(`   • ${products.length} products created`)
    console.log('\n👤 Test Users:')
    console.log('   • admin@hempfashion.com / admin123 (admin)')
    console.log('   • customer@test.com / password123 (customer)')
    console.log('   • jane.doe@example.com / jane123 (customer)')

  } catch (error) {
    await client.query('ROLLBACK')
    console.error('❌ Seeding failed:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Run seeding
seedDatabase()
  .then(() => {
    console.log('\n🎉 Seeding completed! Your hemp fashion ecommerce system is ready to use.')
    process.exit(0)
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
