-- Phase 1: Database Infrastructure for Bonus Time (Focus Mode)

-- 1. Add Bonus Time configuration to 'families' table
ALTER TABLE public.families 
ADD COLUMN IF NOT EXISTS bonus_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS bonus_weekday_limit INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS bonus_holiday_limit INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS bonus_point_to_minutes INTEGER DEFAULT 10; -- Default: 1 Point = 10 Minutes (Premium rate)

-- 2. Add Bonus Time balance to 'kids' table
ALTER TABLE public.kids 
ADD COLUMN IF NOT EXISTS bonus_minutes INTEGER DEFAULT 0;

-- 3. Update the RPC function to handle bonus time changes safely
--    We are adding 'b_change' (bonus_change) parameter
CREATE OR REPLACE FUNCTION public.update_kid_stats(
    target_kid_id uuid,
    p_change integer,      -- Points change
    m_change integer,      -- General Minutes change
    b_change integer,      -- Bonus Minutes change (New!)
    p_reason text,
    p_actor text,
    p_parent_id uuid
)
RETURNS void AS $$
BEGIN
    -- 1. Update stats (ensure non-negative)
    UPDATE public.kids
    SET 
        total_points = GREATEST(0, total_points + p_change),
        total_minutes = GREATEST(0, total_minutes + m_change),
        bonus_minutes = GREATEST(0, bonus_minutes + b_change) -- Handle Bonus Time
    WHERE id = target_kid_id;

    -- 2. Insert Log
    -- Note: We might need to store bonus change in logs too if we want to track it strictly.
    -- For now, we will just log the reason. If you need a column in logs, you need to alter logs table too.
    -- Let's append bonus info to reason if bonus changed, to avoid altering logs table structure heavily for now.
    
    INSERT INTO public.logs (kid_id, points_change, minutes_change, reason, actor_name, parent_id)
    VALUES (
        target_kid_id, 
        p_change, 
        m_change, 
        CASE 
            WHEN b_change <> 0 THEN p_reason || ' (精選: ' || b_change || '分)'
            ELSE p_reason 
        END, 
        p_actor, 
        p_parent_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. (Optional) Enhance Logs Table if you prefer strict columns
-- UNCOMMENT below lines if you want dedicated column in logs
-- ALTER TABLE public.logs ADD COLUMN IF NOT EXISTS bonus_change INTEGER DEFAULT 0;
-- And then update the insert statement above to include bonus_change.
