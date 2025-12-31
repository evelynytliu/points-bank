-- Fix RLS Policies for wish_goals table

-- Drop potentially restrictive or incomplete policies
drop policy if exists "Parents can insert/update/delete wish goals" on wish_goals;
drop policy if exists "Users can view wish goals for their family" on wish_goals;
drop policy if exists "Allow all authenticated access" on wish_goals;
drop policy if exists "View goals" on wish_goals;
drop policy if exists "Manage goals" on wish_goals;

-- Enable RLS
alter table wish_goals enable row level security;

-- Policy: Allow parents to MANAGE (Select, Insert, Update, Delete) goals for their family kids
-- Checks if the current user (auth.uid) is a parent (in profiles) of the same family as the kid
create policy "Manage goals"
on wish_goals for all
using (
  exists (
    select 1 from kids
    join profiles on profiles.family_id = kids.family_id
    where kids.id = wish_goals.kid_id
    and profiles.id = auth.uid()
  )
)
with check (
  exists (
    select 1 from kids
    join profiles on profiles.family_id = kids.family_id
    where kids.id = wish_goals.kid_id
    and profiles.id = auth.uid()
  )
);

-- Note: For kids viewing their own goals, if they are not authenticated via Supabase Auth (guest mode),
-- they might need public access or a specific anon policy. 
-- However, typically the app fetches data using the parent's token or a public client if configured.
-- Adding a read-only policy for anon/public if needed (careful with data exposure):
-- create policy "Anon view" on wish_goals for select using (true); 
-- (Keeping it secure for now, assuming parents manage it or kids use a shared login mechanism if implemented)
