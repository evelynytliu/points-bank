-- 確保 RPC 函數可以被匿名使用者 (小孩模式) 呼叫
grant execute on function public.update_kid_stats to anon, authenticated, service_role;
