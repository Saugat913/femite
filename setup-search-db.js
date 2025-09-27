const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// For development/testing with self-signed certificates
if (process.env.NODE_ENV === 'development' || 
    (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('aivencloud.com'))) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

async function setupSearchDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const requiresSSL = connectionString.includes('aivencloud.com') || 
                     connectionString.includes('sslmode=require') ||
                     process.env.NODE_ENV === 'production';

  const sslConfig = requiresSSL 
    ? { 
        rejectUnauthorized: false, 
        checkServerIdentity: () => undefined,
        secureProtocol: 'TLSv1_2_method'
      }
    : false;

  const pool = new Pool({
    connectionString,
    ssl: sslConfig,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  console.log('Connecting to database...');

  try {
    // Test connection
    const client = await pool.connect();
    console.log('✓ Database connected successfully');
    client.release();

    // Read and execute the search optimization migration
    const migrationPath = path.join(__dirname, 'lib/migrations/search-optimization.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Running search optimization migration...');
    await pool.query(migrationSQL);
    console.log('✓ Search optimization migration completed');

    // Check if we have any products
    const productsResult = await pool.query('SELECT COUNT(*) as count FROM products');
    const productCount = parseInt(productsResult.rows[0].count);
    console.log(`Found ${productCount} products in database`);

    if (productCount === 0) {
      console.log('No products found. Adding sample products...');
      await insertSampleProducts(pool);
    } else {
      console.log('Updating search vectors for existing products...');
      await pool.query(`
        UPDATE products SET search_vector = 
          setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
          setweight(to_tsvector('english', COALESCE(description, '')), 'B')
        WHERE search_vector IS NULL
      `);
    }

    // Add some sample search suggestions
    console.log('Adding sample search suggestions...');
    await addSampleSearchSuggestions(pool);

    console.log('✓ Database setup completed successfully');
    
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function insertSampleProducts(pool) {
  const sampleProducts = [
    {
      name: 'Organic Hemp T-Shirt',
      description: 'Ultra-soft organic hemp t-shirt with natural UV protection and antimicrobial properties',
      price: 45.99,
      stock: 100,
      image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: 'Hemp Denim Jacket',
      description: 'Durable hemp denim jacket that gets softer with every wash. Perfect for casual wear',
      price: 89.99,
      stock: 50,
      image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: 'Sustainable Hemp Hoodie',
      description: 'Cozy hemp hoodie made from 100% organic fibers. Naturally temperature regulating',
      price: 69.99,
      stock: 75,
      image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: 'Hemp Yoga Pants',
      description: 'Flexible hemp yoga pants with moisture-wicking properties. Perfect for active lifestyle',
      price: 54.99,
      stock: 60,
      image_url: 'https://images.unsplash.com/photo-1506629905607-45e135278531?w=400&h=300&fit=crop&crop=center'
    },
    {
      name: 'Organic Hemp Button-Down Shirt',
      description: 'Professional hemp button-down shirt with natural wrinkle resistance',
      price: 79.99,
      stock: 40,
      image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=300&fit=crop&crop=center'
    }
  ];

  for (const product of sampleProducts) {
    await pool.query(`
      INSERT INTO products (id, name, description, price, stock, image_url, created_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
      ON CONFLICT (name) DO NOTHING
    `, [product.name, product.description, product.price, product.stock, product.image_url]);
  }

  // Create categories and link them to products
  await pool.query(`
    INSERT INTO categories (id, name, description, created_at)
    VALUES 
      (gen_random_uuid(), 'Shirts', 'Hemp shirts and t-shirts', NOW()),
      (gen_random_uuid(), 'Pants', 'Hemp pants and bottoms', NOW()),
      (gen_random_uuid(), 'Outerwear', 'Hemp jackets and hoodies', NOW())
    ON CONFLICT (name) DO NOTHING
  `);

  console.log('✓ Sample products inserted');
}

async function addSampleSearchSuggestions(pool) {
  const suggestions = [
    'hemp shirt',
    'organic clothing',
    'sustainable fashion',
    'hemp pants',
    'eco-friendly',
    'hemp hoodie',
    'organic hemp',
    'natural fiber',
    'hemp denim',
    'yoga clothes'
  ];

  for (const suggestion of suggestions) {
    await pool.query(`
      INSERT INTO search_suggestions (query, search_count, is_trending)
      VALUES ($1, $2, $3)
      ON CONFLICT (query) DO UPDATE SET
        search_count = search_suggestions.search_count + 1
    `, [suggestion, Math.floor(Math.random() * 50) + 1, Math.random() > 0.7]);
  }

  console.log('✓ Sample search suggestions added');
}

// Run the setup
setupSearchDatabase().catch(console.error);