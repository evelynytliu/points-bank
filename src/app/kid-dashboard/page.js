'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogOut, Star, Clock, Trophy, ChevronRight, Sparkles, Minus, Plus, MessageSquare } from 'lucide-react';

export default function KidDashboard() {
    const router = useRouter();
    const [kid, setKid] = useState(null);
    const [kidData, setKidData] = useState(null);
    const [family, setFamily] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async (id, familyId) => {
        const { data: k } = await supabase.from('kids').select('*').eq('id', id).single();
        const { data: f } = await supabase.from('families').select('*').eq('id', familyId).single();
        if (k) setKidData(k);
        if (f) setFamily(f);
        setLoading(false);
    };

    useEffect(() => {
        const session = localStorage.getItem('kid_session');
        if (!session) {
            router.push('/');
            return;
        }
        const parsed = JSON.parse(session);
        setKid(parsed);

        fetchData(parsed.id, parsed.family_id);

        const channel = supabase
            .channel('schema-kid-changes')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'kids', filter: `id=eq.${parsed.id}` },
                (payload) => setKidData(payload.new)
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'families', filter: `id=eq.${parsed.family_id}` },
                (payload) => setFamily(payload.new)
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const updateSelf = async (pChange, mChange, defReason) => {
        const reason = prompt('請輸入原因（選填）:', defReason);

        const { error } = await supabase.from('kids').update({
            total_points: Math.max(0, kidData.total_points + pChange),
            total_minutes: Math.max(0, kidData.total_minutes + mChange)
        }).eq('id', kidData.id);

        if (error) {
            alert('更新失敗: ' + error.message);
            return;
        }

        await supabase.from('logs').insert({
            kid_id: kidData.id,
            parent_id: kidData.parent_id,
            points_change: pChange,
            minutes_change: mChange,
            reason: reason || defReason,
            actor_name: kidData.name // 紀錄是由小孩自己執行的
        });

        fetchData(kidData.id, kidData.family_id);
    };

    const handleLogout = () => {
        localStorage.removeItem('kid_session');
        router.push('/');
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-cyan-400 font-black italic tracking-widest uppercase animate-pulse">系統連線中...</div>;

    const pointToMinutes = family?.point_to_minutes || 2;
    const pointToCash = family?.point_to_cash || 5;
    const timeLimit = family?.weekday_limit || 60;
    const timePercent = Math.min(100, (kidData?.total_minutes / timeLimit) * 100);

    const isWarning = timePercent > 0 && timePercent <= 30;
    const isDanger = timePercent <= 10;

    return (
        <div className="min-h-screen bg-[#050508] p-4 md:p-8 flex flex-col items-center">
            <div className="w-full max-w-2xl flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-black italic">{kidData?.name?.[0]}</div>
                    <h1 className="text-xl font-black text-white italic tracking-tighter uppercase">{kidData?.name} 的個人基地</h1>
                </div>
                <button onClick={handleLogout} className="p-2.5 bg-white/5 rounded-xl border border-white/5 text-slate-500 hover:text-red-400 transition cursor-pointer"><LogOut className="w-5 h-5" /></button>
            </div>

            <div className="w-full max-w-2xl space-y-6">

                {/* POINT SCORE */}
                <div className="glass-panel p-10 text-center relative overflow-hidden bg-gradient-to-br from-white/[0.05] to-transparent">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Trophy className="w-32 h-32 text-yellow-500" /></div>
                    <div className="text-sm font-black text-cyan-400 uppercase tracking-widest mb-4 flex items-center justify-center gap-2 font-black italic"><Sparkles className="w-4 h-4" /> 當前累積點數</div>
                    <div className="text-8xl font-black text-white italic drop-shadow-[0_0_30px_rgba(0,229,255,0.4)] mb-4">{kidData?.total_points}</div>

                    <div className="flex justify-center gap-8 mt-6 pt-6 border-t border-white/5">
                        <div className="text-center">
                            <div className="text-3xl font-black text-green-400 italic">${kidData?.total_points * pointToCash}</div>
                            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest font-black">獎金價值</div>
                        </div>
                        <div className="w-px bg-white/10 h-10 self-center"></div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-cyan-400 italic">{kidData?.total_points * pointToMinutes}m</div>
                            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest font-black">兌換潛力</div>
                        </div>
                    </div>

                    {/* Kid Actions: Minus Only */}
                    <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                        <button
                            onClick={() => {
                                const amt = prompt('要消耗多少點數？');
                                if (amt && parseInt(amt) <= kidData.total_points) updateSelf(-parseInt(amt), 0, '小孩自行消耗點數');
                            }}
                            className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 p-4 rounded-2xl text-red-400 transition-all group"
                        >
                            <Star className="w-4 h-4 group-hover:scale-110 transition" />
                            <span className="text-xs font-black uppercase tracking-widest">消耗點數</span>
                        </button>
                        <button
                            onClick={() => {
                                const amt = prompt('兌換規則：1 點數 = ' + pointToMinutes + ' 分鐘。要使用多少點數？');
                                if (amt && parseInt(amt) <= kidData.total_points) updateSelf(-parseInt(amt), parseInt(amt) * pointToMinutes, '小孩自行兌換時間');
                            }}
                            className="flex items-center justify-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 p-4 rounded-2xl text-cyan-400 transition-all group shadow-lg shadow-cyan-500/5"
                        >
                            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition" />
                            <span className="text-xs font-black uppercase tracking-widest">點數換時間</span>
                        </button>
                    </div>
                </div>

                {/* SCREEN TIME MONITOR */}
                <div className="glass-panel p-8">
                    <div className="flex justify-between items-end mb-4 px-1">
                        <div className="flex items-center gap-2 text-white font-black italic text-sm uppercase"><Clock className="w-5 h-5 text-cyan-400" /> 剩餘螢幕時間紀錄</div>
                        <div className="text-right font-black"><span className="text-3xl text-white italic">{kidData?.total_minutes}</span> <span className="text-slate-500 text-sm italic ml-1">MIN</span></div>
                    </div>
                    <div className="bar-wrap !h-12 border-white/10">
                        <div
                            className={`bar-fill transition-all duration-1000 ${isDanger ? 'danger' : isWarning ? 'warning' : ''}`}
                            style={{ width: `${timePercent}%` }}
                        />
                    </div>

                    {/* Kid Actions: Minute Minus Only */}
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={() => {
                                const amt = prompt('要扣除多少分鐘？');
                                if (amt) updateSelf(0, -parseInt(amt), '小孩自律扣除時間');
                            }}
                            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-3 rounded-2xl text-slate-400 text-xs font-black uppercase tracking-widest transition-all"
                        >
                            <Minus className="w-4 h-4" /> 消耗螢幕時間 (看完了)
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 uppercase font-black italic">
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 group hover:bg-white/10 transition">
                        <div className="text-[10px] text-slate-500 mb-2 tracking-widest">如何獲得點數？</div>
                        <div className="text-white text-xs flex items-center justify-between">達成家長指定的任務與挑戰 <ChevronRight className="w-4 h-4 text-slate-600" /></div>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5 group hover:bg-white/10 transition">
                        <div className="text-[10px] text-slate-500 mb-2 tracking-widest">系統小提醒</div>
                        <div className="text-white text-xs flex items-center justify-between">自律使用時間，點數價值更高喔！ <ChevronRight className="w-4 h-4 text-slate-600" /></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
