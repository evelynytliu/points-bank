import React, { useState } from 'react';
import { Monitor, Star, Clock, Coins, PlusCircle, ArrowRight } from 'lucide-react'; // ArrowRight replacing '->' text with icon if available or just text

import WishGoalModal from '../WishGoalModal';
import AnimatedCounter from '../AnimatedCounter';

export default function NeonThemeLayout({
    cardRef,
    kid,
    goal,
    visualPoints,
    visualMinutes,
    visualBonusMinutes, // New
    timePercent,
    bonusTimePercent, // New
    isDanger,
    isWarning,
    timeLimit,
    bonusTimeLimit, // New
    familySettings,
    t,
    actorName,
    onUpdate,
    onUpdateGoal,
    onDeleteGoal,
    showModal,
    isUpdatingGoal
}) {
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [timeType, setTimeType] = useState(null); // null (Both) | 'general' | 'bonus'

    // Reset timeType if bonus is disabled
    React.useEffect(() => {
        if (!familySettings?.bonus_enabled) {
            setTimeType('general');
        }
    }, [familySettings?.bonus_enabled]);

    // Neon Style Constants
    const theme = 'neon';

    // Ensure robust calculations locally if props fail
    const safeTimePercent = timePercent || Math.max(0, Math.min(100, (visualMinutes / (timeLimit || 1)) * 100));
    const safeBonusPercent = bonusTimePercent || Math.max(0, Math.min(100, (visualBonusMinutes / (bonusTimeLimit || 1)) * 100));

    return (
        <div
            ref={cardRef}
            onClick={() => setTimeType(null)}
            className="p-8 group relative overflow-hidden transition-all duration-500 glass-panel border-cyan-500/30 shadow-[0_0_40px_rgba(34,211,238,0.15)] ring-1 ring-cyan-400/20 rounded-[30px]"
        >
            <div className="flex flex-col md:flex-row justify-between items-center md:items-center gap-6 mb-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl bg-cyan-500/10 shadow-[0_0_20px_rgba(0,229,255,0.15)]">
                            {kid.avatar || '👶'}
                        </div>
                        <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">{kid.name}</h3>
                    </div>
                </div>
                <div className="w-full relative flex items-center gap-6 py-2">

                    {/* Left Column: Big Points Number (Neon Style) */}
                    <div className="flex-1 flex flex-col justify-center items-center py-2 relative">
                        <div className="text-cyan-400 font-bold text-sm tracking-[0.2em] mb-2 uppercase drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">
                            {t.current_points || '目前點數'}
                        </div>
                        <div className="text-7xl font-black text-white italic tracking-tighter drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]" style={{ WebkitTextStroke: '2px rgba(34,211,238,0.3)' }}>
                            <AnimatedCounter value={visualPoints} />
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-16 w-0 border-l-2 border-dashed self-center mx-2 border-white/10"></div>

                    {/* Right Column: Info Stack (Goal, Time, Value) */}
                    <div className="flex-1 flex flex-col justify-center items-start gap-3 pr-2">

                        {/* 1. Goal Progress Section */}
                        <div
                            onClick={() => setShowGoalModal(true)}
                            className="w-full cursor-pointer group/goal"
                        >
                            {isUpdatingGoal ? (
                                <div className="space-y-1 animate-pulse opacity-60">
                                    <div className="h-5 bg-white/10 rounded w-24"></div>
                                    <div className="h-2 bg-white/10 rounded-full w-full"></div>
                                </div>
                            ) : goal ? (
                                <div className="space-y-1 relative">
                                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-cyan-400">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                                            {t.current_goal}
                                        </div>
                                        <span className="text-white">{Math.floor((visualPoints / (goal.target_points || 1)) * 100)}%</span>
                                    </div>
                                    <div className="flex items-end gap-3 transition-opacity">
                                        <div className="text-sm font-black text-white truncate max-w-[120px]">{goal.title}</div>
                                    </div>
                                    <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/10">
                                        <div
                                            className="bg-cyan-400 h-full rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] relative"
                                            style={{ width: `${Math.min(100, Math.max(0, (visualPoints / (goal.target_points || 1)) * 100))}%` }}
                                        >
                                            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]"></div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="border border-dashed border-white/10 rounded-xl p-3 flex flex-col items-center justify-center gap-1 group-hover/goal:border-cyan-500/50 group-hover/goal:bg-cyan-500/5 transition-all">
                                    <PlusCircle className="w-5 h-5 text-slate-500 group-hover/goal:text-cyan-400" />
                                    <div className="text-[10px] font-bold text-slate-500 group-hover/goal:text-cyan-400 uppercase tracking-widest">{t.set_goal}</div>
                                </div>
                            )}
                        </div>

                        {/* 2. Minutes Available (Potential from Points) */}
                        <div className="flex items-center gap-3 w-full">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                                <Clock className="w-4 h-4 text-slate-400" />
                            </div>
                            <div className="flex-1">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider leading-none mb-0.5">{t.can_exchange || '可兌換'}</div>
                                <div className="text-xl font-black text-white leading-none flex gap-3 items-baseline">
                                    <span>
                                        <AnimatedCounter value={Math.floor(visualPoints * (familySettings?.point_to_minutes || 2))} />
                                        <span className="text-[10px] text-slate-500 ml-1">{t.minutes_unit}</span>
                                    </span>
                                    {familySettings?.bonus_enabled && (
                                        <span className="text-amber-400 border-l border-white/10 pl-3">
                                            <AnimatedCounter value={Math.floor(visualPoints * (familySettings?.bonus_point_to_minutes || 10))} />
                                            <span className="text-[10px] text-amber-400/60 font-medium ml-1">精選</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 3. Cash Value */}
                        <div className="flex items-center gap-3 w-full">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                                <Coins className="w-4 h-4 text-slate-400" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider leading-none mb-0.5">{t.cash_unit || '元'}</div>
                                <div className="text-xl font-black text-emerald-400 leading-none">
                                    $<AnimatedCounter value={(visualPoints * (familySettings?.point_to_cash || 5))} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bars & Mode Switcher */}
            <div className="space-y-4 mb-6">
                {/* Bonus Time (Focus Mode) - Only if enabled - MOVED TO TOP */}
                {familySettings?.bonus_enabled && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setTimeType(prev => prev === 'bonus' ? null : 'bonus');
                        }}
                        className={`relative w-full h-10 rounded-full overflow-hidden flex items-center transition-all duration-300 group ${(timeType === 'bonus' || timeType === null) ? 'bg-black/60 shadow-[0_0_20px_rgba(245,158,11,0.3)] border border-amber-500/50 scale-100 z-10' : 'bg-amber-900/10 border border-amber-500/20 scale-[0.98] opacity-70 hover:opacity-90'}`}
                    >
                        <div
                            className="absolute top-0 left-0 h-full shadow-[0_0_30px_rgba(245,158,11,0.6)] transition-all duration-1000 z-0"
                            style={{ width: `${safeBonusPercent}%`, backgroundColor: '#f59e0b' }}
                        />

                        {/* Label */}
                        <div className={`relative z-10 pl-4 pr-2 font-black text-[10px] md:text-xs uppercase tracking-widest transition-colors whitespace-nowrap ${(timeType === 'bonus' || timeType === null) ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,1)]' : 'text-amber-500/60'}`}>
                            {t.focus_mode || '精選'}
                        </div>

                        <div className={`relative z-10 flex-1 flex items-center justify-end md:justify-center pr-4 gap-2 font-black text-xs uppercase tracking-widest transition-colors ${(timeType === 'bonus' || timeType === null) ? 'text-amber-300 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]' : 'text-amber-600'}`}>
                            <Star className={`w-3 h-3 ${(timeType === 'bonus' || timeType === null) ? 'text-amber-300' : 'text-amber-700'}`} />
                            <span>{visualBonusMinutes} {t.minutes_unit} <span className="opacity-50">/ {bonusTimeLimit}</span></span>
                        </div>
                    </button>
                )}

                {/* General Time - MOVED TO BOTTOM */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (familySettings?.bonus_enabled) {
                            setTimeType(prev => prev === 'general' ? null : 'general');
                        }
                    }}
                    className={`relative w-full h-10 rounded-full overflow-hidden flex items-center transition-all duration-300 group ${(timeType === 'general' || timeType === null) ? 'bg-black/60 shadow-[0_0_20px_rgba(6,182,212,0.3)] border border-cyan-500/50 scale-100 z-10' : 'bg-cyan-900/10 border border-cyan-500/20 scale-[0.98] opacity-70 hover:opacity-90'}`}
                >
                    <div
                        className="absolute top-0 left-0 h-full shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all duration-1000 z-0"
                        style={{ width: `${safeTimePercent}%`, backgroundColor: '#06b6d4' }}
                    />

                    {/* Label */}
                    {familySettings?.bonus_enabled && (
                        <div className={`relative z-10 pl-4 pr-2 font-black text-[10px] md:text-xs uppercase tracking-widest transition-colors whitespace-nowrap ${(timeType === 'general' || timeType === null) ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,1)]' : 'text-cyan-500/60'}`}>
                            {t.play_mode || '一般'}
                        </div>
                    )}

                    <div className={`relative z-10 flex-1 flex items-center ${familySettings?.bonus_enabled ? 'justify-end md:justify-center' : 'justify-center'} pr-4 gap-2 font-black text-xs uppercase tracking-widest transition-colors ${(timeType === 'general' || timeType === null) ? 'text-cyan-300 drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]' : 'text-cyan-600'}`}>
                        <Monitor className={`w-3 h-3 ${(timeType === 'general' || timeType === null) ? 'text-cyan-300' : 'text-cyan-700'}`} />
                        <span>{visualMinutes} {t.minutes_unit} <span className="opacity-50">/ {timeLimit}</span></span>
                    </div>
                </button>
            </div>

            {/* Toggle Buttons Removed - Integrated into Progress Bars */}

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-4 gap-2 mb-2">
                {[10, 20, 30, 60].map(mins => (
                    <button
                        key={mins}
                        onClick={(e) => {
                            e.stopPropagation();
                            const effectiveType = timeType || 'general';
                            const typeLabel = (effectiveType === 'bonus') ? ` (${t.focus_label || '精選'})` : (timeType === 'general' ? ` (${t.play_label || '一般'})` : '');

                            showModal({
                                type: 'confirm',
                                title: (t.quick_deduct || '快速扣除') + typeLabel,
                                message: `${t.confirm_deduct || '確定要扣除'} ${mins} ${t.minutes_unit}?`,
                                onConfirm: () => {
                                    if (effectiveType === 'general') {
                                        onUpdate(kid, 0, -mins, 0, t.quick_deduct || '快速扣除', actorName);
                                    } else {
                                        onUpdate(kid, 0, 0, -mins, t.quick_deduct + ' (精選)', actorName);
                                    }
                                }
                            });
                        }}
                        className={`border-2 border-b-4 p-2 rounded-xl text-sm font-black transition-all flex flex-col items-center justify-center gap-1 group/btn ${(timeType === 'general' || timeType === null) ? 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white' : 'bg-amber-900/10 border-amber-500/20 text-amber-500/80 hover:bg-amber-500/10 hover:text-amber-400'}`}
                    >
                        <span>-{mins}</span>
                        <span className="text-[9px] uppercase opacity-50">{t.minutes_unit}</span>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={() => {
                        const kidMins = kid.total_minutes;
                        const rate = familySettings?.point_to_minutes || 2;
                        const maxPts = Math.floor(kidMins / rate);
                        if (maxPts < 1) return showModal({ title: '提醒', message: t.alert_mins_not_enough });
                        showModal({
                            type: 'prompt',
                            title: t.prompt_redeem_points,
                            message: t.prompt_rate_mins_to_pts?.replace('{rate}', rate).replace('{value}', kidMins),
                            defaultValue: kidMins.toString(),
                            unit: t.minutes_unit,
                            rate: rate,
                            mode: 'minsToPts',
                            onConfirm: (val) => {
                                const mins = parseInt(val);
                                const pts = Math.floor(mins / rate);
                                if (pts > 0 && mins <= kidMins) onUpdate(kid, pts, -(pts * rate), 0, t.time_to_points, actorName);
                            }
                        });
                    }}
                    className="bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white border-2 border-b-4 p-3 rounded-xl text-lg font-black transition-all uppercase tracking-widest flex items-center justify-center gap-3"
                >
                    <Monitor className="w-5 h-5" /> ➔ <Star className="w-5 h-5 text-orange-400" />
                </button>

                {/* Redeem Time: Split if Bonus Enabled */}
                <div className="flex gap-1">
                    {familySettings?.bonus_enabled ? (
                        <>
                            <button
                                onClick={() => {
                                    const kidPts = kid.total_points;
                                    const rate = familySettings?.point_to_minutes || 2;
                                    if (kidPts < 1) return showModal({ title: '提醒', message: t.alert_pts_not_enough });
                                    showModal({
                                        type: 'prompt',
                                        title: '兌換一般時間',
                                        message: t.prompt_rate_pts_to_mins?.replace('{rate}', rate).replace('{value}', kidPts),
                                        defaultValue: '1',
                                        unit: t.points_label,
                                        rate: rate,
                                        mode: 'ptsToMins',
                                        onConfirm: (val) => {
                                            const want = parseInt(val);
                                            if (want && want <= kidPts) onUpdate(kid, -want, want * rate, 0, t.points_to_time, actorName);
                                        }
                                    });
                                }}
                                className="flex-1 bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 border-2 border-b-4 p-3 rounded-l-xl text-lg font-black transition-all uppercase flex items-center justify-center"
                            >
                                <Monitor className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => {
                                    const kidPts = kid.total_points;
                                    const rate = familySettings?.bonus_point_to_minutes || 2;
                                    if (kidPts < 1) return showModal({ title: '提醒', message: t.alert_pts_not_enough });
                                    showModal({
                                        type: 'prompt',
                                        title: '兌換精選時間',
                                        message: `匯率 1:${rate} (精選)，目前有 ${kidPts} 點：`,
                                        defaultValue: '1',
                                        unit: t.points_label,
                                        rate: rate,
                                        mode: 'ptsToMins',
                                        onConfirm: (val) => {
                                            const want = parseInt(val);
                                            if (want && want <= kidPts) onUpdate(kid, -want, 0, want * rate, '點數兌換精選', actorName);
                                        }
                                    });
                                }}
                                className="flex-1 bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 border-2 border-b-4 p-3 rounded-r-xl text-lg font-black transition-all uppercase flex items-center justify-center"
                            >
                                <Star className="w-5 h-5" />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => {
                                const kidPts = kid.total_points;
                                const rate = familySettings?.point_to_minutes || 2;
                                if (kidPts < 1) return showModal({ title: '提醒', message: t.alert_pts_not_enough });
                                showModal({
                                    type: 'prompt',
                                    title: t.prompt_redeem_time,
                                    message: t.prompt_rate_pts_to_mins?.replace('{rate}', rate).replace('{value}', kidPts),
                                    defaultValue: '1',
                                    unit: t.points_label,
                                    rate: rate,
                                    mode: 'ptsToMins',
                                    onConfirm: (val) => {
                                        const want = parseInt(val);
                                        if (want && want <= kidPts) onUpdate(kid, -want, want * rate, 0, t.points_to_time, actorName);
                                    }
                                });
                            }}
                            className="flex-1 bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 border-2 border-b-4 p-3 rounded-xl text-lg font-black transition-all uppercase tracking-widest flex items-center justify-center gap-3"
                        >
                            <Star className="w-5 h-5 text-orange-400" /> ➔ <Monitor className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
            <WishGoalModal
                isOpen={showGoalModal}
                onClose={() => setShowGoalModal(false)}
                kid={kid}
                goal={goal}
                onSave={(data) => onUpdateGoal(kid.id, data)}
                onDelete={() => onDeleteGoal(kid.id)}
                t={t}
                theme={theme}
            />
        </div >
    );
}
