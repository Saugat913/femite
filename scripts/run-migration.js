const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set')
  process.exit(1)
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

async function runMigration(migrationFile) {
  const migrationPath = path.join(__dirname, '..', 'migrations', migrationFile)
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`Migration file not found: ${migrationPath}`)
    process.exit(1)
  }

  const sql = fs.readFileSync(migrationPath, 'utf8')
  
  try {
    console.log(`Running migration: ${migrationFile}`)
    await pool.query(sql)
    console.log(`✅ Migration completed successfully: ${migrationFile}`)
  } catch (error) {
    console.error(`❌ Migration failed: ${migrationFile}`)
    console.error(error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Get migration file from command line argument
const migrationFile = process.argv[2]
if (!migrationFile) {
  console.error('Please provide a migration file name')
  console.error('Usage: node scripts/run-migration.js <migration-file>')
  process.exit(1)
}

runMigration(migrationFile)
