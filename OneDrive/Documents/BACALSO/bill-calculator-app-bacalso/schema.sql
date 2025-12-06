-- ============================================
-- Electric Bill Calculator Database Schema
-- ============================================

-- Create calculations table
CREATE TABLE IF NOT EXISTS calculations (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    power_consumption DECIMAL(10, 2) NOT NULL,
    cost_per_kwh DECIMAL(10, 2) NOT NULL,
    result DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON calculations(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON calculations(created_at DESC);

-- Enable Row Level Security
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running the script)
DROP POLICY IF EXISTS "Users can insert their own calculations" ON calculations;
DROP POLICY IF EXISTS "Users can view their own calculations" ON calculations;
DROP POLICY IF EXISTS "Users can update their own calculations" ON calculations;
DROP POLICY IF EXISTS "Users can delete their own calculations" ON calculations;

-- Create policy to allow users to insert their own calculations
CREATE POLICY "Users can insert their own calculations"
    ON calculations
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to view their own calculations
CREATE POLICY "Users can view their own calculations"
    ON calculations
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Create policy to allow users to update their own calculations
CREATE POLICY "Users can update their own calculations"
    ON calculations
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own calculations
CREATE POLICY "Users can delete their own calculations"
    ON calculations
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
