-- 1. 幫 families 增加一個易於搜尋的 short_id 欄位
alter table public.families add column if not exists short_id text;

-- 2. 把現有的 ID 前八碼填入 short_id
update public.families set short_id = substring(id::text from 1 for 8) where short_id is null;

-- 3. 建立索引加速搜尋
create index if not exists idx_families_short_id on public.families(short_id);

-- 4. 建立觸發器，讓未來的家庭自動產生 short_id
create or replace function public.sync_short_family_id()
returns trigger as $$
begin
  new.short_id := substring(new.id::text from 1 for 8);
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_family_created_sync_short on public.families;
create trigger on_family_created_sync_short
  before insert on public.families
  for each row execute procedure public.sync_short_family_id();
