# Address Management API

The address management system allows authenticated users to manage their shipping and billing addresses.

## Endpoints

### GET /api/addresses
Get all addresses for the authenticated user.

**Query Parameters:**
- `type` (optional): Filter addresses by type (`shipping`, `billing`, `both`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "shipping",
      "name": "John Doe",
      "company": "Company Name",
      "addressLine1": "123 Main St",
      "addressLine2": "Apt 4B",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94102",
      "country": "US",
      "phone": "555-123-4567",
      "isDefault": true,
      "createdAt": "2025-09-15T03:05:28.071Z",
      "updatedAt": "2025-09-15T03:05:28.071Z"
    }
  ]
}
```

### POST /api/addresses
Create a new address.

**Request Body:**
```json
{
  "type": "shipping", // optional, defaults to "shipping"
  "name": "John Doe", // required
  "company": "Company Name", // optional
  "addressLine1": "123 Main St", // required
  "addressLine2": "Apt 4B", // optional
  "city": "San Francisco", // required
  "state": "CA", // required
  "zipCode": "94102", // required
  "country": "US", // optional, defaults to "US"
  "phone": "555-123-4567", // optional
  "isDefault": true // optional, defaults to false (or true if first address)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "shipping",
    "name": "John Doe",
    "company": "Company Name",
    "addressLine1": "123 Main St",
    "addressLine2": "Apt 4B",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102",
    "country": "US",
    "phone": "555-123-4567",
    "isDefault": true,
    "createdAt": "2025-09-15T03:05:28.071Z",
    "updatedAt": "2025-09-15T03:05:28.071Z"
  },
  "message": "Address created successfully"
}
```

### GET /api/addresses/[id]
Get a specific address by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "shipping",
    "name": "John Doe",
    // ... other address fields
  }
}
```

### PUT /api/addresses/[id]
Update an existing address. All fields are optional - only provided fields will be updated.

**Request Body:**
```json
{
  "name": "Updated Name",
  "addressLine1": "Updated Address",
  "city": "Updated City"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    // Updated address object
  },
  "message": "Address updated successfully"
}
```

### DELETE /api/addresses/[id]
Delete an address. If the deleted address was the default, another address of the same type will be automatically promoted to default.

**Response:**
```json
{
  "success": true,
  "message": "Address deleted successfully"
}
```

### PUT /api/addresses/[id]/default
Set an address as the default for its type. This will automatically unset any other default address of the same type.

**Response:**
```json
{
  "success": true,
  "data": {
    // Updated address object with isDefault: true
  },
  "message": "Default address updated successfully"
}
```

## Address Types

- `shipping`: Used for product delivery
- `billing`: Used for payment/billing information
- `both`: Can be used for both shipping and billing

## Default Address Logic

- When a user creates their first address of a specific type, it automatically becomes the default
- Only one address per type can be default at a time
- Setting a new default address automatically unsets the previous default for that type
- When deleting a default address, if other addresses of the same type exist, one will be automatically promoted to default

## Authentication

All endpoints require authentication. The session cookie must be present in the request.

## Error Responses

**401 Unauthorized:**
```json
{
  "error": "Authentication required"
}
```

**404 Not Found:**
```json
{
  "error": "Address not found"
}
```

**400 Bad Request:**
```json
{
  "error": "Name, address line 1, city, state, and zip code are required"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to create address"
}
```

## Usage Examples

### Frontend Integration

```typescript
import { AddressAPI } from '@/lib/api/addresses'

// Get all addresses
const addresses = await AddressAPI.getAddresses()

// Get shipping addresses only
const shippingAddresses = await AddressAPI.getAddresses('shipping')

// Create a new address
const newAddress = await AddressAPI.createAddress({
  name: 'John Doe',
  addressLine1: '123 Main St',
  city: 'San Francisco',
  state: 'CA',
  zipCode: '94102'
})

// Update an address
const updatedAddress = await AddressAPI.updateAddress('address-id', {
  addressLine1: 'Updated Address'
})

// Set as default
const defaultAddress = await AddressAPI.setDefaultAddress('address-id')

// Delete an address
await AddressAPI.deleteAddress('address-id')
```

### cURL Examples

```bash
# Get all addresses
curl -X GET http://localhost:3000/api/addresses/ \
  -H "Content-Type: application/json" \
  -b cookies.txt

# Create address
curl -X POST http://localhost:3000/api/addresses/ \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "John Doe",
    "addressLine1": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102"
  }'

# Set as default
curl -X PUT http://localhost:3000/api/addresses/[id]/default/ \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

## Database Schema

The addresses are stored in the `user_addresses` table:

```sql
CREATE TABLE user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('shipping', 'billing', 'both')),
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  address_line_1 VARCHAR(255) NOT NULL,
  address_line_2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  country VARCHAR(2) NOT NULL DEFAULT 'US',
  phone VARCHAR(20),
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```
