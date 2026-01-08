import React, { useState } from 'react';
import { Monitor, Star, Clock, Coins, PlusCircle, ChevronDown } from 'lucide-react';
import WishGoalModal from '../WishGoalModal';
import AnimatedCounter from '../AnimatedCounter';

export default function DoodleThemeLayout({
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

    // Doodle Style Constants
    const theme = 'doodle';
    const borderColor = '#4a4a4a';

    return (
        <div
            ref={cardRef}
            onClick={() => setTimeType(null)} // Click background to reset
            className="p-6 md:p-8 group relative overflow-hidden transition-all duration-500 bg-white border-4 border-[#4a4a4a] rounded-[30px] shadow-[12px_12px_0px_#e0e0e0] font-['M_PLUS_Rounded_1c']"
        >

            {/* 1. Header: Avatar & Name */}
            <div className="flex justify-center items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-4xl bg-white border-2 border-[#4a4a4a] shadow-[3px_3px_0px_#4a4a4a] relative z-10 overflow-hidden">
                    {kid.avatar || '👶'}
                </div>
                <h3 className="text-4xl font-black text-[#4a4a4a] italic uppercase tracking-tighter" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.05)' }}>
                    {kid.name}
                </h3>
            </div>

            {/* 2. Main Content: Split Columns */}
            <div className="flex flex-row items-stretch justify-between gap-4 mb-6 relative">

                {/* Left Column: Big Points Number */}
                <div className="flex-1 flex flex-col justify-center items-center gap-0">
                    <div className="flex items-center gap-2 text-[#ff8a80] font-bold text-lg mb-1">
                        <Star className="w-5 h-5 fill-current" />
                        <span>{t.points_label}</span>
                    </div>
                    {/* Updated: Smaller font text-6xl (was text-[5rem]) */}
                    <div className="text-6xl leading-none font-black text-[#4a4a4a] italic tracking-tighter" style={{ textShadow: '3px 3px 0px #eee' }}>
                        <AnimatedCounter value={visualPoints} />
                    </div>
                </div>

                {/* Divider */}
                <div className="w-0 border-r-2 border-dashed border-[#4a4a4a]/20 mx-2 self-stretch"></div>

                {/* Right Column: Goal & Stats */}
                <div className="flex-1 flex flex-col justify-center gap-4 pl-2">

                    {/* Goal Section */}
                    <div
                        onClick={() => setShowGoalModal(true)}
                        className="w-full cursor-pointer group/goal"
                    >
                        {isUpdatingGoal ? (
                            <div className="space-y-1 animate-pulse opacity-60">
                                <div className="h-5 bg-[#eee] rounded w-24"></div>
                                <div className="h-2 bg-[#eee] rounded-full w-full"></div>
                            </div>
                        ) : goal ? (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[#4a4a4a] font-bold text-sm">
                                        <span className="text-xl">🎯</span>
                                        <span className="truncate max-w-[100px]">{goal.title}</span>
                                    </div>
                                </div>
                                <div className="w-full h-2.5 bg-[#f0f0f0] rounded-full overflow-hidden border border-black/5">
                                    <div
                                        className="h-full rounded-full bg-[#ff8a80] transition-all duration-1000"
                                        style={{ width: `${Math.min(100, Math.max(0, (visualPoints / (goal.target_points || 1)) * 100))}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-[#ccc] rounded-xl p-2 flex items-center justify-center gap-2 text-[#aaa] hover:text-[#ff8a80] hover:border-[#ff8a80] transition-all">
                                <PlusCircle className="w-4 h-4" />
                                <span className="text-xs font-bold">{t.wish_setup_new}</span>
                            </div>
                        )}
                    </div>

                    {/* Stats Compact */}
                    <div className="space-y-2">
                        {/* Time */}
                        <div className="flex items-center gap-3">
                            <Monitor className="w-5 h-5 text-[#ff8a80]" />
                            <div className="text-lg font-black text-[#555] italic">
                                <span className="text-xl text-[#4a4a4a]"><AnimatedCounter value={Math.floor(visualPoints * (familySettings?.point_to_minutes || 2))} /></span>
                                <span className="text-xs ml-1 font-bold text-[#999]">{t.minutes_unit}</span>
                            </div>
                        </div>
                        {/* Cash */}
                        <div className="flex items-center gap-3">
                            <Coins className="w-5 h-5 text-[#4caf50]" />
                            <div className="text-lg font-black text-[#555] italic">
                                <span className="text-xl text-[#4a4a4a]"><AnimatedCounter value={(visualPoints * (familySettings?.point_to_cash || 5))} /></span>
                                <span className="text-xs ml-1 font-bold text-[#999]">{t.cash_unit}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Time Limit Progress Bar (Detailed) & Mode Switcher */}
            <div className="mb-4">
                {/* Bonus Time (Focus Mode) - Only if enabled - MOVED TO TOP */}
                {familySettings?.bonus_enabled && (
                    <div className="mb-6">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setTimeType(prev => prev === 'bonus' ? null : 'bonus');
                            }}
                            className={`relative w-full h-14 rounded-2xl overflow-hidden flex items-center bg-[#fff8e1] border-4 transition-all duration-300 group/bar ${(timeType === 'bonus' || timeType === null) ? 'border-[#d97706] shadow-[4px_4px_0px_#d97706] scale-100 opacity-100 z-10' : 'border-[#e6c46e] shadow-none scale-[0.98] opacity-60 hover:opacity-80'}`}
                        >
                            <div
                                className="absolute top-0 left-0 h-full bg-[#fbbf24] transition-all duration-1000 origin-left"
                                style={{ width: `${bonusTimePercent}%` }}
                            />

                            {/* Label Badge */}
                            <div className={`relative z-10 flex-shrink-0 ml-2 px-3 py-1 rounded-lg font-black text-sm transition-colors border-2 ${(timeType === 'bonus' || timeType === null) ? 'bg-white text-[#78350f] border-[#d97706]' : 'bg-[#fff] text-[#9ca3af] border-[#e6e6e6]'}`}>
                                {t.focus_mode}
                            </div>

                            <div className="relative z-10 flex-1 flex items-center justify-center gap-2 font-black text-[#78350f] text-lg tracking-widest pl-2 pr-4">
                                <Star className="w-5 h-5 text-[#92400e]" />
                                <span>{visualBonusMinutes}</span>
                                <span className="text-xs opacity-70">{t.minutes_unit}</span>
                                <span className="opacity-40 text-sm ml-1">/ {bonusTimeLimit}</span>
                            </div>

                            <div className="relative z-10 pr-4">
                                <ChevronDown className={`w-5 h-5 text-[#78350f] transition-transform duration-300 ${timeType === 'bonus' ? 'rotate-180' : ''}`} />
                            </div>

                            {timeType === 'bonus' && (
                                <div className="absolute right-3 top-3 w-2 h-2 rounded-full bg-[#d97706] animate-pulse" />
                            )}
                        </button>

                        {/* Quick Actions for Bonus - Inline */}
                        {timeType === 'bonus' && (
                            <div className="mt-3 animate-in slide-in-from-top-2 fade-in duration-300">
                                <div className="grid grid-cols-4 gap-3 bg-[#fff8e1] p-3 rounded-2xl border-2 border-[#d97706]">
                                    {[10, 20, 30].map(mins => (
                                        <button
                                            key={mins}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onUpdate(kid, 0, 0, -mins, t.quick_deduct + ' (' + t.focus_label + ')', actorName);
                                            }}
                                            className="border-2 border-[#d97706] bg-white text-[#78350f] font-black rounded-xl py-2 shadow-[2px_2px_0px_#d97706] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all text-sm hover:bg-[#ffecb3]"
                                        >
                                            -{mins}
                                        </button>
                                    ))}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            showModal({
                                                type: 'prompt',
                                                title: t.prompt_custom_deduct + ' (' + t.focus_label + ')',
                                                message: t.prompt_enter_mins_deduct,
                                                unit: t.minutes_unit,
                                                onConfirm: (val) => {
                                                    const m = parseInt(val);
                                                    if (m) onUpdate(kid, 0, 0, -m, t.manual_deduct + ' (' + t.focus_label + ')', actorName);
                                                }
                                            });
                                        }}
                                        className="border-2 border-[#d97706] bg-white text-[#78350f] font-black rounded-xl py-2 shadow-[2px_2px_0px_#d97706] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all text-sm hover:bg-[#ffecb3]"
                                    >
                                        {t.custom}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* General Time - MOVED TO BOTTOM */}
                <div className="mb-6">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (familySettings?.bonus_enabled) {
                                setTimeType(prev => prev === 'general' ? null : 'general');
                            }
                        }}
                        className={`relative w-full h-14 rounded-2xl overflow-hidden flex items-center bg-[#e0e0e0] border-4 transition-all duration-300 group/bar ${(timeType === 'general' || timeType === null) ? 'border-[#4a4a4a] shadow-[4px_4px_0px_#4a4a4a] scale-100 opacity-100 z-10' : 'border-[#aaa] shadow-none scale-[0.98] opacity-60 hover:opacity-80'}`}
                    >
                        <div
                            className="absolute top-0 left-0 h-full bg-[#66bb6a] transition-all duration-1000 origin-left"
                            style={{ width: `${timePercent}%` }}
                        />

                        {/* Label Badge */}
                        {familySettings?.bonus_enabled && (
                            <div className={`relative z-10 flex-shrink-0 ml-2 px-3 py-1 rounded-lg font-black text-sm transition-colors border-2 ${(timeType === 'general' || timeType === null) ? 'bg-white text-[#4a4a4a] border-[#4a4a4a]' : 'bg-[#f5f5f5] text-[#888] border-[#ccc]'}`}>
                                {t.play_mode}
                            </div>
                        )}

                        <div className={`relative z-10 flex-1 flex items-center justify-center gap-2 font-black text-[#4a4a4a] text-lg tracking-widest ${familySettings?.bonus_enabled ? 'pl-2' : ''} pr-4`}>
                            <Monitor className="w-5 h-5 opacity-60" />
                            <span>{visualMinutes}</span>
                            <span className="text-xs opacity-70">{t.minutes_unit}</span>
                            <span className="opacity-40 text-sm ml-1">/ {timeLimit}</span>
                        </div>

                        {familySettings?.bonus_enabled && (
                            <div className="relative z-10 pr-4">
                                <ChevronDown className={`w-5 h-5 text-[#4a4a4a] transition-transform duration-300 ${timeType === 'general' ? 'rotate-180' : ''}`} />
                            </div>
                        )}

                        {familySettings?.bonus_enabled && timeType === 'general' && (
                            <div className="absolute right-3 top-3 w-2 h-2 rounded-full bg-[#4a4a4a] animate-pulse" />
                        )}
                    </button>

                    {/* Quick Actions for General - Inline */}
                    {(timeType === 'general' || !familySettings?.bonus_enabled) && (
                        <div className="mt-3 animate-in slide-in-from-top-2 fade-in duration-300">
                            <div className="grid grid-cols-4 gap-3 bg-[#f5f5f5] p-3 rounded-2xl border-2 border-[#4a4a4a]">
                                {[10, 20, 30].map(mins => (
                                    <button
                                        key={mins}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onUpdate(kid, 0, -mins, 0, t.quick_deduct, actorName);
                                        }}
                                        className="border-2 border-[#4a4a4a] bg-white text-[#4a4a4a] font-black rounded-xl py-2 shadow-[2px_2px_0px_#4a4a4a] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all text-sm hover:bg-[#e0e0e0]"
                                    >
                                        -{mins}
                                    </button>
                                ))}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        showModal({
                                            type: 'prompt',
                                            title: t.prompt_custom_deduct,
                                            message: t.prompt_enter_mins_deduct,
                                            unit: t.minutes_unit,
                                            onConfirm: (val) => {
                                                const m = parseInt(val);
                                                if (m) onUpdate(kid, 0, -m, 0, t.manual_deduct, actorName);
                                            }
                                        });
                                    }}
                                    className="border-2 border-[#4a4a4a] bg-white text-[#4a4a4a] font-black rounded-xl py-2 shadow-[2px_2px_0px_#4a4a4a] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all text-sm hover:bg-[#e0e0e0]"
                                >
                                    {t.custom}
                                </button>
                            </div>
                        </div>
                    )}
                </div>



                {/* 5. Exchange Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Time -> Points (Only General Time for now) */}
                    <button
                        onClick={() => {
                            const kidMins = kid.total_minutes;
                            const rate = familySettings?.point_to_minutes || 2;
                            if (Math.floor(kidMins / rate) < 1) return showModal({ title: t.alert_title, message: t.alert_mins_not_enough });
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
                        className="bg-[#edf2f4] border-2 border-[#4a4a4a] text-[#4a4a4a] shadow-[4px_4px_0px_#4a4a4a] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] rounded-xl p-3 text-lg font-black transition-all flex items-center justify-center gap-3 hover:bg-[#dee2e6]"
                    >
                        <Monitor className="w-5 h-5" /> ➔ <Star className="w-5 h-5 text-[#ffb74d]" />
                    </button>

                    {/* Points -> Time (Choice) */}
                    <div className="relative">
                        {familySettings?.bonus_enabled ? (
                            <div className="flex gap-2 h-full">
                                <button
                                    onClick={() => {
                                        const kidPts = kid.total_points;
                                        const rate = familySettings?.point_to_minutes || 2;
                                        if (kidPts < 1) return showModal({ title: t.alert_title, message: t.alert_pts_not_enough });
                                        showModal({
                                            type: 'prompt',
                                            title: t.prompt_redeem_time + ' (' + t.play_label + ')',
                                            message: t.prompt_rate_pts_to_mins?.replace('{rate}', rate).replace('{value}', kidPts),
                                            defaultValue: '1',
                                            unit: t.points_label,
                                            rate: rate,
                                            mode: 'ptsToMins',
                                            onConfirm: (val) => {
                                                const want = parseInt(val);
                                                // onUpdate(kid, pChange, mChange, bChange, reason, actor)
                                                if (want && want <= kidPts) onUpdate(kid, -want, want * rate, 0, t.points_to_time, actorName);
                                            }
                                        });
                                    }}
                                    className="flex-1 bg-[#e8f5e9] border-2 border-[#4a4a4a] text-[#2e7d32] shadow-[4px_4px_0px_#4a4a4a] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] rounded-xl p-1 text-sm font-black hover:bg-[#c8e6c9] flex flex-col items-center justify-center"
                                >
                                    <span className="text-[10px] uppercase opacity-70">{t.play_label}</span>
                                    <Monitor className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => {
                                        const kidPts = kid.total_points;
                                        // Use bonus rate
                                        const rate = familySettings?.bonus_point_to_minutes || 2;
                                        if (kidPts < 1) return showModal({ title: t.alert_title, message: t.alert_pts_not_enough });
                                        showModal({
                                            type: 'prompt',
                                            title: `${t.exchange_to_time} (${t.focus_label})`,
                                            message: t.prompt_rate_pts_to_mins?.replace('{rate}', rate).replace('{value}', kidPts),
                                            defaultValue: '1',
                                            unit: t.points_label,
                                            rate: rate,
                                            mode: 'ptsToMins', // We can reuse this mode for preview
                                            onConfirm: (val) => {
                                                const want = parseInt(val);
                                                // onUpdate(kid, pChange, mChange, bChange, reason, actor)
                                                if (want && want <= kidPts) onUpdate(kid, -want, 0, want * rate, t.points_to_time + ' (' + t.focus_label + ')', actorName);
                                            }
                                        });
                                    }}
                                    className="flex-1 bg-[#fff8e1] border-2 border-[#d97706] text-[#78350f] shadow-[4px_4px_0px_#d97706] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] rounded-xl p-1 text-sm font-black hover:bg-[#ffecb3] flex flex-col items-center justify-center"
                                >
                                    <span className="text-[10px] uppercase opacity-70">{t.focus_label}</span>
                                    <Star className="w-5 h-5" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    const kidPts = kid.total_points;
                                    const rate = familySettings?.point_to_minutes || 2;
                                    if (kidPts < 1) return showModal({ title: t.alert_title, message: t.alert_pts_not_enough });
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
                                className="w-full h-full bg-[#e8f5e9] border-2 border-[#4a4a4a] text-[#2e7d32] shadow-[4px_4px_0px_#4a4a4a] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] rounded-xl p-3 text-lg font-black transition-all flex items-center justify-center gap-3 hover:bg-[#c8e6c9]"
                            >
                                <Star className="w-5 h-5 text-[#ffb74d]" /> ➔ <Monitor className="w-5 h-5" />
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
            </div>
        </div >
    );
}
