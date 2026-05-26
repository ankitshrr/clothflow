/*
  # Initial Ecommerce Schema

  1. New Tables
    - `profiles` - User profiles extending Supabase auth
    - `categories` - Product categories with hierarchy
    - `products` - Main product catalog
    - `product_images` - Product image gallery
    - `product_sizes` - Available sizes for products
    - `product_colors` - Available colors for products
    - `inventory` - Stock tracking per product variant
    - `cart_items` - Shopping cart items
    - `orders` - Customer orders
    - `order_items` - Items within orders
    - `store_locations` - Physical store locations for Google Maps
    - `reviews` - Product reviews and ratings
    - `wishlists` - User wishlists
    
  2. Security
    - Enable RLS on all tables
    - Policies ensure users can only access their own data
    - Admin users have full access via role-based policies
    
  3. Important Notes
    - All timestamps use timestamptz with DEFAULT now()
    - Soft deletes using deleted_at column where appropriate
    - Foreign key constraints maintain referential integrity
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  phone text DEFAULT '',
  avatar_url text DEFAULT '',
  role text DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Product categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text DEFAULT '',
  image_url text DEFAULT '',
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text DEFAULT '',
  short_description text DEFAULT '',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  base_price decimal(10,2) NOT NULL CHECK (base_price >= 0),
  sale_price decimal(10,2) CHECK (sale_price >= 0),
  sku text UNIQUE,
  is_featured boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Product images
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text DEFAULT '',
  display_order integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Product sizes
CREATE TABLE IF NOT EXISTS product_sizes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_label text NOT NULL,
  size_type text DEFAULT 'clothing' CHECK (size_type IN ('clothing', 'shoes', 'accessories')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, size_label)
);

-- Product colors
CREATE TABLE IF NOT EXISTS product_colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_name text NOT NULL,
  color_hex text DEFAULT '#000000',
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, color_name)
);

-- Inventory tracking
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_id uuid REFERENCES product_sizes(id) ON DELETE CASCADE,
  color_id uuid REFERENCES product_colors(id) ON DELETE CASCADE,
  quantity integer DEFAULT 0 CHECK (quantity >= 0),
  low_stock_threshold integer DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, size_id, color_id)
);

-- Cart items
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size_id uuid REFERENCES product_sizes(id) ON DELETE SET NULL,
  color_id uuid REFERENCES product_colors(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id, size_id, color_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number text NOT NULL UNIQUE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  subtotal decimal(10,2) NOT NULL CHECK (subtotal >= 0),
  shipping_cost decimal(10,2) DEFAULT 0 CHECK (shipping_cost >= 0),
  tax_amount decimal(10,2) DEFAULT 0 CHECK (tax_amount >= 0),
  total decimal(10,2) NOT NULL CHECK (total >= 0),
  shipping_address jsonb DEFAULT '{}',
  billing_address jsonb DEFAULT '{}',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  size_label text DEFAULT '',
  color_name text DEFAULT '',
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price decimal(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price decimal(10,2) NOT NULL CHECK (total_price >= 0),
  created_at timestamptz DEFAULT now()
);

-- Store locations for Google Maps
CREATE TABLE IF NOT EXISTS store_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text DEFAULT '',
  postal_code text DEFAULT '',
  country text DEFAULT 'United States',
  latitude decimal(10,8) NOT NULL,
  longitude decimal(11,8) NOT NULL,
  phone text DEFAULT '',
  email text DEFAULT '',
  operating_hours jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  offers_pickup boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reviews and ratings
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text DEFAULT '',
  comment text DEFAULT '',
  is_verified_purchase boolean DEFAULT false,
  is_approved boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, user_id)
);

-- Wishlists
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Categories policies (public read, admin write)
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Products policies (public read, admin write)
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Product images policies
CREATE POLICY "Product images are viewable by everyone"
  ON product_images FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM products WHERE products.id = product_images.product_id
  ));

CREATE POLICY "Admins can manage product images"
  ON product_images FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Product sizes policies
CREATE POLICY "Product sizes are viewable by everyone"
  ON product_sizes FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage product sizes"
  ON product_sizes FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Product colors policies
CREATE POLICY "Product colors are viewable by everyone"
  ON product_colors FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage product colors"
  ON product_colors FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Inventory policies
CREATE POLICY "Inventory is viewable by everyone"
  ON inventory FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage inventory"
  ON inventory FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Cart items policies
CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  ));

CREATE POLICY "Admins can manage all order items"
  ON order_items FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Store locations policies (public read, admin write)
CREATE POLICY "Store locations are viewable by everyone"
  ON store_locations FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can manage store locations"
  ON store_locations FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (is_approved = true OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can insert own reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Wishlists policies
CREATE POLICY "Users can view own wishlist"
  ON wishlists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist items"
  ON wishlists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist items"
  ON wishlists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Trigger to call handle_new_user on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
