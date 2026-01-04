import React, { useState } from 'react';
import { PlusCircle, Monitor, Coins, Clock, Star, X } from 'lucide-react';
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div ref={cardRef} className="relative w-full md:max-w-2xl mx-auto my-4 group transition-all duration-500 font-['M_PLUS_Rounded_1c']">

            {/* The Responsive Mason Jar Container */}
            <div className="relative bg-gradient-to-b from-[#2e1065] via-[#1e1b4b] to-[#0f172a] border-4 border-[#8b5cf6] rounded-[3rem] shadow-[0_0_40px_rgba(139,92,246,0.5)] overflow-hidden min-h-[480px] flex flex-col ring-4 ring-[#8b5cf6]/20">

                {/* Lid Decoration */}
                <div className="h-5 bg-gradient-to-r from-[#4c1d95] to-[#5b21b6] border-b-4 border-[#8b5cf6] w-full z-20 relative shadow-md">
                    <div className="absolute top-1 left-1/3 right-1/3 h-1.5 bg-white/20 rounded-full blur-[1px]"></div>
                </div>

                {/* Physics Background Layer */}
                <div className="absolute inset-x-0 bottom-0 top-[20px] z-0">
                    <StarJar points={visualPoints} theme="container" seed={kid.id} />
                </div>

                {/* Interactive Content Layer */}
                <div className="relative z-10 p-4 pt-6 flex flex-col flex-1 h-full justify-start pointer-events-none gap-2">

                    {/* Header: Avatar & Name */}

                    <div className="flex items-center justify-center gap-3 mt-0 pointer-events-auto">
                        <div className="w-12 h-12 rounded-full bg-[#1e1b4b] border-2 border-[#8b5cf6] flex items-center justify-center shadow-[0_0_15px_#8b5cf6] text-2xl text-white relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent"></div>
                            <span className="relative z-10">{kid.avatar || '👶'}</span>
                        </div>
                        <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200 italic uppercase tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none pr-4">{kid.name}</h3>
                    </div>

                    {/* Main Body: Points Only (Move to top) */}
                    <div className="flex flex-col items-center font-['M_PLUS_Rounded_1c'] pointer-events-none">
                        <div className="text-center pointer-events-auto">
                            <div className="inline-block px-4 py-2 relative z-20">
                                <div className="text-sm font-black text-purple-200 uppercase tracking-widest mb-1 drop-shadow-md">{t.current_points}</div>
                                <div className="text-8xl font-black text-[#fbbf24] tabular-nums tracking-tighter leading-none" style={{ textShadow: '4px 4px 0px #2e1065, 0 0 20px rgba(251, 191, 36, 0.4)' }}>
                                    <AnimatedCounter value={visualPoints} />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Low-profile Progress Bar (Visible when menu is closed) */}
                <div className={`absolute bottom-0 inset-x-0 h-1.5 bg-black/20 z-40 transition-all duration-500 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}>
                    <div
                        className={`h-full transition-all duration-1000 ${isDanger ? 'bg-[#ff8a80] shadow-[0_0_10px_#ff8a80]' : isWarning ? 'bg-[#ffd180] shadow-[0_0_10px_#ffd180]' : 'bg-[#a78bfa] shadow-[0_0_10px_#a78bfa]'}`}
                        style={{ width: `${timePercent}%` }}
                    />
                </div>

                {/* Collapsible Action Tray (Moved Outside Content Padding) */}
                <div
                    className="absolute bottom-0 inset-x-0 z-50 transition-transform duration-500 ease-in-out"
                    style={{ transform: isMenuOpen ? 'translateY(0)' : 'translateY(110%)' }} // Move slightly further down when closed
                >
                    <div className="bg-[#0f172a]/90 backdrop-blur-xl border-t-4 border-[#8b5cf6]/50 rounded-t-[2.5rem] p-4 pb-6 shadow-[0_-10px_60px_rgba(0,0,0,0.7)] space-y-3 pointer-events-auto">

                        {/* 1. Goal & Stats Stats Row (Ultra Compact) */}
                        <div className="bg-[#1e1b4b]/60 rounded-2xl p-2.5 border border-purple-500/20 flex items-center gap-3 shadow-inner">
                            {/* Goal */}
                            <div onClick={() => setShowGoalModal(true)} className="flex-1 cursor-pointer group/goal hover:bg-white rounded-xl p-1.5 transition-colors min-w-0">
                                {goal ? (
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-base">🎯</span>
                                            <span className="text-xs font-bold text-white truncate">{goal.title}</span>
                                        </div>
                                        <div className="w-full h-1.5 rounded-full overflow-hidden bg-[#eee] border border-[#4a4a4a]/20">
                                            <div className="h-full rounded-full bg-[#ff8a80]" style={{ width: `${Math.min(100, Math.max(0, (visualPoints / (goal.target_points || 1)) * 100))}%` }} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-xs font-bold text-purple-300/60 opacity-80">
                                        <PlusCircle className="w-4 h-4" /> <span>願望</span>
                                    </div>
                                )}
                            </div>
                            <div className="w-px h-8 bg-white/10" />
                            {/* Stats */}
                            <div className="flex gap-2">
                                <div className="flex flex-col items-center min-w-[50px]">
                                    <Monitor className="w-3 h-3 text-[#ff8a80] mb-0.5" />
                                    <span className="text-sm font-black text-white leading-none"><AnimatedCounter value={visualPoints * (familySettings?.point_to_minutes || 2)} /></span>
                                </div>
                                <div className="flex flex-col items-center min-w-[50px]">
                                    <Coins className="w-3 h-3 text-emerald-400 mb-0.5" />
                                    <span className="text-sm font-black text-white leading-none"><AnimatedCounter value={visualPoints * (familySettings?.point_to_cash || 5)} /></span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Progress Bar (Slim) */}
                        <div className="relative w-full h-6 bg-[#1e1b4b] border border-purple-500/20 rounded-full flex items-center justify-center overflow-hidden shadow-inner">
                            <div className={`absolute top-0 left-0 h-full transition-all duration-1000 ${isDanger ? 'bg-[#ff8a80]' : isWarning ? 'bg-[#ffd180]' : 'bg-[#a78bfa]'}`} style={{ width: `${timePercent}%` }}></div>
                            <div className="relative z-10 flex items-center gap-1 font-black text-white text-xs drop-shadow-md">
                                <span className="opacity-90"><Monitor className="w-3 h-3 inline mr-1" />{visualMinutes} / {timeLimit}</span>
                            </div>
                        </div>

                        {/* 3. Actions Grid */}
                        <div className="flex flex-col gap-2">
                            {/* Row A: Quick Deduct (4 items) */}
                            <div className="grid grid-cols-4 gap-2">
                                {[10, 20, 30].map(val => (
                                    <button key={val} onClick={() => {
                                        showModal({ type: 'confirm', title: t.quick_deduct, message: `${t.confirm_deduct} ${val} ${t.minutes_unit}?`, onConfirm: () => onUpdate(kid, 0, -val, t.quick_deduct, actorName) });
                                    }} className="bg-[#450a0a]/60 hover:bg-[#7f1d1d]/80 text-red-200 border border-red-500/20 active:scale-95 py-2.5 rounded-xl text-sm font-black transition-all shadow-sm backdrop-blur-sm">
                                        -{val}
                                    </button>
                                ))}
                                <button onClick={() => showModal({ type: 'prompt', title: t.prompt_custom_deduct, onConfirm: (v) => v && onUpdate(kid, 0, -parseInt(v), t.manual_deduct, actorName) })}
                                    className="bg-white/5 hover:bg-white/10 text-purple-100 border border-purple-500/30 active:scale-95 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center backdrop-blur-sm">
                                    <span className="text-xs">自訂</span>
                                </button>
                            </div>

                            {/* Row B: Redeem & Close */}
                            <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                                {/* Redeem Points (Time -> Star) - Cosmic Blue */}
                                <button onClick={() => {
                                    const kidMins = kid.total_minutes; const rate = familySettings?.point_to_minutes || 2;
                                    if (Math.floor(kidMins / rate) < 1) return showModal({ title: '提醒', message: t.alert_mins_not_enough });
                                    showModal({ type: 'prompt', title: t.prompt_redeem_points, message: t.prompt_rate_mins_to_pts?.replace('{rate}', rate).replace('{value}', kidMins), defaultValue: kidMins.toString(), unit: t.minutes_unit, rate: rate, mode: 'minsToPts', onConfirm: (val) => { const mins = parseInt(val); const pts = Math.floor(mins / rate); if (pts > 0 && mins <= kidMins) onUpdate(kid, pts, -(pts * rate), t.time_to_points, actorName); } });
                                }} className="bg-gradient-to-r from-blue-900/60 to-indigo-900/60 hover:from-blue-800 hover:to-indigo-800 text-blue-100 border border-blue-400/30 active:scale-95 py-3 rounded-2xl text-xs font-bold transition-all shadow-[0_0_10px_rgba(59,130,246,0.2)] flex items-center justify-center gap-1 backdrop-blur-sm">
                                    <Monitor className="w-3.5 h-3.5" />➔<Star className="w-3.5 h-3.5 text-[#fbbf24] fill-current" />
                                    <span>{t.prompt_redeem_points}</span>
                                </button>

                                {/* Redeem Time (Star -> Time) - Cosmic Green/Teal */}
                                <button onClick={() => {
                                    const kidPts = kid.total_points; const rate = familySettings?.point_to_minutes || 2;
                                    if (kidPts < 1) return showModal({ title: '提醒', message: t.alert_pts_not_enough });
                                    showModal({ type: 'prompt', title: t.prompt_redeem_time, message: t.prompt_rate_pts_to_mins?.replace('{rate}', rate).replace('{value}', kidPts), defaultValue: '1', unit: t.points_label, rate: rate, mode: 'ptsToMins', onConfirm: (val) => { const want = parseInt(val); if (want && want <= kidPts) onUpdate(kid, -want, want * rate, t.points_to_time, actorName); } });
                                }} className="bg-gradient-to-r from-emerald-900/60 to-teal-900/60 hover:from-emerald-800 hover:to-teal-800 text-emerald-100 border border-emerald-400/30 active:scale-95 py-3 rounded-2xl text-xs font-bold transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)] flex items-center justify-center gap-1 backdrop-blur-sm">
                                    <Star className="w-3.5 h-3.5 text-[#fbbf24] fill-current" />➔<Monitor className="w-3.5 h-3.5" />
                                    <span>{t.prompt_redeem_time}</span>
                                </button>

                                {/* Close Button */}
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="bg-[#8b5cf6] text-white hover:bg-[#7c3aed] active:scale-95 w-14 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)] border border-purple-400/50"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Floating Toggle Button (Visible ONLY when menu is closed) */}
                <div
                    className={`absolute bottom-6 right-6 z-[60] transition-all duration-300 ${isMenuOpen ? 'opacity-0 pointer-events-none scale-50' : 'opacity-100 scale-100'}`}
                >
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="w-16 h-16 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.4)] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center pointer-events-auto border-4 border-purple-300/20 ring-4 ring-[#8b5cf6]/30 bg-[#8b5cf6] text-white hover:scale-110 hover:bg-[#7c3aed]"
                    >
                        <PlusCircle className="w-8 h-8" />
                    </button>
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
