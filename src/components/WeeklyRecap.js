'use client';
import { Flame, Sparkles } from 'lucide-react';

// Local calendar-day key (avoid UTC shifting days for TW evening hours)
const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

const STAT_WINDOW_DAYS = 14; // how many days of logs the dashboard fetches for stats

export default function WeeklyRecap({ kids, logs, t, theme }) {
    const isDark = theme === 'neon' || theme === 'jar';
    const isJar = theme === 'jar';

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const stats = kids.map(kid => {
        const kidLogs = logs.filter(l => l.kid_id === kid.id && l.points_change > 0);
        const earned = kidLogs
            .filter(l => new Date(l.created_at) >= sevenDaysAgo)
            .reduce((sum, l) => sum + l.points_change, 0);

        // Consecutive days (ending today or yesterday) with at least one earn
        const earnDays = new Set(kidLogs.map(l => dayKey(new Date(l.created_at))));
        let streak = 0;
        const cursor = new Date(now);
        if (!earnDays.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
        while (earnDays.has(dayKey(cursor))) {
            streak++;
            cursor.setDate(cursor.getDate() - 1);
        }
        return { kid, earned, streak };
    });

    const familyTotal = stats.reduce((sum, s) => sum + s.earned, 0);
    const hasActivity = familyTotal > 0 || stats.some(s => s.streak > 0);

    return (
        <div className={`glass-panel p-6 ${isJar ? '' : (!isDark ? 'border-[#4a4a4a]' : 'border-cyan-500/20')}`}>
            <div className={`flex items-center justify-between mb-4`}>
                <h3 className={`text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 ${isJar ? 'text-[#fbbf24]' : (!isDark ? 'text-[#ff8a80]' : 'text-cyan-400')}`}>
                    <Sparkles className="w-4 h-4" /> {t.weekly_recap}
                </h3>
                {hasActivity && (
                    <span className={`text-xs font-black px-3 py-1 rounded-full ${isJar ? 'bg-purple-500/20 text-purple-200' : (!isDark ? 'bg-[#e8f5e9] text-[#2e7d32]' : 'bg-green-500/10 text-green-400')}`}>
                        {t.weekly_family_total} +{familyTotal} {t.pt_unit}
                    </span>
                )}
            </div>

            {!hasActivity ? (
                <p className={`text-sm font-medium py-4 text-center ${!isDark ? 'text-[#aaa]' : 'text-slate-500'}`}>
                    {t.no_weekly_data}
                </p>
            ) : (
                <div className="space-y-2">
                    {stats.map(({ kid, earned, streak }) => (
                        <div key={kid.id} className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${isJar ? 'bg-purple-900/20 border-purple-500/30' : (!isDark ? 'bg-white border-[#eee]' : 'bg-white/[0.03] border-white/5')}`}>
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="text-xl shrink-0">{kid.avatar || '👶'}</span>
                                <span className={`font-bold truncate ${!isDark ? 'text-[#4a4a4a]' : 'text-white'}`}>{kid.name}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {streak >= 2 && (
                                    <span className={`text-xs font-black px-2 py-1 rounded-lg flex items-center gap-1 ${isJar ? 'bg-amber-500/20 text-amber-300' : (!isDark ? 'bg-[#fff3e0] text-[#ef6c00]' : 'bg-orange-500/10 text-orange-400')}`} title={`${streak} ${t.streak_suffix}`}>
                                        <Flame className="w-3.5 h-3.5" />
                                        {streak >= STAT_WINDOW_DAYS ? `${STAT_WINDOW_DAYS}+` : streak} {t.streak_suffix}
                                    </span>
                                )}
                                <span className={`text-sm font-black px-2.5 py-1 rounded-lg ${earned > 0 ? (isJar ? 'bg-purple-500/20 text-purple-200' : (!isDark ? 'bg-[#e8f5e9] text-[#2e7d32]' : 'bg-green-500/10 text-green-400')) : (!isDark ? 'bg-[#f5f5f5] text-[#aaa]' : 'bg-white/5 text-slate-500')}`}>
                                    +{earned} {t.pt_unit}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
