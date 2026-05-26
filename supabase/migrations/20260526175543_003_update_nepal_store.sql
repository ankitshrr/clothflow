/*
  # Update Categories and Store for Nepal Men's Store

  1. Changes
    - Remove old categories
    - Add new men's clothing categories: T-Shirts, Shirts, Tracks & Pants, Jackets & Hoodies, Sports Wear
    - Remove old store locations
    - Add single store location in Pepsi-Cola, Nepal
    - Remove old products
    - Add new men's clothing products

  2. Categories
    - T-Shirts
    - Shirts  
    - Tracks & Pants
    - Jackets & Hoodies
    - Sports Wear
    
  3. Store Location
    - Single store in Pepsi-Cola, Kathmandu, Nepal
*/

-- Delete old products first (due to foreign key constraints)
DELETE FROM product_images;
DELETE FROM inventory;
DELETE FROM cart_items;
DELETE FROM order_items;
DELETE FROM reviews;
DELETE FROM wishlists;
DELETE FROM product_sizes;
DELETE FROM product_colors;
DELETE FROM products;

-- Delete old categories
DELETE FROM categories;

-- Delete old store locations
DELETE FROM store_locations;

-- Insert new categories for men's clothing
INSERT INTO categories (id, name, slug, description, image_url, display_order, is_active) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'T-Shirts', 't-shirts', 'Comfortable and stylish t-shirts for every occasion', 'https://images.unsplash.com/photo-1521572163474-56556f4d0ee7?w=800', 1, true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Shirts', 'shirts', 'Formal and casual shirts for the modern man', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800', 2, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Tracks & Pants', 'tracks-pants', 'Comfortable tracks and stylish pants', 'https://images.unsplash.com/photo-1552371029-66dc3019c5d8?w=800', 3, true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Jackets & Hoodies', 'jackets-hoodies', 'Stay warm and stylish with our jackets and hoodies', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800', 4, true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Sports Wear', 'sports-wear', 'Performance sportswear for active lifestyle', 'https://images.unsplash.com/photo-1571902943202-90e07d1d40c4?w=800', 5, true);

-- Insert new store location in Pepsi-Cola, Nepal
INSERT INTO store_locations (name, address, city, state, postal_code, country, latitude, longitude, phone, email, operating_hours, is_active, offers_pickup) VALUES 
  ('MenStore Pepsi-Cola', 'Pepsi-Cola Town Planning Road', 'Kathmandu', 'Bagmati', '44600', 'Nepal', 27.6867, 85.3456, '+977 1-4102030', 'pepsicola@menstore.com.np', 
  '{"monday": "10:00 AM - 8:00 PM", "tuesday": "10:00 AM - 8:00 PM", "wednesday": "10:00 AM - 8:00 PM", "thursday": "10:00 AM - 8:00 PM", "friday": "10:00 AM - 9:00 PM", "saturday": "10:00 AM - 9:00 PM", "sunday": "11:00 AM - 7:00 PM"}', 
  true, true);

-- Insert new men's products
INSERT INTO products (id, name, slug, description, short_description, category_id, base_price, sale_price, sku, is_featured, is_active) VALUES
  -- T-Shirts
  ('11111111-1111-1111-1111-111111111111', 'Premium Cotton Crew Neck T-Shirt', 'premium-cotton-crew-neck-tshirt', 'Ultra-soft 100% cotton crew neck t-shirt. Perfect for everyday wear with a classic fit. Features reinforced stitching for durability and a tag-free collar for comfort.', 'Premium cotton t-shirt for everyday comfort', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1200.00, 899.00, 'TS-001', true, true),
  ('11111111-1111-1111-1111-111111111112', 'Graphic Print Street T-Shirt', 'graphic-print-street-tshirt', 'Urban style graphic print t-shirt with bold designs. Made from premium cotton blend for softness and durability. Unique prints that stand out.', 'Stylish graphic print t-shirt', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1499.00, NULL, 'TS-002', false, true),
  ('11111111-1111-1111-1111-111111111113', 'Polo Collar T-Shirt', 'polo-collar-tshirt', 'Classic polo collar t-shirt perfect for semi-casual occasions. Features a ribbed collar, button placket, and comfortable fit.', 'Classic polo t-shirt for semi-casual look', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1799.00, 1499.00, 'TS-003', true, true),
  
  -- Shirts  
  ('22222222-2222-2222-2222-222222222221', ' Formal Cotton Shirt', 'formal-cotton-shirt', 'Premium formal cotton shirt with crisp finish. Perfect for office and formal occasions. Features a spread collar, pocket, and adjustable cuffs.', 'Premium formal cotton shirt', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2499.00, NULL, 'SH-001', true, true),
  ('22222222-2222-2222-2222-222222222222', 'Casual Denim Shirt', 'casual-denim-shirt', 'Stylish denim shirt with a relaxed fit. Perfect for casual outings. Features classic button-down collar and chest pockets.', 'Stylish denim casual shirt', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2999.00, 2499.00, 'SH-002', false, true),
  ('22222222-2222-2222-2222-222222222223', 'Checked Flannel Shirt', 'checked-flannel-shirt', 'Warm flannel shirt with classic check pattern. Perfect for cooler weather. Features button-down collar and double chest pockets.', 'Warm checked flannel shirt', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2799.00, NULL, 'SH-003', true, true),
  
  -- Tracks & Pants
  ('33333333-3333-3333-3333-333333333331', 'Comfortable Track Pants', 'comfortable-track-pants', 'Soft and comfortable track pants perfect for workouts or casual wear. Features elastic waistband with drawstring and side pockets.', 'Comfortable track pants for active lifestyle', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 1999.00, 1599.00, 'TP-001', true, true),
  ('33333333-3333-3333-3333-333333333332', 'Slim Fit Chinos', 'slim-fit-chinos', 'Modern slim fit chinos made from premium stretch cotton. Perfect for both casual and semi-formal occasions.', 'Premium slim fit chinos', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 2699.00, NULL, 'TP-002', false, true),
  ('33333333-3333-3333-3333-333333333333', 'Jogger Pants', 'jogger-pants', 'Stylish jogger pants with tapered fit. Features elastic cuffs, drawstring waist, and multiple pockets.', 'Modern jogger pants', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 2299.00, 1899.00, 'TP-003', true, true),
  
  -- Jackets & Hoodies
  ('44444444-4444-4444-4444-444444444441', 'Classic Zip-Up Hoodie', 'classic-zip-up-hoodie', 'Warm and comfortable zip-up hoodie made from soft cotton blend. Features kangaroo pockets and drawstring hood.', 'Classic zip-up hoodie for comfort', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 3999.00, 3499.00, 'JH-001', true, true),
  ('44444444-4444-4444-4444-444444444442', 'Lightweight Bomber Jacket', 'lightweight-bomber-jacket', 'Stylish bomber jacket with modern fit. Perfect for transitional weather. Features ribbed collar, cuffs, and hem.', 'Modern bomber jacket', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 5499.00, NULL, 'JH-002', false, true),
  ('44444444-4444-4444-4444-444444444443', 'Pullover Hoodie', 'pullover-hoodie', 'Classic pullover hoodie with kangaroo pocket and soft fleece lining. Perfect for cool evenings.', 'Soft pullover hoodie', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 3499.00, 2799.00, 'JH-003', true, true),
  
  -- Sports Wear
  ('55555555-5555-5555-5555-555555555551', 'Quick-Dry Sports T-Shirt', 'quick-dry-sports-tshirt', 'Performance sports t-shirt with moisture-wicking technology. Keeps you dry during intense workouts. Lightweight and breathable.', 'Moisture-wicking sports t-shirt', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 1699.00, NULL, 'SW-001', true, true),
  ('55555555-5555-5555-5555-555555555552', 'Training Shorts', 'training-shorts', 'Comfortable training shorts with inner brief. Features elastic waistband and side pockets. Perfect for gym and sports.', 'Comfortable training shorts', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 1499.00, 1199.00, 'SW-002', false, true),
  ('55555555-5555-5555-5555-555555555553', 'Track Suit Set', 'track-suit-set', 'Complete track suit with matching jacket and pants. Perfect for workouts or casual wear. Features full zip jacket and elastic waist pants.', 'Complete track suit set', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 4999.00, 4299.00, 'SW-003', true, true);

-- Insert product images
INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary) VALUES
  -- T-Shirts
  ('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1521572163474-56556f4d0ee7?w=800', 'Premium Cotton Crew Neck T-Shirt', 0, true),
  ('11111111-1111-1111-1111-111111111112', 'https://images.unsplash.com/photo-1583743814966-8936f5b34bea?w=800', 'Graphic Print Street T-Shirt', 0, true),
  ('11111111-1111-1111-1111-111111111113', 'https://images.unsplash.com/photo-1625910513834-6deb9a8df88c?w=800', 'Polo Collar T-Shirt', 0, true),
  
  -- Shirts
  ('22222222-2222-2222-2222-222222222221', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800', 'Formal Cotton Shirt', 0, true),
  ('22222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800', 'Casual Denim Shirt', 0, true),
  ('22222222-2222-2222-2222-222222222223', 'https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=800', 'Checked Flannel Shirt', 0, true),
  
  -- Tracks & Pants
  ('33333333-3333-3333-3333-333333333331', 'https://images.unsplash.com/photo-1552371029-66dc3019c5d8?w=800', 'Comfortable Track Pants', 0, true),
  ('33333333-3333-3333-3333-333333333332', 'https://images.unsplash.com/photo-1473966968600-fa802b568a86?w=800', 'Slim Fit Chinos', 0, true),
  ('33333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1552902865-58f1b4e7408b?w=800', 'Jogger Pants', 0, true),
  
  -- Jackets & Hoodies
  ('44444444-4444-4444-4444-444444444441', 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800', 'Classic Zip-Up Hoodie', 0, true),
  ('44444444-4444-4444-4444-444444444442', 'https://images.unsplash.com/photo-1591041934464-a5c4c07918d9?w=800', 'Lightweight Bomber Jacket', 0, true),
  ('44444444-4444-4444-4444-444444444443', 'https://images.unsplash.com/photo-1571902943202-90e07d1d40c4?w=800', 'Pullover Hoodie', 0, true),
  
  -- Sports Wear
  ('55555555-5555-5555-5555-555555555551', 'https://images.unsplash.com/photo-1571902943202-90e07d1d40c4?w=800', 'Quick-Dry Sports T-Shirt', 0, true),
  ('55555555-5555-5555-5555-555555555552', 'https://images.unsplash.com/photo-1597227141692-ee2223e8e467?w=800', 'Training Shorts', 0, true),
  ('55555555-5555-5555-5555-555555555553', 'https://images.unsplash.com/photo-1515886655712-6f3b1c6e0e18?w=800', 'Track Suit Set', 0, true);

-- Insert product sizes
INSERT INTO product_sizes (product_id, size_label, size_type) VALUES
  -- T-Shirts sizes
  ('11111111-1111-1111-1111-111111111111', 'S', 'clothing'),
  ('11111111-1111-1111-1111-111111111111', 'M', 'clothing'),
  ('11111111-1111-1111-1111-111111111111', 'L', 'clothing'),
  ('11111111-1111-1111-1111-111111111111', 'XL', 'clothing'),
  ('11111111-1111-1111-1111-111111111112', 'S', 'clothing'),
  ('11111111-1111-1111-1111-111111111112', 'M', 'clothing'),
  ('11111111-1111-1111-1111-111111111112', 'L', 'clothing'),
  ('11111111-1111-1111-1111-111111111113', 'M', 'clothing'),
  ('11111111-1111-1111-1111-111111111113', 'L', 'clothing'),
  ('11111111-1111-1111-1111-111111111113', 'XL', 'clothing'),
  
  -- Shirts sizes
  ('22222222-2222-2222-2222-222222222221', 'S', 'clothing'),
  ('22222222-2222-2222-2222-222222222221', 'M', 'clothing'),
  ('22222222-2222-2222-2222-222222222221', 'L', 'clothing'),
  ('22222222-2222-2222-2222-222222222222', 'M', 'clothing'),
  ('22222222-2222-2222-2222-222222222222', 'L', 'clothing'),
  ('22222222-2222-2222-2222-222222222222', 'XL', 'clothing'),
  ('22222222-2222-2222-2222-222222222223', 'L', 'clothing'),
  ('22222222-2222-2222-2222-222222222223', 'XL', 'clothing'),
  
  -- Track & Pants sizes
  ('33333333-3333-3333-3333-333333333331', 'S', 'clothing'),
  ('33333333-3333-3333-3333-333333333331', 'M', 'clothing'),
  ('33333333-3333-3333-3333-333333333331', 'L', 'clothing'),
  ('33333333-3333-3333-3333-333333333332', '30', 'clothing'),
  ('33333333-3333-3333-3333-333333333332', '32', 'clothing'),
  ('33333333-3333-3333-3333-333333333332', '34', 'clothing'),
  ('33333333-3333-3333-3333-333333333333', 'M', 'clothing'),
  ('33333333-3333-3333-3333-333333333333', 'L', 'clothing'),
  ('33333333-3333-3333-3333-333333333333', 'XL', 'clothing'),
  
  -- Hoodies sizes
  ('44444444-4444-4444-4444-444444444441', 'M', 'clothing'),
  ('44444444-4444-4444-4444-444444444441', 'L', 'clothing'),
  ('44444444-4444-4444-4444-444444444441', 'XL', 'clothing'),
  ('44444444-4444-4444-4444-444444444442', 'M', 'clothing'),
  ('44444444-4444-4444-4444-444444444442', 'L', 'clothing'),
  ('44444444-4444-4444-4444-444444444443', 'L', 'clothing'),
  ('44444444-4444-4444-4444-444444444443', 'XL', 'clothing'),
  
  -- Sports Wear sizes
  ('55555555-5555-5555-5555-555555555551', 'S', 'clothing'),
  ('55555555-5555-5555-5555-555555555551', 'M', 'clothing'),
  ('55555555-5555-5555-5555-555555555551', 'L', 'clothing'),
  ('55555555-5555-5555-5555-555555555552', 'M', 'clothing'),
  ('55555555-5555-5555-5555-555555555552', 'L', 'clothing'),
  ('55555555-5555-5555-5555-555555555553', 'M', 'clothing'),
  ('55555555-5555-5555-5555-555555555553', 'L', 'clothing'),
  ('55555555-5555-5555-5555-555555555553', 'XL', 'clothing');

-- Insert product colors
INSERT INTO product_colors (product_id, color_name, color_hex) VALUES
  -- T-Shirts colors
  ('11111111-1111-1111-1111-111111111111', 'White', '#FFFFFF'),
  ('11111111-1111-1111-1111-111111111111', 'Black', '#000000'),
  ('11111111-1111-1111-1111-111111111111', 'Navy', '#000080'),
  ('11111111-1111-1111-1111-111111111112', 'Black', '#000000'),
  ('11111111-1111-1111-1111-111111111112', 'Gray', '#808080'),
  ('11111111-1111-1111-1111-111111111113', 'Navy', '#000080'),
  ('11111111-1111-1111-1111-111111111113', 'White', '#FFFFFF'),
  
  -- Shirts colors
  ('22222222-2222-2222-2222-222222222221', 'White', '#FFFFFF'),
  ('22222222-2222-2222-2222-222222222221', 'Light Blue', '#ADD8E6'),
  ('22222222-2222-2222-2222-222222222222', 'Blue', '#0000FF'),
  ('22222222-2222-2222-2222-222222222222', 'Black', '#000000'),
  ('22222222-2222-2222-2222-222222222223', 'Red', '#FF0000'),
  ('22222222-2222-2222-2222-222222222223', 'Green', '#008000'),
  
  -- Track & Pants colors
  ('33333333-3333-3333-3333-333333333331', 'Black', '#000000'),
  ('33333333-3333-3333-3333-333333333331', 'Gray', '#808080'),
  ('33333333-3333-3333-3333-333333333332', 'Khaki', '#C3B091'),
  ('33333333-3333-3333-3333-333333333332', 'Navy', '#000080'),
  ('33333333-3333-3333-3333-333333333333', 'Black', '#000000'),
  ('33333333-3333-3333-3333-333333333333', 'Gray', '#808080'),
  
  -- Hoodies colors
  ('44444444-4444-4444-4444-444444444441', 'Black', '#000000'),
  ('44444444-4444-4444-4444-444444444441', 'Gray', '#808080'),
  ('44444444-4444-4444-4444-444444444442', 'Black', '#000000'),
  ('44444444-4444-4444-4444-444444444442', 'Olive', '#808000'),
  ('44444444-4444-4444-4444-444444444443', 'Navy', '#000080'),
  ('44444444-4444-4444-4444-444444444443', 'Black', '#000000'),
  
  -- Sports Wear colors
  ('55555555-5555-5555-5555-555555555551', 'Black', '#000000'),
  ('55555555-5555-5555-5555-555555555551', 'Blue', '#0000FF'),
  ('55555555-5555-5555-5555-555555555552', 'Black', '#000000'),
  ('55555555-5555-5555-5555-555555555552', 'Navy', '#000080'),
  ('55555555-5555-5555-5555-555555555553', 'Black', '#000000'),
  ('55555555-5555-5555-5555-555555555553', 'Navy', '#000080');

-- Insert inventory for products (simplified with good stock)
INSERT INTO inventory (product_id, size_id, color_id, quantity, low_stock_threshold)
SELECT 
  ps.product_id,
  ps.id,
  pc.id,
  CASE 
    WHEN ps.size_label IN ('M', 'L') THEN 30
    ELSE 20
  END,
  5
FROM product_sizes ps
CROSS JOIN product_colors pc
WHERE ps.product_id = pc.product_id;

-- Insert inventory for products without size variants
INSERT INTO inventory (product_id, color_id, quantity, low_stock_threshold)
SELECT
  pc.product_id,
  pc.id,
  25,
  5
FROM product_colors pc
WHERE NOT EXISTS (
  SELECT 1 FROM product_sizes ps WHERE ps.product_id = pc.product_id
);
