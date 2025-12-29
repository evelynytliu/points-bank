-- 1. 幫 families 資料表增加設定欄位
alter table public.families add column if not exists weekday_limit integer default 50;
alter table public.families add column if not exists holiday_limit integer default 90;
alter table public.families add column if not exists point_to_minutes integer default 2;
alter table public.families add column if not exists point_to_cash integer default 5;

-- 2. 確保家長可以更新自己家庭的設定
drop policy if exists "Family update settings" on public.families;
create policy "Family update settings" on public.families
  for update using (exists (select 1 from public.profiles where id = auth.uid() and family_id = families.id));

create policy "Family view settings" on public.families
  for select using (exists (select 1 from public.profiles where id = auth.uid() and family_id = families.id) or exists (select 1 from public.kids where family_id = families.id));
