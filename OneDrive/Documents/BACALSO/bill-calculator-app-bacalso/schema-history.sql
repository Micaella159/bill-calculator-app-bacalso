-- ============================================
-- System History Table Schema
-- Add this to your Supabase SQL Editor
-- ============================================

-- Create system_history table
CREATE TABLE IF NOT EXISTS system_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    user_agent TEXT,
    page_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_system_history_user_id ON system_history(user_id);
CREATE INDEX IF NOT EXISTS idx_system_history_action ON system_history(action);
CREATE INDEX IF NOT EXISTS idx_system_history_timestamp ON system_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_history_user_timestamp ON system_history(user_id, timestamp DESC);

-- Enable Row Level Security
ALTER TABLE system_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own history" ON system_history;
DROP POLICY IF EXISTS "Users can view their own history" ON system_history;
DROP POLICY IF EXISTS "Users can delete their own history" ON system_history;

-- Create policy to allow users to insert their own history
CREATE POLICY "Users can insert their own history"
    ON system_history
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to view their own history
CREATE POLICY "Users can view their own history"
    ON system_history
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own history
CREATE POLICY "Users can delete their own history"
    ON system_history
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
