-- 1. 修正 families 資料表的讀取權限，允許匿名使用者透過代碼查詢家庭 (用於登入)
drop policy if exists "Family view settings" on public.families;
create policy "Family view settings" on public.families
  for select using (true); -- 允許讀取以進行代碼驗證，因為這不包含導出等敏感資訊

-- 2. 修正 kids 資料表的讀取權限，允許匿名使用者在輸入家庭代碼後看到成員清單
drop policy if exists "Public view kids for login" on public.kids;
create policy "Public view kids for login" on public.kids
  for select using (true); -- 允許讀取成員清單進行名稱選擇

-- 3. 確保家長對自己的小孩有完整權限 (原本的可能不夠完整)
drop policy if exists "Parents can view own kids" on public.kids;
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
