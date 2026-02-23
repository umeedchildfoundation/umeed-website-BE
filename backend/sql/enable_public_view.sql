-- COPY THIS ENTIRE POICY AND RUN IT IN SUPABASE SQL EDITOR

-- This policy allows ANYONE (public) to see donations that have been marked as 'verified'.
-- Without this, only logged-in Admins can see the list.

create policy "Allow public read verified"
on public.donations
for select
to public
using (status = 'verified');

-- Instructions:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Click "New Query"
-- 3. Paste this code
-- 4. Click "Run"
