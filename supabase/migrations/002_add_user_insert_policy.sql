-- Add INSERT policy for users table
-- This allows users to create their own profile record during onboarding
CREATE POLICY "Users can create own profile"
  ON users FOR INSERT
  WITH CHECK (true);

