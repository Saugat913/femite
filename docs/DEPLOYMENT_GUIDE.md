# 🌿 Hemp Fashion E-commerce - Complete Deployment Guide

## 📋 Overview

This is a comprehensive deployment guide for the Hemp Fashion E-commerce platform built with Next.js 14. This guide covers everything from local development to production deployment and includes all necessary configuration, testing, and next steps.

## 🏗️ Project Architecture

### Technology Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom hemp theme
- **Database**: PostgreSQL with connection pooling
- **Authentication**: JWT with session management
- **Email**: Nodemailer with SMTP support
- **Payment**: Stripe integration
- **State Management**: React Context + Zustand
- **Deployment**: Vercel-ready with ISR support

### Key Features
- ✅ Complete e-commerce functionality
- ✅ User authentication & email verification
- ✅ Shopping cart & checkout with Stripe
- ✅ Product catalog with search & filters
- ✅ Admin panel integration via ISR revalidation
- ✅ Email system (verification, orders, newsletters)
- ✅ Blog system with dynamic routing
- ✅ Mobile-responsive hemp-themed design
- ✅ API-ready architecture for external backends

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)
**Best for**: Production deployment with zero configuration

### Option 2: Docker + VPS
**Best for**: Self-hosted deployments with full control

### Option 3: Traditional VPS
**Best for**: Manual deployment with PM2 or similar

---

## 🔧 Pre-Deployment Checklist

### 1. Environment Requirements
- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- SMTP email service configured
- Stripe account for payments
- Domain name (for production)

### 2. Required Environment Variables
Create `.env.local` from `.env.example` and configure:

```bash
# Core Configuration
NEXT_PUBLIC_USE_API=true
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXT_PUBLIC_APP_NAME="Your Store Name"
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/hemp_ecommerce

# Authentication & Security
JWT_SECRET=your-super-secure-jwt-secret-key-at-least-32-characters
REVALIDATION_SECRET=your-super-secure-revalidation-secret-key

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ADMIN_EMAIL=admin@yourdomain.com
NEXT_PUBLIC_CONTACT_EMAIL=hello@yourdomain.com
NEXT_PUBLIC_SUPPORT_EMAIL=support@yourdomain.com

# Payment Processing
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Optional Features
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_REVIEWS=true
```

---

## 🌐 Option 1: Vercel Deployment (Recommended)

### Step 1: Prepare for Vercel
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Test build locally
npm run build
npm start

# 3. Run tests
chmod +x scripts/testing/test-apis.sh
./scripts/testing/test-apis.sh
node scripts/testing/test-revalidation.js
```

### Step 2: Database Setup
**Option A: Use Vercel Postgres**
```bash
# Add Vercel Postgres addon in dashboard
# Update DATABASE_URL in environment variables
```

**Option B: External Database (Recommended)**
```bash
# Use services like:
# - Aiven (has free tier)
# - ElephantSQL
# - AWS RDS
# - DigitalOcean Managed Databases

# Run migrations
psql $DATABASE_URL -f migrations/20250910154621_create_product.sql
psql $DATABASE_URL -f migrations/20250911061218_create_categories.sql
psql $DATABASE_URL -f migrations/20250911062309_create_users.sql
psql $DATABASE_URL -f migrations/20250911065804_create_carts_and_orders.sql
# ... run all migration files in order
```

### Step 3: Deploy to Vercel
```bash
# 1. Login to Vercel
vercel login

# 2. Deploy
vercel

# 3. Set production environment variables in Vercel dashboard
# Go to Settings > Environment Variables and add all variables

# 4. Redeploy with environment variables
vercel --prod
```

### Step 4: Configure Domain & SSL
1. Add custom domain in Vercel dashboard
2. Update DNS records as instructed
3. SSL certificates are automatically provided

### Step 5: Post-Deployment Setup
```bash
# Test production deployment
curl -X GET https://your-domain.com/api/products
curl -X POST https://your-domain.com/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"type": "verification", "email": "test@example.com"}'
```

---

## 🐳 Option 2: Docker Deployment

### Step 1: Create Docker Configuration
Create `Dockerfile`:
```dockerfile
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
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/hemp_ecommerce
      - JWT_SECRET=your-super-secure-jwt-secret-key-at-least-32-characters
      - NEXT_PUBLIC_APP_URL=https://your-domain.com
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

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app

volumes:
  postgres_data:
```

### Step 2: Deploy with Docker
```bash
# 1. Build and run
docker-compose up --build -d

# 2. Check logs
docker-compose logs -f app

# 3. Run database migrations
docker-compose exec db psql -U postgres -d hemp_ecommerce -f /docker-entrypoint-initdb.d/20250910154621_create_product.sql
```

---

## 🖥️ Option 3: Traditional VPS Deployment

### Step 1: Server Setup
```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# 4. Install PM2 for process management
sudo npm install pm2 -g

# 5. Install Nginx
sudo apt install nginx

# 6. Setup firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Step 2: Database Setup
```bash
# 1. Setup PostgreSQL
sudo -u postgres psql
CREATE DATABASE hemp_ecommerce;
CREATE USER hemp_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE hemp_ecommerce TO hemp_user;
\q

# 2. Run migrations
psql -h localhost -U hemp_user -d hemp_ecommerce -f migrations/20250910154621_create_product.sql
# ... run all migrations
```

### Step 3: Application Setup
```bash
# 1. Clone repository
git clone <your-repo-url> /var/www/hemp-fashion-ecommerce
cd /var/www/hemp-fashion-ecommerce

# 2. Install dependencies
npm install

# 3. Build application
npm run build

# 4. Create ecosystem file for PM2
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'hemp-fashion-ecommerce',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/hemp-fashion-ecommerce',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};

# 5. Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Step 4: Nginx Configuration
Create `/etc/nginx/sites-available/hemp-fashion`:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/hemp-fashion /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## 📧 Email System Configuration

### Gmail Setup
1. Enable 2-Factor Authentication
2. Generate App Password:
   - Google Account → Security → 2-Step Verification → App passwords
   - Create password for "Mail"
   - Use this password in `SMTP_PASSWORD`

### Alternative SMTP Providers
- **SendGrid**: Professional email service
- **Mailgun**: Developer-focused email API  
- **AWS SES**: Cost-effective for high volume
- **Postmark**: High deliverability rates

### Email Testing
```bash
# Test email system after deployment
curl -X POST https://your-domain.com/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"type": "verification", "email": "test@example.com"}'
```

---

## 💳 Stripe Configuration

### Development Setup
1. Create Stripe account
2. Get test API keys from dashboard
3. Install Stripe CLI for webhook testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

### Production Setup
1. Switch to live API keys
2. Configure webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`
4. Update `STRIPE_WEBHOOK_SECRET` with production webhook secret

---

## 🔐 Security Checklist

### Pre-Deployment Security
- [ ] Strong JWT secret (32+ characters)
- [ ] Secure revalidation secret
- [ ] Database credentials secured
- [ ] SMTP credentials secured  
- [ ] Stripe keys are live/test appropriate
- [ ] No secrets in git history

### Post-Deployment Security
- [ ] HTTPS enabled (SSL certificate)
- [ ] Database SSL enabled
- [ ] CORS properly configured
- [ ] Rate limiting in place (via Vercel or Nginx)
- [ ] Regular security updates scheduled

---

## 📊 Monitoring & Analytics

### Application Monitoring
```bash
# Health check endpoints
curl https://your-domain.com/api/products  # Should return products
curl https://your-domain.com/api/categories  # Should return categories
```

### Google Analytics Setup
1. Create GA4 property
2. Get Measurement ID
3. Set `GOOGLE_ANALYTICS_ID` environment variable
4. Enable with `NEXT_PUBLIC_ENABLE_ANALYTICS=true`

### Error Monitoring (Recommended)
- **Sentry**: For error tracking
- **LogRocket**: For session replay
- **Hotjar**: For user behavior analytics

---

## 🧪 Testing Your Deployment

### Automated Testing
```bash
# 1. API endpoints test
./scripts/testing/test-apis.sh

# 2. Revalidation system test  
node scripts/testing/test-revalidation.js

# 3. Email system test
curl -X POST https://your-domain.com/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"type": "newsletter", "email": "your-email@example.com"}'
```

### Manual Testing Checklist
- [ ] Homepage loads correctly
- [ ] Product catalog displays
- [ ] User registration works
- [ ] Email verification received
- [ ] Login/logout functionality  
- [ ] Shopping cart operations
- [ ] Checkout process (test mode)
- [ ] Order confirmation emails
- [ ] Admin revalidation (if applicable)
- [ ] Mobile responsiveness
- [ ] Performance (Google PageSpeed)

---

## 🔄 Post-Deployment Setup

### 1. Admin Panel Integration (Optional)
If you have a separate admin panel:

```javascript
// In your admin panel, after product updates:
const triggerRevalidation = async (type, id) => {
  const response = await fetch('https://your-domain.com/api/revalidate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: 'your-revalidation-secret',
      type: type,  // 'product', 'blog', or 'all'
      id: id       // product ID or blog slug
    })
  });
  return response.json();
};
```

### 2. Content Management
- Add initial products via API or admin panel
- Create initial blog posts
- Set up product categories
- Configure shipping options in Stripe

### 3. SEO Setup
- Add sitemap generation
- Configure Open Graph meta tags  
- Set up Google Search Console
- Add structured data markup

### 4. Performance Optimization
- Enable Vercel Analytics
- Set up Core Web Vitals monitoring
- Configure ISR revalidation intervals
- Optimize images and fonts

---

## 📈 What to Do Next

### Immediate (Week 1)
1. **Test Everything**: Run all test scripts, manual testing
2. **Monitor Errors**: Set up error tracking and monitoring
3. **SEO Basics**: Submit sitemap to Google Search Console
4. **Backup Strategy**: Set up database backups
5. **SSL Certificate**: Ensure HTTPS is working properly

### Short Term (Month 1)
1. **Content Addition**: 
   - Add your hemp fashion products
   - Create compelling product descriptions
   - Upload high-quality product images
   - Write initial blog posts about hemp fashion

2. **Marketing Setup**:
   - Connect Google Analytics
   - Set up Facebook Pixel (if needed)
   - Configure email marketing integration
   - Create social media accounts

3. **User Experience**:
   - Test checkout flow with real transactions (test mode)
   - Gather feedback from beta users
   - Optimize mobile experience
   - Add customer support chat (optional)

### Medium Term (Months 2-3)
1. **Advanced Features**:
   - Product reviews and ratings
   - Wishlist functionality  
   - Advanced search and filtering
   - Multi-currency support (if international)

2. **Performance & Scale**:
   - Set up CDN for images
   - Implement advanced caching
   - Database query optimization
   - Load testing and optimization

3. **Business Operations**:
   - Inventory management system
   - Customer service workflows
   - Return/exchange processes
   - Shipping integrations

### Long Term (3+ Months)
1. **Advanced E-commerce**:
   - Subscription products
   - Affiliate program
   - Advanced analytics dashboard
   - A/B testing framework

2. **Mobile Experience**:
   - Progressive Web App (PWA)
   - Mobile app (React Native)
   - Push notifications
   - Offline support

---

## 🆘 Troubleshooting

### Common Issues

**Database Connection Fails**
```bash
# Check connection string
echo $DATABASE_URL

# Test connection manually
psql $DATABASE_URL -c "SELECT NOW();"
```

**Email Not Sending**
```bash
# Test SMTP credentials
curl -X POST https://your-domain.com/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"type": "verification", "email": "your-email@example.com"}'
```

**Build Fails**
```bash
# Clear build cache
rm -rf .next
npm run build

# Check for TypeScript errors
npm run type-check
```

**Environment Variables Not Loading**
- Ensure `.env.local` exists (not `.env`)
- Restart development server after changes
- Check for typos in variable names
- Variables starting with `NEXT_PUBLIC_` are exposed to browser

### Getting Help
1. Check server logs (Vercel Function logs or PM2 logs)
2. Review the documentation in `docs/` folder
3. Test individual components with provided test scripts
4. Check database logs for query errors
5. Verify all environment variables are set correctly

---

## 📝 Final Notes

### Project Structure
- All documentation is now organized in `/docs/`
- Testing scripts are in `/scripts/testing/`  
- Database migrations are in `/migrations/`
- See `docs/PROJECT_STRUCTURE.md` for complete organization

### Key Features Ready for Production
- ✅ Complete e-commerce platform
- ✅ Hemp fashion themed design
- ✅ Mobile responsive
- ✅ SEO optimized with Next.js 14
- ✅ Secure authentication system
- ✅ Professional email system
- ✅ Stripe payment integration
- ✅ Admin panel integration ready
- ✅ Performance optimized with ISR

### Support Documentation
- `docs/EMAIL_SYSTEM.md` - Complete email system guide
- `docs/integration/ADMIN_INTEGRATION.md` - Admin panel integration
- `docs/PROJECT_STRUCTURE.md` - Project organization
- `.env.example` - All required environment variables

This Hemp Fashion E-commerce platform is production-ready and includes all the features needed for a successful online store. The modular architecture makes it easy to extend and customize for your specific hemp fashion business needs.

---

**🌿 Happy Hemp Fashion E-commerce Deployment! 🌿**

*Your sustainable fashion platform is ready to make a positive impact on the world of fashion!*