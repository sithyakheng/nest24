-- Create rank_payments table for ABA payment tracking
CREATE TABLE IF NOT EXISTS rank_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  rank TEXT NOT NULL CHECK (rank IN ('elite', 'premier', 'crown')),
  gmail TEXT NOT NULL,
  full_name TEXT NOT NULL,
  shop_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  screenshot_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_rank_payments_seller_status ON rank_payments(seller_id, status);
CREATE INDEX IF NOT EXISTS idx_rank_payments_created_at ON rank_payments(created_at DESC);

-- Add shop_name to profiles table if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS shop_name TEXT;

-- RLS policies for rank_payments
ALTER TABLE rank_payments ENABLE ROW LEVEL SECURITY;

-- Policy: Sellers can only view their own payments
CREATE POLICY "Sellers can view own rank payments" ON rank_payments
  FOR SELECT USING (auth.uid() = seller_id);

-- Policy: Sellers can insert their own payments
CREATE POLICY "Sellers can insert own rank payments" ON rank_payments
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

-- Policy: Admins can view all payments
CREATE POLICY "Admins can view all rank payments" ON rank_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can update all payments
CREATE POLICY "Admins can update all rank payments" ON rank_payments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
