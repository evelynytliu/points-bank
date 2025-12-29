-- 1. 確保 short_id 是唯一的，且不能為空
alter table public.families add constraint unique_short_id unique (short_id);

-- 2. 移除原本自動產生 short_id 的觸發器，改由家長手動設定 (或保留作為預設值但允許修改)
-- 我們保留觸發器作為「新家庭」的預設初始化，但未來家長可以手動修改。
