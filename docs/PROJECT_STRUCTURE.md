# Hemp Fashion E-commerce - Project Structure

## 📁 Directory Organization

After reorganization, the project follows a clean, maintainable structure:

```
hemp-fashion-ecommerce/
├── 📁 app/                     # Next.js 14 App Router
│   ├── 📁 api/                 # API Routes
│   │   ├── addresses/route.ts
│   │   ├── blog/route.ts
│   │   ├── cart/route.ts
│   │   ├── categories/route.ts
│   │   ├── orders/route.ts
│   │   ├── products/route.ts
│   │   ├── revalidate/route.ts
│   │   ├── search/route.ts
│   │   └── test-email/route.ts
│   ├── 📁 (pages)/             # Application Pages
│   │   ├── about/page.tsx
│   │   ├── account/page.tsx
│   │   ├── blog/page.tsx & [slug]/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── shop/page.tsx & [id]/page.tsx
│   │   └── auth pages (login, register, etc.)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # Homepage
├── 📁 components/              # React Components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ProductCard.tsx
│   ├── ShopClient.tsx
│   └── search/SearchFilters.tsx
├── 📁 lib/                     # Shared Libraries
│   ├── 📁 api/                 # API utilities
│   ├── 📁 migrations/          # Database migrations
│   ├── 📁 types/               # TypeScript types
│   ├── api-config.ts           # API configuration
│   ├── api-service.ts          # API service layer
│   ├── auth.ts                 # Authentication
│   ├── db.ts                   # Database connection
│   ├── email-service.ts        # Email system
│   ├── stripe.ts               # Payment processing
│   └── context files           # React contexts
├── 📁 docs/                    # 📚 Documentation (NEW)
│   ├── 📁 deployment/          # Deployment guides
│   ├── 📁 integration/         # Integration guides
│   │   └── ADMIN_INTEGRATION.md
│   ├── EMAIL_SYSTEM.md         # Email documentation
│   ├── PROJECT_STRUCTURE.md    # This file
│   └── DEPLOYMENT_GUIDE.md     # Complete deployment guide
├── 📁 scripts/                 # 🔧 Utility Scripts (REORGANIZED)
│   ├── 📁 testing/             # Testing scripts
│   │   ├── test-apis.sh        # API testing script
│   │   └── test-revalidation.js # Revalidation testing
│   └── 📁 utils/               # Utility scripts
├── 📁 migrations/              # Database Schema
│   ├── 005_add_refresh_tokens.sql
│   ├── 20250910154621_create_product.sql
│   ├── 20250911061218_create_categories.sql
│   ├── 20250911062309_create_users.sql
│   ├── 20250911065804_create_carts_and_orders.sql
│   └── [additional migration files]
├── 📄 Configuration Files
│   ├── .env.example           # Environment template
│   ├── .eslintrc.json         # ESLint config
│   ├── .gitignore            # Git ignore rules
│   ├── next.config.js        # Next.js configuration
│   ├── package.json          # Dependencies
│   ├── postcss.config.js     # PostCSS config
│   ├── tailwind.config.ts    # Tailwind CSS config
│   └── tsconfig.json         # TypeScript config
└── README.md                  # Main project README
```

## 📋 What Was Reorganized

### Moved Files:
- ✅ `EMAIL_SYSTEM_README.md` → `docs/EMAIL_SYSTEM.md`
- ✅ `ADMIN_INTEGRATION.md` → `docs/integration/ADMIN_INTEGRATION.md`
- ✅ `test-revalidation.js` → `scripts/testing/test-revalidation.js`
- ✅ `scripts/test-apis.sh` → `scripts/testing/test-apis.sh`

### Created New Directories:
- ✅ `docs/` - Centralized documentation
- ✅ `docs/deployment/` - Deployment guides
- ✅ `docs/integration/` - Integration documentation
- ✅ `scripts/testing/` - Testing utilities
- ✅ `scripts/utils/` - Utility scripts

## 📖 Documentation Structure

### `/docs/`
- **EMAIL_SYSTEM.md** - Complete email system documentation
- **PROJECT_STRUCTURE.md** - This file, project organization
- **DEPLOYMENT_GUIDE.md** - Comprehensive deployment guide

### `/docs/integration/`
- **ADMIN_INTEGRATION.md** - Admin panel integration guide

### `/docs/deployment/`
- Ready for deployment-specific guides (Vercel, Docker, etc.)

## 🔧 Scripts Structure

### `/scripts/testing/`
- **test-apis.sh** - Test all API endpoints
- **test-revalidation.js** - Test ISR revalidation system

### `/scripts/utils/`
- Ready for utility scripts (database setup, migrations, etc.)

## 🎯 Benefits of New Structure

1. **Clear Separation**: Documentation and scripts are properly organized
2. **Easy Navigation**: Related files are grouped together
3. **Scalability**: Structure can grow with the project
4. **Professional**: Industry-standard organization
5. **Maintenance**: Easier to find and update files

## 📚 Key Documentation Files

1. **README.md** - Main project overview and getting started
2. **docs/EMAIL_SYSTEM.md** - Email system implementation
3. **docs/integration/ADMIN_INTEGRATION.md** - Admin panel integration
4. **docs/DEPLOYMENT_GUIDE.md** - Complete deployment instructions
5. **.env.example** - Environment configuration template

## 🔍 Finding Files

### Documentation
```bash
# All documentation
find docs/ -name "*.md"

# Integration guides
ls docs/integration/

# Deployment guides
ls docs/deployment/
```

### Scripts
```bash
# All scripts
find scripts/ -type f

# Testing scripts
ls scripts/testing/

# Utility scripts
ls scripts/utils/
```

### Configuration
```bash
# Configuration files
ls *.config.* *.json
```

This organized structure makes the Hemp Fashion E-commerce project more maintainable and professional, following modern development practices.