-- Enable Row Level Security
alter table auth.users enable row level security;

-- 1. Create Profiles (Parents)
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz default now(),
  primary key (id)
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Create Kids Table
create table public.kids (
  id uuid default gen_random_uuid() primary key,
  parent_id uuid references public.profiles(id) not null,
  name text not null,
  total_points integer default 0,
  total_minutes integer default 0,
  avatar_url text, /* Optional styling */
  created_at timestamptz default now()
);

alter table public.kids enable row level security;

create policy "Parents can view own kids" on kids
  for select using (auth.uid() = parent_id);

create policy "Parents can insert own kids" on kids
  for insert with check (auth.uid() = parent_id);

create policy "Parents can update own kids" on kids
  for update using (auth.uid() = parent_id);

create policy "Parents can delete own kids" on kids
  for delete using (auth.uid() = parent_id);


-- 3. Create Logs Table
create table public.logs (
  id uuid default gen_random_uuid() primary key,
  kid_id uuid references public.kids(id) on delete cascade not null,
  parent_id uuid references public.profiles(id) not null, /* redundancy for easier query permissions */
  points_change integer default 0,
  minutes_change integer default 0,
  reason text,
  created_at timestamptz default now()
);

alter table public.logs enable row level security;

create policy "Parents can view own logs" on logs
  for select using (auth.uid() = parent_id);

create policy "Parents can insert own logs" on logs
  for insert with check (auth.uid() = parent_id);
