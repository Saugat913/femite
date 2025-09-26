# Admin Panel Integration Guide

This document explains how to integrate your separate admin panel with the hemp fashion e-commerce site to trigger cache revalidation when products or blog posts are updated.

## Overview

The e-commerce site uses **Incremental Static Regeneration (ISR)** for optimal performance:
- Pages are statically generated at build time for fast loading
- Pages are automatically revalidated at timed intervals
- Pages can be revalidated on-demand via API calls from your admin panel

## Revalidation Times

- **Homepage**: 5 minutes (300 seconds)
- **Shop page**: 1 minute (60 seconds)  
- **Blog listing**: 3 minutes (180 seconds)
- **Individual product pages**: 5 minutes (300 seconds)
- **Individual blog posts**: 5 minutes (300 seconds)

## Admin Panel Integration

### 1. Environment Setup

In your e-commerce site's `.env.local` file, add:
```bash
REVALIDATION_SECRET=your-super-secure-revalidation-secret-key
```

### 2. Revalidation API Endpoint

**URL**: `https://your-ecommerce-site.com/api/revalidate`  
**Method**: `POST`  
**Content-Type**: `application/json`

### 3. Usage Examples

#### A. When Adding/Updating/Deleting a Product

```javascript
// In your admin panel, after successful product operation:
async function triggerProductRevalidation(productId) {
  try {
    const response = await fetch('https://your-ecommerce-site.com/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: 'your-super-secure-revalidation-secret-key',
        type: 'product',
        id: productId  // Optional: specific product ID
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Cache revalidated successfully:', result.paths);
    } else {
      console.error('Revalidation failed:', result.error);
    }
  } catch (error) {
    console.error('Revalidation request failed:', error);
  }
}
```

#### B. When Adding/Updating/Deleting a Blog Post

```javascript
// In your admin panel, after successful blog operation:
async function triggerBlogRevalidation(blogSlug) {
  try {
    const response = await fetch('https://your-ecommerce-site.com/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: 'your-super-secure-revalidation-secret-key',
        type: 'blog',
        id: blogSlug  // Optional: specific blog post slug
      })
    });

    const result = await response.json();
    console.log('Blog revalidation result:', result);
  } catch (error) {
    console.error('Blog revalidation failed:', error);
  }
}
```

#### C. Revalidating Specific Pages

```javascript
// Revalidate specific paths
async function revalidateSpecificPages() {
  const response = await fetch('https://your-ecommerce-site.com/api/revalidate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      secret: 'your-super-secure-revalidation-secret-key',
      paths: ['/', '/shop', '/blog'] // Multiple paths
    })
  });
}
```

#### D. Revalidate Everything (Bulk Operations)

```javascript
// After bulk operations or major updates
async function revalidateAllPages() {
  const response = await fetch('https://your-ecommerce-site.com/api/revalidate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      secret: 'your-super-secure-revalidation-secret-key',
      type: 'all'
    })
  });
}
```

## API Parameters

### Required
- `secret`: Your revalidation secret key

### Optional (choose one approach)
- `type`: 'product', 'blog', or 'all'
- `id`: Specific product ID or blog slug (used with type)
- `path`: Single path to revalidate
- `paths`: Array of paths to revalidate
- `tag`: Cache tag to revalidate
- `tags`: Array of cache tags to revalidate

## Response Format

### Success Response
```json
{
  "success": true,
  "revalidated": true,
  "timestamp": "2025-01-16T06:15:00.000Z",
  "paths": ["/", "/shop", "/shop/product-123"],
  "tags": [],
  "type": "product",
  "id": "product-123"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Invalid or missing secret"
}
```

## Integration Examples by Framework

### PHP (Laravel/CodeIgniter)
```php
function triggerRevalidation($type, $id = null) {
    $url = 'https://your-ecommerce-site.com/api/revalidate';
    $data = [
        'secret' => env('ECOMMERCE_REVALIDATION_SECRET'),
        'type' => $type,
        'id' => $id
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $result = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($result, true);
}

// Usage:
triggerRevalidation('product', $productId);
triggerRevalidation('blog', $blogSlug);
```

### Python (Django/Flask)
```python
import requests
import json

def trigger_revalidation(revalidation_type, item_id=None):
    url = 'https://your-ecommerce-site.com/api/revalidate'
    data = {
        'secret': os.getenv('ECOMMERCE_REVALIDATION_SECRET'),
        'type': revalidation_type,
        'id': item_id
    }
    
    response = requests.post(url, json=data)
    return response.json()

# Usage:
trigger_revalidation('product', product_id)
trigger_revalidation('blog', blog_slug)
```

### Node.js/Express
```javascript
const axios = require('axios');

async function triggerRevalidation(type, id = null) {
  try {
    const response = await axios.post('https://your-ecommerce-site.com/api/revalidate', {
      secret: process.env.ECOMMERCE_REVALIDATION_SECRET,
      type: type,
      id: id
    });
    
    return response.data;
  } catch (error) {
    console.error('Revalidation failed:', error.message);
    return null;
  }
}

// Usage:
await triggerRevalidation('product', productId);
await triggerRevalidation('blog', blogSlug);
```

## When to Trigger Revalidation

### Products
- ✅ After creating a new product
- ✅ After updating product details (name, price, description, stock, images)
- ✅ After deleting a product
- ✅ After changing product categories
- ✅ After updating product availability/visibility

### Blog Posts
- ✅ After creating a new blog post
- ✅ After updating blog post content
- ✅ After publishing/unpublishing a blog post
- ✅ After deleting a blog post
- ✅ After changing blog post categories

### Optional Triggers
- After bulk operations (use `type: 'all'`)
- After major site configuration changes
- After category updates that affect many items

## Testing the Integration

### 1. Test Endpoint Availability
```bash
curl -X GET https://your-ecommerce-site.com/api/revalidate
```

### 2. Test Revalidation
```bash
curl -X POST https://your-ecommerce-site.com/api/revalidate \
  -H "Content-Type: application/json" \
  -d '{"secret":"your-secret","type":"all"}'
```

## Security Considerations

1. **Keep the secret secure**: Store it in environment variables, never in code
2. **Use HTTPS**: Always make revalidation requests over HTTPS
3. **Rate limiting**: Consider implementing rate limiting in your admin panel
4. **Error handling**: Always handle failed revalidation gracefully
5. **Logging**: Log revalidation attempts for debugging

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check that the secret matches exactly
2. **500 Server Error**: Check the e-commerce site logs
3. **Network timeout**: Revalidation is non-blocking, timeouts shouldn't affect functionality
4. **Changes not visible**: Wait a few seconds and clear browser cache

### Debugging

Check the e-commerce site server logs for revalidation messages:
```
Revalidated product path: /shop/product-123
Revalidated path: /
Revalidated path: /shop
```

## Summary

This integration allows your admin panel to instantly update the cached content on the e-commerce site while maintaining excellent performance through static generation. The revalidation API is flexible and supports various use cases from single-item updates to bulk operations.