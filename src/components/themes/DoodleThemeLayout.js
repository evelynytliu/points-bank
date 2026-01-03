import React, { useState } from 'react';
import { Monitor, Star, Clock, Coins, PlusCircle } from 'lucide-react';
import WishGoalModal from '../WishGoalModal';
import AnimatedCounter from '../AnimatedCounter';

export default function DoodleThemeLayout({
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
}) {
    const [showGoalModal, setShowGoalModal] = useState(false);

    // Doodle Style Constants
    const theme = 'doodle';
    const borderColor = '#4a4a4a';

    return (
        <div ref={cardRef} className="p-6 md:p-8 group relative overflow-hidden transition-all duration-500 bg-white border-4 border-[#4a4a4a] rounded-[30px] shadow-[12px_12px_0px_#e0e0e0] font-['M_PLUS_Rounded_1c']">

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
                        <span>{t.points_label || '點數'}</span>
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
                                <span className="text-xs font-bold">{t.set_goal || '設定願望'}</span>
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

            {/* 3. Time Limit Progress Bar */}
            <div className="mb-6">
                <div className="relative w-full h-12 rounded-xl overflow-hidden flex items-center justify-center bg-[#e0e0e0] border-2 border-[#4a4a4a] shadow-[3px_3px_0px_rgba(74,74,74,0.2)]">
                    <div
                        className="absolute top-0 left-0 h-full bg-[#66bb6a] transition-all duration-1000"
                        style={{ width: `${timePercent}%` }}
                    />
                    <div className="relative z-10 flex items-center gap-2 font-black text-[#4a4a4a] text-lg tracking-widest">
                        <Monitor className="w-5 h-5 opacity-60" />
                        <span>{visualMinutes}</span>
                        <span className="text-xs opacity-70">{t.minutes_unit}</span>
                        <span className="opacity-40 text-sm ml-1">/ {timeLimit}</span>
                    </div>
                </div>
            </div>

            {/* 4. Quick Actions (Refined 2D Buttons) */}
            <div className="grid grid-cols-4 gap-3 mb-4">
                {[10, 20, 30].map(mins => (
                    <button
                        key={mins}
                        onClick={() => onUpdate(kid, 0, -mins, t.quick_deduct || '快速扣除', actorName)}
                        className="bg-[#fbe9e7] border-2 border-[#4a4a4a] text-[#4a4a4a] font-black rounded-xl py-2 shadow-[3px_3px_0px_#4a4a4a] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all hover:bg-[#ffccbc] text-sm md:text-base"
                    >
                        -{mins}
                    </button>
                ))}
                <button
                    onClick={() => {
                        showModal({
                            type: 'prompt',
                            title: t.prompt_custom_deduct,
                            message: t.prompt_enter_mins_deduct,
                            unit: t.minutes_unit,
                            onConfirm: (val) => {
                                const m = parseInt(val);
                                if (m) onUpdate(kid, 0, -m, t.manual_deduct, actorName);
                            }
                        });
                    }}
                    className="bg-white border-2 border-[#4a4a4a] text-[#4a4a4a] font-black rounded-xl py-2 shadow-[3px_3px_0px_#4a4a4a] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all hover:bg-[#f5f5f5] text-sm md:text-base"
                >
                    {t.custom || '自訂'}
                </button>
            </div>

            {/* 5. Exchange Buttons (Refined 2D Buttons) */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => {
                        const kidMins = kid.total_minutes;
                        const rate = familySettings?.point_to_minutes || 2;
                        if (Math.floor(kidMins / rate) < 1) return showModal({ title: '提醒', message: t.alert_mins_not_enough });
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
                                if (pts > 0 && mins <= kidMins) onUpdate(kid, pts, -(pts * rate), t.time_to_points, actorName);
                            }
                        });
                    }}
                    className="bg-[#edf2f4] border-2 border-[#4a4a4a] text-[#4a4a4a] shadow-[4px_4px_0px_#4a4a4a] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] rounded-xl p-3 text-lg font-black transition-all flex items-center justify-center gap-3 hover:bg-[#dee2e6]"
                >
                    <Monitor className="w-5 h-5" /> ➔ <Star className="w-5 h-5 text-[#ffb74d]" />
                </button>
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
                                if (want && want <= kidPts) onUpdate(kid, -want, want * rate, t.points_to_time, actorName);
                            }
                        });
                    }}
                    className="bg-[#e8f5e9] border-2 border-[#4a4a4a] text-[#2e7d32] shadow-[4px_4px_0px_#4a4a4a] active:shadow-none active:translate-x-[4px] active:translate-y-[4px] rounded-xl p-3 text-lg font-black transition-all flex items-center justify-center gap-3 hover:bg-[#c8e6c9]"
                >
                    <Star className="w-5 h-5 text-[#ffb74d]" /> ➔ <Monitor className="w-5 h-5" />
                </button>
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
