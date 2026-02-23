-- Add joined_at column to volunteers table if it doesn't exist
ALTER TABLE public.volunteers
ADD COLUMN IF NOT EXISTS joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Backfill existing records that might have null joined_at
-- We'll use created_at if it exists, otherwise now()
UPDATE public.volunteers
SET joined_at = created_at
WHERE joined_at IS NULL;
