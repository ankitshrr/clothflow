/*
  # Seed Data for Ecommerce Store

  1. Categories
    - Men's Clothing
    - Women's Clothing
    - Accessories
    - Shoes
    
  2. Sample Products
    - 6 featured products across categories
    - Multiple images, sizes, and colors per product
    - Inventory tracking
    
  3. Store Locations
    - 3 sample store locations with coordinates
    
  4. Important Notes
    - All products are active and some are featured
    - Inventory is seeded for all product variants
    - Store locations are ready for Google Maps integration
*/

-- Insert categories
INSERT INTO categories (id, name, slug, description, image_url, display_order, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Men''s Clothing', 'mens-clothing', 'Discover the latest trends in men''s fashion', 'https://images.unsplash.com/photo-1490578474892-0c6886c0a27e?w=800', 1, true),
  ('22222222-2222-2222-2222-222222222222', 'Women''s Clothing', 'womens-clothing', 'Elegant and stylish women''s apparel', 'https://images.unsplash.com/photo-1487412749393-070b8d8657fe?w=800', 2, true),
  ('33333333-3333-3333-3333-333333333333', 'Accessories', 'accessories', 'Complete your look with our accessories', 'https://images.unsplash.com/photo-1523275335684-97845c8c4f84?w=800', 3, true),
  ('44444444-4444-4444-4444-444444444444', 'Shoes', 'shoes', 'Step out in style with our footwear collection', 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800', 4, true);

-- Insert products
INSERT INTO products (id, name, slug, description, short_description, category_id, base_price, sale_price, sku, is_featured, is_active) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Classic Wool Overcoat', 'classic-wool-overcoat', 'Elevate your winter wardrobe with our premium wool overcoat. Crafted from high-quality wool blend, this timeless piece features a tailored fit, notched lapels, and a sophisticated double-breasted design. Perfect for both formal occasions and everyday elegance.', 'Premium wool blend overcoat with timeless design', '11111111-1111-1111-1111-111111111111', 299.00, 249.00, 'MWO-001', true, true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Slim Fit Chinos', 'slim-fit-chinos', 'Modern slim fit chinos perfect for any occasion. Made from premium stretch cotton for ultimate comfort and flexibility. Features a flat front design, belt loops, and functional pockets. Versatile enough for both casual and business casual settings.', 'Comfortable slim fit chinos in premium stretch cotton', '11111111-1111-1111-1111-111111111111', 89.00, NULL, 'MCH-002', false, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Silk Midi Dress', 'silk-midi-dress', 'Luxurious silk midi dress that embodies feminine elegance. Features a flattering A-line silhouette, elegant V-neckline, and delicate pleating details. The lustrous silk fabric drapes beautifully, making it perfect for special occasions and evening events.', 'Elegant silk midi dress with A-line silhouette', '22222222-2222-2222-2222-222222222222', 189.00, 159.00, 'WDR-001', true, true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Cashmere Sweater', 'cashmere-sweater', 'Indulge in pure luxury with our 100% cashmere sweater. This incredibly soft and lightweight piece offers exceptional warmth without bulk. Features a classic crew neck, ribbed cuffs and hem, and a relaxed fit that layers beautifully.', 'Ultra-soft 100% cashmere sweater', '22222222-2222-2222-2222-222222222222', 199.00, NULL, 'WSW-002', false, true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Leather Crossbody Bag', 'leather-crossbody-bag', 'Sophisticated leather crossbody bag perfect for everyday use. Crafted from premium full-grain leather with beautiful natural patina. Features an adjustable strap, multiple interior compartments, and secure zip closure. Timeless design that only gets better with age.', 'Premium leather crossbody bag with multiple compartments', '33333333-3333-3333-3333-333333333333', 149.00, 129.00, 'ACB-001', true, true),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Premium Leather Oxford', 'premium-leather-oxford', 'Exceptionally crafted leather oxford shoes for the discerning gentleman. Made from premium calfskin leather with Goodyear welt construction for durability and resoleability. Features brogue detailing, leather lining, and a classic cap toe design.', 'Handcrafted leather oxford shoes with Goodyear welt', '44444444-4444-4444-4444-444444444444', 275.00, NULL, 'SHO-001', true, true);

-- Insert product images
INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://images.unsplash.com/photo-1544923246-77307dd628b0?w=800', 'Classic Wool Overcoat - Front View', 0, true),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://images.unsplash.com/photo-1591041934464-a5c4c07918d9?w=800', 'Classic Wool Overcoat - Detail', 1, false),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'https://images.unsplash.com/photo-1473966968600-fa802b568a86?w=800', 'Slim Fit Chinos - Front View', 0, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800', 'Silk Midi Dress - Front View', 0, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'https://images.unsplash.com/photo-1566174053879-5256198bb032?w=800', 'Silk Midi Dress - Side View', 1, false),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800', 'Cashmere Sweater - Front View', 0, true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'https://images.unsplash.com/photo-1594223274512-ad4803739b41?w=800', 'Leather Crossbody Bag - Front View', 0, true),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'https://images.unsplash.com/photo-1449505278894-6c88a6d096b0?w=800', 'Premium Leather Oxford - Front View', 0, true);

-- Insert product sizes
INSERT INTO product_sizes (product_id, size_label, size_type) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'S', 'clothing'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'M', 'clothing'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'L', 'clothing'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'XL', 'clothing'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '30', 'clothing'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '32', 'clothing'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '34', 'clothing'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '36', 'clothing'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'XS', 'clothing'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'S', 'clothing'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'M', 'clothing'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'L', 'clothing'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'XS', 'clothing'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'S', 'clothing'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'M', 'clothing'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'L', 'clothing'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '8', 'shoes'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '9', 'shoes'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '10', 'shoes'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '11', 'shoes'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '12', 'shoes');

-- Insert product colors
INSERT INTO product_colors (product_id, color_name, color_hex) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Charcoal', '#36454F'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Navy', '#000080'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Camel', '#C19A6B'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Khaki', '#C3B091'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Navy', '#000080'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Olive', '#808000'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Emerald', '#50C878'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Burgundy', '#800020'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Navy', '#000080'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Ivory', '#FFFFF0'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Camel', '#C19A6B'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Blush', '#DE5D83'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Cognac', '#834333'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Black', '#000000'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Chestnut', '#954535'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Black', '#000000');

-- Insert inventory for product variants
-- For wool overcoat
INSERT INTO inventory (product_id, size_id, color_id, quantity, low_stock_threshold)
SELECT
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  ps.id,
  pc.id,
  CASE
    WHEN ps.size_label = 'M' AND pc.color_name = 'Charcoal' THEN 25
    WHEN ps.size_label = 'L' AND pc.color_name = 'Charcoal' THEN 20
    WHEN ps.size_label = 'M' AND pc.color_name = 'Navy' THEN 30
    ELSE 15
  END,
  5
FROM product_sizes ps
CROSS JOIN product_colors pc
WHERE ps.product_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  AND pc.product_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- For chinos
INSERT INTO inventory (product_id, size_id, color_id, quantity, low_stock_threshold)
SELECT
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  ps.id,
  pc.id,
  CASE
    WHEN ps.size_label = '32' AND pc.color_name = 'Khaki' THEN 40
    WHEN ps.size_label = '34' AND pc.color_name = 'Navy' THEN 35
    ELSE 20
  END,
  5
FROM product_sizes ps
CROSS JOIN product_colors pc
WHERE ps.product_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
  AND pc.product_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

-- For silk dress
INSERT INTO inventory (product_id, size_id, color_id, quantity, low_stock_threshold)
SELECT
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  ps.id,
  pc.id,
  CASE
    WHEN ps.size_label = 'S' AND pc.color_name = 'Emerald' THEN 15
    WHEN ps.size_label = 'M' AND pc.color_name = 'Burgundy' THEN 20
    ELSE 10
  END,
  5
FROM product_sizes ps
CROSS JOIN product_colors pc
WHERE ps.product_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
  AND pc.product_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

-- For cashmere sweater
INSERT INTO inventory (product_id, size_id, color_id, quantity, low_stock_threshold)
SELECT
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  ps.id,
  pc.id,
  CASE
    WHEN ps.size_label = 'S' AND pc.color_name = 'Ivory' THEN 20
    WHEN ps.size_label = 'M' AND pc.color_name = 'Camel' THEN 25
    ELSE 15
  END,
  5
FROM product_sizes ps
CROSS JOIN product_colors pc
WHERE ps.product_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'
  AND pc.product_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd';

-- For crossbody bag (no size, just color)
INSERT INTO inventory (product_id, color_id, quantity, low_stock_threshold)
SELECT
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  pc.id,
  CASE WHEN pc.color_name = 'Cognac' THEN 30 ELSE 25 END,
  5
FROM product_colors pc
WHERE pc.product_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';

-- For leather oxford
INSERT INTO inventory (product_id, size_id, color_id, quantity, low_stock_threshold)
SELECT
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  ps.id,
  pc.id,
  CASE
    WHEN ps.size_label = '10' AND pc.color_name = 'Chestnut' THEN 15
    WHEN ps.size_label = '11' AND pc.color_name = 'Black' THEN 20
    ELSE 10
  END,
  3
FROM product_sizes ps
CROSS JOIN product_colors pc
WHERE ps.product_id = 'ffffffff-ffff-ffff-ffff-ffffffffffff'
  AND pc.product_id = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

-- Insert store locations
INSERT INTO store_locations (name, address, city, state, postal_code, country, latitude, longitude, phone, email, operating_hours, is_active, offers_pickup) VALUES
  ('Flagship Store - Manhattan', '123 Fashion Avenue', 'New York', 'NY', '10001', 'United States', 40.7505, -73.9934, '+1 212-555-0100', 'manhattan@clothingstore.com', '{"monday": "10:00 AM - 9:00 PM", "tuesday": "10:00 AM - 9:00 PM", "wednesday": "10:00 AM - 9:00 PM", "thursday": "10:00 AM - 9:00 PM", "friday": "10:00 AM - 10:00 PM", "saturday": "10:00 AM - 10:00 PM", "sunday": "11:00 AM - 7:00 PM"}', true, true),
  ('Boutique - Los Angeles', '456 Rodeo Drive', 'Beverly Hills', 'CA', '90210', 'United States', 34.0709, -118.4025, '+1 310-555-0200', 'la@clothingstore.com', '{"monday": "10:00 AM - 8:00 PM", "tuesday": "10:00 AM - 8:00 PM", "wednesday": "10:00 AM - 8:00 PM", "thursday": "10:00 AM - 8:00 PM", "friday": "10:00 AM - 9:00 PM", "saturday": "10:00 AM - 9:00 PM", "sunday": "12:00 PM - 6:00 PM"}', true, true),
  ('Downtown Store - Chicago', '789 Michigan Avenue', 'Chicago', 'IL', '60611', 'United States', 41.8827, -87.6233, '+1 312-555-0300', 'chicago@clothingstore.com', '{"monday": "10:00 AM - 8:00 PM", "tuesday": "10:00 AM - 8:00 PM", "wednesday": "10:00 AM - 8:00 PM", "thursday": "10:00 AM - 8:00 PM", "friday": "10:00 AM - 9:00 PM", "saturday": "10:00 AM - 9:00 PM", "sunday": "11:00 AM - 6:00 PM"}', true, true);
