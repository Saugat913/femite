-- Search optimization migration for Hemp Fashion E-commerce
-- This migration adds full-text search indexes and search analytics tables

-- Enable pg_trgm extension for trigram matching (for autocomplete)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add full-text search column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search_vector
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search_vector
DROP TRIGGER IF EXISTS update_product_search_vector_trigger ON products;
CREATE TRIGGER update_product_search_vector_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();

-- Update existing products with search vectors
UPDATE products SET search_vector = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B');

-- Create GIN index on search_vector for fast full-text search
CREATE INDEX IF NOT EXISTS idx_products_search_vector ON products USING GIN(search_vector);

-- Create additional indexes for filtering
CREATE INDEX IF NOT EXISTS idx_products_price ON products (price);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products (stock);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING GIN (name gin_trgm_ops);

-- Create search analytics table
CREATE TABLE IF NOT EXISTS search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT NOT NULL,
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  results_count INTEGER DEFAULT 0,
  clicked_product_id UUID REFERENCES products(id),
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  filters JSONB -- Store applied filters as JSON
);

-- Create indexes for search analytics
CREATE INDEX IF NOT EXISTS idx_search_queries_query ON search_queries (query);
CREATE INDEX IF NOT EXISTS idx_search_queries_user_id ON search_queries (user_id);
CREATE INDEX IF NOT EXISTS idx_search_queries_created_at ON search_queries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_queries_session_id ON search_queries (session_id);

-- Create search suggestions table for popular searches
CREATE TABLE IF NOT EXISTS search_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query TEXT UNIQUE NOT NULL,
  search_count INTEGER DEFAULT 1,
  last_searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category TEXT,
  is_trending BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for search suggestions
CREATE INDEX IF NOT EXISTS idx_search_suggestions_query_trgm ON search_suggestions USING GIN (query gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_search_suggestions_count ON search_suggestions (search_count DESC);
CREATE INDEX IF NOT EXISTS idx_search_suggestions_trending ON search_suggestions (is_trending, search_count DESC);

-- Create product attributes table for better filtering
CREATE TABLE IF NOT EXISTS product_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  attribute_type TEXT NOT NULL, -- 'size', 'color', 'material', 'brand', etc.
  attribute_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for product attributes
CREATE INDEX IF NOT EXISTS idx_product_attributes_product_id ON product_attributes (product_id);
CREATE INDEX IF NOT EXISTS idx_product_attributes_type ON product_attributes (attribute_type);
CREATE INDEX IF NOT EXISTS idx_product_attributes_value ON product_attributes (attribute_value);
CREATE INDEX IF NOT EXISTS idx_product_attributes_type_value ON product_attributes (attribute_type, attribute_value);

-- Insert default product attributes for existing products
INSERT INTO product_attributes (product_id, attribute_type, attribute_value)
SELECT p.id, 'size', unnest(ARRAY['XS', 'S', 'M', 'L', 'XL', 'XXL'])
FROM products p
ON CONFLICT DO NOTHING;

INSERT INTO product_attributes (product_id, attribute_type, attribute_value)
SELECT p.id, 'color', unnest(ARRAY['Natural', 'Forest Green', 'Earth Brown', 'Sage Green', 'Charcoal'])
FROM products p
ON CONFLICT DO NOTHING;

INSERT INTO product_attributes (product_id, attribute_type, attribute_value)
SELECT p.id, 'material', 'Hemp'
FROM products p
ON CONFLICT DO NOTHING;

-- Create materialized view for search performance
CREATE MATERIALIZED VIEW IF NOT EXISTS product_search_view AS
SELECT 
  p.id,
  p.name,
  p.description,
  p.price,
  p.stock,
  p.image_url,
  p.search_vector,
  p.created_at,
  COALESCE(
    STRING_AGG(DISTINCT c.name, ', '),
    'Uncategorized'
  ) as categories,
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'type', pa.attribute_type,
        'value', pa.attribute_value
      )
    ) FILTER (WHERE pa.id IS NOT NULL),
    '[]'::json
  ) as attributes
FROM products p
LEFT JOIN product_categories pc ON p.id = pc.product_id
LEFT JOIN categories c ON pc.category_id = c.id
LEFT JOIN product_attributes pa ON p.id = pa.product_id
GROUP BY p.id, p.name, p.description, p.price, p.stock, p.image_url, p.search_vector, p.created_at;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_product_search_view_search_vector ON product_search_view USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_product_search_view_price ON product_search_view (price);
CREATE INDEX IF NOT EXISTS idx_product_search_view_stock ON product_search_view (stock);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_product_search_view()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY product_search_view;
END;
$$ LANGUAGE plpgsql;

-- Create function to get search suggestions
CREATE OR REPLACE FUNCTION get_search_suggestions(search_term TEXT, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(suggestion TEXT, count INTEGER, category TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ss.query,
    ss.search_count,
    ss.category
  FROM search_suggestions ss
  WHERE ss.query ILIKE search_term || '%'
     OR ss.query % search_term
  ORDER BY 
    ss.is_trending DESC,
    ss.search_count DESC,
    similarity(ss.query, search_term) DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
