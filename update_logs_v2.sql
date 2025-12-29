-- 1. 調整 logs 資料表，增加執行者名稱欄位
alter table public.logs add column if not exists actor_name text;

-- 2. 由於目前的 RLS 策略可能限制了小孩的寫入權限，我們需要開放讓小孩端能寫入扣除紀錄
drop policy if exists "Family access logs" on public.logs;
create policy "Allow anyone to insert logs" on public.logs for insert with check (true);
create policy "Allow anyone to view logs" on public.logs for select using (true);
