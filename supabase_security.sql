-- ⚠️ 重要：請將此腳本複製到 Supabase 的 SQL Editor 執行以修復安全性
-- 執行後，您的資料庫將會開啟 RLS (Row Level Security)，並限制未授權的存取。

-- 1. 啟用 RLS (開啟後，預設會拒絕所有存取，直到下方 Policy 生效)
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE kids ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 2. 設定 Families 表格權限
-- (1) 允許使用者讀取「自己所屬」的家庭，或是「自己是管理員」的家庭
CREATE POLICY "View own family" ON families FOR SELECT USING (
  id IN (SELECT family_id FROM profiles WHERE id = auth.uid()) OR
  admin_id = auth.uid()
);

-- (2) 允許已登入使用者建立新家庭
CREATE POLICY "Create family" ON families FOR INSERT WITH CHECK (
  auth.uid() = admin_id
);

-- (3) 允許管理員修改自己的家庭資料
CREATE POLICY "Update own family" ON families FOR UPDATE USING (
  admin_id = auth.uid()
);

-- 3. 設定 Profiles 表格權限
-- 允許使用者完全控制自己的 Profile
CREATE POLICY "Manage own profile" ON profiles FOR ALL USING (auth.uid() = id);

-- 4. 設定 Kids 表格權限
-- 允許家庭成員(家長/小孩)讀取同家庭的小孩資料
CREATE POLICY "View family kids" ON kids FOR SELECT USING (
  family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())
);

-- 允許家長(必須在同家庭)新增/修改/刪除小孩
-- 這裡做比較寬鬆的檢查：只要使用者在該家庭內即可操作 (應用程式端有 checkParentPin 做二次驗證)
CREATE POLICY "Manage family kids" ON kids FOR ALL USING (
  family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid())
);

-- 5. 設定 Logs 表格權限
-- 允許家庭成員查看紀錄
CREATE POLICY "View family logs" ON logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM kids k
    JOIN profiles p ON p.family_id = k.family_id
    WHERE k.id = logs.kid_id AND p.id = auth.uid()
  )
);

-- 允許刪除紀錄 (重設功能用)
CREATE POLICY "Delete family logs" ON logs FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM kids k
    JOIN profiles p ON p.family_id = k.family_id
    WHERE k.id = logs.kid_id AND p.id = auth.uid()
  )
);

-- 6. 建立安全搜尋函數 (給首頁「小孩登入/訪客登入」使用)
-- 因為未登入者無法通過 RLS，必須透過這個 Security Definer 函數來「代為查詢」
-- 這樣就可以只回傳必要的資訊 (id, name, theme)，而不暴露敏感資訊 (如 parent_pin)

CREATE OR REPLACE FUNCTION api_find_family(code text)
RETURNS TABLE (id uuid, family_name text, theme text)
LANGUAGE plpgsql
SECURITY DEFINER -- 以函數建立者的權限執行 (繞過 RLS)
AS $$
BEGIN
  -- 嘗試匹配 UUID 或 Short ID
  IF code ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RETURN QUERY SELECT f.id, f.family_name, f.theme FROM families f WHERE f.id = code::uuid;
  ELSE
    RETURN QUERY SELECT f.id, f.family_name, f.theme FROM families f WHERE f.short_id = code;
  END IF;
END;
$$;

-- 授權給所有人 (包含未登入者) 使用此查詢函數
GRANT EXECUTE ON FUNCTION api_find_family(text) TO anon, authenticated, service_role;

-- 7. 建立取得小孩列表的安全函數 (給首頁登入用)
CREATE OR REPLACE FUNCTION api_get_family_kids(target_family_id uuid)
RETURNS TABLE (id uuid, name text, avatar text, login_pin text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT k.id, k.name, k.avatar, k.login_pin 
  FROM kids k 
  WHERE k.family_id = target_family_id 
  ORDER BY k.sort_order, k.created_at;
END;
$$;

GRANT EXECUTE ON FUNCTION api_get_family_kids(uuid) TO anon, authenticated, service_role;

-- 8. 確保與「加入家庭」、「更新點數」相關的既有函數也是 Security Definer
-- (若這些函數不存在會報錯，可忽略，或確認您的應用程式邏輯)
ALTER FUNCTION join_family(uuid) SECURITY DEFINER;
ALTER FUNCTION update_kid_stats(uuid, int, int, text, text, uuid) SECURITY DEFINER;
ALTER FUNCTION remove_family_member(uuid) SECURITY DEFINER;
ALTER FUNCTION delete_and_revert_log(uuid) SECURITY DEFINER;
