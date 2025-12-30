'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { History, ArrowLeft, Search, Calendar, User, Clock, Trash2 } from 'lucide-react';
import { dictionaries } from '@/lib/dictionaries';

export default function LogsPage() {
    const router = useRouter();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [family, setFamily] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterKid, setFilterKid] = useState('all');
    const [kids, setKids] = useState([]);
    const [language, setLanguage] = useState('zh');

    // Default to last 7 days
    const [startDate, setStartDate] = useState(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const t = dictionaries[language] || dictionaries['zh'];

    useEffect(() => {
        const savedLang = localStorage.getItem('app_language') || 'zh';
        setLanguage(savedLang);
        fetchLogs();
    }, [startDate, endDate]);

    const fetchLogs = async () => {
        if (!supabase) return;
        setLoading(true);
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            let familyId = null;

            if (authUser) {
                const { data: profile } = await supabase.from('profiles').select('family_id').eq('id', authUser.id).single();
                familyId = profile?.family_id;
            } else {
                const kidSession = localStorage.getItem('kid_session');
                if (kidSession) {
                    familyId = JSON.parse(kidSession).family_id;
                } else {
                    router.push('/');
                    return;
                }
            }

            if (!familyId) return;

            // Get Family Theme
            const { data: familyData } = await supabase.from('families').select('*').eq('id', familyId).single();
            setFamily(familyData || { theme: 'cyber' });
            document.body.className = familyData?.theme === 'doodle' ? 'theme-doodle' : '';

            // Get Kids for filter
            const { data: kidsData } = await supabase.from('kids').select('*').eq('family_id', familyId);
            setKids(kidsData || []);

            // Get Logs with Date Range
            let query = supabase
                .from('logs')
                .select(`*, kids!inner(name, family_id)`)
                .eq('kids.family_id', familyId)
                .order('created_at', { ascending: false });

            if (startDate) query = query.gte('created_at', `${startDate}T00:00:00`);
            if (endDate) query = query.lte('created_at', `${endDate}T23:59:59`);

            const { data: logsData, error: lError } = await query;

            if (lError) throw lError;
            setLogs(logsData || []);
        } catch (e) {
            console.error('Error fetching logs:', e);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            (log.reason || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.kids?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (log.actor_name || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesKid = filterKid === 'all' || log.kids?.name === filterKid;
        return matchesSearch && matchesKid;
    });

    if (loading) return (
        <div className={`min-h-screen flex items-center justify-center font-bold animate-pulse ${family?.theme === 'doodle' ? 'text-[#ff8a80]' : 'text-cyan-400'}`}>{t.loading}</div>
    );

    const theme = family?.theme || 'cyber';

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto space-y-8 pb-20">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4 glass-panel p-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/dashboard')} className={`p-2 rounded-xl transition-all ${theme === 'doodle' ? 'hover:bg-black/5 text-[#4a4a4a]' : 'hover:bg-white/10 text-slate-400'}`}>
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-3">
                        <History className={`${theme === 'doodle' ? 'text-pink-500' : 'text-pink-500'} w-8 h-8`} />
                        <h1 className={`text-2xl font-black italic uppercase ${theme === 'doodle' ? 'text-[#4a4a4a]' : 'text-white'}`}>{t.full_logs_title}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'doodle' ? 'text-[#888]' : 'text-slate-500'}`}>
                        {t.total_records_prefix}{filteredLogs.length}{t.total_records_suffix}
                    </span>
                </div>
            </header>

            <section className={`glass-panel p-6 ${theme === 'doodle' ? 'border-[#4a4a4a]' : 'border-white/5'} space-y-4`}>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="relative md:col-span-4">
                        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${theme === 'doodle' ? 'text-[#aaa]' : 'text-slate-500'}`} />
                        <input
                            type="text"
                            placeholder={t.search_placeholder_logs}
                            className={`w-full pl-12 pr-4 py-3 rounded-2xl border transition-all outline-none ${theme === 'doodle' ? 'bg-white border-[#4a4a4a] text-[#4a4a4a]' : 'bg-black/40 border-white/10 text-white focus:ring-cyan-500'}`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-3">
                        <select
                            className={`w-full px-4 py-3 rounded-2xl border transition-all outline-none ${theme === 'doodle' ? 'bg-white border-[#4a4a4a] text-[#4a4a4a]' : 'bg-black/40 border-white/10 text-white'}`}
                            value={filterKid}
                            onChange={(e) => setFilterKid(e.target.value)}
                        >
                            <option value="all">{t.all_members}</option>
                            {kids.map(k => <option key={k.id} value={k.name}>{k.name}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-5 flex items-center gap-2">
                        <input
                            type="date"
                            className={`w-full px-4 py-3 rounded-2xl border transition-all outline-none ${theme === 'doodle' ? 'bg-white border-[#4a4a4a] text-[#4a4a4a]' : 'bg-black/40 border-white/10 text-white'}`}
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                        <span className={theme === 'doodle' ? 'text-[#4a4a4a]' : 'text-slate-500'}>-</span>
                        <input
                            type="date"
                            className={`w-full px-4 py-3 rounded-2xl border transition-all outline-none ${theme === 'doodle' ? 'bg-white border-[#4a4a4a] text-[#4a4a4a]' : 'bg-black/40 border-white/10 text-white'}`}
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            <div className={`glass-panel p-2 md:p-6 ${theme === 'doodle' ? 'border-[#4a4a4a]' : 'border-white/5'} overflow-hidden`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className={`border-b ${theme === 'doodle' ? 'border-[#eee]' : 'border-white/10'}`}>
                                <th className={`p-4 text-[10px] font-black uppercase tracking-widest ${theme === 'doodle' ? 'text-[#888]' : 'text-slate-500'}`}>{t.col_time}</th>
                                <th className={`p-4 text-[10px] font-black uppercase tracking-widest ${theme === 'doodle' ? 'text-[#888]' : 'text-slate-500'}`}>{t.col_target}</th>
                                <th className={`p-4 text-[10px] font-black uppercase tracking-widest ${theme === 'doodle' ? 'text-[#888]' : 'text-slate-500'}`}>{t.col_reason}</th>
                                <th className={`p-4 text-[10px] font-black uppercase tracking-widest ${theme === 'doodle' ? 'text-[#888]' : 'text-slate-500'}`}>{t.col_change}</th>
                                <th className={`p-4 text-[10px] font-black uppercase tracking-widest ${theme === 'doodle' ? 'text-[#888]' : 'text-slate-500'}`}>{t.col_operator}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map(log => (
                                <tr key={log.id} className={`border-b group hover:bg-white/[0.02] ${theme === 'doodle' ? 'border-[#f9f9f9]' : 'border-white/[0.05]'}`}>
                                    <td className="p-4">
                                        <div className={`text-xs font-mono ${theme === 'doodle' ? 'text-[#888]' : 'text-slate-500'}`}>
                                            {new Date(log.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'zh-TW')}<br />
                                            {new Date(log.created_at).toLocaleTimeString(language === 'en' ? 'en-US' : 'zh-TW')}
                                        </div>
                                    </td>
                                    <td className={`p-4 font-bold ${theme === 'doodle' ? 'text-[#4a4a4a]' : 'text-cyan-400'}`}>{log.kids?.name}</td>
                                    <td className={`p-4 text-sm ${theme === 'doodle' ? 'text-[#555]' : 'text-slate-300'}`}>{log.reason || t.default_reason}</td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            {log.points_change !== 0 && (
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded w-fit ${log.points_change > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                    {log.points_change > 0 ? '+' : ''}{log.points_change} {t.pt_unit}
                                                </span>
                                            )}
                                            {log.minutes_change !== 0 && (
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded w-fit ${log.minutes_change > 0 ? (theme === 'doodle' ? 'bg-[#ff8a80]/10 text-[#ff8a80]' : 'bg-cyan-500/10 text-cyan-400') : 'bg-orange-500/10 text-orange-400'}`}>
                                                    {log.minutes_change > 0 ? '+' : ''}{log.minutes_change} {t.min_unit_short}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className={`p-4 text-xs flex items-center gap-1 ${theme === 'doodle' ? 'text-[#888]' : 'text-slate-500'}`}>
                                        <User className="w-3 h-3" /> {log.actor_name || t.default_actor}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredLogs.length === 0 && (
                    <div className={`text-center py-20 ${theme === 'doodle' ? 'text-[#aaa]' : 'text-slate-600'}`}>
                        {t.no_logs_found}
                    </div>
                )}
            </div>
        </div>
    );
}
