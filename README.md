# Hemp Fashion E-commerce

A modern, responsive e-commerce platform built with Next.js 14, focused on sustainable hemp clothing. The application is designed with a plug-and-play API architecture that can easily be integrated with any backend service.

## 🚀 API-Ready Architecture

### Easy Integration
The application is built with a service layer that allows you to switch between mock data and real API calls by simply changing an environment variable:

```env
# Set to true when your API is ready
NEXT_PUBLIC_USE_API=false
```

### API Configuration
Centralized API configuration in `/lib/api-config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: {
    development: 'http://localhost:3001/api',
    production: 'https://your-api-domain.com/api'
  },
  ENDPOINTS: {
    PRODUCTS: {
      LIST: '/products',
      DETAIL: '/products/:id',
      // ... all endpoints defined
    }
  }
}
```

## 🛠 Technology Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React for consistent iconography  
- **Images**: Next.js Image component for optimization
- **TypeScript**: Full type safety throughout the application
- **State Management**: React Context for cart and search

## 🔧 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hemp-fashion-ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

# Environment Setup
Update your `.env.local`:
```env
NEXT_PUBLIC_USE_API=true
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

## 🎨 Customization

### Hemp Theme
The app uses a custom hemp-inspired color palette defined in `tailwind.config.ts`:

```typescript
colors: {
  hemp: {
    'green-light': '#E9F1E8',
    'green-dark': '#6C7D47', 
    'beige': '#F5F1E9',
    'text': '#3C3C3C',
    'accent': '#B29E84',
  }
}
```


### Build for Production
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test responsiveness across devices
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.


