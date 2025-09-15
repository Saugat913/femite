#!/usr/bin/env ts-node

import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { query, getClient } from '../lib/db'

async function runMigrations() {
  console.log('Starting database migrations...')
  
  const client = await getClient()
  
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
    const migrationsDir = join(__dirname, '..', 'migrations')
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort()
    
    console.log(`Found ${migrationFiles.length} migration files`)
    
    for (const filename of migrationFiles) {
      if (executedMigrations.has(filename)) {
        console.log(`⏭️  Skipping already executed migration: ${filename}`)
        continue
      }
      
      console.log(`🔄 Executing migration: ${filename}`)
      
      const filePath = join(migrationsDir, filename)
      const sql = readFileSync(filePath, 'utf8')
      
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
  }
}

// Run migrations if this script is called directly
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
}

export { runMigrations }
