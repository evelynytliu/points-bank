-- Create a table for Wish Goals
create table if not exists wish_goals (
  id uuid default gen_random_uuid() primary key,
  kid_id uuid references kids(id) on delete cascade not null,
  title text not null,
  target_points integer not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(kid_id) -- One active goal per kid for simplicity
);

-- Add RLS policies (optional but good practice)
alter table wish_goals enable row level security;

create policy "Users can view wish goals for their family"
on wish_goals for select
using (
  exists (
    select 1 from kids
    where kids.id = wish_goals.kid_id
    and kids.family_id in (
      select family_id from profiles where id = auth.uid()
      union
      select family_id from kids where id = auth.uid() -- if auth.uid() is kid (though kid auth is different in this app)
    )
  )
);

create policy "Parents can insert/update/delete wish goals"
on wish_goals for all
using (
  exists (
    select 1 from kids
    join families on kids.family_id = families.id
    where kids.id = wish_goals.kid_id
    and families.admin_id = auth.uid()
  )
);

-- Allow Kids to view their own goals (if using RLS strictly, but app logic might handle it via parent fetch)
-- Simplified policy for public/anon if needed or just rely on application logic + family check above.
