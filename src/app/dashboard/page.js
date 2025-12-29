'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogOut, Plus, TrendingUp, History, Monitor, Star, Clock, Calendar, Share2, Key, Settings, X, Save, User, CheckCircle2, ChevronDown, ChevronUp, Zap, ShieldAlert, Trash2 } from 'lucide-react';

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [family, setFamily] = useState(null);
    const [loading, setLoading] = useState(true);
    const [kids, setKids] = useState([]);
    const [logs, setLogs] = useState([]);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [userRole, setUserRole] = useState('parent'); // 'parent' or 'kid'

    // UI 狀態
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [isAdminExpanded, setIsAdminExpanded] = useState(false);
    const [newKidName, setNewKidName] = useState('');
    const [allocPlan, setAllocPlan] = useState('weekday');

    // 管理後台狀態
    const [selectedKids, setSelectedKids] = useState([]);
    const [ptsChange, setPtsChange] = useState('');
    const [minChange, setMinChange] = useState('');
    const [customReason, setCustomReason] = useState('');

    // 系統設定狀態
    const [tempSettings, setTempSettings] = useState({
        weekday_limit: 50,
        holiday_limit: 90,
        point_to_minutes: 2,
        point_to_cash: 5,
        parent_pin: '0000',
        use_parent_pin: false,
        short_id: ''
    });

    const checkParentPin = () => {
        if (!family?.use_parent_pin || userRole === 'parent') return true;
        const input = prompt('此操作需要家長管理密碼:');
        if (input === family.parent_pin) return true;
        alert('密碼錯誤！');
        return false;
    };

    const fetchData = async () => {
        if (!supabase) return;
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            let currentProfile = null;
            let currentFamilyId = null;

            if (authUser) {
                setUser(authUser);
                setUserRole('parent');
                let { data: profileCheck } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
                let profileData = profileCheck;

                if (!profileData) {
                    // 如果 profile 真的不在（可能 trigger 延遲或失敗），主動建立一個
                    const { data: newProfile } = await supabase.from('profiles').insert({
                        id: authUser.id,
                        full_name: authUser.user_metadata?.full_name || authUser.email.split('@')[0]
                    }).select().single();
                    profileData = newProfile;
                }

                // 如果還沒有家庭，建立一個
                if (!profileData?.family_id) {
                    const { data: familyData } = await supabase.from('families').insert({
                        family_name: `${authUser.email.split('@')[0]} 的家`,
                        admin_id: authUser.id
                    }).select().single();

                    if (familyData) {
                        await supabase.from('profiles').update({ family_id: familyData.id }).eq('id', authUser.id);
                        profileData = { ...profileData, family_id: familyData.id };
                    }
                }
                currentProfile = profileData;
                currentFamilyId = profileData?.family_id;
            } else {
                // 檢查是否為小孩登入
                const kidSession = localStorage.getItem('kid_session');
                if (kidSession) {
                    const kData = JSON.parse(kidSession);
                    setUserRole('kid');
                    setUser({ id: kData.id, email: `kid_${kData.name}@family`, guest: true });
                    currentProfile = { full_name: kData.name, family_id: kData.family_id };
                    currentFamilyId = kData.family_id;
                } else {
                    router.push('/');
                    return;
                }
            }

            if (!currentFamilyId) {
                console.warn("未發現家庭 ID，請重新整理或聯繫管理員。");
                setLoading(false);
                return;
            }

            setProfile(currentProfile);

            // 獲取家庭資訊
            const { data: familyData, error: fError } = await supabase.from('families').select('*').eq('id', currentFamilyId).single();
            if (fError) console.error('獲取家庭失敗:', fError);

            if (familyData) {
                setFamily(familyData);
                setTempSettings({
                    weekday_limit: familyData.weekday_limit || 50,
                    holiday_limit: familyData.holiday_limit || 90,
                    point_to_minutes: familyData.point_to_minutes || 2,
                    point_to_cash: familyData.point_to_cash || 5,
                    parent_pin: familyData.parent_pin || '0000',
                    use_parent_pin: familyData.use_parent_pin || false,
                    short_id: familyData.short_id || ''
                });
            }

            // 獲取小孩清單 (考慮到舊資料遷移，如果查不到 family_id 的，可以查 parent_id 作為備案)
            let { data: kidsData, error: kidsError } = await supabase
                .from('kids')
                .select('*')
                .eq('family_id', currentFamilyId)
                .order('created_at', { ascending: true });

            if (kidsError) {
                console.error('獲取小孩失敗，詳細資訊:', {
                    code: kidsError.code,
                    message: kidsError.message,
                    details: kidsError.details,
                    hint: kidsError.hint
                });
                throw kidsError;
            }

            // 如果查不到小孩，且是家長模式，試著幫忙遷移舊資料 (parent_id 匹配但 family_id 是 null 的)
            if (kidsData?.length === 0 && authUser) {
                const { data: legacyKids } = await supabase.from('kids').select('*').eq('parent_id', authUser.id).is('family_id', null);
                if (legacyKids?.length > 0) {
                    // 自動幫忙補上 family_id
                    await supabase.from('kids').update({ family_id: currentFamilyId }).eq('parent_id', authUser.id).is('family_id', null);
                    kidsData = legacyKids.map(k => ({ ...k, family_id: currentFamilyId }));
                }
            }
            setKids(kidsData || []);

            // 獲取日誌
            const { data: logsData, error: lError } = await supabase
                .from('logs')
                .select(`*, kids!inner(name, family_id)`)
                .eq('kids.family_id', currentFamilyId)
                .order('created_at', { ascending: false })
                .limit(20);

            if (lError) console.error('獲取日誌失敗:', lError);
            setLogs(logsData || []);

            // 如果是家長，獲取所有成員清單用於管理
            if (authUser) {
                const { data: members } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('family_id', currentFamilyId);
                setFamilyMembers(members || []);
            }

        } catch (e) {
            console.error('FetchData 發生未預期錯誤:', e.message || e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [router]);

    const toggleKidSelection = (id) => {
        setSelectedKids(prev =>
            prev.includes(id) ? prev.filter(kidId => kidId !== id) : [...prev, id]
        );
    };

    const getActorName = () => {
        if (userRole === 'parent') {
            return user?.email?.split('@')[0] || '管理員';
        }
        return profile?.full_name || '小孩';
    };

    const handleBatchUpdate = async () => {
        if (!checkParentPin()) return;
        if (selectedKids.length === 0) return alert('請選擇對象');
        const p = parseInt(ptsChange) || 0;
        const m = parseInt(minChange) || 0;
        if (p === 0 && m === 0) return alert('請輸入調整數值');

        const actor = getActorName();
        for (const kidId of selectedKids) {
            const kid = kids.find(k => k.id === kidId);
            if (kid) {
                await updateKidAction(kid, p, m, customReason || '後台批量調整', actor, false);
            }
        }

        setPtsChange('');
        setMinChange('');
        setCustomReason('');
        setSelectedKids([]);
        alert('批量更新完成！');
        fetchData();
    };

    const handleLogout = async () => {
        if (userRole === 'parent') {
            await supabase.auth.signOut();
        } else {
            localStorage.removeItem('kid_session');
        }
        router.push('/');
    };

    const saveSettings = async () => {
        if (!family) return;
        const { error } = await supabase.from('families').update(tempSettings).eq('id', family.id);
        if (error) alert('儲存失敗: ' + error.message);
        else {
            alert('設定已更新！');
            setShowSettingsModal(false);
            fetchData();
        }
    };

    const kickMember = async (memberId) => {
        if (memberId === family.admin_id) return alert('不能移除管理員');
        if (!confirm('確定要將此成員移出家庭嗎？')) return;

        const { error } = await supabase.rpc('remove_family_member', { target_user_id: memberId });
        if (error) alert('移除失敗: ' + error.message);
        else {
            alert('已成功移除');
            fetchData();
        }
    };

    const addKid = async () => {
        if (!newKidName.trim() || !profile?.family_id) return;
        const { error } = await supabase.from('kids').insert({
            name: newKidName,
            parent_id: user.id === family.admin_id ? user.id : family.admin_id, // 確保關聯正確
            family_id: profile.family_id,
            login_pin: '1234'
        });
        if (error) alert(error.message);
        else {
            setNewKidName('');
            setShowAddModal(false);
            fetchData();
        }
    };

    const deleteKid = async (kid) => {
        if (!checkParentPin()) return;
        if (!confirm(`確定要刪除「${kid.name}」嗎？此路徑無法重來。`)) return;

        const { error } = await supabase.from('kids').delete().eq('id', kid.id);
        if (error) {
            alert('刪除失敗: ' + error.message);
        } else {
            alert('成員已移除');
            fetchData();
        }
    };

    const updateKidAction = async (kid, pChange, mChange, reason, actor, shouldFetch = true) => {
        // 如果是減少時間/點數且開啟了家長密碼，則需要檢查
        if (userRole === 'kid' && (pChange > 0 || mChange > 0)) {
            if (!checkParentPin()) return;
        }

        // 使用 RPC 執行原子更新與 Log 寫入，解決 Guest 權限問題並防範計算衝突
        const { error } = await supabase.rpc('update_kid_stats', {
            target_kid_id: kid.id,
            p_change: pChange,
            m_change: mChange,
            p_reason: reason,
            p_actor: actor,
            p_parent_id: family.admin_id
        });

        if (error) {
            alert('更新失敗: ' + error.message);
            console.error('RPC Error:', error);
            return;
        }

        if (shouldFetch) fetchData();
    };

    const batchAllocate = async () => {
        if (!checkParentPin()) return;
        const minutes = allocPlan === 'weekday' ? family.weekday_limit : family.holiday_limit;
        const reason = `${allocPlan === 'weekday' ? '平日' : '假日'}分配`;
        if (!confirm(`確定要為所有小孩分配 ${minutes} 分鐘嗎？`)) return;
        const actor = getActorName();
        for (const kid of kids) {
            await updateKidAction(kid, 0, minutes, reason, actor, false);
        }
        alert('分配完成！');
        fetchData();
    };

    if (loading) return (
        <div className="min-h-screen bg-[#080812] flex items-center justify-center text-cyan-400 font-bold animate-pulse">載入中...</div>
    );

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4 glass-panel p-6 border-cyan-500/10">
                <div className="flex items-center gap-3">
                    <Monitor className="text-cyan-400 w-8 h-8" />
                    <h1 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase">控制後台 {userRole === 'kid' && <span className="text-xs bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full ml-2 non-italic tracking-normal normal-case">小孩模式</span>}</h1>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                    {userRole === 'parent' && (
                        <button onClick={() => setShowSettingsModal(true)} className="flex items-center gap-2 p-3 bg-white/5 hover:bg-cyan-500/20 rounded-2xl border border-white/5 group transition-all text-xs text-slate-400">
                            <Settings className="w-5 h-5 group-hover:rotate-90 transition-all duration-500" />
                            <span className="hidden md:inline font-bold">系統與成員管理</span>
                        </button>
                    )}
                    <button onClick={handleLogout} className="p-3 bg-white/5 hover:bg-red-500/20 rounded-2xl border border-white/5 group transition-all"><LogOut className="w-5 h-5 text-slate-500 group-hover:text-red-400" /></button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-8">

                    {/* Only show Admin Panel to parents or if needed */}
                    {/* Admin Panel available to all, but actions may require PIN */}
                    <div className={`glass-panel border-cyan-500/20 overflow-hidden transition-all duration-500 ${isAdminExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-[70px] opacity-90'}`}>
                        <button
                            onClick={() => setIsAdminExpanded(!isAdminExpanded)}
                            className="w-full flex justify-between items-center p-6 bg-gradient-to-r from-cyan-500/10 to-transparent hover:from-cyan-500/20 transition-all"
                        >
                            <div className="flex items-center gap-3 font-black italic text-white uppercase tracking-wider">
                                <Zap className="text-cyan-400 w-5 h-5 animate-pulse" /> 管理控制台 (批量點數/時間)
                            </div>
                            {isAdminExpanded ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
                        </button>

                        <div className="p-8 pt-2">
                            <div className="flex flex-wrap gap-3 mb-8">
                                {kids.map(k => (
                                    <button
                                        key={k.id}
                                        onClick={() => toggleKidSelection(k.id)}
                                        className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 border ${selectedKids.includes(k.id) ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.4)]' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}
                                    >
                                        {selectedKids.includes(k.id) && <CheckCircle2 className="w-4 h-4" />}
                                        {k.name}
                                    </button>
                                ))}
                                {userRole === 'parent' && <button onClick={() => setShowAddModal(true)} className="px-4 py-3 rounded-2xl bg-white/5 border border-dashed border-white/20 text-slate-500 hover:text-white transition-all"><Plus className="w-5 h-5" /></button>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">⭐ 點數調整</label>
                                    <input type="number" placeholder="例如: +10 / -5" className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-white font-black text-center focus:ring-2 focus:ring-cyan-500 outline-none" value={ptsChange} onChange={e => setPtsChange(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">📺 分鐘調整</label>
                                    <input type="number" placeholder="例如: +30 / -20" className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-white font-black text-center focus:ring-2 focus:ring-cyan-500 outline-none" value={minChange} onChange={e => setMinChange(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">📝 說明原因</label>
                                    <input type="text" placeholder="例如: 洗碗獎勵" className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-white font-black text-center focus:ring-2 focus:ring-cyan-500 outline-none" value={customReason} onChange={e => setCustomReason(e.target.value)} />
                                </div>
                            </div>
                            <button onClick={handleBatchUpdate} className="btn btn-primary w-full !py-4 text-sm font-black uppercase tracking-widest shadow-xl">執行批次更新 🚀</button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h2 className="text-2xl font-black italic text-white flex items-center gap-3 uppercase font-black"><TrendingUp className="text-cyan-400" /> 狀態總覽</h2>
                        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 font-bold">
                            <button onClick={() => setAllocPlan('weekday')} className={`px-4 py-2 rounded-xl text-xs transition-all ${allocPlan === 'weekday' ? 'bg-cyan-500 text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>平日 ({family?.weekday_limit}m)</button>
                            <button onClick={() => setAllocPlan('holiday')} className={`px-4 py-2 rounded-xl text-xs transition-all ${allocPlan === 'holiday' ? 'bg-purple-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>假日 ({family?.holiday_limit}m)</button>
                            <button onClick={batchAllocate} className="ml-2 p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all" title="一鍵分配當前模式時間"><Calendar className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        {kids.map(kid => (
                            <KidCard
                                key={kid.id}
                                kid={kid}
                                onUpdate={updateKidAction}
                                onDelete={deleteKid}
                                currentLimit={allocPlan === 'weekday' ? family?.weekday_limit : family?.holiday_limit}
                                familySettings={family}
                                actorName={getActorName()}
                                hideSensitive={userRole === 'kid'}
                            />
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <h2 className="text-2xl font-black italic text-white flex items-center gap-3 uppercase tracking-tight"><History className="text-pink-500" /> 異動紀錄</h2>
                    <div className="glass-panel p-6 border-pink-500/5 min-h-[500px]">
                        {logs.map(log => (
                            <li key={log.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-2 list-none mb-4 font-bold border-l-2 border-l-cyan-500/20">
                                <div className="flex justify-between items-start">
                                    <span className="font-bold text-cyan-400 uppercase text-xs tracking-widest">{log.kids?.name}</span>
                                    <span className="text-[10px] text-slate-600 font-mono italic">{new Date(log.created_at).toLocaleTimeString()}</span>
                                </div>
                                <div className="text-sm text-slate-300 font-medium">{log.reason || '調整'}</div>
                                <div className="flex justify-between items-center mt-1">
                                    <div className="flex gap-2">
                                        {log.points_change !== 0 && <span className={`text-[10px] px-2 py-0.5 rounded ${log.points_change > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{log.points_change > 0 ? '+' : ''}{log.points_change} 點</span>}
                                        {log.minutes_change !== 0 && <span className={`text-[10px] px-2 py-0.5 rounded ${log.minutes_change > 0 ? 'bg-cyan-500/10 text-cyan-400' : 'bg-orange-500/10 text-orange-400'}`}>{log.minutes_change > 0 ? '+' : ''}{log.minutes_change} 分鐘</span>}
                                    </div>
                                    <div className="text-[10px] text-slate-600 flex items-center gap-1"><User className="w-3 h-3" /> {log.actor_name || '系統'}</div>
                                </div>
                            </li>
                        ))}
                    </div>
                </div>
            </div>

            {/* Settings Modal */}
            {showSettingsModal && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[100] p-6">
                    <div className="glass-panel p-8 md:p-10 max-w-2xl w-full border-cyan-500/30 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-white italic flex items-center gap-3"><Settings className="text-cyan-400 w-6 h-6" /> 系統規則與帳號管理</h3>
                            <button onClick={() => setShowSettingsModal(false)} className="text-slate-500 hover:text-white"><X /></button>
                        </div>

                        <div className="space-y-8">
                            {/* Member Management */}
                            <section>
                                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                                    <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em]">家長管理權限 ({familyMembers.length})</h4>
                                    <div className="group relative">
                                        <button className="text-[9px] bg-white/5 px-2 py-1 rounded-md text-slate-500 hover:text-cyan-300 transition-colors" onClick={() => {
                                            navigator.clipboard.writeText(family.id);
                                            alert('完整邀請碼已複製！別人可以使用此碼加入管理員。');
                                        }}>複製家長邀請碼</button>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    {familyMembers.map(m => (
                                        <div key={m.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-xs uppercase">{m.email?.charAt(0)}</div>
                                                <div>
                                                    <div className="text-sm font-bold text-white">{m.email}</div>
                                                    <div className="text-[10px] text-slate-500 font-black">{m.id === family.admin_id ? '🔑 管理員 (Admin)' : '👤 家長'}</div>
                                                </div>
                                            </div>
                                            {m.id !== family.admin_id && m.id !== user.id && (
                                                <button onClick={() => kickMember(m.id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Kid Login Config */}
                            <section className="p-6 bg-cyan-500/5 rounded-3xl border border-cyan-500/10">
                                <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] mb-4">小孩訪問設定</h4>
                                <div className="space-y-6">
                                    <div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-3">
                                        <div className="flex justify-between items-center">
                                            <label className="text-xs font-bold text-white uppercase italic">家庭訪問碼 (自訂 ID)</label>
                                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">唯一，他人不可重複</span>
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-xl font-black font-mono text-cyan-400 text-center focus:ring-2 focus:ring-cyan-500 outline-none uppercase"
                                            value={tempSettings.short_id}
                                            onChange={(e) => setTempSettings({ ...tempSettings, short_id: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
                                            placeholder="例如: FAMILY888"
                                        />
                                        <p className="text-[9px] text-slate-600 text-center uppercase tracking-widest font-bold">這是小孩登入時要輸入的第一串代碼</p>
                                    </div>
                                </div>
                            </section>

                            {/* PIN Settings */}
                            <section className="p-6 bg-cyan-500/5 rounded-3xl border border-cyan-500/10">
                                <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] mb-4">安全保護設定</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                                        <div className="space-y-0.5">
                                            <div className="text-xs font-bold text-white">啟動家長密碼</div>
                                            <div className="text-[9px] text-slate-500">加分或批量操作時需驗證</div>
                                        </div>
                                        <button
                                            onClick={() => setTempSettings({ ...tempSettings, use_parent_pin: !tempSettings.use_parent_pin })}
                                            className={`w-12 h-6 rounded-full transition-all relative ${tempSettings.use_parent_pin ? 'bg-cyan-500' : 'bg-slate-700'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${tempSettings.use_parent_pin ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">管理密碼 (4 位數)</label>
                                        <input type="text" maxLength={4} className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white font-mono font-bold text-center tracking-[0.5em]" value={tempSettings.parent_pin} onChange={e => setTempSettings({ ...tempSettings, parent_pin: e.target.value })} />
                                    </div>
                                </div>
                            </section>

                            {/* Conversion Rules */}
                            <section>
                                <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] mb-4">點數與時間規則</h4>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="space-y-2 text-center">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase">平日分鐘</label>
                                        <input type="number" className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white font-bold text-center" value={tempSettings.weekday_limit} onChange={e => setTempSettings({ ...tempSettings, weekday_limit: parseInt(e.target.value) })} />
                                    </div>
                                    <div className="space-y-2 text-center">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase">假日分鐘</label>
                                        <input type="number" className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white font-bold text-center" value={tempSettings.holiday_limit} onChange={e => setTempSettings({ ...tempSettings, holiday_limit: parseInt(e.target.value) })} />
                                    </div>
                                    <div className="space-y-2 text-center">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase">1點換分</label>
                                        <input type="number" className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white font-bold text-center" value={tempSettings.point_to_minutes} onChange={e => setTempSettings({ ...tempSettings, point_to_minutes: parseInt(e.target.value) })} />
                                    </div>
                                    <div className="space-y-2 text-center">
                                        <label className="text-[9px] font-bold text-slate-500 uppercase">1點換現</label>
                                        <input type="number" className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white font-bold text-center" value={tempSettings.point_to_cash} onChange={e => setTempSettings({ ...tempSettings, point_to_cash: parseInt(e.target.value) })} />
                                    </div>
                                </div>
                            </section>
                        </div>

                        <button onClick={saveSettings} className="btn btn-primary w-full gap-2 font-black !py-4 mt-10"><Save className="w-5 h-5" /> 儲存所有變更</button>
                    </div>
                </div>
            )}

            {showAddModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-6">
                    <div className="glass-panel p-10 max-w-sm w-full border-cyan-500/30">
                        <h3 className="text-2xl font-black mb-6 italic text-white tracking-tight uppercase">新增成員</h3>
                        <input type="text" placeholder="輸入姓名" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold mb-6 text-center focus:ring-2 focus:ring-cyan-500 outline-none" value={newKidName} onChange={e => setNewKidName(e.target.value)} />
                        <div className="flex gap-4">
                            <button onClick={() => setShowAddModal(false)} className="btn btn-ghost flex-1">取消</button>
                            <button onClick={addKid} className="btn btn-primary flex-1 font-black">執行</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function KidCard({ kid, onUpdate, onDelete, currentLimit, familySettings, actorName, hideSensitive }) {
    const timeLimit = currentLimit || 60;
    const timePercent = Math.min(100, (kid.total_minutes / timeLimit) * 100);
    const isWarning = timePercent > 0 && timePercent <= 30;
    const isDanger = timePercent <= 10;

    return (
        <div className="glass-panel p-8 group relative overflow-hidden transition-all duration-500 hover:bg-white/[0.04] border-cyan-500/5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">{kid.name}</h3>
                        {!hideSensitive && (
                            <button onClick={() => onDelete(kid)} className="p-1.5 bg-white/5 rounded-lg text-slate-500 hover:text-red-500 transition-colors shadow-inner" title="刪除成員"><Trash2 className="w-3.5 h-3.5" /></button>
                        )}
                    </div>
                </div>
                <div className="bg-black/40 border border-white/10 rounded-2xl p-6 text-center min-w-[150px] shadow-2xl relative overflow-hidden text-white">
                    <div className="absolute top-0 right-0 p-1 opacity-20 text-white"><Star className="w-12 h-12 text-yellow-500" /></div>
                    <div className="text-[10px] text-cyan-400 font-black uppercase mb-1 relative z-10">星等點數</div>
                    <div className="text-5xl font-black flex items-center justify-center gap-2 font-black italic relative z-10">{kid.total_points}</div>
                    <div className="mt-3 pt-3 border-t border-white/5 text-[10px] text-slate-500 leading-relaxed font-black uppercase tracking-tighter italic relative z-10">
                        兌換：<span className="text-cyan-400">{kid.total_points * (familySettings?.point_to_minutes || 2)} M</span> | <span className="text-green-400">${kid.total_points * (familySettings?.point_to_cash || 5)}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-3 mb-8">
                <div className="flex justify-between items-end px-1 font-black">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold italic text-sm uppercase leading-none"><Clock className="w-4 h-4" /> 今日剩餘螢幕時間紀錄</div>
                    <div className="text-white font-black text-2xl">{kid.total_minutes} <span className="text-slate-500 text-sm">/ {timeLimit}m</span></div>
                </div>
                <div className="bar-wrap shadow-inner"><div className={`bar-fill transition-all duration-1000 ${isDanger ? 'danger' : isWarning ? 'warning' : ''}`} style={{ width: `${timePercent}%` }} /></div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button onClick={() => onUpdate(kid, 0, -10, '快速扣除', actorName)} className="bg-white/5 border border-white/10 p-3 rounded-xl text-slate-400 text-sm font-black hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest flex items-center justify-center">−10m</button>
                    <button onClick={() => onUpdate(kid, 0, -20, '快速扣除', actorName)} className="bg-white/5 border border-white/10 p-3 rounded-xl text-slate-400 text-sm font-black hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest flex items-center justify-center">−20m</button>
                    <button onClick={() => onUpdate(kid, 0, -30, '快速扣除', actorName)} className="bg-white/5 border border-white/10 p-3 rounded-xl text-slate-400 text-sm font-black hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest flex items-center justify-center">−30m</button>
                    <button onClick={() => {
                        const m = parseInt(prompt('輸入扣除分鐘:'));
                        if (m) onUpdate(kid, 0, -m, '手動扣除', actorName);
                    }} className="bg-white/5 border border-white/10 p-3 rounded-xl text-red-500/60 text-sm font-black hover:bg-red-500/20 hover:text-red-400 transition-all uppercase tracking-widest flex items-center justify-center">自訂</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                        onClick={() => {
                            const kidMins = kid.total_minutes;
                            const rate = familySettings?.point_to_minutes || 2;
                            const maxPts = Math.floor(kidMins / rate);
                            if (maxPts < 1) return alert('分鐘不足！');
                            const want = prompt(`將時間換成點數 (匯率 ${rate}:1)\n目前時間：${kidMins}m (最多換 ${maxPts}點)\n請輸入要換成的點數：`);
                            if (want && parseInt(want) <= maxPts) onUpdate(kid, parseInt(want), -(parseInt(want) * rate), '時間兌換點數', actorName);
                        }}
                        className="bg-white/5 border border-white/10 p-4 rounded-2xl text-slate-400 text-xs font-black hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                        📺 ➔ ⭐ 換成點數
                    </button>
                    <button
                        onClick={() => {
                            const kidPts = kid.total_points;
                            const rate = familySettings?.point_to_minutes || 2;
                            if (kidPts < 1) return alert('點數不足！');
                            const want = prompt(`將點數換成時間 (匯率 1:${rate})\n目前點數：${kidPts} (1點=${rate}分鐘)\n請輸入要使用的點數：`);
                            if (want && parseInt(want) <= kidPts) onUpdate(kid, -parseInt(want), parseInt(want) * rate, '點數兌換時間', actorName);
                        }}
                        className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-2xl text-cyan-400 text-xs font-black hover:bg-cyan-500/20 hover:text-cyan-400 transition-all uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/5"
                    >
                        ⭐ ➔ 📺 兌換時間
                    </button>
                </div>
            </div>
        </div>
    );
}
