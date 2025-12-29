-- 增加索引以加速小孩登入碼查詢
create index if not exists idx_kids_login_pin on public.kids(login_pin);

-- 由於小孩登入碼現在是唯一的識別元，我們建議長度稍微增加
-- 但由家長在介面設定即可。
