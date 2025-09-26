# 🌿 Hemp Fashion E-commerce

> A complete, production-ready e-commerce platform built with Next.js 14, designed for sustainable hemp fashion retailers.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)](https://tailwindcss.com/)
[![Production Ready](https://img.shields.io/badge/Production-Ready-green)](https://vercel.com/)

## 🚀 Features

✅ **Complete E-commerce Platform**
- Shopping cart & checkout with Stripe integration
- User authentication & email verification
- Product catalog with search & filtering
- Order management & tracking
- Blog system for content marketing

✅ **Production-Ready Systems**
- Professional email system (verification, orders, newsletters)
- Admin panel integration via ISR revalidation
- Mobile-responsive hemp-themed design
- Performance optimized with Next.js 14 ISR
- Database schema with PostgreSQL

✅ **Developer Experience**
- TypeScript throughout the application
- Comprehensive testing scripts
- Organized documentation structure
- API-ready architecture for external backends
- Easy deployment to Vercel, Docker, or VPS

## 📋 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- SMTP email service
- Stripe account

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd hemp-fashion-ecommerce

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your configuration:
# - DATABASE_URL for PostgreSQL
# - SMTP settings for email
# - Stripe keys for payments
# - JWT secrets for authentication
```

### 3. Database Setup

```bash
# Run the database setup script
./scripts/utils/setup-database.sh
```

### 4. Start Development

```bash
# Run development server
npm run dev

# Open http://localhost:3000
```

### 5. Test Everything

```bash
# Test all API endpoints
./scripts/testing/test-apis.sh

# Test revalidation system
node scripts/testing/test-revalidation.js
```

## 🏗️ Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with full type safety
- **Styling**: Tailwind CSS with custom hemp theme
- **Database**: PostgreSQL with connection pooling
- **Authentication**: JWT with session management
- **Email**: Nodemailer with professional templates
- **Payments**: Stripe integration with webhooks
- **State Management**: React Context + Zustand
- **Deployment**: Vercel-ready with ISR support

## 📁 Project Structure

```
hemp-fashion-ecommerce/
├── 📁 app/                    # Next.js App Router
├── 📁 components/             # React components
├── 📁 lib/                    # Shared libraries & utilities
├── 📁 docs/                   # 📚 Complete documentation
│   ├── DEPLOYMENT_GUIDE.md    # Comprehensive deployment guide
│   ├── EMAIL_SYSTEM.md        # Email system documentation
│   ├── PROJECT_STRUCTURE.md   # Project organization
│   └── integration/           # Integration guides
├── 📁 scripts/                # 🔧 Utility scripts
│   ├── testing/               # API & system testing
│   └── utils/                 # Setup & maintenance tools
├── 📁 migrations/             # Database schema migrations
└── Configuration files        # Next.js, Tailwind, TypeScript
```

## 🚀 Deployment

### Option 1: Vercel (Recommended)
```bash
npm i -g vercel
vercel login
vercel
# Configure environment variables in Vercel dashboard
```

### Option 2: Docker
```bash
docker-compose up --build -d
```

### Option 3: Traditional VPS
See `docs/DEPLOYMENT_GUIDE.md` for complete instructions.

## 📚 Documentation

- **[📖 Complete Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Everything you need to deploy
- **[📧 Email System](docs/EMAIL_SYSTEM.md)** - Email configuration & testing
- **[🔗 Admin Integration](docs/integration/ADMIN_INTEGRATION.md)** - Connect your admin panel
- **[📁 Project Structure](docs/PROJECT_STRUCTURE.md)** - File organization

## 🧪 Testing

```bash
# Test all API endpoints
./scripts/testing/test-apis.sh

# Test revalidation system
node scripts/testing/test-revalidation.js

# Setup database
./scripts/utils/setup-database.sh
```

## 🎨 Hemp Theme Customization

Custom color palette in `tailwind.config.ts`:

```typescript
colors: {
  hemp: {
    'green-light': '#E8F5E8',
    'green-dark': '#5A7C5A',
    'beige': '#F8F6F2',
    'text': '#1F2937',
    'accent': '#6B7280'
  }
}
```

## 📈 What's Next?

After deployment:

1. **Week 1**: Test everything, set up monitoring, configure SSL
2. **Month 1**: Add products, set up marketing, optimize user experience
3. **Month 2-3**: Advanced features, performance optimization, business operations
4. **3+ Months**: Advanced e-commerce features, mobile app, analytics

See `docs/DEPLOYMENT_GUIDE.md` for detailed next steps.

## 🆘 Support

- 📖 Check `docs/` for comprehensive documentation
- 🧪 Run test scripts to verify functionality
- 🔧 Use utility scripts for common tasks
- 📧 Test email system with provided endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run type-check && ./scripts/testing/test-apis.sh`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**🌿 Ready to launch your sustainable hemp fashion business! 🌿**


