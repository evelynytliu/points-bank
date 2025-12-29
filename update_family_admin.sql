-- 增加家長密碼與管理員欄位
alter table public.families add column if not exists parent_pin text default '0000';
alter table public.families add column if not exists use_parent_pin boolean default false;
alter table public.families add column if not exists admin_id uuid references public.profiles(id);

-- 補齊管理員資訊
update public.families f
set admin_id = (select id from public.profiles p where p.family_id = f.id order by created_at asc limit 1)
where admin_id is null;

-- 調整 RLS
drop policy if exists "Family members can view each other" on public.profiles;
create policy "Family members can view each other" on public.profiles
  for select using (
    family_id = (select family_id from public.profiles where id = auth.uid())
  );

-- 允許從家庭中移除成員
create or replace function public.remove_family_member(target_user_id uuid)
returns void as $$
declare
    current_user_family_id uuid;
    is_admin boolean;
begin
    select family_id into current_user_family_id from public.profiles where id = auth.uid();
    select (admin_id = auth.uid()) into is_admin from public.families where id = current_user_family_id;
    
    if not is_admin then
        raise exception '只有管理員可以移除成員';
    end if;

    update public.profiles set family_id = null where id = target_user_id and family_id = current_user_family_id;
end;
$$ language plpgsql security definer;
