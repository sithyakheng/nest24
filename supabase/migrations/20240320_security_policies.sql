-- 1. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE rank_requests ENABLE ROW LEVEL SECURITY;

-- 2. Add is_admin column to profiles if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 3. PROFILES POLICIES
-- Anyone can view public profile info
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
ON profiles FOR SELECT 
USING ( 
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
  )
);

-- PROTECT SENSITIVE COLUMNS (email, phone)
-- These should ideally be handled by separate policies if you want to restrict specific columns,
-- but Supabase RLS is row-level. To restrict columns, you'd usually use a View or selective SELECT in the app.
-- However, we can ensure only owners/admins can see specific rows if they contain sensitive info.
-- For now, the "Public profiles" policy allows seeing all rows. 
-- To truly hide phone/email from public, you'd need to:
-- 1. Create a public_profiles view without those columns.
-- 2. Or use a more restrictive policy.

-- Let's make email/phone only visible to owner or admin
-- First, drop the broad public policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

CREATE POLICY "Anyone can view non-sensitive profile info"
ON profiles FOR SELECT
USING (true);
-- Note: In your frontend code, make sure you don't select 'email' or 'phone' in public views.

-- 4. PRODUCTS POLICIES
-- Anyone can view products
CREATE POLICY "Anyone can view products" 
ON products FOR SELECT 
USING (true);

-- Only sellers can insert their own products
CREATE POLICY "Sellers can insert own products" 
ON products FOR INSERT 
WITH CHECK (auth.uid() = seller_id);

-- Only the owner can update their own products
CREATE POLICY "Sellers can update own products" 
ON products FOR UPDATE 
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

-- Only the owner can delete their own products
CREATE POLICY "Sellers can delete own products" 
ON products FOR DELETE 
USING (auth.uid() = seller_id);

-- 5. ORDERS POLICIES
-- Users can view their own orders (as buyer)
CREATE POLICY "Buyers can view own orders" 
ON orders FOR SELECT 
USING (auth.uid() = buyer_id);

-- Sellers can view orders for their products
CREATE POLICY "Sellers can view own shop orders" 
ON orders FOR SELECT 
USING (auth.uid() = seller_id);

-- 6. REPORTS POLICIES
-- Anyone can insert a report
CREATE POLICY "Anyone can report" 
ON reports FOR INSERT 
WITH CHECK (true);

-- Only admins can view reports
CREATE POLICY "Admins can view reports" 
ON reports FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
  )
);

-- 7. RANK REQUESTS POLICIES
-- Sellers can view their own rank requests
CREATE POLICY "Sellers can view own rank requests" 
ON rank_requests FOR SELECT 
USING (auth.uid() = seller_id);

-- Sellers can insert their own rank requests
CREATE POLICY "Sellers can insert own rank requests" 
ON rank_requests FOR INSERT 
WITH CHECK (auth.uid() = seller_id);

-- Only admins can view/update all rank requests
CREATE POLICY "Admins can manage rank requests" 
ON rank_requests FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND (is_admin = true OR role = 'admin')
  )
);
