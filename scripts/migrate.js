#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

async function runMigrations() {
  console.log('Starting database migrations...')
  
  // Database connection
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required')
  }
  
  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('aivencloud.com') 
      ? { rejectUnauthorized: false } 
      : process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : false,
  })
  
  const client = await pool.connect()
  
  try {
    // Create migrations tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL UNIQUE,
        executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
      )
    `)
    
    // Get list of already executed migrations
    const executedResult = await client.query('SELECT filename FROM migrations ORDER BY executed_at')
    const executedMigrations = new Set(executedResult.rows.map(row => row.filename))
    
    // Get all migration files sorted by filename (which includes timestamp)
    const migrationsDir = path.join(__dirname, '..', 'migrations')
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort()
    
    console.log(`Found ${migrationFiles.length} migration files`)
    
    for (const filename of migrationFiles) {
      if (executedMigrations.has(filename)) {
        console.log(`⏭️  Skipping already executed migration: ${filename}`)
        continue
      }
      
      console.log(`🔄 Executing migration: ${filename}`)
      
      const filePath = path.join(migrationsDir, filename)
      const sql = fs.readFileSync(filePath, 'utf8')
      
      try {
        // Start transaction
        await client.query('BEGIN')
        
        // Execute migration SQL
        await client.query(sql)
        
        // Record migration as executed
        await client.query(
          'INSERT INTO migrations (filename) VALUES ($1)',
          [filename]
        )
        
        // Commit transaction
        await client.query('COMMIT')
        
        console.log(`✅ Successfully executed migration: ${filename}`)
      } catch (error) {
        // Rollback transaction on error
        await client.query('ROLLBACK')
        throw error
      }
    }
    
    console.log('✅ All migrations completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Run migrations
runMigrations()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
