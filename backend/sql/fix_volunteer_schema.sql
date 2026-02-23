    -- Comprehensive Schema Fix for Volunteers Table
    -- 1. Standardize 'name' column
    DO $$
    BEGIN
    IF EXISTS(SELECT *
        FROM information_schema.columns
        WHERE table_name = 'volunteers' and column_name = 'full_name')
    THEN
        ALTER TABLE public.volunteers RENAME COLUMN full_name TO name;
    END IF;
    END $$;

    ALTER TABLE public.volunteers ADD COLUMN IF NOT EXISTS name TEXT;

    -- 2. Add/Fix other columns
    -- We are using TEXT[] for skills and preferred_languages to support multi-select arrays.
    ALTER TABLE public.volunteers 
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS age NUMERIC,
    ADD COLUMN IF NOT EXISTS gender TEXT,
    ADD COLUMN IF NOT EXISTS occupation TEXT,
    ADD COLUMN IF NOT EXISTS availability TEXT,
    ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::JSONB;

    -- 3. Handle skills and preferred_languages as Arrays
    -- If they exist as TEXT, we try to convert them or drop/recreate (DATA LOSS risk on drop, but safe with IF NOT EXISTS if empty)
    -- Since user is likely in dev/setup phase, we will try to ALTER them to arrays.

    ALTER TABLE public.volunteers 
    ADD COLUMN IF NOT EXISTS skills TEXT[],
    ADD COLUMN IF NOT EXISTS preferred_languages TEXT[];

    -- If they existed as TEXT previously (from my previous script), 
    -- we need to convert them. This block handles that case.
    DO $$
    BEGIN
        -- Check if skills is NOT an array (data_type='text')
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='volunteers' AND column_name='skills' AND data_type='text') THEN
            ALTER TABLE public.volunteers 
            ALTER COLUMN skills TYPE text[] USING string_to_array(skills, ',');
        END IF;

        -- Check if preferred_languages is NOT an array
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='volunteers' AND column_name='preferred_languages' AND data_type='text') THEN
            ALTER TABLE public.volunteers 
            ALTER COLUMN preferred_languages TYPE text[] USING string_to_array(preferred_languages, ',');
        END IF;
    END $$;

-- 4. Fix 'volunteer_applications' table (Public Form)
-- Ensure skills_subjects and preferred_languages are TEXT[]
ALTER TABLE public.volunteer_applications 
ADD COLUMN IF NOT EXISTS skills_subjects TEXT[],
ADD COLUMN IF NOT EXISTS preferred_languages TEXT[];

-- Convert if they exist as TEXT
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='volunteer_applications' AND column_name='skills_subjects' AND data_type='text') THEN
        ALTER TABLE public.volunteer_applications
        ALTER COLUMN skills_subjects TYPE text[] USING string_to_array(skills_subjects, ',');
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='volunteer_applications' AND column_name='preferred_languages' AND data_type='text') THEN
        ALTER TABLE public.volunteer_applications
        ALTER COLUMN preferred_languages TYPE text[] USING string_to_array(preferred_languages, ',');
    END IF;
END $$;

-- Add volunteer_id column if it doesn't exist
ALTER TABLE public.volunteers
ADD COLUMN IF NOT EXISTS volunteer_id TEXT UNIQUE;

-- Backfill volunteer_id for existing records
DO $$
DECLARE
    r RECORD;
    seq INTEGER := 1001;
    new_id TEXT;
BEGIN
    -- Only update records that don't have a volunteer_id
    FOR r IN SELECT id FROM public.volunteers WHERE volunteer_id IS NULL ORDER BY created_at ASC
    LOOP
        -- Find the next available ID
        LOOP
            new_id := 'UMV' || seq::text;
            IF NOT EXISTS (SELECT 1 FROM public.volunteers WHERE volunteer_id = new_id) THEN
                EXIT;
            END IF;
            seq := seq + 1;
        END LOOP;
        
        UPDATE public.volunteers
        SET volunteer_id = new_id
        WHERE id = r.id;
        
        seq := seq + 1;
    END LOOP;
END $$;
