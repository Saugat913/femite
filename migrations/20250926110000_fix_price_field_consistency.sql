-- Fix price field inconsistency in products table
-- Change price_cents (BIGINT) to price (NUMERIC(10,2)) to match other tables

DO $$ 
BEGIN 
    -- First check if we have price_cents column
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'price_cents') THEN
        
        -- Add new price column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'price') THEN
            ALTER TABLE products ADD COLUMN price NUMERIC(10,2);
        END IF;
        
        -- Convert price_cents to price (divide by 100 to convert cents to dollars)
        UPDATE products SET price = COALESCE(price_cents, 0) / 100.0 WHERE price IS NULL;
        
        -- Make price column NOT NULL and set a default
        ALTER TABLE products ALTER COLUMN price SET NOT NULL;
        ALTER TABLE products ALTER COLUMN price SET DEFAULT 0.00;
        
        -- Drop the old price_cents column
        ALTER TABLE products DROP COLUMN price_cents;
        
        -- Add check constraint for positive prices
        ALTER TABLE products ADD CONSTRAINT products_price_positive CHECK (price >= 0);
        
    ELSE 
        -- If price_cents doesn't exist, ensure price column exists with proper format
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'price') THEN
            ALTER TABLE products ADD COLUMN price NUMERIC(10,2) NOT NULL DEFAULT 0.00;
        END IF;
        
        -- Ensure proper constraints
        IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE constraint_name = 'products_price_positive') THEN
            ALTER TABLE products ADD CONSTRAINT products_price_positive CHECK (price >= 0);
        END IF;
    END IF;
    
END $$;

-- Ensure image_url field is consistent (TEXT instead of VARCHAR with arbitrary limits)
DO $$ 
BEGIN 
    -- Check if image_url column exists and ensure it's TEXT type
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url') THEN
        -- Change to TEXT if it's not already
        ALTER TABLE products ALTER COLUMN image_url TYPE TEXT;
    ELSE
        -- Add image_url column if it doesn't exist
        ALTER TABLE products ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- Add helpful indexes for price-based queries
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_price_stock ON products(price, stock) WHERE stock > 0;

-- Update any existing test data to have reasonable prices if they're 0
UPDATE products SET price = 29.99 WHERE price = 0 AND name ILIKE '%shirt%';
UPDATE products SET price = 39.99 WHERE price = 0 AND name ILIKE '%hoodie%';
UPDATE products SET price = 24.99 WHERE price = 0 AND name ILIKE '%tank%';
UPDATE products SET price = 49.99 WHERE price = 0 AND name ILIKE '%jacket%';
UPDATE products SET price = 34.99 WHERE price = 0 AND name ILIKE '%pants%';
UPDATE products SET price = 19.99 WHERE price = 0; -- Default for any remaining items