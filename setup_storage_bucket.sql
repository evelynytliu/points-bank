-- Enable the storage extension if not already enabled (usually enabled by default)
-- create extension if not exists "storage";

-- 1. Create a new storage bucket called 'wish_goals'
insert into storage.buckets (id, name, public)
values ('wish_goals', 'wish_goals', true);

-- 2. Set up security policies (RLS) for the 'wish_goals' bucket

-- Allow public access to view images (so they load in the app)
-- Note: 'Public' means anyone with the link can view. Since file names are UUIDs, this is usually obscure enough for non-sensitive family photos.
-- If you want strict privacy, set public to false and use signed URLs (more complex implementation).
create policy "Give public access to wish_goals"
on storage.objects for select
using ( bucket_id = 'wish_goals' );

-- Allow authenticated users (family members) to upload images
create policy "Allow authenticated uploads"
on storage.objects for insert
with check ( bucket_id = 'wish_goals' and auth.role() = 'authenticated' );

-- Allow authenticated users to update/delete their own images (or all images for simplicity in family app)
create policy "Allow internal update"
on storage.objects for update
using ( bucket_id = 'wish_goals' and auth.role() = 'authenticated' );

create policy "Allow internal delete"
on storage.objects for delete
using ( bucket_id = 'wish_goals' and auth.role() = 'authenticated' );
