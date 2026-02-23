
DO $$
DECLARE
    r RECORD;
    seq INTEGER := 1001;
    new_id TEXT;
BEGIN
    -- Update ALL students to new format, ordered by created_at
    -- Note: This overwrites existing roll numbers. If checking for "UMS" prefix to avoid double update:
    FOR r IN SELECT id FROM public.students WHERE roll_number IS NULL OR roll_number NOT LIKE 'UMS%' ORDER BY created_at ASC
    LOOP
        -- Find the next available ID
        LOOP
            new_id := 'UMS' || seq::text;
            IF NOT EXISTS (SELECT 1 FROM public.students WHERE roll_number = new_id) THEN
                EXIT;
            END IF;
            seq := seq + 1;
        END LOOP;
        
        UPDATE public.students
        SET roll_number = new_id
        WHERE id = r.id;
        
        seq := seq + 1;
    END LOOP;
END $$;
