-- 建立一個新的 RPC 函數，用於刪除日誌並同時撤銷（還原）點數與時間
create or replace function public.delete_and_revert_log(
    target_log_id uuid
)
returns void as $$
declare
    v_kid_id uuid;
    v_p_change integer;
    v_m_change integer;
    v_family_admin_id uuid;
begin
    -- 1. 獲取日誌資料與這家人的管理員 ID
    select 
        l.kid_id, l.points_change, l.minutes_change, f.admin_id
    into 
        v_kid_id, v_p_change, v_m_change, v_family_admin_id
    from public.logs l
    join public.kids k on k.id = l.kid_id
    join public.families f on f.id = k.family_id
    where l.id = target_log_id;

    -- 檢查是否找到紀錄
    if v_kid_id is null then
        raise exception '找不到該筆異動紀錄';
    end if;

    -- 2. 權限檢查：只有該家庭的管理員才有刪除權限 (auth.uid() 必須等於 admin_id)
    if v_family_admin_id != auth.uid() then
        raise exception '只有管理員可以執行撤銷動作';
    end if;

    -- 3. 逆轉點數與時間 (將原本的變動減回來)
    -- 注意：不使用 greatest(0, ...) 是因為如果是撤銷「扣除」，數值應該會增加；
    -- 如果是撤銷「增加」，數值會減少，此時我們仍確保不低於 0。
    update public.kids
    set 
        total_points = greatest(0, total_points - v_p_change),
        total_minutes = greatest(0, total_minutes - v_m_change)
    where id = v_kid_id;

    -- 4. 刪除該筆日誌
    delete from public.logs where id = target_log_id;
end;
$$ language plpgsql security definer;
