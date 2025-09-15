import { Pool } from 'pg'

let pool: Pool

export function getDb() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    
    // For cloud databases like Aiven, we need SSL but with relaxed certificate verification
    const sslConfig = connectionString?.includes('aivencloud.com') 
      ? { rejectUnauthorized: false } // Accept self-signed certificates for Aiven
      : process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : false
    
    pool = new Pool({
      connectionString,
      ssl: sslConfig,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  }
  
  return pool
}

export async function query(text: string, params?: any[]) {
  const db = getDb()
  const start = Date.now()
  
  try {
    const result = await db.query(text, params)
    const duration = Date.now() - start
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query', { text, duration, rows: result.rowCount })
    }
    
    return result
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

export async function getClient() {
  const db = getDb()
  return await db.connect()
}

// Graceful shutdown
process.on('SIGINT', () => {
  if (pool) {
    pool.end()
  }
})

process.on('SIGTERM', () => {
  if (pool) {
    pool.end()
  }
})
