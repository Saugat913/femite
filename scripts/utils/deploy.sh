#!/bin/bash

# Hemp Fashion E-commerce - Automated Deployment Script
# This script handles the complete deployment process

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌿 Hemp Fashion E-commerce - Deployment Script${NC}"
echo "==============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ ERROR: Please run this script from the project root directory${NC}"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${RED}❌ ERROR: .env.local file not found${NC}"
    echo "Please create .env.local from .env.example"
    exit 1
fi

echo -e "${YELLOW}📋 Pre-deployment checks...${NC}"

# Check Node.js version
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js version: $NODE_VERSION${NC}"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Run build test
echo -e "${YELLOW}🏗️  Testing build...${NC}"
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Build test successful${NC}"
else
    echo -e "${RED}❌ Build test failed${NC}"
    echo "Please fix build errors before deploying"
    exit 1
fi

# Run type check
echo -e "${YELLOW}🔍 Type checking...${NC}"
if npm run type-check > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Type check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Type check warnings (non-critical)${NC}"
fi

# Test API endpoints if server is running
echo -e "${YELLOW}🧪 Testing API endpoints...${NC}"
if curl -s http://localhost:3000/api/products > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Local API endpoints responding${NC}"
else
    echo -e "${YELLOW}⚠️  Local server not running (this is OK for deployment)${NC}"
fi

echo ""
echo -e "${PURPLE}🚀 Ready for deployment!${NC}"
echo ""

# Check if Vercel CLI is installed
if command -v vercel >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Vercel CLI is installed${NC}"
else
    echo -e "${YELLOW}📦 Installing Vercel CLI...${NC}"
    npm install -g vercel
fi

echo ""
echo -e "${BLUE}🎯 Deployment Options:${NC}"
echo "1. Deploy to Vercel (Recommended)"
echo "2. Show environment variables for manual setup"
echo "3. Generate Docker deployment files"
echo "4. Exit"
echo ""

read -p "Choose an option (1-4): " choice

case $choice in
    1)
        echo -e "${YELLOW}🚀 Deploying to Vercel...${NC}"
        echo ""
        
        # Login to Vercel (if not already logged in)
        if ! vercel whoami >/dev/null 2>&1; then
            echo -e "${YELLOW}🔐 Please login to Vercel...${NC}"
            vercel login
        fi
        
        echo -e "${GREEN}✅ Logged in to Vercel${NC}"
        
        # Deploy
        echo -e "${YELLOW}📤 Deploying project...${NC}"
        vercel --prod
        
        echo ""
        echo -e "${GREEN}🎉 Deployment complete!${NC}"
        echo ""
        echo -e "${YELLOW}📋 Next steps:${NC}"
        echo "1. Go to Vercel Dashboard: https://vercel.com/dashboard"
        echo "2. Find your project and go to Settings → Environment Variables"
        echo "3. Copy variables from .env.production file"
        echo "4. Redeploy: vercel --prod"
        echo ""
        echo -e "${BLUE}📧 Test your deployment:${NC}"
        echo "curl -X POST https://your-domain.vercel.app/api/test-email \\"
        echo "  -H 'Content-Type: application/json' \\"
        echo "  -d '{\"type\": \"verification\", \"email\": \"your-email@example.com\"}'"
        ;;
        
    2)
        echo -e "${YELLOW}📋 Environment Variables for Production:${NC}"
        echo ""
        echo -e "${BLUE}Copy these to Vercel Dashboard → Settings → Environment Variables:${NC}"
        echo ""
        cat .env.production | grep -v '^#' | grep -v '^$'
        echo ""
        echo -e "${YELLOW}📝 Instructions:${NC}"
        echo "1. Go to Vercel Dashboard"
        echo "2. Select your project"
        echo "3. Go to Settings → Environment Variables"
        echo "4. Add each variable above (Name = key, Value = everything after =)"
        echo "5. Deploy with: vercel --prod"
        ;;
        
    3)
        echo -e "${YELLOW}🐳 Generating Docker deployment files...${NC}"
        
        # Create Dockerfile if it doesn't exist
        if [ ! -f "Dockerfile" ]; then
            cat > Dockerfile << 'EOF'
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["npm", "start"]
EOF
            echo -e "${GREEN}✅ Created Dockerfile${NC}"
        fi
        
        # Create docker-compose.yml if it doesn't exist
        if [ ! -f "docker-compose.yml" ]; then
            cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.local
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: hemp_ecommerce
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"

volumes:
  postgres_data:
EOF
            echo -e "${GREEN}✅ Created docker-compose.yml${NC}"
        fi
        
        echo -e "${YELLOW}📝 Docker deployment commands:${NC}"
        echo "docker-compose up --build -d"
        ;;
        
    4)
        echo -e "${YELLOW}👋 Deployment cancelled${NC}"
        exit 0
        ;;
        
    *)
        echo -e "${RED}❌ Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🌿 Hemp Fashion E-commerce deployment ready!${NC}"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "- Complete guide: docs/DEPLOYMENT_GUIDE.md"
echo "- Environment analysis: docs/ENVIRONMENT_ANALYSIS.md"
echo "- Project structure: docs/PROJECT_STRUCTURE.md"
echo ""
echo -e "${PURPLE}Happy sustainable fashion business! 🌿✨${NC}"