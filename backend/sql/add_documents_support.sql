-- Add documents column to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::JSONB;

-- Add documents column to volunteers table
ALTER TABLE public.volunteers 
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::JSONB;

-- STORAGE SETUP (Run this in SQL Editor as well)
-- 1. Create a new public bucket named 'documents' if it doesn't exist
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

-- 2. Allow public access to read documents
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'documents' );

-- 3. Allow authenticated users to upload documents
create policy "Authenticated Upload"
  on storage.objects for insert
  with check ( bucket_id = 'documents' and auth.role() = 'authenticated' );

-- 4. Allow authenticated users to update/delete their own uploads (or all if admin - simplified for now)
create policy "Authenticated Update"
  on storage.objects for update
  using ( bucket_id = 'documents' and auth.role() = 'authenticated' );
