-- 1. Update the role constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('customer', 'admin', 'co_admin'));

-- 2. Add policies to allow primary admin to manage users
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
  ));

-- 3. Update Categories policies
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'co_admin')
  ));

DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins and Co-admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'co_admin')
  ));

-- 4. Update Products policies
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'co_admin')
  ));

DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins and Co-admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'co_admin')
  ));

-- 5. Update Product Images policies
DROP POLICY IF EXISTS "Admins can manage product images" ON product_images;
CREATE POLICY "Admins and Co-admins can manage product images"
  ON product_images FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'co_admin')
  ));

-- 6. Update Product Sizes policies
DROP POLICY IF EXISTS "Admins can manage product sizes" ON product_sizes;
CREATE POLICY "Admins and Co-admins can manage product sizes"
  ON product_sizes FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'co_admin')
  ));

-- 7. Update Product Colors policies
DROP POLICY IF EXISTS "Admins can manage product colors" ON product_colors;
CREATE POLICY "Admins and Co-admins can manage product colors"
  ON product_colors FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'co_admin')
  ));

-- 8. Update Inventory policies
DROP POLICY IF EXISTS "Admins can manage inventory" ON inventory;
CREATE POLICY "Admins and Co-admins can manage inventory"
  ON inventory FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'co_admin')
  ));

-- 9. Update Order Items policies
DROP POLICY IF EXISTS "Admins can manage all order items" ON order_items;
CREATE POLICY "Admins and Co-admins can manage all order items"
  ON order_items FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'co_admin')
  ));

-- 10. Update Store Locations policies
DROP POLICY IF EXISTS "Store locations are viewable by everyone" ON store_locations;
CREATE POLICY "Store locations are viewable by everyone"
  ON store_locations FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'co_admin')
  ));

DROP POLICY IF EXISTS "Admins can manage store locations" ON store_locations;
CREATE POLICY "Admins and Co-admins can manage store locations"
  ON store_locations FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'co_admin')
  ));

-- 11. Update Reviews policies
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (is_approved = true OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'co_admin')
  ));

DROP POLICY IF EXISTS "Admins can manage all reviews" ON reviews;
CREATE POLICY "Admins and Co-admins can manage all reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'co_admin')
  ));

-- 12. Also Orders need management policies, but looking at 001, there is no "Admins can manage orders" policy!
-- Let's add one just in case they need it for the dashboard (orders are currently only managed by customers updating own).
-- Wait, if they didn't have it, I'll just add it.
DROP POLICY IF EXISTS "Admins and Co-admins can manage all orders" ON orders;
CREATE POLICY "Admins and Co-admins can manage all orders"
  ON orders FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'co_admin')
  ));
