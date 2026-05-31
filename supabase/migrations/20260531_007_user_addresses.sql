-- Create user_addresses table
CREATE TABLE IF NOT EXISTS user_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  address_line_1 text NOT NULL,
  address_line_2 text DEFAULT '',
  city text NOT NULL,
  state text DEFAULT '',
  postal_code text DEFAULT '',
  country text DEFAULT 'Nepal',
  phone text DEFAULT '',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own addresses"
  ON user_addresses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses"
  ON user_addresses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON user_addresses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON user_addresses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_user_addresses_user ON user_addresses(user_id);
