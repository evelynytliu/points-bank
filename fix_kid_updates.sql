-- 1. 修正小孩資料表的更新權限，允許非登入使用者也能更新紀錄 (因應小孩端 Guest 登入)
-- 在家庭點數應用的場景中，安全與便利的折衷
drop policy if exists "Parents can update own kids" on public.kids;
create policy "Enable update for all users" on public.kids
  for update using (true) with check (true);

-- 2. 同時也確保小孩可以讀取自己的資料 (如果之前漏掉的話)
drop policy if exists "Parents can view own kids" on public.kids;
drop policy if exists "Anyone can view kids" on public.kids;
create policy "Enable select for all users" on public.kids
  for select using (true);

-- 3. 優化：建立一個原子更新的小幫手函數，防止點數計算錯誤 (RPC)
create or replace function public.update_kid_stats(
    target_kid_id uuid,
    p_change integer,
    m_change integer,
    p_reason text,
    p_actor text,
    p_parent_id uuid
)
returns void as $$
begin
    -- 1. 更新數值 (確保不低於 0)
    update public.kids
    set 
        total_points = greatest(0, total_points + p_change),
        total_minutes = greatest(0, total_minutes + m_change)
    where id = target_kid_id;

    -- 2. 寫入日誌
    insert into public.logs (kid_id, points_change, minutes_change, reason, actor_name, parent_id)
    values (target_kid_id, p_change, m_change, p_reason, p_actor, p_parent_id);
end;
$$ language plpgsql security definer;
