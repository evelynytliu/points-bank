'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Reorder, useDragControls } from 'framer-motion';
import confetti from 'canvas-confetti';
import Logo from '@/components/Logo';

import { LogOut, Plus, PlusCircle, TrendingUp, History, Monitor, Star, Clock, Calendar, Share2, Key, Settings, X, Save, User, UserPlus, CheckCircle2, ChevronDown, ChevronUp, Zap, ShieldAlert, Trash2, Coins, Download, Copy, Smile, GripVertical, Edit2, Eye, EyeOff, Lock } from 'lucide-react';
import { dictionaries } from '@/lib/dictionaries';
import { APP_CONFIG } from '@/lib/config';
import StarJar from '@/components/StarJar';
import JarThemeLayout from '@/components/themes/JarThemeLayout';
import NeonThemeLayout from '@/components/themes/NeonThemeLayout';
import DoodleThemeLayout from '@/components/themes/DoodleThemeLayout';
import AnimatedCounter from '@/components/AnimatedCounter';

const AVATARS = [
    '🦊', '🐱', '🐶', '🦁', '🐼', '🐨', '🐷', '🐯',
    '🐸', '🐙', '🦖', '🦄', '🐝', '🦋', '⚽', '🏀',
    '🎨', '🚀', '🚁', '🚃', '🌈', '🍦', '🍩', '🍕',
    '🍓', '🥑', '🎮', '🍎', '🧩', '🎸', '🛹', '🎻',
    '🎭', '🎬', '🧬', '💎', '🔥', '⚡', '🍀', '🌸'
];


function SortableKidItem({
    kid,
    family,
    t,
    editingKidId,
    editName,
    setEditName,
    editPin,
    setEditPin,
    saveEditKid,
    cancelEditKid,
    startEditKid,
    deleteKid,
    showAvatarPicker,
    setShowAvatarPicker,
    updateKidAvatar
}) {
    const dragControls = useDragControls();

    return (
        <Reorder.Item
            value={kid}
            className="relative"
            dragListener={false}
            dragControls={dragControls}
        >
            <div className={`p-4 rounded-2xl border ${family?.theme === 'jar' ? 'bg-purple-900/20 border-purple-500/30' : ((family?.theme !== 'neon' && family?.theme !== 'jar') ? 'bg-[#fdfbf7] border-[#eee]' : 'bg-white/5 border-white/5')} cursor-default select-none flex flex-col md:flex-row md:items-center gap-3 md:gap-4`}>
                {/* Left: Avatar & Name */}
                <div className="flex items-center gap-3 w-full md:w-auto md:flex-1 min-w-0">
                    <div
                        className={`p-2 rounded-lg cursor-grab active:cursor-grabbing touch-none ${family?.theme !== 'neon' ? 'text-[#ccc] hover:bg-black/5' : 'text-slate-600 hover:bg-white/5'}`}
                        style={{ touchAction: 'none' }}
                        onPointerDown={(e) => dragControls.start(e)}
                    >
                        <GripVertical className="w-5 h-5" />
                    </div>
                    <button
                        onClick={() => setShowAvatarPicker(showAvatarPicker === kid.id ? null : kid.id)}
                        className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-95 ${family?.theme === 'jar' ? 'bg-purple-500/20 border-purple-500/30' : ((family?.theme !== 'neon' && family?.theme !== 'jar') ? 'bg-white shadow-sm border-[#eee]' : 'bg-black/40 border-white/10')} border`}
                    >
                        {kid.avatar || '👶'}
                    </button>
                    {editingKidId === kid.id ? (
                        <input
                            autoFocus
                            className={`flex-1 min-w-0 rounded-lg px-3 py-2 text-sm font-bold outline-none border focus:ring-2 ${family?.theme === 'jar' ? 'bg-purple-900/40 border-purple-500/30 text-white focus:ring-purple-500' : ((family?.theme !== 'neon' && family?.theme !== 'jar') ? 'bg-white border-[#4a4a4a] text-[#4a4a4a] focus:ring-cyan-500' : 'bg-black/20 border-white/10 text-white focus:ring-cyan-500')}`}
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder={t.enter_kid_name}
                        />
                    ) : (
                        <span className={`font-bold truncate text-lg ${family?.theme === 'jar' ? 'text-white' : (family?.theme !== 'neon' ? 'text-[#4a4a4a]' : 'text-white')}`}>{kid.name}</span>
                    )}
                </div>

                {/* Right: PIN & Actions */}
                <div className={`flex items-center justify-between md:justify-end gap-4 w-full md:w-auto ${editingKidId === kid.id ? 'pl-0' : 'pl-14 md:pl-0'}`}>
                    {editingKidId === kid.id ? (
                        // Edit Mode: PIN Input
                        <div className="flex items-center gap-2">
                            <label className={`text-xs font-black uppercase ${family?.theme !== 'neon' ? 'text-slate-400' : 'text-slate-500'}`}>PIN</label>
                            <input
                                type="text"
                                maxLength={4}
                                className={`w-16 text-center font-mono text-sm py-1.5 rounded-lg border focus:outline-none focus:ring-1 ${family?.theme === 'jar' ? 'bg-purple-900/40 border-purple-500/30 text-white focus:ring-purple-500' : ((family?.theme !== 'neon' && family?.theme !== 'jar') ? 'bg-white border-[#4a4a4a] text-[#4a4a4a] focus:ring-[#ff8a80]' : 'bg-black/40 border-white/10 text-cyan-400 focus:ring-cyan-500')}`}
                                value={editPin}
                                onChange={(e) => setEditPin(e.target.value.replace(/\D/g, ''))}
                            />
                        </div>
                    ) : (
                        // Display Mode: Text Only PIN
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black uppercase tracking-wider ${family?.theme !== 'neon' ? 'text-[#ccc]' : 'text-slate-600'}`}>PIN</span>
                            <span className={`font-mono font-bold text-sm ${family?.theme !== 'neon' ? 'text-[#888]' : 'text-slate-400'}`}>
                                {kid.login_pin || '1234'}
                            </span>
                        </div>
                    )}

                    {editingKidId === kid.id ? (
                        <div className="flex gap-1">
                            <button onClick={() => saveEditKid(kid.id)} className="p-2 text-green-500 hover:scale-110 transition-all rounded-full hover:bg-green-500/10" title="儲存"><CheckCircle2 className="w-5 h-5" /></button>
                            <button onClick={cancelEditKid} className="p-2 text-red-500 hover:scale-110 transition-all rounded-full hover:bg-red-500/10" title="取消"><X className="w-5 h-5" /></button>
                        </div>
                    ) : (
                        <div className="flex gap-1">
                            <button onClick={() => startEditKid(kid)} className={`p-2 rounded-xl transition-all ${family?.theme !== 'neon' ? 'text-slate-400 hover:text-blue-500 hover:bg-blue-50' : 'text-slate-500 hover:text-blue-400 hover:bg-blue-500/20'}`} title="修改資料"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => deleteKid(kid)} className={`p-2 rounded-xl transition-all ${family?.theme !== 'neon' ? 'text-slate-400 hover:text-[#ff8a80] hover:bg-red-50' : 'text-slate-500 hover:text-red-400 hover:bg-red-500/20'}`} title="刪除小孩"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    )}
                </div>
            </div>

            {/* Avatar Picker Overlay */}
            {showAvatarPicker === kid.id && (
                <div className="absolute top-16 left-0 z-10 w-full p-4 bg-[#2a2a2a] rounded-2xl shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
                    <div className="grid grid-cols-8 gap-2">
                        {AVATARS.map(emoji => (
                            <button
                                key={emoji}
                                onClick={() => updateKidAvatar(kid.id, emoji)}
                                className={`p-2 text-xl rounded-xl hover:bg-black/5 flex items-center justify-center transition-all hover:scale-125 ${kid.avatar === emoji ? 'bg-orange-400/20' : ''}`}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </Reorder.Item>
    );
}

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [family, setFamily] = useState(null);
    const [loading, setLoading] = useState(true);
    const [kids, setKids] = useState([]);
    const [goals, setGoals] = useState({}); // Map of kid_id -> goal object
    const [updatingKidGoalId, setUpdatingKidGoalId] = useState(null);
    const [logs, setLogs] = useState([]);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [userRole, setUserRole] = useState('parent'); // 'parent' or 'kid'

    // Language
    const [language, setLanguage] = useState('zh');
    const t = dictionaries[language] || dictionaries['zh'];

    useEffect(() => {
        setLanguage(localStorage.getItem('app_language') || 'zh');
    }, []);

    // UI 狀態
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [isAdminExpanded, setIsAdminExpanded] = useState(false);
    const [newKidName, setNewKidName] = useState('');
    const [newKidAvatar, setNewKidAvatar] = useState(AVATARS[0]);
    const [allocPlan, setAllocPlan] = useState('weekday');

    // 自動判斷平日/假日
    useEffect(() => {
        const day = new Date().getDay();
        const isHoliday = (day === 0 || day === 6); // 0 is Sunday, 6 is Saturday
        setAllocPlan(isHoliday ? 'holiday' : 'weekday');
    }, []);
    const [showAvatarPicker, setShowAvatarPicker] = useState(null); // kidId for which we are picking
    const [editingKidId, setEditingKidId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editPin, setEditPin] = useState('');

    // 管理後台狀態
    const [selectedKids, setSelectedKids] = useState([]);
    const [ptsChange, setPtsChange] = useState('');
    const [minChange, setMinChange] = useState('');
    const [customReason, setCustomReason] = useState('');

    // Onboarding
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [joinPin, setJoinPin] = useState('');
    const [newFamilyName, setNewFamilyName] = useState('我的家'); // Default name
    const [familyHistory, setFamilyHistory] = useState([]); // List of visited families
    const [joinNewFamilyCode, setJoinNewFamilyCode] = useState('');
    const [joinNewFamilyPin, setJoinNewFamilyPin] = useState('');
    const [showJoinInput, setShowJoinInput] = useState(false);
    const [highlightSettings, setHighlightSettings] = useState(false);

    // 系統設定狀態
    const [tempSettings, setTempSettings] = useState({
        weekday_limit: 50,
        holiday_limit: 90,
        point_to_minutes: 2,
        point_to_cash: 5,
        parent_pin: '0000',
        use_parent_pin: false,
        short_id: '',
        theme: 'doodle',
        star_size: 5
    });

    const [modal, setModal] = useState({
        isOpen: false,
        type: 'alert', // alert, confirm, prompt
        title: '',
        message: '',
        value: '',
        onConfirm: () => { }
    });

    const [tourStep, setTourStep] = useState(0);

    // PWA Install Prompt State
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isChrome, setIsChrome] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [dismissedInstallPrompt, setDismissedInstallPrompt] = useState(false);
    const [isPinVisible, setIsPinVisible] = useState(false);

    useEffect(() => {
        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
        const userAgent = window.navigator.userAgent.toLowerCase();
        setIsIOS(/iphone|ipad|ipod/.test(userAgent));
        setIsChrome(/crios/.test(userAgent));
        setIsMobile(/android|iphone|ipad|ipod/.test(userAgent));
        setDismissedInstallPrompt(localStorage.getItem('dismissed_install_prompt') === 'true');

        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const dismissInstallPrompt = () => {
        setDismissedInstallPrompt(true);
        localStorage.setItem('dismissed_install_prompt', 'true');
    };

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
            }
        } else if (isIOS) {
            const steps = isChrome ? [
                t.install_ios_chrome_1,
                t.install_ios_chrome_2,
                t.install_ios_chrome_3
            ] : [
                t.install_ios_safari_1,
                t.install_ios_safari_2,
                t.install_ios_safari_3
            ];

            showModal({
                title: isChrome ? t.install_ios_chrome_title : t.install_ios_safari_title,
                message: steps.join('\n'),
                type: 'alert'
            });
        }
    };

    // Initial check for tour
    useEffect(() => {
        if (kids && kids.length === 0 && !localStorage.getItem('tour_completed')) {
            // Wait a bit for UI to settle
            setTimeout(() => setTourStep(1), 1000);
        }
    }, [kids]);

    const finishTour = () => {
        setTourStep(0);
        localStorage.setItem('tour_completed', 'true');
        setHighlightSettings(true);
        setTimeout(() => setHighlightSettings(false), 5000);
    };

    // Apply theme class to body
    useEffect(() => {
        const theme = family?.theme || 'cyber';
        document.body.className = (theme === 'doodle') ? 'theme-doodle' : (theme === 'jar' ? 'theme-jar' : '');
    }, [family?.theme]);

    const showModal = (config) => {
        setModal({
            isOpen: true,
            type: config.type || 'alert',
            title: config.title || '系統訊息',
            message: config.message || '',
            value: config.defaultValue || '',
            unit: config.unit || '',
            rate: config.rate,
            mode: config.mode,
            confirmText: config.confirmText,
            cancelText: config.cancelText,
            content: config.content,
            onConfirm: (val) => {
                config.onConfirm && config.onConfirm(val);
                setModal(prev => ({ ...prev, isOpen: false }));
            },
            onCancel: () => {
                config.onCancel && config.onCancel();
                setModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const checkParentPin = () => {
        return new Promise((resolve) => {
            if (!family?.use_parent_pin || userRole === 'parent') {
                resolve(true);
                return;
            }

            showModal({
                type: 'prompt',
                title: '安全驗證',
                message: '此操作需要家長管理密碼：',
                onConfirm: (val) => {
                    if (val === family.parent_pin) {
                        resolve(true);
                    } else {
                        showModal({ title: '驗證失敗', message: '密碼錯誤！' });
                        resolve(false);
                    }
                },
                onCancel: () => resolve(false)
            });
        });
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
                    const { data: newProfile } = await supabase.from('profiles').insert({
                        id: authUser.id,
                        full_name: authUser.user_metadata?.full_name || authUser.email.split('@')[0]
                    }).select().single();
                    profileData = newProfile;
                }

                if (!profileData?.family_id) {
                    setShowOnboarding(true);
                    setLoading(false);
                    return;
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

                // Update Family History
                if (authUser) {
                    const savedHistory = JSON.parse(localStorage.getItem(`family_history_${authUser.id}`) || '[]');
                    const filtered = savedHistory.filter(f => f.id !== familyData.id);
                    const newHistory = [{
                        id: familyData.id,
                        name: familyData.family_name,
                        short_id: familyData.short_id || ''
                    }, ...filtered].slice(0, 5);
                    localStorage.setItem(`family_history_${authUser.id}`, JSON.stringify(newHistory));
                    setFamilyHistory(newHistory);
                }

                setTempSettings({
                    weekday_limit: familyData.weekday_limit || 50,
                    holiday_limit: familyData.holiday_limit || 90,
                    point_to_minutes: familyData.point_to_minutes || 2,
                    point_to_cash: familyData.point_to_cash || 5,
                    parent_pin: familyData.parent_pin || '0000',
                    use_parent_pin: familyData.use_parent_pin || false,
                    short_id: familyData.short_id || '',
                    theme: familyData.theme || 'cyber',
                    star_size: familyData.star_size || 5
                });
                localStorage.setItem('cached_theme', familyData.theme || 'doodle');
            }

            // 獲取小孩清單 (考慮到舊資料遷移，如果查不到 family_id 的，可以查 parent_id 作為備案)
            let { data: kidsData, error: kidsError } = await supabase
                .from('kids')
                .select('*')
                .eq('family_id', currentFamilyId)
                .order('sort_order', { ascending: true })
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

            let finalKids = kidsData || [];

            // --- 個人化排序邏輯 ---
            // --- 個人化排序邏輯 ---
            // Note: Use !authUser because userRole state update is async and might not be reflected yet
            if (!authUser && localStorage.getItem('kid_session')) {
                // 1. 小孩模式：自己排第一
                const kidSession = localStorage.getItem('kid_session');
                if (kidSession) {
                    const currentKid = JSON.parse(kidSession);
                    const me = finalKids.find(k => k.id === currentKid.id);
                    if (me) {
                        const others = finalKids.filter(k => k.id !== currentKid.id);
                        finalKids = [me, ...others];
                    }
                }
            } else if (authUser && currentProfile) {
                // 2. 家長模式：讀取資料庫中的個人偏好排序 (kid_order)
                const orderIds = currentProfile.kid_order || JSON.parse(localStorage.getItem(`dashboard_sort_${authUser.id}`) || 'null');

                if (orderIds && Array.isArray(orderIds)) {
                    const sorted = [];
                    orderIds.forEach(id => {
                        const found = finalKids.find(k => k.id === id);
                        if (found) sorted.push(found);
                    });
                    const missing = finalKids.filter(k => !orderIds.includes(k.id));
                    finalKids = [...sorted, ...missing];
                }
            }

            setKids(finalKids);

            // Fetch Wish Goals
            if (finalKids.length > 0) {
                const kidIds = finalKids.map(k => k.id);
                const { data: goalsData } = await supabase
                    .from('wish_goals')
                    .select('*')
                    .in('kid_id', kidIds);

                if (goalsData) {
                    const goalsMap = {};
                    goalsData.forEach(g => goalsMap[g.kid_id] = g);
                    setGoals(goalsMap);
                }
            }

            // 獲取日誌
            const { data: logsData, error: lError } = await supabase
                .from('logs')
                .select(`*, kids!inner(name, family_id)`)
                .eq('kids.family_id', currentFamilyId)
                .order('created_at', { ascending: false })
                .limit(10);

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
        if (!await checkParentPin()) return;
        if (selectedKids.length === 0) return alert('請選擇對象');
        const p = parseInt(ptsChange) || 0;
        const m = parseInt(minChange) || 0;
        if (p === 0 && m === 0) return alert('請輸入調整數值');

        const actor = getActorName();
        for (const kidId of selectedKids) {
            const kid = kids.find(k => k.id === kidId);
            if (kid) {
                await updateKidAction(kid, p, m, customReason || '後台批次調整', actor, false);
            }
        }

        setPtsChange('');
        setMinChange('');
        setCustomReason('');
        setSelectedKids([]);
        alert('更新完成！');
        fetchData();
    };

    const handleLogout = () => {
        showModal({
            type: 'confirm',
            title: t.logout_confirm_title,
            message: t.logout_confirm_msg,
            onConfirm: async () => {
                if (userRole === 'parent') {
                    await supabase.auth.signOut();
                } else {
                    localStorage.removeItem('kid_session');
                }
                router.push('/');
            }
        });
    };

    const saveSettings = async () => {
        if (!family) return;

        // 檢查家庭代碼是否重複 (排除自己)
        if (tempSettings.short_id && tempSettings.short_id !== family.short_id) {
            const { data: duplicates } = await supabase
                .from('families')
                .select('id')
                .eq('short_id', tempSettings.short_id)
                .neq('id', family.id);

            if (duplicates && duplicates.length > 0) {
                return alert('⚠️ 這個家庭訪問碼已經被其他人使用了，請換一個！(試試點擊隨機產生)');
            }
        }

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
            avatar: newKidAvatar,
            parent_id: user.id === family.admin_id ? user.id : family.admin_id,
            family_id: profile.family_id,
            login_pin: '1234'
        });
        if (error) alert(error.message);
        else {
            setNewKidName('');
            setNewKidAvatar(AVATARS[Math.floor(Math.random() * AVATARS.length)]);
            setShowAddModal(false);
            fetchData();
        }
    };

    const updateKidAvatar = async (kidId, avatar) => {
        const { error } = await supabase.from('kids').update({ avatar }).eq('id', kidId);
        if (error) alert(error.message);
        else {
            setShowAvatarPicker(null);
            fetchData();
        }
    };

    const updateKidPin = async (kidId, newPin) => {
        if (!/^\d{4}$/.test(newPin)) return;
        const { error } = await supabase.from('kids').update({ login_pin: newPin }).eq('id', kidId);
        if (error) alert(error.message);
        else fetchData();
    };

    const startEditKid = (kid) => {
        setEditingKidId(kid.id);
        setEditName(kid.name);
        setEditPin(kid.login_pin || '1234');
    };

    const cancelEditKid = () => {
        setEditingKidId(null);
    };

    const saveEditKid = async (kidId) => {
        if (!editName.trim()) return;
        if (!/^\d{4}$/.test(editPin)) return alert('PIN 碼必須為 4 位數字');

        const { error } = await supabase.from('kids').update({
            name: editName.trim(),
            login_pin: editPin
        }).eq('id', kidId);

        if (error) {
            alert(error.message);
        } else {
            setEditingKidId(null);
            fetchData();
            // 同步更新小孩模式的 Session (如果修正的是當前使用者)
            const kidSession = localStorage.getItem('kid_session');
            if (kidSession) {
                const kData = JSON.parse(kidSession);
                if (kData.id === kidId) {
                    localStorage.setItem('kid_session', JSON.stringify({ ...kData, name: editName.trim() }));
                }
            }
        }
    };

    const handleReorderKids = async (newOrder) => {
        setKids(newOrder); // 立即更新 UI

        // 儲存到個人帳號設定中 (profiles.kid_order)
        if (user?.id && userRole === 'parent') {
            const orderIds = newOrder.map(k => k.id);

            // 遠端與本地同步更新
            await supabase.from('profiles').update({ kid_order: orderIds }).eq('id', user.id);
            localStorage.setItem(`dashboard_sort_${user.id}`, JSON.stringify(orderIds));
        }
    };

    const deleteKid = async (kid) => {
        if (!await checkParentPin()) return;
        showModal({
            type: 'confirm',
            title: '刪除成員',
            message: `確定要刪除「${kid.name}」嗎？此操作無法復原。`,
            onConfirm: async () => {
                const { error } = await supabase.from('kids').delete().eq('id', kid.id);
                if (error) {
                    showModal({ title: '刪除失敗', message: error.message });
                } else {
                    showModal({ title: '操作成功', message: '成員已移除' });
                    fetchData();
                }
            }
        });
    };

    const updateKidAction = async (kid, pChange, mChange, reason, actor, shouldFetch = true) => {
        // 如果是減少時間/點數且開啟了家長密碼，則需要檢查
        if (userRole === 'kid' && (pChange > 0 || mChange > 0)) {
            if (!await checkParentPin()) return;
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
        if (!await checkParentPin()) return;
        const minutes = allocPlan === 'weekday' ? family.weekday_limit : family.holiday_limit;
        const reason = `${allocPlan === 'weekday' ? '平日' : '假日'}分配`;

        showModal({
            type: 'confirm',
            title: '批次分配',
            message: `確定要為所有小孩分配 ${minutes} 分鐘嗎？`,
            onConfirm: async () => {
                const actor = getActorName();
                for (const kid of kids) {
                    await updateKidAction(kid, 0, minutes, reason, actor, false);
                }
                showModal({ title: '完成', message: '分配完成！' });
                fetchData();
            }
        });
    };

    const resetLogsOnly = async () => {
        if (!await checkParentPin()) return;
        showModal({
            type: 'confirm',
            title: '清空異動紀錄',
            message: '確定要清空所有異動紀錄嗎？這將會刪除日誌，但「保留」目前的點數與剩餘時間。此操作無法復原。',
            onConfirm: async () => {
                const kidIds = kids.map(k => k.id);
                const { error } = await supabase.from('logs').delete().in('kid_id', kidIds);
                if (error) showModal({ title: '失敗', message: error.message });
                else {
                    showModal({ title: '成功', message: '異動紀錄已清空' });
                    fetchData();
                }
            }
        });
    };

    const resetFamilyData = async () => {
        if (!await checkParentPin()) return;
        showModal({
            type: 'confirm',
            title: '危險：徹底清空',
            message: '確定要清空所有紀錄「並歸零點數」嗎？所有小孩的點數與時間將會變為 0。此操作無法復原。',
            onConfirm: async () => {
                const kidIds = kids.map(k => k.id);
                // 1. Delete logs
                await supabase.from('logs').delete().in('kid_id', kidIds);
                // 2. Reset kids stats
                const { error } = await supabase.from('kids').update({ total_points: 0, total_minutes: 0 }).in('id', kidIds);

                if (error) showModal({ title: '失敗', message: error.message });
                else {
                    showModal({ title: '成功', message: '所有資料已重設並歸零' });
                    fetchData();
                }
            }
        });
    };

    const deleteLog = async (logId) => {
        if (userRole !== 'parent') return;
        if (!await checkParentPin()) return;

        showModal({
            type: 'confirm',
            title: '撤銷並刪除紀錄',
            message: '確定要刪除並撤銷此紀錄嗎？這會自動還原該次異動的點數與時間。',
            onConfirm: async () => {
                const { error } = await supabase.rpc('delete_and_revert_log', { target_log_id: logId });
                if (error) showModal({ title: '撤銷失敗', message: error.message });
                else {
                    fetchData();
                }
            }
        });
    };

    const handleCreateFamily = async () => {
        if (!newFamilyName.trim()) return alert('請輸入家庭名稱');

        const { data: familyData, error } = await supabase.from('families').insert({
            family_name: newFamilyName,
            admin_id: user.id,
            theme: 'doodle'
        }).select().single();

        if (error) {
            alert('建立失敗: ' + error.message);
        } else if (familyData) {
            await supabase.from('profiles').update({ family_id: familyData.id }).eq('id', user.id);
            setShowOnboarding(false);
            fetchData();
        }
    };

    const handleJoinFamily = async (codeIn, pinIn) => {
        const codeToUse = typeof codeIn === 'string' ? codeIn.trim() : joinCode.trim();
        const pinToUse = typeof pinIn === 'string' ? pinIn.trim() : joinPin.trim();

        if (!codeToUse) return alert('請輸入家庭代碼');
        if (!pinToUse) return alert('請輸入家庭驗證 PIN 碼');

        let targetId = codeToUse;
        let targetFamily = null;

        // 1. Try to lookup by short_id first
        const { data: familyByShort, error: searchError } = await supabase
            .rpc('get_family_by_code', { lookup_code: codeToUse })
            .maybeSingle();

        if (familyByShort) {
            targetId = familyByShort.id;
            targetFamily = familyByShort;
        } else {
            // 2. If not found by short_id, check if it's a valid UUID
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (uuidRegex.test(codeToUse)) {
                // If ID is valid UUID, fetch family to check PIN
                const { data: familyById } = await supabase
                    .from('families')
                    .select('*')
                    .eq('id', codeToUse)
                    .maybeSingle();
                if (familyById) {
                    targetId = familyById.id;
                    targetFamily = familyById;
                }
            } else {
                return alert(t.alert_no_family);
            }
        }

        if (!targetFamily) return alert(t.alert_no_family);

        // 3. Check PIN
        if (targetFamily.use_parent_pin && targetFamily.parent_pin) {
            if (pinToUse !== targetFamily.parent_pin) {
                return alert('PIN 碼錯誤！加入家庭失敗。');
            }
        }

        // 4. Join
        const { error } = await supabase.rpc('join_family', { target_family_id: targetId });

        if (error) {
            alert(t.alert_join_fail + error.message);
        } else {
            alert(t.alert_join_success);
            setShowOnboarding(false);
            setShowSettingsModal(false);
            // Clear inputs
            setJoinCode('');
            setJoinPin('');
            setJoinNewFamilyCode('');
            setJoinNewFamilyPin('');
            setShowJoinInput(false);
            fetchData();
        }
    };

    const handleUpdateGoal = async (kidId, goalData) => {
        if (!kidId) return;
        setUpdatingKidGoalId(kidId);

        // Check if goal exists
        const existing = goals[kidId];

        let error;
        if (existing) {
            const { error: err } = await supabase
                .from('wish_goals')
                .update({ ...goalData })
                .eq('kid_id', kidId);
            error = err;
        } else {
            const { error: err } = await supabase
                .from('wish_goals')
                .insert({ ...goalData, kid_id: kidId });
            error = err;
        }

        if (error) {
            alert('更新願望失敗: ' + error.message);
        } else {
            await fetchData();
        }
        setUpdatingKidGoalId(null);
    };

    const handleDeleteGoal = async (kidId) => {
        if (!confirm('確定要刪除這個願望目標嗎？')) return;
        setUpdatingKidGoalId(kidId);

        try {
            // 1. Get image info before deleting
            const { data: goals } = await supabase
                .from('wish_goals')
                .select('image_url')
                .eq('kid_id', kidId)
                .limit(1);

            const goal = goals?.[0];

            // 2. Delete database record
            const { error } = await supabase
                .from('wish_goals')
                .delete()
                .eq('kid_id', kidId);

            if (error) throw error;

            // 3. If record deleted successfully, clean up storage
            if (goal?.image_url && goal.image_url.includes('wish_goals')) {
                const fileName = goal.image_url.split('wish_goals/').pop();
                if (fileName) {
                    await supabase.storage
                        .from('wish_goals')
                        .remove([fileName]);
                }
            }

            await fetchData();
        } catch (error) {
            console.error('Error deleting goal:', error);
            alert('刪除失敗: ' + error.message);
        } finally {
            setUpdatingKidGoalId(null);
        }
    };

    const exportLogsToCSV = async () => {
        try {
            const { data: allLogs, error } = await supabase
                .from('logs')
                .select(`*, kids!inner(name, family_id)`)
                .eq('kids.family_id', family.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (!allLogs || allLogs.length === 0) {
                showModal({ title: '提醒', message: '目前沒有任何紀錄可以匯出。' });
                return;
            }

            // CSV Header
            const headers = ['時間', '對象', '原因', '點數變動', '分鐘變動', '操作者'];
            const csvRows = [headers.join(',')];

            for (const log of allLogs) {
                const row = [
                    `"${new Date(log.created_at).toLocaleString().replace(/"/g, '""')}"`,
                    `"${(log.kids?.name || '未知').replace(/"/g, '""')}"`,
                    `"${(log.reason || '調整').replace(/"/g, '""')}"`,
                    log.points_change,
                    log.minutes_change,
                    `"${(log.actor_name || '系統').replace(/"/g, '""')}"`
                ];
                csvRows.push(row.join(','));
            }

            const csvString = '\uFEFF' + csvRows.join('\n'); // Add BOM for Excel Chinese support
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `點數紀錄_${new Date().toLocaleDateString()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (e) {
            console.error('Export error:', e);
            showModal({ title: '匯出失敗', message: e.message });
        }
    };

    if (loading) {
        const cached = typeof window !== 'undefined' ? localStorage.getItem('cached_theme') : 'doodle';
        const isDark = cached === 'neon' || cached === 'cyber';
        return (
            <div className={`min-h-screen flex items-center justify-center font-bold animate-pulse ${isDark ? 'bg-[#080812] text-cyan-400' : 'bg-[#fffbf0] text-[#ff8a80]'}`}>載入中...</div>
        );
    }

    return (
        <div className={`min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20 ${(family?.theme === 'jar') ? '' : (family?.theme !== 'neon' ? 'bg-[#fffbf0]' : 'bg-[#080812]')}`}>
            <header className="flex flex-col md:flex-row justify-between items-center gap-4 py-6">
                <div className="flex items-center gap-4 group cursor-pointer transition-all duration-300 hover:scale-[1.02]">
                    <div className="relative">
                        <div className={`absolute inset-0 rounded-full blur-xl transform group-hover:scale-150 transition-all duration-500 opacity-0 group-hover:opacity-100 ${family?.theme === 'jar' ? 'bg-[#fbbf24]/30' : (family?.theme !== 'neon' ? 'bg-[#ff8a80]/30' : 'bg-cyan-400/30')}`}></div>
                        <Logo className={`${(family?.theme !== 'neon' && family?.theme !== 'jar') ? '' : (family?.theme === 'jar' ? 'text-[#fbbf24]' : 'text-cyan-400')} w-12 h-12 relative z-10 drop-shadow-sm transition-transform duration-500 group-hover:scale-125`} />
                    </div>
                    <div className="flex flex-col">
                        <h1 className={`text-3xl font-black ${(family?.theme !== 'neon' && family?.theme !== 'jar') ? 'text-[#2d2d2d]' : 'text-white'} italic tracking-tighter uppercase relative z-10 flex items-center gap-3`}>
                            <span className="relative pr-2">
                                {t.points_bank}
                                <span className={`absolute -bottom-1 left-0 w-full h-3 ${family?.theme !== 'neon' ? 'bg-[#ff8a80]/30' : 'bg-cyan-500/20'} -rotate-1 rounded-full -z-10 group-hover:h-full group-hover:bottom-0 transition-all duration-300 mix-blend-multiply`}></span>
                            </span>
                            {userRole === 'kid' && <span className={`text-xs ${family?.theme !== 'neon' ? 'bg-[#ff8a80] text-white' : 'bg-cyan-500 text-black'} px-2 py-1 rounded-lg -rotate-6 shadow-sm border border-white/20 tracking-normal not-italic normal-case`}>{t.kid_mode}</span>}
                        </h1>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                    {userRole === 'parent' && (
                        <button
                            onClick={() => {
                                setShowSettingsModal(true);
                                setHighlightSettings(false);
                            }}
                            className={`flex items-center gap-2 px-4 py-2.5 ${family?.theme === 'jar' ? 'bg-purple-900/20 border-purple-500/30 text-white hover:bg-purple-500/20' : (family?.theme !== 'neon' ? 'bg-white border-[#e0e0e0] hover:border-[#4a4a4a] text-[#4a4a4a]' : 'bg-white/5 border-white/10 hover:bg-cyan-500/20 text-slate-300')} rounded-full border-2 transition-all shadow-sm active:scale-95 hover:shadow-md ${highlightSettings ? (family?.theme === 'jar' ? 'ring-2 ring-purple-500 border-purple-500' : (family?.theme !== 'neon' ? 'ring-2 ring-[#ff8a80] border-[#ff8a80]' : 'ring-2 ring-cyan-500 border-cyan-500')) : ''}`}
                        >
                            <Settings className={`w-4 h-4 transition-transform duration-500 ${highlightSettings ? 'rotate-180 text-[#ff8a80]' : 'group-hover:rotate-90'}`} />
                            <span className="font-bold text-sm whitespace-nowrap">{t.settings}</span>
                        </button>
                    )}
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-2 px-4 py-2.5 ${family?.theme === 'jar' ? 'bg-purple-900/20 border-purple-500/30 text-white hover:bg-purple-500/20 hover:text-red-400' : (family?.theme !== 'neon' ? 'bg-white border-[#e0e0e0] hover:border-[#ff8a80] text-[#4a4a4a] hover:text-[#ff8a80]' : 'bg-white/5 border-white/10 hover:bg-red-500/20 text-slate-300 hover:text-red-400')} rounded-full border-2 transition-all shadow-sm active:scale-95 hover:shadow-md`}
                        title={t.logout}
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="font-bold text-sm whitespace-nowrap">{t.logout}</span>
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8 space-y-8">

                    {/* Only show Admin Panel to parents or if needed */}
                    {/* Admin Panel available to all, but actions may require PIN */}
                    <div className={`glass-panel ${family?.theme === 'jar' ? '' : (family?.theme !== 'neon' ? 'border-[#4a4a4a]' : 'border-cyan-500/20')} overflow-hidden transition-all duration-500 ${isAdminExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-[70px] opacity-90'}`}>
                        <button
                            onClick={() => setIsAdminExpanded(!isAdminExpanded)}
                            className={`w-full flex justify-between items-center p-6 ${family?.theme === 'jar' ? 'bg-purple-900/10 hover:bg-purple-900/30' : (family?.theme !== 'neon' ? 'bg-[#ff8a80]/5 hover:bg-[#ff8a80]/10' : 'bg-gradient-to-r from-cyan-500/10 to-transparent hover:from-cyan-500/20')} transition-all`}
                        >
                            <div className={`flex items-center gap-3 font-black italic ${(family?.theme !== 'neon' && family?.theme !== 'jar') ? 'text-[#4a4a4a]' : 'text-white'} uppercase tracking-wider`}>
                                <Zap className={`${family?.theme === 'jar' ? 'text-[#fbbf24]' : (family?.theme !== 'neon' ? 'text-[#ff8a80]' : 'text-cyan-400')} w-5 h-5 animate-pulse`} /> {t.admin_console}
                            </div>
                            {isAdminExpanded ? <ChevronUp className={(family?.theme !== 'neon' && family?.theme !== 'jar') ? 'text-[#4a4a4a]' : 'text-slate-500'} /> : <ChevronDown className={(family?.theme !== 'neon' && family?.theme !== 'jar') ? 'text-[#4a4a4a]' : 'text-slate-500'} />}
                        </button>

                        <div className="p-8 pt-2">
                            <div className="flex flex-wrap gap-3 mb-8">
                                {kids.map(k => (
                                    <button
                                        key={k.id}
                                        onClick={() => toggleKidSelection(k.id)}
                                        className={`px-6 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 border ${selectedKids.includes(k.id)
                                            ? (family?.theme === 'jar' ? 'bg-purple-500 text-white border-purple-400 shadow-[0_0_15px_#8b5cf6]' : (family?.theme !== 'neon' ? 'bg-[#ff8a80] text-white border-[#4a4a4a] shadow-[4px_4px_0px_#d8c4b6]' : 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.4)]'))
                                            : (family?.theme === 'jar' ? 'bg-purple-900/20 text-purple-200 border-purple-500/30 hover:bg-purple-500/20' : (family?.theme !== 'neon' ? 'bg-white text-[#4a4a4a] border-[#4a4a4a] hover:bg-[#f5f5f5] hover:text-[#4a4a4a]' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'))}`}
                                    >
                                        {selectedKids.includes(k.id) && <CheckCircle2 className="w-4 h-4" />}
                                        {k.name}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="space-y-1">
                                    <label className={`text-base font-black ${family?.theme !== 'neon' ? 'text-[#555]' : 'text-slate-500'} uppercase tracking-widest ml-2`}>⭐ {t.points_adjust}</label>
                                    <input type="number" placeholder={t.pts_change_placeholder} className={`w-full ${family?.theme === 'jar' ? 'bg-purple-900/20 border-purple-500/30 text-white focus:ring-purple-500' : (family?.theme !== 'neon' ? 'bg-white border-[#4a4a4a] text-[#4a4a4a] focus:ring-cyan-500' : 'bg-black/40 border-white/10 text-white focus:ring-cyan-500')} border p-5 text-lg rounded-2xl font-black text-center focus:ring-2 outline-none`} value={ptsChange} onChange={e => setPtsChange(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className={`text-base font-black ${family?.theme !== 'neon' ? 'text-[#555]' : 'text-slate-500'} uppercase tracking-widest ml-2`}>📺 {t.minutes_adjust}</label>
                                    <input type="number" placeholder={t.min_change_placeholder} className={`w-full ${family?.theme === 'jar' ? 'bg-purple-900/20 border-purple-500/30 text-white focus:ring-purple-500' : (family?.theme !== 'neon' ? 'bg-white border-[#4a4a4a] text-[#4a4a4a] focus:ring-cyan-500' : 'bg-black/40 border-white/10 text-white focus:ring-cyan-500')} border p-5 text-lg rounded-2xl font-black text-center focus:ring-2 outline-none`} value={minChange} onChange={e => setMinChange(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className={`text-base font-black ${family?.theme !== 'neon' ? 'text-[#555]' : 'text-slate-500'} uppercase tracking-widest ml-2`}>📝 {t.reason_desc}</label>
                                    <input type="text" placeholder={t.reason_placeholder} className={`w-full ${family?.theme === 'jar' ? 'bg-purple-900/20 border-purple-500/30 text-white focus:ring-purple-500' : (family?.theme !== 'neon' ? 'bg-white border-[#4a4a4a] text-[#4a4a4a] focus:ring-cyan-500' : 'bg-black/40 border-white/10 text-white focus:ring-cyan-500')} border p-5 text-lg rounded-2xl font-black text-center focus:ring-2 outline-none`} value={customReason} onChange={e => setCustomReason(e.target.value)} />
                                </div>
                            </div>

                            {/* Preset Buttons for Time Allocation */}
                            <div className="flex gap-4 mb-6 justify-center">
                                <button
                                    onClick={() => {
                                        if (selectedKids.length === 0) setSelectedKids(kids.map(k => k.id));
                                        setMinChange(family?.weekday_limit || 0);
                                        setCustomReason(t.weekday_alloc_reason || '平日分配');
                                    }}
                                    className={`px-6 py-3 rounded-xl text-lg font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95 ${family?.theme === 'jar' ? 'bg-purple-900/20 text-purple-200 border border-purple-500/30 hover:bg-purple-500/20' : (family?.theme !== 'neon' ? 'bg-white text-[#4a4a4a] border-2 border-[#4a4a4a] hover:bg-[#f5f5f5]' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10')}`}
                                >
                                    🏢 {t.weekday} ({family?.weekday_limit}m)
                                </button>
                                <button
                                    onClick={() => {
                                        if (selectedKids.length === 0) setSelectedKids(kids.map(k => k.id));
                                        setMinChange(family?.holiday_limit || 0);
                                        setCustomReason(t.holiday_alloc_reason || '假日分配');
                                    }}
                                    className={`px-6 py-3 rounded-xl text-lg font-bold uppercase tracking-widest transition-all shadow-sm active:scale-95 ${family?.theme === 'jar' ? 'bg-purple-900/20 text-purple-200 border border-purple-500/30 hover:bg-purple-500/20' : (family?.theme !== 'neon' ? 'bg-white text-[#ff8a80] border-2 border-[#ff8a80] hover:bg-[#fff8e1]' : 'bg-white/5 text-purple-400 border border-purple-500/30 hover:bg-purple-500/10')}`}
                                >
                                    🏖️ {t.holiday} ({family?.holiday_limit}m)
                                </button>
                            </div>

                            <button onClick={handleBatchUpdate} className="btn btn-primary w-full !py-6 text-xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                                {t.execute_update} 🚀
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-8 mt-8">
                        {kids.map(kid => (
                            <KidCard
                                key={kid.id}
                                kid={kid}
                                goal={goals[kid.id]}
                                isUpdatingGoal={updatingKidGoalId === kid.id}
                                onUpdateGoal={handleUpdateGoal}
                                onDeleteGoal={handleDeleteGoal}
                                onUpdate={updateKidAction}
                                onDelete={deleteKid}
                                currentLimit={allocPlan === 'weekday' ? family?.weekday_limit : family?.holiday_limit}
                                familySettings={family}
                                actorName={getActorName()}
                                hideSensitive={userRole === 'kid'}
                                showModal={showModal}
                                t={t}
                            />
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <h2 className={`text-2xl font-black italic ${family?.theme === 'jar' ? 'text-white' : (family?.theme !== 'neon' ? 'text-[#4a4a4a]' : 'text-white')} flex items-center gap-3 uppercase tracking-tight`}><History className="text-pink-500" /> {t.history_log}</h2>
                    <div className="min-h-[500px]">
                        {logs.length === 0 ? (
                            <div className={`flex flex-col items-center justify-center h-[450px] text-center ${family?.theme !== 'neon' ? 'text-[#aaa]' : 'text-slate-600'}`}>
                                <History className="w-12 h-12 mb-4 opacity-50" />
                                <p className="text-lg font-bold">{t.no_logs_found}</p>
                            </div>
                        ) : (
                            logs.map(log => (
                                <li key={log.id} className={`p-4 rounded-xl ${family?.theme === 'jar' ? 'bg-purple-900/20 border-purple-500/30' : (family?.theme !== 'neon' ? 'bg-white border-[#4a4a4a]' : 'bg-white/[0.02] border-white/5')} border flex flex-col gap-2 list-none mb-4 font-bold border-l-2 ${family?.theme === 'jar' ? 'border-l-purple-500' : (family?.theme !== 'neon' ? 'border-l-[#ff8a80]' : 'border-l-cyan-500/20')}`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col">
                                            <span className={`font-bold ${family?.theme === 'jar' ? 'text-purple-300' : (family?.theme !== 'neon' ? 'text-[#4a4a4a]' : 'text-cyan-400')} uppercase text-base tracking-widest`}>{log.kids?.name}</span>
                                            <span className={`text-sm ${family?.theme === 'jar' ? 'text-purple-200/60' : (family?.theme !== 'neon' ? 'text-[#888]' : 'text-slate-600')} font-mono italic`}>{new Date(log.created_at).toLocaleTimeString(language === 'en' ? 'en-US' : 'zh-TW')}</span>
                                        </div>
                                        {userRole === 'parent' && (
                                            <button
                                                onClick={() => deleteLog(log.id)}
                                                className={`p-1.5 rounded-lg ${family?.theme !== 'neon' ? 'text-[#ff8a80] hover:bg-red-50' : 'text-slate-500 hover:text-red-400 hover:bg-white/5'} transition-all`}
                                                title="刪除此筆紀錄"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <div className={`text-base ${family?.theme === 'jar' ? 'text-white' : (family?.theme !== 'neon' ? 'text-[#555]' : 'text-slate-300')} font-medium`}>{log.reason || '調整'}</div>
                                    <div className="flex justify-between items-center mt-1">
                                        <div className="flex gap-2">
                                            {log.points_change !== 0 && <span className={`text-sm px-2 py-0.5 rounded ${log.points_change > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{log.points_change > 0 ? '+' : ''}{log.points_change} 點</span>}
                                            {log.minutes_change !== 0 && <span className={`text-sm px-2 py-0.5 rounded ${log.minutes_change > 0 ? (family?.theme !== 'neon' ? 'bg-[#ff8a80]/10 text-[#ff8a80]' : 'bg-cyan-500/10 text-cyan-400') : 'bg-orange-500/10 text-orange-400'}`}>{log.minutes_change > 0 ? '+' : ''}{log.minutes_change} 分鐘</span>}
                                        </div>
                                        <div className={`text-sm ${family?.theme === 'jar' ? 'text-purple-200/60' : (family?.theme !== 'neon' ? 'text-[#888]' : 'text-slate-600')} flex items-center gap-1`}><User className="w-4 h-4" /> {log.actor_name || '系統'}</div>
                                    </div>
                                </li>
                            ))
                        )}
                    </div>
                    <button
                        onClick={() => router.push('/logs')}
                        className={`w-full mt-4 py-3 rounded-xl border-2 font-black transition-all flex items-center justify-center gap-2 ${family?.theme === 'jar' ? 'bg-purple-500/10 border-purple-500/20 text-purple-200 hover:bg-purple-500/30' : (family?.theme !== 'neon' ? 'bg-white border-[#4a4a4a] text-[#4a4a4a] hover:bg-[#f5f5f5] hover:text-[#4a4a4a]' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10')}`}
                    >
                        <History className="w-4 h-4" /> 查看全部異動紀錄
                    </button>
                </div>
            </div>

            {/* Settings Modal */}
            {showSettingsModal && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
                    <div className={`glass-panel flex flex-col max-w-2xl w-full ${family?.theme === 'jar' ? '' : (family?.theme !== 'neon' ? 'border-[#4a4a4a] border-2 shadow-[8px_8px_0px_#d8c4b6]' : 'border-cyan-500/30')} max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300`}>
                        {/* Sticky Header */}
                        <div className={`flex justify-between items-center p-8 md:px-10 pb-6 border-b ${family?.theme === 'jar' ? 'bg-purple-900/10 border-purple-500/30' : (family?.theme !== 'neon' ? 'border-[#4a4a4a] bg-[#fcfbf9]' : 'border-white/5 bg-black/20')} backdrop-blur-md z-10`}>
                            <h3 className={`text-2xl font-black ${(family?.theme !== 'neon' && family?.theme !== 'jar') ? 'text-[#4a4a4a]' : 'text-white'} italic flex items-center gap-3`}><Settings className={`${family?.theme === 'jar' ? 'text-[#fbbf24]' : (family?.theme !== 'neon' ? 'text-[#ff8a80]' : 'text-cyan-400')} w-6 h-6`} /> {t.settings}</h3>
                            <button onClick={() => {
                                const isChanged =
                                    tempSettings.weekday_limit !== family.weekday_limit ||
                                    tempSettings.holiday_limit !== family.holiday_limit ||
                                    tempSettings.point_to_minutes !== family.point_to_minutes ||
                                    tempSettings.point_to_cash !== family.point_to_cash ||
                                    tempSettings.parent_pin !== family.parent_pin ||
                                    tempSettings.use_parent_pin !== family.use_parent_pin ||
                                    tempSettings.short_id !== family.short_id ||
                                    tempSettings.theme !== family.theme ||
                                    tempSettings.star_size !== (family.star_size || 5);

                                if (isChanged) {
                                    showModal({
                                        type: 'confirm',
                                        title: t.unsaved_changes_title,
                                        message: t.unsaved_changes_msg,
                                        confirmText: t.discard,
                                        cancelText: t.keep_editing,
                                        onConfirm: () => setShowSettingsModal(false)
                                    });
                                } else {
                                    setShowSettingsModal(false);
                                }
                            }} className={`${family?.theme !== 'neon' ? 'text-[#4a4a4a]' : 'text-slate-500'} hover:opacity-70 transition-transform active:scale-90`}><X /></button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10 scroll-smooth">
                            {/* 0. Family Switcher (New) */}
                            {/* 0. Family Switcher (New) */}
                            {APP_CONFIG.ENABLE_FAMILY_SWITCHING && familyHistory.length > 0 && (
                                <section>
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className={`text-sm font-black ${family?.theme !== 'neon' ? 'text-[#ff8a80]' : 'text-cyan-500'} uppercase tracking-[0.2em]`}>{t.switch_family || '切換家庭'}</h4>
                                        <button onClick={() => setShowJoinInput(!showJoinInput)} className={`p-1.5 rounded-lg transition-all ${family?.theme !== 'neon' ? 'text-[#888] hover:bg-black/5 hover:text-[#4a4a4a]' : 'text-slate-500 hover:bg-white/10 hover:text-white'}`}>
                                            <Plus className={`w-4 h-4 transition-transform duration-300 ${showJoinInput ? 'rotate-45' : ''}`} />
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {familyHistory.map(hist => (
                                            <div key={hist.id} className={`flex items-center justify-between p-4 rounded-2xl border ${hist.id === family?.id ? (family?.theme === 'jar' ? 'bg-purple-500/20 border-purple-500' : (family?.theme !== 'neon' ? 'bg-[#ff8a80]/10 border-[#ff8a80]' : 'bg-cyan-500/10 border-cyan-500')) : (family?.theme === 'jar' ? 'bg-purple-900/20 border-purple-500/30' : (family?.theme !== 'neon' ? 'bg-white border-[#eee]' : 'bg-white/5 border-white/5'))}`}>
                                                <div>
                                                    <div className={`text-sm font-bold ${family?.theme !== 'neon' ? 'text-[#4a4a4a]' : 'text-white'}`}>{hist.name}</div>
                                                    <div className="text-[10px] opacity-60 font-mono">ID: {hist.short_id}</div>
                                                </div>
                                                {hist.id === family?.id ? (
                                                    <span className={`text-xs font-black px-3 py-1 rounded-full ${family?.theme !== 'neon' ? 'bg-[#ff8a80] text-white' : 'bg-cyan-500 text-black'}`}>{t.current_family || '目前'}</span>
                                                ) : (
                                                    <button onClick={() => {
                                                        showModal({
                                                            type: 'prompt',
                                                            title: '輸入 PIN 碼',
                                                            message: `請輸入「${hist.name}」的家庭 PIN 碼：`,
                                                            onConfirm: (val) => handleJoinFamily(hist.short_id, val)
                                                        });
                                                    }} className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${family?.theme !== 'neon' ? 'bg-[#f5f5f5] text-[#4a4a4a] hover:bg-[#e0e0e0]' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                                                        {t.switch_button || '切換'}
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {showJoinInput && (
                                            <div className={`p-4 rounded-2xl border flex flex-col gap-2 animate-in slide-in-from-top-2 fade-in duration-300 ${family?.theme === 'jar' ? 'bg-purple-900/20 border-purple-500/30' : (family?.theme !== 'neon' ? 'bg-white border-[#eee]' : 'bg-white/5 border-white/5')}`}>
                                                <div className={`text-xs font-bold ${family?.theme !== 'neon' ? 'text-[#888]' : 'text-slate-500'}`}>{t.join_new_family_label || '加入新家庭'}</div>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder={t.join_new_family_placeholder || '輸入家庭代碼'}
                                                        className={`flex-1 p-2 rounded-xl text-sm font-bold outline-none ${family?.theme === 'jar' ? 'bg-black/30 text-white border border-purple-500/30 focus:border-purple-500' : (family?.theme !== 'neon' ? 'bg-[#f5f5f5] text-[#4a4a4a]' : 'bg-black/30 text-white')}`}
                                                        value={joinNewFamilyCode}
                                                        onChange={e => setJoinNewFamilyCode(e.target.value)}
                                                    />
                                                    <input
                                                        type="password"
                                                        maxLength={4}
                                                        placeholder="PIN"
                                                        className={`w-20 p-2 rounded-xl text-sm font-bold outline-none text-center ${family?.theme === 'jar' ? 'bg-black/30 text-white border border-purple-500/30 focus:border-purple-500' : (family?.theme !== 'neon' ? 'bg-[#f5f5f5] text-[#4a4a4a]' : 'bg-black/30 text-white')}`}
                                                        value={joinNewFamilyPin}
                                                        onChange={e => setJoinNewFamilyPin(e.target.value.replace(/\D/g, ''))}
                                                    />
                                                    <button
                                                        onClick={() => handleJoinFamily(joinNewFamilyCode, joinNewFamilyPin)}
                                                        disabled={!joinNewFamilyCode.trim() || !joinNewFamilyPin.trim()}
                                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${!joinNewFamilyCode.trim() || !joinNewFamilyPin.trim() ? 'opacity-50 cursor-not-allowed' : ''} ${family?.theme !== 'neon' ? 'bg-[#4a4a4a] text-white hover:opacity-90' : 'bg-cyan-500 text-black hover:bg-cyan-400'}`}
                                                    >
                                                        {t.join_btn_short || '加入'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* 1. 點數與時間規則 (最常用) */}
                            <section>
                                <h4 className={`text-sm font-black ${family?.theme === 'jar' ? 'text-[#fbbf24]' : (family?.theme !== 'neon' ? 'text-[#ff8a80]' : 'text-cyan-500')} uppercase tracking-[0.2em] mb-4`}>{t.points_time_rules}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="space-y-2 text-center col-span-2 md:col-span-1">
                                        <label className={`text-xs font-bold ${family?.theme !== 'neon' ? 'text-[#888]' : 'text-slate-500'} uppercase block mb-1`}>{t.weekday_limit}</label>
                                        <div className={`flex items-center gap-2 p-1 rounded-xl border ${family?.theme === 'jar' ? 'bg-purple-900/20 border-purple-500/30' : ((family?.theme !== 'neon' && family?.theme !== 'jar') ? 'bg-white border-[#4a4a4a]' : 'bg-black/40 border-white/10')}`}>
                                            <input type="number" className={`w-full ${(family?.theme !== 'neon' && family?.theme !== 'jar') ? 'bg-transparent text-[#4a4a4a]' : 'bg-transparent text-white'} font-bold text-center focus:outline-none p-1 pl-3`} value={tempSettings.weekday_limit} onChange={e => setTempSettings({ ...tempSettings, weekday_limit: parseInt(e.target.value) })} />
                                            <span className={`pr-3 text-xs font-black ${(family?.theme !== 'neon' && family?.theme !== 'jar') ? 'text-[#888]' : 'text-slate-500'} whitespace-nowrap`}>{t.minutes_unit}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-center col-span-2 md:col-span-1">
                                        <label className={`text-xs font-bold ${family?.theme !== 'neon' ? 'text-[#888]' : 'text-slate-500'} uppercase block mb-1`}>{t.holiday_limit}</label>
                                        <div className={`flex items-center gap-2 p-1 rounded-xl border ${family?.theme === 'jar' ? 'bg-purple-900/20 border-purple-500/30' : ((family?.theme !== 'neon' && family?.theme !== 'jar') ? 'bg-white border-[#4a4a4a]' : 'bg-black/40 border-white/10')}`}>
                                            <input type="number" className={`w-full ${(family?.theme !== 'neon' && family?.theme !== 'jar') ? 'bg-transparent text-[#4a4a4a]' : 'bg-transparent text-white'} font-bold text-center focus:outline-none p-1 pl-3`} value={tempSettings.holiday_limit} onChange={e => setTempSettings({ ...tempSettings, holiday_limit: parseInt(e.target.value) })} />
                                            <span className={`pr-3 text-xs font-black ${(family?.theme !== 'neon' && family?.theme !== 'jar') ? 'text-[#888]' : 'text-slate-500'} whitespace-nowrap`}>{t.minutes_unit}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-center col-span-2 md:col-span-1">
                                        <div className={`flex items-end gap-2 px-1 ${family?.theme !== 'neon' ? 'text-[#888]' : 'text-slate-500'} text-xs font-bold uppercase`}>
                                            <div className="w-[30px] text-center pb-1">{t.pts_to_time_rate?.split(':')[0]?.trim() || 'Points'}</div>
                                            <div className="w-[10px] text-center pb-1">:</div>
                                            <div className="flex-1 text-center pb-1">{t.pts_to_time_rate?.split(':')[1]?.trim() || 'Minutes'}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-[30px] text-center text-xl font-black ${family?.theme !== 'neon' ? 'text-[#aaa]' : 'text-slate-500'}`}>1</div>
                                            <div className={`w-[10px] text-center text-xl font-black ${family?.theme !== 'neon' ? 'text-[#aaa]' : 'text-slate-500'}`}>:</div>
                                            <div className={`flex-1 flex items-center p-1 rounded-xl border ${family?.theme === 'jar' ? 'bg-purple-900/20 border-purple-500/30' : ((family?.theme !== 'neon' && family?.theme !== 'jar') ? 'bg-white border-[#4a4a4a]' : 'bg-black/40 border-white/10')}`}>
                                                <input type="number" className={`w-full ${(family?.theme !== 'neon' && family?.theme !== 'jar') ? 'bg-transparent text-[#4a4a4a]' : 'bg-transparent text-white'} font-bold text-center focus:outline-none p-1`} value={tempSettings.point_to_minutes} onChange={e => setTempSettings({ ...tempSettings, point_to_minutes: parseInt(e.target.value) })} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-center col-span-2 md:col-span-1">
                                        <div className={`flex items-end gap-2 px-1 ${family?.theme !== 'neon' ? 'text-[#888]' : 'text-slate-500'} text-xs font-bold uppercase`}>
                                            <div className="w-[30px] text-center pb-1">{t.pts_to_cash_rate?.split(':')[0]?.trim() || 'Points'}</div>
                                            <div className="w-[10px] text-center pb-1">:</div>
                                            <div className="flex-1 text-center pb-1">{t.pts_to_cash_rate?.split(':')[1]?.trim() || 'Cash'}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-[30px] text-center text-xl font-black ${family?.theme !== 'neon' ? 'text-[#aaa]' : 'text-slate-500'}`}>1</div>
                                            <div className={`w-[10px] text-center text-xl font-black ${family?.theme !== 'neon' ? 'text-[#aaa]' : 'text-slate-500'}`}>:</div>
                                            <div className={`flex-1 flex items-center p-1 rounded-xl border ${family?.theme === 'jar' ? 'bg-purple-900/20 border-purple-500/30' : ((family?.theme !== 'neon' && family?.theme !== 'jar') ? 'bg-white border-[#4a4a4a]' : 'bg-black/40 border-white/10')}`}>
                                                <input type="number" step="0.1" className={`w-full ${(family?.theme !== 'neon' && family?.theme !== 'jar') ? 'bg-transparent text-[#4a4a4a]' : 'bg-transparent text-white'} font-bold text-center focus:outline-none p-1`} value={tempSettings.point_to_cash} onChange={e => setTempSettings({ ...tempSettings, point_to_cash: parseFloat(e.target.value) })} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h4 className={`text-sm font-black ${family?.theme !== 'neon' ? 'text-[#ff8a80]' : 'text-cyan-500'} uppercase tracking-[0.2em] mb-4`}>{t.kids_mgmt}</h4>
                                <div className={`text-xs ${family?.theme !== 'neon' ? 'text-[#888]' : 'text-slate-500'} opacity-60 mb-3`}>{t.kid_sort_hint}</div>
                                <Reorder.Group axis="y" values={kids} onReorder={handleReorderKids} className="space-y-3 mb-4">
                                    {kids.map(kid => (
                                        <SortableKidItem
                                            key={kid.id}
                                            kid={kid}
                                            family={family}
                                            t={t}
                                            editingKidId={editingKidId}
                                            editName={editName}
                                            setEditName={setEditName}
                                            editPin={editPin}
                                            setEditPin={setEditPin}
                                            saveEditKid={saveEditKid}
                                            cancelEditKid={cancelEditKid}
                                            startEditKid={startEditKid}
                                            deleteKid={deleteKid}
                                            showAvatarPicker={showAvatarPicker}
                                            setShowAvatarPicker={setShowAvatarPicker}
                                            updateKidAvatar={updateKidAvatar}
                                        />
                                    ))}
                                </Reorder.Group>
                                <button onClick={() => { setShowAddModal(true); setShowSettingsModal(false); }} className={`w-full py-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 font-black transition-all ${family?.theme !== 'neon' ? 'border-[#ff8a80]/30 text-[#ff8a80] hover:bg-[#ff8a80]/5' : 'border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/10'}`}>
                                    <Plus className="w-5 h-5" /> {t.add_kid_member}
                                </button>
                            </section>

                            <div className="flex flex-col gap-6">
                                {/* 3. 家庭邀請碼 */}
                                <section className={`p-4 md:p-6 ${family?.theme !== 'neon' ? 'bg-[#ff8a80]/5' : 'bg-cyan-500/5'} rounded-3xl border-2 border-dashed ${family?.theme !== 'neon' ? 'border-[#ff8a80]/30' : 'border-cyan-500/20 shadow-[0_0_20px_rgba(0,255,255,0.05)]'}`}>
                                    <h4 className={`text-sm font-black ${family?.theme !== 'neon' ? 'text-[#ff8a80]' : 'text-cyan-500'} uppercase tracking-[0.2em] mb-4`}>{t.family_conn_center}</h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center flex-wrap gap-2">
                                            <div className="flex items-center gap-2">
                                                <label className={`text-xs font-black ${family?.theme !== 'neon' ? 'text-[#4a4a4a]' : 'text-slate-400'} uppercase`}>{t.family_access_code}</label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {/* Invite Parent */}
                                                <button
                                                    onClick={() => {
                                                        const url = 'https://points-bank.vercel.app/';
                                                        const code = tempSettings.short_id;

                                                        let msg = t.invite_parent_msg_template;
                                                        const pinSection = tempSettings.use_parent_pin
                                                            ? t.invite_parent_pin_section.replace('{pin}', tempSettings.parent_pin)
                                                            : '';

                                                        msg = msg.replace('{url}', url)
                                                            .replace('{code}', code)
                                                            .replace('{pin_section}', pinSection);

                                                        showModal({
                                                            type: 'confirm',
                                                            title: '📋 ' + t.invite_msg_title,
                                                            message: msg,
                                                            confirmText: t.copy_invite,
                                                            cancelText: t.cancel,
                                                            onConfirm: () => {
                                                                navigator.clipboard.writeText(msg);
                                                                alert(t.copied);
                                                            }
                                                        });
                                                    }}
                                                    className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${family?.theme !== 'neon' ? 'bg-[#e3f2fd] text-[#1976d2] hover:bg-[#bbdefb]' : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'}`}
                                                >
                                                    <Share2 className="w-3.5 h-3.5" />
                                                    {t.invite_parent_btn}
                                                </button>

                                                {/* Invite Kid */}
                                                <button
                                                    onClick={() => {
                                                        if (kids.length === 0) {
                                                            alert(t.no_kids_alert);
                                                            return;
                                                        }

                                                        showModal({
                                                            type: 'alert',
                                                            title: t.invite_kid_msg_title,
                                                            message: t.select_kid_invite,
                                                            content: (
                                                                <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1">
                                                                    {kids.map(kid => (
                                                                        <button
                                                                            key={kid.id}
                                                                            onClick={() => {
                                                                                const url = 'https://points-bank.vercel.app/';
                                                                                const code = tempSettings.short_id;
                                                                                let msg = t.invite_kid_msg_template;
                                                                                msg = msg.replace('{url}', url)
                                                                                    .replace('{code}', code)
                                                                                    .replace(/{name}/g, kid.name)
                                                                                    .replace('{pin}', kid.login_pin || '1234');

                                                                                showModal({
                                                                                    type: 'confirm',
                                                                                    title: '📋 ' + t.invite_kid_msg_title,
                                                                                    message: msg,
                                                                                    confirmText: t.copy_invite,
                                                                                    cancelText: t.cancel,
                                                                                    onConfirm: () => {
                                                                                        navigator.clipboard.writeText(msg);
                                                                                        alert(t.copied);
                                                                                    }
                                                                                });
                                                                            }}
                                                                            className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all active:scale-95 ${family?.theme !== 'neon' ? 'bg-white border-[#4a4a4a] text-[#4a4a4a] hover:bg-orange-50' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                                                                        >
                                                                            <span className="text-2xl">{kid.avatar || '👶'}</span>
                                                                            <span className="font-bold text-sm truncate w-full text-center">{kid.name}</span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            ),
                                                            confirmText: t.cancel || '取消',
                                                        });
                                                    }}
                                                    className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${family?.theme !== 'neon' ? 'bg-[#ffccbc] text-[#d84315] hover:bg-[#ffab91]' : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'}`}
                                                >
                                                    <UserPlus className="w-3.5 h-3.5" />
                                                    {t.invite_kid_btn}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="relative flex items-center">
                                            <input
                                                type="text"
                                                className={`w-full flex-1 ${family?.theme !== 'neon' ? 'bg-white border-[#eee] text-[#ff8a80]' : 'bg-black/40 border-white/5 text-cyan-400'} border-2 rounded-2xl p-3 md:p-4 pr-12 text-lg font-black font-mono text-center uppercase shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500`}
                                                value={tempSettings.short_id}
                                                onChange={(e) => setTempSettings({ ...tempSettings, short_id: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
                                                placeholder="例如: FAMILY123"
                                            />
                                            <button
                                                onClick={() => { navigator.clipboard.writeText(tempSettings.short_id); alert(t.copied); }}
                                                className={`absolute right-2 p-2 rounded-xl transition-all ${family?.theme !== 'neon' ? 'text-[#ccc] hover:text-[#4a4a4a] hover:bg-black/5' : 'text-slate-500 hover:text-white hover:bg-white/10'}`}
                                                title={t.copy_code || 'Copy'}
                                            >
                                                <Copy className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-500 italic opacity-60">{t.access_code_hint}</p>
                                    </div>
                                </section>

                                {/* 4. 家長與管理員 */}
                                <section>
                                    <h4 className={`text-sm font-black ${family?.theme === 'jar' ? 'text-[#fbbf24]' : (family?.theme !== 'neon' ? 'text-[#ff8a80]' : 'text-cyan-500')} uppercase tracking-[0.2em] mb-4`}>{t.parent_team_center}</h4>
                                    <div className="space-y-3">
                                        {familyMembers.map(m => (
                                            <div key={m.id} className={`flex items-center justify-between p-4 ${family?.theme === 'jar' ? 'bg-purple-900/20 border-purple-500/30' : ((family?.theme !== 'neon' && family?.theme !== 'jar') ? 'bg-white border-[#4a4a4a]' : 'bg-white/5 border-white/5')} rounded-2xl border`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full ${family?.theme === 'jar' ? 'bg-purple-500/20 text-purple-300' : (family?.theme !== 'neon' ? 'bg-[#ff8a80]/20 text-[#ff8a80]' : 'bg-cyan-500/20 text-cyan-400')} flex items-center justify-center font-bold text-xs uppercase`}>{m.email?.charAt(0)}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className={`font-bold text-sm mb-0.5 ${(family?.theme !== 'neon' && family?.theme !== 'jar') ? 'text-[#4a4a4a]' : 'text-white'}`}>{m.email}</div>
                                                        <div className={`text-sm ${family?.theme === 'jar' ? 'text-purple-300' : (family?.theme !== 'neon' ? 'text-[#888]' : 'text-slate-500')} flex items-center gap-1`}><User className="w-4 h-4" /> {m.id === family.admin_id ? t.admin_label : t.parent_label}</div>
                                                    </div>
                                                </div>
                                                {m.id !== family.admin_id && m.id !== user.id && (
                                                    <button onClick={() => kickMember(m.id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            {/* 5. 安全與偏好設定 */}
                            <section>
                                <h4 className={`text-sm font-black ${family?.theme === 'jar' ? 'text-[#fbbf24]' : (family?.theme !== 'neon' ? 'text-[#ff8a80]' : 'text-cyan-500')} uppercase tracking-[0.2em] mb-4`}>{t.security_settings}</h4>
                                <div className="space-y-8">
                                    {/* Security - PIN */}
                                    <div className="space-y-6">
                                        {/* Row 1: PIN Input (Masked) + Eye Icon */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className={`text-sm font-bold ${(family?.theme !== 'neon' && family?.theme !== 'jar') ? 'text-[#4a4a4a]' : 'text-white'}`}>{t.parent_pin_label}</div>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type={isPinVisible ? "text" : "password"}
                                                    maxLength={4}
                                                    placeholder={t.four_digit_pin}
                                                    className={`w-full ${family?.theme === 'jar' ? 'bg-purple-900/20 border-purple-500/30 text-white' : ((family?.theme !== 'neon' && family?.theme !== 'jar') ? 'bg-white border-[#eee] text-[#4a4a4a]' : 'bg-black/40 border-white/10 text-white')} p-4 pr-12 rounded-2xl border font-mono font-bold text-center tracking-[0.5em] focus:outline-none focus:ring-1 focus:ring-[#ff8a80] transition-colors`}
                                                    value={tempSettings.parent_pin}
                                                    onChange={e => setTempSettings({ ...tempSettings, parent_pin: e.target.value })}
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (isPinVisible) {
                                                            setIsPinVisible(false);
                                                        } else {
                                                            // Enhance: Use number words for challenge
                                                            const numsZh = ['零', '壹', '貳', '參', '肆', '伍', '陸', '柒', '捌', '玖', '拾'];
                                                            const numsEn = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
                                                            const isZh = language === 'zh';
                                                            const n1 = Math.floor(Math.random() * 5) + 1; // 1-5
                                                            const n2 = Math.floor(Math.random() * 5) + 1; // 1-5
                                                            const op = Math.random() > 0.5 ? '+' : '-';

                                                            // Ensure result is positive for subtraction
                                                            const [a, b] = (op === '-' && n1 < n2) ? [n2, n1] : [n1, n2];

                                                            const qText = isZh
                                                                ? `${numsZh[a]} ${op === '+' ? '加' : '減'} ${numsZh[b]} = ?`
                                                                : `${numsEn[a]} ${op === '+' ? 'plus' : 'minus'} ${numsEn[b]} = ?`;
                                                            const ans = op === '+' ? a + b : a - b;

                                                            showModal({
                                                                type: 'prompt',
                                                                title: t.show_pin,
                                                                message: `${t.verify_math}\n\n${qText}`,
                                                                onConfirm: (val) => {
                                                                    if (parseInt(val) === ans) {
                                                                        setIsPinVisible(true);
                                                                    } else {
                                                                        alert(t.math_error);
                                                                    }
                                                                }
                                                            });
                                                        }
                                                    }}
                                                    className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${family?.theme !== 'neon' ? 'hover:bg-gray-100 text-gray-400' : 'hover:bg-white/10 text-slate-500'}`}
                                                >
                                                    {isPinVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5 opacity-70" />}
                                                </button>
                                            </div>
                                            <div className={`text-xs text-center ${family?.theme !== 'neon' ? 'text-[#888]' : 'text-slate-500'}`}>{t.parent_pin_sub}</div>
                                        </div>

                                        {/* Row 2: Enable Toggle */}
                                        <div className="space-y-2">
                                            <div className={`flex items-center justify-between p-4 ${family?.theme === 'jar' ? 'bg-purple-900/20 border-purple-500/30' : ((family?.theme !== 'neon' && family?.theme !== 'jar') ? 'bg-white border-[#eee]' : 'bg-black/40 border-white/5')} rounded-2xl border`}>
                                                <div className={`font-bold ${family?.theme === 'jar' ? 'text-white' : (family?.theme !== 'neon' ? 'text-[#4a4a4a]' : 'text-white')}`}>{t.enable_parent_pin}</div>
                                                <button
                                                    onClick={() => setTempSettings({ ...tempSettings, use_parent_pin: !tempSettings.use_parent_pin })}
                                                    className={`w-16 h-8 rounded-full transition-all relative flex items-center shadow-inner shrink-0 ${tempSettings.use_parent_pin
                                                        ? (family?.theme === 'jar' ? 'bg-purple-500' : (family?.theme !== 'neon' ? 'bg-orange-400' : 'bg-cyan-500'))
                                                        : (family?.theme === 'jar' ? 'bg-purple-900/40' : (family?.theme !== 'neon' ? 'bg-[#eee]' : 'bg-white/10'))
                                                        }`}
                                                >
                                                    <div className={`text-[10px] font-black absolute transition-all duration-300 ${tempSettings.use_parent_pin ? 'left-2 text-white' : 'right-2 text-slate-400'}`}>
                                                        {tempSettings.use_parent_pin ? 'ON' : 'OFF'}
                                                    </div>
                                                    <div className={`w-6 h-6 bg-white rounded-full transition-all shadow-md z-10 transform ${tempSettings.use_parent_pin ? 'translate-x-9' : 'translate-x-1'}`} />
                                                </button>
                                            </div>
                                            <div className={`text-xs text-center ${family?.theme !== 'neon' ? 'text-[#888]' : 'text-slate-500'}`}>{t.enable_pin_sub}</div>
                                        </div>
                                    </div>


                                    {/* UI Style */}
                                    <div className="space-y-4">
                                        <h4 className={`text-sm font-black ${family?.theme !== 'neon' ? 'text-[#ff8a80]' : 'text-cyan-500'} uppercase tracking-[0.2em]`}>{t.ui_style_selection}</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button onClick={() => setTempSettings({ ...tempSettings, theme: 'jar' })} className={`col-span-2 h-full min-h-[100px] p-4 rounded-xl border-2 transition-all text-center flex flex-row items-center justify-center gap-4 bg-[#fff9c4] border-[#ffd54f] text-[#f57f17] hover:scale-[1.02] active:scale-95 ${tempSettings.theme === 'jar' ? 'ring-2 ring-[#fbc02d] ring-offset-2' : 'opacity-60 hover:opacity-100'}`}>
                                                <div className="w-10 h-10 rounded-full border-2 border-[#fbc02d] flex items-center justify-center bg-white text-[#fbc02d]">
                                                    <Star className="w-5 h-5 fill-current" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-sm font-black mb-0.5">Star Jar</div>
                                                    <div className="text-[10px] uppercase tracking-widest opacity-80">Interactive Hero</div>
                                                </div>
                                            </button>
                                            <button onClick={() => setTempSettings({ ...tempSettings, theme: 'neon' })} className={`h-full min-h-[120px] p-4 rounded-2xl border-2 transition-all text-center flex flex-col items-center justify-center bg-[#0a0a0a] border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95 ${tempSettings.theme === 'neon' ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : 'opacity-60 hover:opacity-100'}`}>
                                                <div className="w-12 h-12 rounded-full border-2 border-cyan-500 flex items-center justify-center mb-2 bg-black shadow-[0_0_10px_#06b6d4]">
                                                    <Zap className="w-6 h-6" />
                                                </div>
                                                <div className="text-sm font-bold mb-1">Cyber Neon</div>
                                                <div className="text-[10px] uppercase tracking-widest opacity-80">{t.ui_style_cyber}</div>
                                            </button>
                                            <button onClick={() => setTempSettings({ ...tempSettings, theme: 'doodle' })} className={`h-full min-h-[120px] p-4 rounded-2xl border-2 transition-all text-center flex flex-col items-center justify-center bg-[#fff8e1] border-[#ff8a80] text-[#4a4a4a] hover:scale-105 active:scale-95 ${tempSettings.theme === 'doodle' ? 'ring-2 ring-[#4a4a4a] ring-offset-2' : 'opacity-60 hover:opacity-100'}`}>
                                                <div className="w-12 h-12 rounded-full border-2 border-[#ff8a80] flex items-center justify-center mb-2 bg-white text-[#ff8a80]">
                                                    <Smile className="w-6 h-6" />
                                                </div>
                                                <div className="text-sm font-bold mb-1">Warm Doodle</div>
                                                <div className="text-[10px] uppercase tracking-widest opacity-60">{t.ui_style_doodle}</div>
                                            </button>
                                        </div>

                                        {/* Star Size Slider for Jar Theme */}
                                        {tempSettings.theme === 'jar' && (
                                            <div className="mt-4 p-4 rounded-xl bg-purple-900/10 border border-purple-500/20 animate-in slide-in-from-top-2 duration-300">
                                                <div className="flex justify-between items-center mb-2">
                                                    <label className="text-sm font-bold text-purple-300">星星尺寸 (Star Size)</label>
                                                    <span className="text-sm font-black text-[#fbbf24] bg-purple-900/40 px-3 py-1 rounded-lg border border-purple-500/30">
                                                        Lv. {tempSettings.star_size || 5}
                                                    </span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="10"
                                                    step="1"
                                                    value={tempSettings.star_size || 5}
                                                    onChange={(e) => setTempSettings({ ...tempSettings, star_size: parseInt(e.target.value) })}
                                                    className="w-full h-2 bg-purple-900/40 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                                />
                                                <div className="flex justify-between text-[10px] text-purple-300/60 font-bold mt-1 px-1">
                                                    <span>Tiny</span>
                                                    <span>Normal</span>
                                                    <span>Giant</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* 6. Install App (Mobile Only) */}
                            {isMobile && !isStandalone && (deferredPrompt || isIOS) && !dismissedInstallPrompt && (
                                <section className="relative group">
                                    <button
                                        onClick={dismissInstallPrompt}
                                        className={`absolute top-0 right-0 p-2 rounded-full z-10 opacity-50 hover:opacity-100 transition-all ${family?.theme !== 'neon' ? 'text-[#4a4a4a] hover:bg-black/5' : 'text-white hover:bg-white/10'}`}
                                        title={t.dismiss || 'Dismiss'}
                                    >
                                        <X className="w-5 h-5" />
                                    </button>

                                    <h4 className={`text-sm font-black ${family?.theme !== 'neon' ? 'text-[#ff8a80]' : 'text-cyan-500'} uppercase tracking-[0.2em] mb-4`}>{t.install_app}</h4>
                                    <div className={`p-6 rounded-2xl border-2 border-dashed flex flex-col md:flex-row items-center justify-between gap-4 ${family?.theme === 'jar' ? 'bg-purple-500/5 border-purple-500/20' : ((family?.theme !== 'neon' && family?.theme !== 'jar') ? 'bg-[#fff5e6] border-[#ff8a80]' : 'bg-cyan-500/5 border-cyan-500/20')}`}>
                                        <div className="text-center md:text-left">
                                            <h5 className={`font-black text-lg mb-1 ${family?.theme !== 'neon' ? 'text-[#4a4a4a]' : 'text-white'}`}>{t.install_app}</h5>
                                            <p className={`text-xs opacity-70 mb-0 max-w-xs ${family?.theme !== 'neon' ? 'text-[#666]' : 'text-slate-400'}`}>{t.install_app_desc}</p>
                                        </div>
                                        <button
                                            onClick={handleInstallClick}
                                            className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2 whitespace-nowrap ${family?.theme === 'jar'
                                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500'
                                                : (family?.theme !== 'neon'
                                                    ? 'bg-[#4a4a4a] text-white border-2 border-[#4a4a4a] hover:bg-[#ff8a80] hover:border-[#ff8a80]'
                                                    : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400')
                                                }`}
                                        >
                                            <Download className="w-5 h-5" />
                                            {t.add_to_home_btn}
                                        </button>
                                    </div>
                                </section>
                            )}

                            {/* 7. 資料重設與匯出 */}
                            <section className={`p-6 rounded-3xl border-2 border-dashed ${family?.theme === 'jar' ? 'border-purple-500/20 bg-purple-900/10' : ((family?.theme !== 'neon' && family?.theme !== 'jar') ? 'border-[#ff8a80]/30 bg-[#ff8a80]/5' : 'border-red-500/20 bg-red-500/5')}`}>
                                <h4 className={`text-sm font-black ${family?.theme !== 'neon' ? 'text-[#ff8a80]' : 'text-red-500'} uppercase tracking-[0.2em] mb-4 flex items-center gap-2`}><Trash2 className="w-3 h-3" /> {t.data_mgmt_export}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button onClick={exportLogsToCSV} className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between ${family?.theme === 'jar' ? 'bg-purple-900/20 border-purple-500/30 hover:bg-purple-500/20' : ((family?.theme !== 'neon' && family?.theme !== 'jar') ? 'bg-white border-[#4a4a4a] text-[#4a4a4a] hover:bg-cyan-50' : 'bg-white/5 border-white/5 hover:bg-cyan-500/20')}`}>
                                        <div className="flex justify-between items-start w-full"><div className="text-sm font-bold mb-1">{t.export_full_history}</div><Download className="w-4 h-4 text-cyan-500" /></div>
                                        <div className={`text-xs font-medium opacity-60 ${family?.theme === 'jar' ? 'text-purple-200' : (family?.theme !== 'neon' ? 'text-[#666]' : 'text-slate-400')}`}>{t.csv_desc}</div>
                                    </button>
                                    <button onClick={resetLogsOnly} className={`p-4 rounded-2xl border transition-all text-left ${family?.theme === 'jar' ? 'bg-purple-900/20 border-purple-500/30 hover:bg-purple-500/20' : ((family?.theme !== 'neon' && family?.theme !== 'jar') ? 'bg-white border-[#4a4a4a] text-[#4a4a4a] hover:bg-orange-50' : 'bg-white/5 border-white/5 hover:bg-red-500/10')}`}>
                                        <div className="text-sm font-bold mb-1">{t.clear_history_only}</div>
                                        <div className={`text-xs font-medium opacity-60 ${family?.theme === 'jar' ? 'text-purple-200' : (family?.theme !== 'neon' ? 'text-[#666]' : 'text-slate-400')}`}>{t.clear_history_desc}</div>
                                    </button>
                                    <button onClick={resetFamilyData} className={`p-4 rounded-2xl border transition-all text-left ${family?.theme === 'jar' ? 'bg-purple-900/20 border-purple-500/30 hover:bg-red-500/20' : ((family?.theme !== 'neon' && family?.theme !== 'jar') ? 'bg-white border-[#ff8a80] text-[#ff8a80] hover:bg-red-50' : 'bg-red-500/10 border-red-500/20 hover:bg-red-500/30')} md:col-span-2`}>
                                        <div className="text-sm font-bold mb-1">{t.reset_family_data}</div>
                                        <div className={`text-xs font-medium opacity-60 ${family?.theme === 'jar' ? 'text-red-300' : ((family?.theme !== 'neon' && family?.theme !== 'jar') ? 'text-[#ff8a80]' : 'text-red-400')}`}>{t.reset_family_desc}</div>
                                    </button>
                                </div>
                            </section>
                        </div>

                        <div className={`p-8 md:px-10 pt-6 border-t ${family?.theme === 'jar' ? 'border-purple-500/30 bg-[#0f172a]/90' : (family?.theme !== 'neon' ? 'border-[#4a4a4a] bg-[#fcfbf9]' : 'border-white/5 bg-black/20')} backdrop-blur-md`}>
                            <button onClick={saveSettings} className="btn btn-primary w-full gap-2 font-black !py-4 shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]"><Save className="w-5 h-5" /> {t.save_changes}</button>
                        </div>
                    </div>
                </div>
            )}

            <CustomModal config={modal} onClose={() => setModal(prev => ({ ...prev, isOpen: false }))} familyTheme={family?.theme} t={t} />

            <TourOverlay
                step={tourStep}
                onNext={() => setTourStep(prev => prev + 1)}
                onFinish={finishTour}
                t={t}
                familyTheme={family?.theme}
            />

            {showAddModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[110] p-6 animate-in fade-in duration-300">
                    <div className={`p-8 md:p-10 max-w-sm w-full border-2 ${family?.theme === 'jar' ? 'bg-[#0f172a] border-purple-500/50 shadow-[0_0_30px_rgba(139,92,246,0.3)] rounded-3xl' : (family?.theme !== 'neon' ? 'bg-white border-[#4a4a4a] shadow-[8px_8px_0px_#d8c4b6] rounded-[30px_15px_40px_10px]' : 'bg-black border-cyan-500/30 rounded-3xl')}`}>
                        <h3 className={`text-2xl font-black mb-8 italic flex items-center gap-3 uppercase tracking-tight ${family?.theme !== 'neon' ? 'text-[#4a4a4a]' : 'text-white'}`}><Plus className="text-cyan-500" /> {t.add_member}</h3>

                        <div className="flex flex-col items-center gap-6 mb-8">
                            <button
                                onClick={() => {
                                    const nextIdx = (AVATARS.indexOf(newKidAvatar) + 1) % AVATARS.length;
                                    setNewKidAvatar(AVATARS[nextIdx]);
                                }}
                                className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl border-4 transition-all hover:scale-110 active:scale-90 ${family?.theme === 'jar' ? 'bg-purple-500/10 border-purple-500/30' : (family?.theme !== 'neon' ? 'bg-[#fff5e6] border-[#4a4a4a]' : 'bg-cyan-500/10 border-cyan-500/30')}`}
                            >
                                {newKidAvatar}
                            </button>
                            <p className={`text-[10px] font-bold ${family?.theme !== 'neon' ? 'text-[#888]' : 'text-slate-500'} uppercase tracking-widest`}>{t.click_to_change_avatar}</p>

                            <input
                                autoFocus
                                type="text"
                                placeholder={t.enter_kid_name}
                                className={`w-full border rounded-2xl p-4 font-black text-center outline-none transition-all ${family?.theme === 'jar' ? 'bg-purple-900/20 border-purple-500/30 text-white focus:ring-purple-500' : (family?.theme !== 'neon' ? 'bg-[#fcfbf9] border-[#4a4a4a] text-[#4a4a4a] focus:ring-2 focus:ring-[#ff8a80]' : 'bg-black/40 border border-white/10 text-white focus:ring-2 focus:ring-cyan-500')}`}
                                value={newKidName}
                                onChange={e => setNewKidName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addKid()}
                            />
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setShowAddModal(false)} className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all ${family?.theme !== 'neon' ? 'text-[#888] hover:text-[#4a4a4a]' : 'text-slate-500 hover:text-white'}`}>{t.cancel}</button>
                            <button onClick={addKid} className="btn btn-primary flex-1 font-black shadow-xl">{t.join_member} 🚀</button>
                        </div>
                    </div>
                </div>
            )}

            {showOnboarding && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[120] p-6 animate-in fade-in duration-500">
                    <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Option 1: Create New */}
                        <div className={`p-8 rounded-3xl border-2 flex flex-col gap-6 group hover:scale-[1.02] transition-all cursor-default ${family?.theme !== 'neon' ? 'bg-white border-[#4a4a4a] shadow-[8px_8px_0px_#d8c4b6]' : 'bg-black/40 border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-500'}`}>
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-2 ${family?.theme !== 'neon' ? 'bg-[#fff5e6]' : 'bg-cyan-500/20 text-cyan-400'}`}>🏠</div>
                            <div>
                                <h3 className={`text-2xl font-black mb-2 ${family?.theme !== 'neon' ? 'text-[#4a4a4a]' : 'text-white'}`}>{t.onboarding_create_title}</h3>
                                <p className={`text-sm ${family?.theme !== 'neon' ? 'text-[#888]' : 'text-slate-400'}`}>{t.onboarding_create_desc}</p>
                            </div>
                            <input
                                type="text"
                                placeholder={t.onboarding_family_name_placeholder}
                                className={`w-full p-4 rounded-xl font-bold outline-none transition-all ${family?.theme !== 'neon' ? 'bg-[#f5f5f5] text-[#4a4a4a] border border-[#eee] focus:border-[#4a4a4a]' : 'bg-black/50 text-white border border-white/10 focus:border-cyan-500'}`}
                                value={newFamilyName}
                                onChange={e => setNewFamilyName(e.target.value)}
                            />
                            <button onClick={handleCreateFamily} className="btn btn-primary w-full py-4 text-sm font-black uppercase tracking-widest mt-auto">{t.onboarding_create_btn}</button>
                        </div>

                        {/* Option 2: Join Existing */}
                        <div className={`p-8 rounded-3xl border-2 flex flex-col gap-6 group hover:scale-[1.02] transition-all cursor-default ${family?.theme !== 'neon' ? 'bg-white border-[#4a4a4a] shadow-[8px_8px_0px_#d8c4b6]' : 'bg-black/40 border-purple-500/30 hover:bg-purple-500/10 hover:border-purple-500'}`}>
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-2 ${family?.theme !== 'neon' ? 'bg-[#f3e5f5]' : 'bg-purple-500/20 text-purple-400'}`}>🔗</div>
                            <div>
                                <h3 className={`text-2xl font-black mb-2 ${family?.theme !== 'neon' ? 'text-[#4a4a4a]' : 'text-white'}`}>{t.onboarding_join_title}</h3>
                                <p className={`text-sm ${family?.theme !== 'neon' ? 'text-[#888]' : 'text-slate-400'}`}>{t.onboarding_join_desc}</p>
                            </div>
                            <input
                                type="text"
                                placeholder={t.onboarding_join_placeholder}
                                className={`w-full p-4 rounded-xl font-bold outline-none transition-all ${family?.theme !== 'neon' ? 'bg-[#f5f5f5] text-[#4a4a4a] border border-[#eee] focus:border-[#4a4a4a]' : 'bg-black/50 text-white border border-white/10 focus:border-purple-500'}`}
                                value={joinCode}
                                onChange={e => setJoinCode(e.target.value)}
                            />
                            <div className="relative">
                                <input
                                    type="text"
                                    maxLength={4}
                                    placeholder={t.four_digit_pin}
                                    className={`w-full p-4 rounded-xl font-bold font-mono outline-none transition-all ${family?.theme !== 'neon' ? 'bg-[#f5f5f5] text-[#4a4a4a] border border-[#eee] focus:border-[#4a4a4a]' : 'bg-black/50 text-white border border-white/10 focus:border-purple-500'}`}
                                    value={joinPin}
                                    onChange={e => setJoinPin(e.target.value.replace(/\D/g, ''))}
                                />
                                <Lock className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${family?.theme !== 'neon' ? 'text-gray-400' : 'text-gray-500'}`} />
                            </div>
                            <button onClick={() => handleJoinFamily(joinCode, joinPin)} className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest mt-auto transition-all ${family?.theme !== 'neon' ? 'bg-[#4a4a4a] text-white hover:opacity-90' : 'bg-purple-600 text-white hover:bg-purple-500'}`}>{t.onboarding_join_btn}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}



function KidCard({ kid, goal, isUpdatingGoal, onUpdateGoal, onDeleteGoal, onUpdate, onDelete, currentLimit, familySettings, actorName, hideSensitive, showModal, t }) {
    const timeLimit = currentLimit || 60;



    // Visual states to control animation timing
    const [isInView, setIsInView] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [visualPoints, setVisualPoints] = useState(kid.total_points);
    const [visualMinutes, setVisualMinutes] = useState(kid.total_minutes);
    const prevPointsRef = useRef(kid.total_points);
    const cardRef = useRef(null);

    // Track visibility
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsInView(entry.isIntersecting);
            },
            { threshold: 0.3 } // Trigger when 30% visible
        );
        if (cardRef.current) observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, []);

    // Delay ready state
    useEffect(() => {
        if (isInView) {
            const timer = setTimeout(() => setIsReady(true), 500);
            return () => clearTimeout(timer);
        } else {
            setIsReady(false);
        }
    }, [isInView]);

    // Sync visual state when ready
    useEffect(() => {
        if (!isReady) return;

        // Check for points update
        if (visualPoints !== kid.total_points) {
            // Check if we need confetti (only on increase)
            if (kid.total_points > prevPointsRef.current) {
                const rect = cardRef.current?.getBoundingClientRect();
                const origin = rect ? {
                    x: (rect.left + rect.width / 2) / window.innerWidth,
                    y: (rect.top + rect.height / 2) / window.innerHeight
                } : { x: 0.5, y: 0.5 };

                confetti({
                    particleCount: 40,
                    spread: 80,
                    startVelocity: 40,
                    origin: origin,
                    zIndex: 1500,
                    shapes: ['star'],
                    colors: ['#FFD700', '#FFCA28', '#FFA000', '#FFF176'],
                    scalar: 1.5,
                    gravity: 0.8,
                    ticks: 120
                });
            }
            setVisualPoints(kid.total_points);
            prevPointsRef.current = kid.total_points;
        }

        // Check for minutes update
        if (visualMinutes !== kid.total_minutes) {
            setVisualMinutes(kid.total_minutes);
        }

    }, [kid.total_points, kid.total_minutes, isReady, familySettings?.theme, visualPoints, visualMinutes]);

    const timePercent = Math.min(100, (visualMinutes / timeLimit) * 100);
    const isWarning = timePercent > 0 && timePercent <= 30;
    const isDanger = timePercent <= 10;

    const theme = familySettings?.theme;

    const commonProps = {
        cardRef,
        kid,
        goal,
        visualPoints,
        visualMinutes,
        timePercent,
        isDanger,
        isWarning,
        timeLimit,
        familySettings,
        t,
        actorName,
        onUpdate,
        onUpdateGoal,
        onDeleteGoal,
        showModal,
        isUpdatingGoal
    };

    if (theme === 'jar') {
        return <JarThemeLayout {...commonProps} />;
    }
    if (theme === 'neon') {
        return <NeonThemeLayout {...commonProps} />;
    }

    // Default to DoodleThemeLayout
    return <DoodleThemeLayout {...commonProps} />;
}

// Tour Overlay Component
function TourOverlay({ step, onNext, onFinish, t, familyTheme }) {
    if (step === 0) return null;
    const isDoodle = familyTheme !== 'neon';

    return (
        <div className="fixed inset-0 z-[200] pointer-events-none">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity duration-500" />

            {/* Step 1: Welcome & Add Kids */}
            {step === 1 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md pointer-events-auto p-6 animate-in zoom-in duration-300">
                    <div className={`p-8 rounded-3xl border-2 text-center relative overflow-hidden ${isDoodle ? 'bg-white border-[#4a4a4a] shadow-[8px_8px_0px_#d8c4b6]' : 'bg-black border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.3)]'}`}>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50" />
                        <h3 className={`text-2xl font-black mb-4 uppercase italic tracking-tighter ${isDoodle ? 'text-[#4a4a4a]' : 'text-white'}`}>🎉 {t.tour_welcome}</h3>
                        <p className={`mb-8 font-bold leading-relaxed ${isDoodle ? 'text-[#666]' : 'text-slate-300'}`}>{t.tour_step1_msg}</p>
                        <div className="flex justify-center">
                            <button onClick={onNext} className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest transition-all ${isDoodle ? 'bg-[#ff8a80] text-white border-2 border-[#4a4a4a] hover:scale-105 shadow-[4px_4px_0px_#4a4a4a]' : 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]'}`}>
                                {t.tour_next}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Ratio Hint */}
            {step === 2 && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md pointer-events-auto p-6 animate-in slide-in-from-right-10 duration-300">
                    <div className={`p-8 rounded-3xl border-2 text-center relative overflow-hidden ${isDoodle ? 'bg-white border-[#4a4a4a] shadow-[8px_8px_0px_#d8c4b6]' : 'bg-black border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.2)]'}`}>
                        <h3 className={`text-xl font-black mb-4 uppercase italic ${isDoodle ? 'text-[#4a4a4a]' : 'text-white'}`}>⚙️ {t.points_time_rules}</h3>
                        <p className={`mb-8 font-bold leading-relaxed ${isDoodle ? 'text-[#666]' : 'text-slate-300'}`}>{t.tour_step3_msg}</p>
                        <button onClick={onFinish} className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all ${isDoodle ? 'bg-[#4a4a4a] text-white border-2 border-[#4a4a4a] hover:opacity-90' : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'}`}>
                            {t.tour_finish}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Custom Modal Component
function CustomModal({ config, onClose, familyTheme, t = {} }) {
    const [inputValue, setInputValue] = useState(config.value || '');
    const isDoodle = familyTheme !== 'neon' && familyTheme !== 'jar'; // Update Logic: Jar is Dark

    // Reset local value when modal opens/changes
    useEffect(() => {
        setInputValue(config.value || '');
    }, [config.isOpen, config.value]);

    if (!config.isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[200] p-6 animate-in fade-in duration-300">
            <div className={`glass-panel p-8 max-w-sm w-full border-2 shadow-2xl scale-in-center overflow-hidden relative ${familyTheme === 'jar' ? 'bg-[#0f172a] border-purple-500/50 shadow-[0_0_30px_rgba(139,92,246,0.3)]' : (isDoodle ? 'bg-white border-[#4a4a4a] shadow-[8px_8px_0px_#d8c4b6] rounded-[30px_15px_40px_10px]' : 'bg-black border-cyan-500/30')}`}>
                {!isDoodle && <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${familyTheme === 'jar' ? 'via-purple-500/50' : 'via-cyan-500/50'} to-transparent`} />}

                <h3 className={`text-xl font-black italic mb-2 uppercase tracking-tight ${isDoodle ? 'text-[#4a4a4a]' : 'text-white'}`}>{config.title}</h3>
                <p className={`text-sm font-medium mb-6 leading-relaxed whitespace-pre-line ${isDoodle ? 'text-[#666]' : 'text-slate-400'}`}>{config.message}</p>
                {config.content && <div className="mb-6 w-full">{config.content}</div>}

                {config.type === 'prompt' && (
                    <div className="relative mb-6">
                        <input
                            autoFocus
                            type="text"
                            className={`w-full border rounded-xl p-4 font-black text-center outline-none transition-all ${familyTheme === 'jar' ? 'bg-purple-900/20 border-purple-500/30 text-white focus:ring-purple-500' : (isDoodle ? 'bg-[#fcfbf9] border-[#4a4a4a] text-[#4a4a4a] focus:ring-2 focus:ring-[#ff8a80]' : 'bg-black/40 border-white/10 text-white focus:ring-2 focus:ring-cyan-500')}`}
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && config.onConfirm(inputValue)}
                        />
                        {config.unit && (
                            <span className={`absolute right-4 top-1/2 -translate-y-1/2 font-black text-sm pointer-events-none ${isDoodle ? 'text-[#ff8a80]' : 'text-cyan-400'}`}>
                                {config.unit}
                            </span>
                        )}
                    </div>
                )}

                {config.type === 'prompt' && config.mode && (
                    <div className={`mb-6 p-3 rounded-xl border text-center animate-in zoom-in duration-300 ${isDoodle ? 'bg-[#fdfbf7] border-[#eee] shadow-inner' : 'bg-white/5 border-white/5 shadow-2xl'}`}>
                        <div className={`text-xs font-black uppercase tracking-widest mb-1 ${isDoodle ? 'text-[#888]' : 'text-slate-500'}`}>{t.preview_convert || '即時換算預覽'}</div>
                        <div className={`text-sm font-black italic ${isDoodle ? 'text-[#4a4a4a]' : 'text-white'}`}>
                            {(() => {
                                const val = parseInt(inputValue) || 0;
                                const rate = config.rate || 2;
                                if (config.mode === 'minsToPts') {
                                    const earnedPts = Math.floor(val / rate);
                                    return (
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-orange-500">-{earnedPts * rate} {t.minutes_unit}</span>
                                            <span className="opacity-30">➔</span>
                                            <span className="text-green-500">+{earnedPts} {t.points_label}</span>
                                        </div>
                                    );
                                }
                                if (config.mode === 'ptsToMins') {
                                    return (
                                        <div className="flex items-center justify-center gap-2">
                                            <span className="text-red-500">-{val} {t.points_label}</span>
                                            <span className="opacity-30">➔</span>
                                            <span className={familyTheme === 'jar' ? 'text-purple-400' : 'text-cyan-500'}>+{val * rate} {t.minutes_unit}</span>
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                    </div>
                )}

                <div className="flex gap-3">
                    {(config.type === 'confirm' || config.type === 'prompt') && (
                        <button onClick={() => {
                            if (config.onCancel) config.onCancel();
                            onClose();
                        }} className={`flex-1 py-3 text-xs font-bold rounded-xl border transition-all ${isDoodle ? 'bg-white border-[#4a4a4a] text-[#4a4a4a] hover:bg-black/5' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}>{config.cancelText || t.cancel || '取消'}</button>
                    )}
                    <button onClick={() => config.onConfirm(inputValue)} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg ${familyTheme === 'jar' ? 'bg-purple-600 hover:bg-purple-500 text-white' : (isDoodle ? 'bg-[#ff8a80] text-white border-2 border-[#4a4a4a] hover:opacity-90' : 'bg-cyan-500 text-black hover:bg-cyan-400 font-black')}`}>
                        {config.confirmText || t.confirm || '確定'}
                    </button>
                </div>
            </div>
        </div>
    );
}
