-- Add profile_picture column to volunteers table
ALTER TABLE public.volunteers 
ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Update the view/fetch logic to include it (if strictly needed, but simple select * usually covers it)
