import React, { useState } from 'react';
import { PlusCircle, Monitor, Coins, Clock, Star } from 'lucide-react';
import StarJar from '../StarJar';
import WishGoalModal from '../WishGoalModal';
import AnimatedCounter from '../AnimatedCounter';

export default function JarThemeLayout({
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
    showModal
}) {
    const [showGoalModal, setShowGoalModal] = useState(false);

    return (
        <div ref={cardRef} className="relative w-full md:max-w-2xl mx-auto my-4 group transition-all duration-500 font-['M_PLUS_Rounded_1c']">

            {/* The Responsive Mason Jar Container */}
            <div className="relative bg-[#fffbf0] border-4 border-[#4a4a4a] rounded-[3rem] shadow-[10px_15px_0px_rgba(74,74,74,0.1)] overflow-hidden min-h-[500px] flex flex-col">

                {/* Lid Decoration */}
                <div className="h-5 bg-[#e5e5e5] border-b-4 border-[#4a4a4a] w-full z-20 relative shadow-sm">
                    <div className="absolute top-1 left-1/3 right-1/3 h-1.5 bg-white/60 rounded-full"></div>
                </div>

                {/* Physics Background Layer */}
                <div className="absolute inset-x-0 bottom-0 top-[20px] z-0">
                    <StarJar points={visualPoints} theme="container" seed={kid.id} />
                </div>

                {/* Interactive Content Layer */}
                <div className="relative z-10 p-6 flex flex-col flex-1 h-full justify-between">

                    {/* Header: Avatar & Name */}
                    <div className="flex items-center justify-center gap-4 mb-2 mt-2">
                        <div className="w-16 h-16 rounded-full bg-white border-2 border-[#4a4a4a] flex items-center justify-center shadow-md text-4xl">
                            {kid.avatar || '👶'}
                        </div>
                        <h3 className="text-4xl font-black text-[#4a4a4a] italic uppercase tracking-tighter">{kid.name}</h3>
                    </div>

                    {/* Split Body: Points | Divider | Stats */}
                    <div className="flex-1 flex flex-row items-center justify-between gap-4 mb-4 font-['M_PLUS_Rounded_1c']">
                        {/* Left: Points (Clean) */}
                        <div className="flex-1 text-center">
                            <div className="inline-block px-2">
                                <div className="text-xs font-black text-[#888] uppercase tracking-widest mb-1">{t.current_points}</div>
                                <div className="text-7xl font-black text-[#ff8a80] drop-shadow-sm tabular-nums tracking-tighter">
                                    <AnimatedCounter value={visualPoints} />
                                </div>
                            </div>
                        </div>

                        {/* Vertical Divider */}
                        <div className="h-24 w-0 border-l-2 border-dashed border-[#4a4a4a]/20 self-center"></div>

                        {/* Right: Stats & Goals (Compact) */}
                        <div className="flex-1 flex flex-col justify-center items-start gap-2 pl-2">
                            {/* Goal - Text Only Style */}
                            <div onClick={() => setShowGoalModal(true)} className="w-full cursor-pointer group/goal hover:bg-white/40 rounded-xl p-1.5 transition-colors">
                                {goal ? (
                                    <div className="flex flex-col gap-1 w-full">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">🎯</span>
                                            <span className="text-sm font-bold text-[#4a4a4a] truncate max-w-[120px]">{goal.title}</span>
                                        </div>
                                        <div className="w-full h-2 rounded-full overflow-hidden bg-[#eee] border border-[#4a4a4a]/20">
                                            <div className="h-full rounded-full transition-all duration-1000 bg-[#ff8a80]" style={{ width: `${Math.min(100, Math.max(0, (visualPoints / (goal.target_points || 1)) * 100))}%` }} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-xs font-bold text-[#888] opacity-60 hover:opacity-100">
                                        <PlusCircle className="w-4 h-4" /> {t.wish_setup_new || '設定願望'}
                                    </div>
                                )}
                            </div>
                            {/* Time & Cash Usage */}
                            <div className="space-y-0.5 w-full pl-1.5">
                                <div className="flex items-center gap-2">
                                    <Monitor className="w-3.5 h-3.5 text-[#ff8a80]" />
                                    <span className="text-lg font-black text-[#4a4a4a] leading-none"><AnimatedCounter value={visualPoints * (familySettings?.point_to_minutes || 2)} /></span>
                                    <span className="text-[10px] font-bold text-[#4a4a4a]/50">{t.minutes_unit}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Coins className="w-3.5 h-3.5 text-green-600" />
                                    <span className="text-lg font-black text-[#4a4a4a] leading-none"><AnimatedCounter value={visualPoints * (familySettings?.point_to_cash || 5)} /></span>
                                    <span className="text-[10px] font-bold text-[#4a4a4a]/50">{t.cash_unit}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer: Progress & Buttons (Doodle Style) */}
                    <div className="space-y-3">
                        {/* Progress Bar */}
                        <div className="relative w-full h-9 bg-[#eee] border border-[#4a4a4a]/40 rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
                            <div className={`absolute top-0 left-0 h-full transition-all duration-1000 ${isDanger ? 'bg-[#ff8a80]' : isWarning ? 'bg-[#ffd180]' : 'bg-[#88d8b0]'}`} style={{ width: `${timePercent}%` }}></div>
                            <div className="relative z-10 flex items-center gap-2 font-black uppercase tracking-widest text-[#4a4a4a] text-xs">
                                <Monitor className="w-3.5 h-3.5" />
                                <span className="text-base"><AnimatedCounter value={visualMinutes} /></span>
                                <span className="opacity-60">{t.minutes_unit} / {timeLimit}</span>
                            </div>
                        </div>

                        {/* Quick Deduct (Exact Doodle Buttons) */}
                        <div className="grid grid-cols-4 gap-2">
                            {[10, 20, 30].map(val => (
                                <button key={val} onClick={() => {
                                    showModal({ type: 'confirm', title: t.quick_deduct, message: `${t.confirm_deduct} ${val} ${t.minutes_unit}?`, onConfirm: () => onUpdate(kid, 0, -val, t.quick_deduct, actorName) });
                                }} className="bg-[#fbe9e7] border-[#4a4a4a]/40 text-[#8c3333] hover:bg-[#ff8a80] hover:text-white hover:-translate-y-0.5 border-2 border-b-4 p-1.5 rounded-lg text-sm font-black transition-all flex items-center justify-center">
                                    -{val}
                                </button>
                            ))}
                            <button onClick={() => showModal({ type: 'prompt', title: t.prompt_custom_deduct, onConfirm: (v) => v && onUpdate(kid, 0, -parseInt(v), t.manual_deduct, actorName) })}
                                className="bg-[#fafafa] border-[#4a4a4a]/40 text-[#4a4a4a] hover:bg-[#4a4a4a] hover:text-white hover:-translate-y-0.5 border-2 border-b-4 p-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center">
                                {t.custom}
                            </button>
                        </div>
                        {/* Redeem Buttons (Exact Doodle Buttons, Compact) */}
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => {
                                const kidMins = kid.total_minutes; const rate = familySettings?.point_to_minutes || 2;
                                if (Math.floor(kidMins / rate) < 1) return showModal({ title: '提醒', message: t.alert_mins_not_enough });
                                showModal({ type: 'prompt', title: t.prompt_redeem_points, message: t.prompt_rate_mins_to_pts?.replace('{rate}', rate).replace('{value}', kidMins), defaultValue: kidMins.toString(), unit: t.minutes_unit, rate: rate, mode: 'minsToPts', onConfirm: (val) => { const mins = parseInt(val); const pts = Math.floor(mins / rate); if (pts > 0 && mins <= kidMins) onUpdate(kid, pts, -(pts * rate), t.time_to_points, actorName); } });
                            }} className="bg-[#edf2f4] border-[#4a4a4a]/40 text-[#4a4a4a] hover:bg-[#8d99ae] hover:text-white hover:-translate-y-0.5 border-2 border-b-4 p-2 rounded-lg text-sm font-black transition-all flex items-center justify-center gap-2">
                                <Monitor className="w-4 h-4" /> ➔ <Star className="w-4 h-4 text-orange-400" />
                            </button>
                            <button onClick={() => {
                                const kidPts = kid.total_points; const rate = familySettings?.point_to_minutes || 2;
                                if (kidPts < 1) return showModal({ title: '提醒', message: t.alert_pts_not_enough });
                                showModal({ type: 'prompt', title: t.prompt_redeem_time, message: t.prompt_rate_pts_to_mins?.replace('{rate}', rate).replace('{value}', kidPts), defaultValue: '1', unit: t.points_label, rate: rate, mode: 'ptsToMins', onConfirm: (val) => { const want = parseInt(val); if (want && want <= kidPts) onUpdate(kid, -want, want * rate, t.points_to_time, actorName); } });
                            }} className="bg-[#e8f5e9] border-[#4a4a4a]/40 text-[#2e7d32] hover:bg-[#a5d6a7] hover:text-white hover:-translate-y-0.5 border-2 border-b-4 p-2 rounded-lg text-sm font-black transition-all flex items-center justify-center gap-2">
                                <Star className="w-4 h-4 text-orange-400" /> ➔ <Monitor className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* Important: Jar Theme Specific Modal Instance */}
            <WishGoalModal
                isOpen={showGoalModal}
                onClose={() => setShowGoalModal(false)}
                kid={kid}
                goal={goal}
                onSave={(data) => onUpdateGoal(kid.id, data)}
                onDelete={() => onDeleteGoal(kid.id)}
                t={t}
                theme={familySettings?.theme}
            />
        </div>
    );
}
