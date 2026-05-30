-- Add wholesale fields to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS moq integer DEFAULT 1;
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_type text DEFAULT 'retail' CHECK (product_type IN ('retail', 'wholesale', 'both'));

-- Create inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  company_name text,
  message text NOT NULL DEFAULT '',
  quantity integer NOT NULL DEFAULT 1,
  size_id uuid REFERENCES product_sizes(id) ON DELETE SET NULL,
  color_id uuid REFERENCES product_colors(id) ON DELETE SET NULL,
  inquiry_type text NOT NULL DEFAULT 'inquiry' CHECK (inquiry_type IN ('order', 'inquiry')),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'responded', 'closed')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can insert inquiries (public form)
CREATE POLICY "Anyone can create inquiries" ON inquiries
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Users can view their own inquiries
CREATE POLICY "Users can view own inquiries" ON inquiries
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Admin can do everything with inquiries (using profiles role check)
CREATE POLICY "Admins can manage all inquiries" ON inquiries
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create storage bucket for product images if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: anyone can read product images
CREATE POLICY "Public read access for product images" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'product-images');

-- Storage policy: admin can upload product images
CREATE POLICY "Admin can upload product images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Storage policy: admin can delete product images
CREATE POLICY "Admin can delete product images" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'product-images' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Update trigger for inquiries updated_at
CREATE OR REPLACE FUNCTION update_inquiry_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inquiries_updated_at
  BEFORE UPDATE ON inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_inquiry_updated_at();
