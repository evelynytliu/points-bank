-- 1. Ensure logs table has bonus_change column
ALTER TABLE public.logs ADD COLUMN IF NOT EXISTS bonus_change INTEGER DEFAULT 0;

-- 2. Update update_kid_stats to record bonus_change in dedicated column
CREATE OR REPLACE FUNCTION public.update_kid_stats(
    target_kid_id uuid,
    p_change integer,
    m_change integer,
    b_change integer,
    p_reason text,
    p_actor text,
    p_parent_id uuid
)
RETURNS void AS $$
BEGIN
    -- Update stats
    UPDATE public.kids
    SET 
        total_points = GREATEST(0, total_points + p_change),
        total_minutes = GREATEST(0, total_minutes + m_change),
        bonus_minutes = GREATEST(0, bonus_minutes + b_change)
    WHERE id = target_kid_id;

    -- Insert Log with bonus_change column
    INSERT INTO public.logs (kid_id, points_change, minutes_change, bonus_change, reason, actor_name, parent_id)
    VALUES (
        target_kid_id, 
        p_change, 
        m_change, 
        b_change, 
        CASE 
            WHEN b_change <> 0 THEN p_reason || ' (精選: ' || b_change || '分)'
            ELSE p_reason 
        END, 
        p_actor, 
        p_parent_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update delete_and_revert_log to support bonus reversion + backward compatibility text parsing
CREATE OR REPLACE FUNCTION public.delete_and_revert_log(
    target_log_id uuid
)
RETURNS void AS $$
DECLARE
    v_kid_id uuid;
    v_p_change integer;
    v_m_change integer;
    v_b_change integer;
    v_family_admin_id uuid;
    v_reason text;
BEGIN
    -- 1. Get Log Data
    SELECT 
        l.kid_id, 
        l.points_change, 
        l.minutes_change, 
        COALESCE(l.bonus_change, 0), 
        f.admin_id,
        l.reason
    INTO 
        v_kid_id, v_p_change, v_m_change, v_b_change, v_family_admin_id, v_reason
    FROM public.logs l
    JOIN public.kids k ON k.id = l.kid_id
    JOIN public.families f ON f.id = k.family_id
    WHERE l.id = target_log_id;

    -- Check found
    IF v_kid_id IS NULL THEN
        RAISE EXCEPTION '找不到該筆異動紀錄';
    END IF;

    -- Permission check
    IF v_family_admin_id != auth.uid() THEN
        RAISE EXCEPTION '只有管理員可以執行撤銷動作';
    END IF;

    -- **Backward Compatibility**: If bonus_change is 0 but reason text indicates it, parse it!
    -- Looks for pattern: " (精選: 10分)" or " (精選: -5分)"
    IF v_b_change = 0 AND v_reason LIKE '%(精選: %分)%' THEN
        DECLARE
            extracted_text text;
        BEGIN
            -- Extract string between " (精選: " and "分)"
            extracted_text := substring(v_reason from '\(精選: (-?\d+)分\)');
            IF extracted_text IS NOT NULL THEN
                v_b_change := extracted_text::integer;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- Ignore parsing errors, assume 0
            v_b_change := 0;
        END;
    END IF;

    -- 2. Revert Stats
    UPDATE public.kids
    SET 
        total_points = GREATEST(0, total_points - v_p_change),
        total_minutes = GREATEST(0, total_minutes - v_m_change),
        bonus_minutes = GREATEST(0, bonus_minutes - v_b_change) -- Revert bonus
    WHERE id = v_kid_id;

    -- 3. Delete Log
    DELETE FROM public.logs WHERE id = target_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
