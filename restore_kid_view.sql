-- 解決小孩登入 (匿名訪問) 無法看到資料的問題
-- 請在 Supabase SQL Editor 執行此腳本

-- 1. Families: 允許公開讀取 (用於代碼登入)
drop policy if exists "Family view settings" on public.families;
create policy "Family view settings" on public.families for select using (true);

-- 2. Kids: 允許公開讀取 (用於顯示成員清單)
drop policy if exists "Kids viewable for login" on public.kids;
drop policy if exists "Public view kids for login" on public.kids;
create policy "Public view kids" on public.kids for select using (true);

-- 3. Logs: 允許公開讀取 (只要是對應有效的小孩)
-- 因為小孩登入沒有 Auth，必須允許匿名讀取相關日誌
drop policy if exists "Family members can view own logs" on public.logs;
drop policy if exists "Everyone can view logs" on public.logs;

create policy "Public view logs" on public.logs for select using (
  exists (
    select 1 from public.kids
    where kids.id = logs.kid_id
  )
);

-- 4. Profiles: 確保家長能讀取自己的資料 (修復可能的權限阻擋)
alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
