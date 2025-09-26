#!/bin/bash

# Hemp Fashion E-commerce - Database Setup Script
# This script sets up the PostgreSQL database and runs all migrations in order

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MIGRATIONS_DIR="migrations"
DB_NAME="hemp_ecommerce"

echo -e "${BLUE}🌿 Hemp Fashion E-commerce - Database Setup${NC}"
echo "================================================"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ ERROR: DATABASE_URL environment variable is not set${NC}"
    echo "Please set DATABASE_URL in your .env.local file or environment"
    echo "Example: DATABASE_URL=postgresql://username:password@localhost:5432/hemp_ecommerce"
    exit 1
fi

echo -e "${BLUE}📋 Database Configuration:${NC}"
echo "Database URL: $(echo $DATABASE_URL | sed 's/:[^:@]*@/:***@/')"  # Hide password
echo ""

# Test database connection
echo -e "${YELLOW}🔌 Testing database connection...${NC}"
if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    echo "Please check your DATABASE_URL and ensure the database server is running"
    exit 1
fi

# Check if migrations directory exists
if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo -e "${RED}❌ ERROR: Migrations directory not found: $MIGRATIONS_DIR${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Get list of migration files in order
MIGRATION_FILES=$(find "$MIGRATIONS_DIR" -name "*.sql" | sort)

if [ -z "$MIGRATION_FILES" ]; then
    echo -e "${YELLOW}⚠️  No migration files found in $MIGRATIONS_DIR${NC}"
    echo "Database setup complete (no migrations to run)"
    exit 0
fi

echo -e "${BLUE}📝 Found migrations:${NC}"
for file in $MIGRATION_FILES; do
    echo "  - $(basename "$file")"
done
echo ""

# Create migrations tracking table if it doesn't exist
echo -e "${YELLOW}🏗️  Setting up migration tracking...${NC}"
psql "$DATABASE_URL" -c "
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);" > /dev/null

echo -e "${GREEN}✅ Migration tracking table ready${NC}"

# Run migrations
echo -e "${BLUE}🚀 Running migrations...${NC}"
echo ""

TOTAL_MIGRATIONS=0
SUCCESS_COUNT=0
SKIP_COUNT=0

for migration_file in $MIGRATION_FILES; do
    TOTAL_MIGRATIONS=$((TOTAL_MIGRATIONS + 1))
    
    # Extract version from filename
    VERSION=$(basename "$migration_file" .sql)
    
    # Check if migration has already been applied
    APPLIED=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM schema_migrations WHERE version = '$VERSION';" | tr -d ' ')
    
    if [ "$APPLIED" -gt 0 ]; then
        echo -e "${YELLOW}⏭️  Skipping $VERSION (already applied)${NC}"
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi
    
    echo -e "${BLUE}📄 Running migration: $VERSION${NC}"
    
    # Run the migration
    if psql "$DATABASE_URL" -f "$migration_file" > /dev/null 2>&1; then
        # Record successful migration
        psql "$DATABASE_URL" -c "INSERT INTO schema_migrations (version) VALUES ('$VERSION');" > /dev/null
        echo -e "${GREEN}✅ Successfully applied: $VERSION${NC}"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    else
        echo -e "${RED}❌ Failed to apply migration: $VERSION${NC}"
        echo "Error details:"
        psql "$DATABASE_URL" -f "$migration_file"
        exit 1
    fi
done

echo ""
echo -e "${GREEN}🎉 Database setup complete!${NC}"
echo ""
echo -e "${BLUE}📊 Migration Summary:${NC}"
echo "  Total migrations: $TOTAL_MIGRATIONS"
echo "  Successfully applied: $SUCCESS_COUNT"
echo "  Skipped (already applied): $SKIP_COUNT"
echo ""

# Verify database schema
echo -e "${YELLOW}🔍 Verifying database schema...${NC}"

# Check for key tables
TABLES=("users" "products" "categories" "orders" "carts")
MISSING_TABLES=()

for table in "${TABLES[@]}"; do
    TABLE_EXISTS=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = '$table';" | tr -d ' ')
    
    if [ "$TABLE_EXISTS" -gt 0 ]; then
        echo -e "${GREEN}✅ Table exists: $table${NC}"
    else
        echo -e "${RED}❌ Missing table: $table${NC}"
        MISSING_TABLES+=("$table")
    fi
done

if [ ${#MISSING_TABLES[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All essential tables are present${NC}"
else
    echo -e "${YELLOW}⚠️  Some tables are missing. This might be expected if using a subset of migrations.${NC}"
fi

echo ""
echo -e "${BLUE}🛠️  Next Steps:${NC}"
echo "1. Set up your environment variables (see .env.example)"
echo "2. Run 'npm run build' to build the application"
echo "3. Run 'npm run dev' to start development server"
echo "4. Run './scripts/testing/test-apis.sh' to test API endpoints"
echo ""
echo -e "${GREEN}Your Hemp Fashion E-commerce database is ready! 🌿${NC}"