-- 1. 確保所有表格都有啟用 RLS
alter table public.families enable row level security;
alter table public.kids enable row level security;
alter table public.logs enable row level security;
alter table public.profiles enable row level security;

-- 2. Families: 管理員與成員可讀寫，所有人可讀 (用於代碼登入)
drop policy if exists "Family view settings" on public.families;
create policy "Family view settings" on public.families
  for select using (true);

drop policy if exists "Parents can update own family" on public.families;
create policy "Parents can update own family" on public.families
  for update using (admin_id = auth.uid());

-- 3. Kids: 嚴格隔離，只能看到自己家的小孩
drop policy if exists "Public view kids for login" on public.kids;
drop policy if exists "Parents full access to own kids" on public.kids;

-- 小孩讀取權限 (用於登入)
create policy "Kids viewable for login" on public.kids
  for select using (true);

-- 家長完整權限
create policy "Parents full access to own kids" on public.kids
  for all using (
    exists (
      select 1 from public.families 
      where families.id = kids.family_id 
      and families.admin_id = auth.uid()
    )
    or
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.family_id = kids.family_id
    )
  );

-- 4. Logs: 關鍵！確保匯出與讀取時只能看到自己家的日誌
drop policy if exists "Everyone can view logs" on public.logs; -- 如果原本有舊的就刪掉
drop policy if exists "Family members can view own logs" on public.logs;

create policy "Family members can view own logs" on public.logs
  for select using (
    exists (
      select 1 from public.kids
      where kids.id = logs.kid_id
      -- 這裡會自動套用 kids 的 RLS 政策
      -- 也就是只有這家人的成員(家長)才能看到這些小孩
    )
  );

-- 允許家長刪除日誌 (僅限管理員)
create policy "Admins can delete logs" on public.logs
  for delete using (
    exists (
      select 1 from public.kids
      join public.families on families.id = kids.family_id
      where kids.id = logs.kid_id
      and families.admin_id = auth.uid()
    )
  );
