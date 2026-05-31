-- Add color_id to product_images
ALTER TABLE product_images 
ADD COLUMN IF NOT EXISTS color_id uuid REFERENCES product_colors(id) ON DELETE SET NULL;

-- Notify pgrst to reload schema
NOTIFY pgrst, 'reload schema';
