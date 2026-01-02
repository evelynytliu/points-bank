import React, { useState } from 'react';
import { Monitor, Star, Clock, Coins, PlusCircle } from 'lucide-react';
import StarJar from '../StarJar';
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

    return (
        <div ref={cardRef} className="p-8 group relative overflow-hidden transition-all duration-500 bg-white border-4 border-[#4a4a4a] rounded-[40px_10px_35px_15px] shadow-[10px_10px_0px_rgba(74,74,74,0.15)]">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-center gap-6 mb-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl bg-white shadow-md">
                            {kid.avatar || '👶'}
                        </div>
                        <h3 className="text-4xl font-black text-[#4a4a4a] italic uppercase tracking-tighter">{kid.name}</h3>
                    </div>
                </div>
                <div className="w-full relative flex items-center gap-6 py-4">

                    {/* Left Column: The Star Jar (Regular) */}
                    <div className="flex-1 flex justify-center items-center py-2 relative">
                        <div className="transform scale-125 origin-center">
                            <StarJar points={visualPoints} theme={theme} seed={kid.id} />
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-16 w-0 border-l-2 border-dashed self-center mx-2 border-[#4a4a4a]/20"></div>

                    {/* Right Column: Info Stack (Goal, Time, Value) */}
                    <div className="flex-1 flex flex-col justify-center items-start gap-3 pr-2">

                        {/* 1. Goal Progress Section */}
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
                                <div className="space-y-1 relative">
                                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[#f57f17]">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-[#f57f17] animate-pulse"></span>
                                            {t.current_goal}
                                        </div>
                                        <span className="text-[#888]">{Math.floor((kid.total_points / goal.points) * 100)}%</span>
                                    </div>
                                    <div className="flex items-end gap-3 transition-opacity">
                                        <div className="text-sm font-black text-[#4a4a4a] truncate max-w-[120px]">{goal.title}</div>
                                    </div>
                                    <div className="w-full bg-[#fae0b5] h-1.5 rounded-full overflow-hidden border border-[#f57f17]/20">
                                        <div
                                            className="bg-[#fbc02d] h-full rounded-full shadow-sm relative"
                                            style={{ width: `${Math.min(100, (kid.total_points / goal.points) * 100)}%` }}
                                        >
                                            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[1px]"></div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="border border-dashed border-[#ccc] rounded-xl p-3 flex flex-col items-center justify-center gap-1 group-hover/goal:border-[#ff8a80] group-hover/goal:bg-[#fffbf0] transition-all">
                                    <PlusCircle className="w-5 h-5 text-[#888] group-hover/goal:text-[#ff8a80]" />
                                    <div className="text-[10px] font-bold text-[#888] group-hover/goal:text-[#ff8a80] uppercase tracking-widest">{t.set_goal}</div>
                                </div>
                            )}
                        </div>

                        {/* 2. Minutes Available */}
                        <div className="flex items-center gap-3 w-full">
                            <div className="w-8 h-8 rounded-lg bg-[#eee] flex items-center justify-center border border-[#ddd]">
                                <Clock className="w-4 h-4 text-[#888]" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-[#888] uppercase tracking-wider leading-none mb-0.5">{t.can_use_time}</div>
                                <div className="text-xl font-black text-[#4a4a4a] leading-none">
                                    {Math.floor(kid.total_points / 2)} <span className="text-[10px] text-[#888]">{t.minutes_unit}</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Cash Value */}
                        <div className="flex items-center gap-3 w-full">
                            <div className="w-8 h-8 rounded-lg bg-[#eee] flex items-center justify-center border border-[#ddd]">
                                <Coins className="w-4 h-4 text-[#888]" />
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-[#888] uppercase tracking-wider leading-none mb-0.5">{t.can_exchange}</div>
                                <div className="text-xl font-black text-green-600 leading-none">
                                    ${(kid.total_points / 10).toFixed(1)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-4 gap-2 mb-2">
                {[10, 20, 30, 60].map(mins => (
                    <button
                        key={mins}
                        onClick={() => onUpdate(kid, 0, -mins, t.quick_deduct || '快速扣除', actorName)}
                        className="bg-[#fbe9e7] border-[#4a4a4a]/40 text-[#8c3333] hover:bg-[#ff8a80] hover:text-white hover:-translate-y-0.5 border-2 border-b-4 p-2 rounded-xl text-sm font-black transition-all flex flex-col items-center justify-center gap-1 group/btn"
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
                                if (pts > 0 && mins <= kidMins) onUpdate(kid, pts, -(pts * rate), t.time_to_points, actorName);
                            }
                        });
                    }}
                    className="bg-[#edf2f4] border-[#4a4a4a]/40 text-[#4a4a4a] hover:bg-[#8d99ae] hover:text-white hover:-translate-y-0.5 border-2 border-b-4 p-3 rounded-xl text-lg font-black transition-all uppercase tracking-widest flex items-center justify-center gap-3"
                >
                    <Monitor className="w-5 h-5" /> ➔ <Star className="w-5 h-5 text-orange-400" />
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
                    className="bg-[#e8f5e9] border-[#4a4a4a]/40 text-[#2e7d32] hover:bg-[#a5d6a7] hover:text-white hover:-translate-y-0.5 border-2 border-b-4 p-3 rounded-xl text-lg font-black transition-all uppercase tracking-widest flex items-center justify-center gap-3"
                >
                    <Star className="w-5 h-5 text-orange-400" /> ➔ <Monitor className="w-5 h-5" />
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
