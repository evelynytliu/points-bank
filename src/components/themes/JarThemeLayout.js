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
            <div className="relative bg-[#fffbf0] border-4 border-[#4a4a4a] rounded-[3rem] shadow-[10px_15px_0px_rgba(74,74,74,0.1)] overflow-hidden min-h-[600px] flex flex-col">

                {/* Lid Decoration */}
                <div className="h-5 bg-[#e5e5e5] border-b-4 border-[#4a4a4a] w-full z-20 relative shadow-sm">
                    <div className="absolute top-1 left-1/3 right-1/3 h-1.5 bg-white/60 rounded-full"></div>
                </div>

                {/* Physics Background Layer */}
                <div className="absolute inset-x-0 bottom-0 top-[20px] z-0">
                    <StarJar points={visualPoints} theme="container" seed={kid.id} />
                </div>

                {/* Interactive Content Layer */}
                <div className="relative z-10 p-6 flex flex-col flex-1 h-full justify-between pointer-events-none">

                    {/* Header: Avatar & Name */}
                    <div className="flex items-center justify-center gap-4 mb-2 mt-2 pointer-events-auto">
                        <div className="w-16 h-16 rounded-full bg-white border-2 border-[#4a4a4a] flex items-center justify-center shadow-md text-4xl">
                            {kid.avatar || '👶'}
                        </div>
                        <h3 className="text-4xl font-black text-[#4a4a4a] italic uppercase tracking-tighter">{kid.name}</h3>
                    </div>

                    {/* Main Body: Points Only (Clean with Glow) */}
                    <div className="flex-1 flex flex-col items-center justify-center font-['M_PLUS_Rounded_1c'] pointer-events-none pb-8">
                        <div className="text-center pointer-events-auto">
                            <div className="inline-block px-4">
                                <div className="text-sm font-black text-[#888] uppercase tracking-widest mb-2 drop-shadow-sm">{t.current_points}</div>
                                <div className="text-8xl font-black text-[#4a4a4a] drop-shadow-[0_2px_0_rgba(255,255,255,1)] tabular-nums tracking-tighter filter">
                                    <AnimatedCounter value={visualPoints} />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Collapsible Action Tray (Moved Outside Content Padding) */}
                <div
                    className="absolute bottom-0 inset-x-0 z-50 transition-transform duration-500 ease-in-out"
                    style={{ transform: isMenuOpen ? 'translateY(0)' : 'translateY(100%)' }}
                >
                    <div className="bg-[#fffbf0]/95 backdrop-blur-md border-t-4 border-[#4a4a4a] rounded-t-[2.5rem] p-5 pb-28 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] space-y-3 pointer-events-auto">

                        {/* Drag Handle / Close */}
                        <div className="w-full flex justify-center -mt-2 mb-2" onClick={() => setIsMenuOpen(false)}>
                            <div className="w-12 h-1.5 bg-[#4a4a4a]/20 rounded-full cursor-pointer hover:bg-[#4a4a4a]/40 transition-colors" />
                        </div>

                        {/* Goal & Stats Section (Moved from Jar Body) */}
                        <div className="bg-white/50 rounded-2xl p-4 border border-[#4a4a4a]/10 space-y-4">
                            {/* Goal */}
                            <div onClick={() => setShowGoalModal(true)} className="w-full cursor-pointer group/goal hover:bg-white/60 rounded-xl transition-colors">
                                {goal ? (
                                    <div className="flex flex-col gap-2 w-full">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">🎯</span>
                                                <span className="text-base font-bold text-[#4a4a4a] truncate max-w-[200px]">{goal.title}</span>
                                            </div>
                                            <span className="text-xs font-bold text-[#888]">{Math.floor((visualPoints / (goal.target_points || 1)) * 100)}%</span>
                                        </div>
                                        <div className="w-full h-3 rounded-full overflow-hidden bg-[#eee] border border-[#4a4a4a]/20">
                                            <div className="h-full rounded-full transition-all duration-1000 bg-[#ff8a80] striped-bar" style={{ width: `${Math.min(100, Math.max(0, (visualPoints / (goal.target_points || 1)) * 100))}%` }} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-sm font-bold text-[#888] opacity-60 hover:opacity-100 py-1">
                                        <PlusCircle className="w-5 h-5" /> {t.wish_setup_new || '設定願望'}
                                    </div>
                                )}
                            </div>

                            <div className="h-px bg-[#4a4a4a]/10 w-full" />

                            {/* Time & Cash Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col items-center bg-white/40 rounded-xl p-2 border border-[#4a4a4a]/5">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Monitor className="w-3.5 h-3.5 text-[#ff8a80]" />
                                        <span className="text-xs font-bold text-[#888]">{t.minutes_unit}</span>
                                    </div>
                                    <span className="text-2xl font-black text-[#4a4a4a] tracking-tight"><AnimatedCounter value={visualPoints * (familySettings?.point_to_minutes || 2)} /></span>
                                </div>
                                <div className="flex flex-col items-center bg-white/40 rounded-xl p-2 border border-[#4a4a4a]/5">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Coins className="w-3.5 h-3.5 text-green-600" />
                                        <span className="text-xs font-bold text-[#888]">{t.cash_unit}</span>
                                    </div>
                                    <span className="text-2xl font-black text-[#4a4a4a] tracking-tight"><AnimatedCounter value={visualPoints * (familySettings?.point_to_cash || 5)} /></span>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar (Always useful to see when acting) */}
                        <div className="relative w-full h-10 bg-[#eee] border border-[#4a4a4a]/40 rounded-full flex items-center justify-center overflow-hidden shadow-inner">
                            <div className={`absolute top-0 left-0 h-full transition-all duration-1000 ${isDanger ? 'bg-[#ff8a80]' : isWarning ? 'bg-[#ffd180]' : 'bg-[#88d8b0]'}`} style={{ width: `${timePercent}%` }}></div>
                            <div className="relative z-10 flex items-center gap-2 font-black uppercase tracking-widest text-[#4a4a4a] text-sm">
                                <Monitor className="w-4 h-4" />
                                <span className="text-lg"><AnimatedCounter value={visualMinutes} /></span>
                                <span className="opacity-60 text-xs">/ {timeLimit} {t.minutes_unit}</span>
                            </div>
                        </div>

                        {/* Quick Deduct */}
                        <div className="grid grid-cols-4 gap-3">
                            {[10, 20, 30].map(val => (
                                <button key={val} onClick={() => {
                                    showModal({ type: 'confirm', title: t.quick_deduct, message: `${t.confirm_deduct} ${val} ${t.minutes_unit}?`, onConfirm: () => onUpdate(kid, 0, -val, t.quick_deduct, actorName) });
                                }} className="bg-[#fbe9e7] border-[#4a4a4a]/40 text-[#8c3333] hover:bg-[#ff8a80] hover:text-white hover:-translate-y-1 hover:shadow-lg border-b-4 active:border-b-0 active:translate-y-1 p-3 rounded-full text-base font-black transition-all flex items-center justify-center shadow-sm">
                                    -{val}
                                </button>
                            ))}
                            <button onClick={() => showModal({ type: 'prompt', title: t.prompt_custom_deduct, onConfirm: (v) => v && onUpdate(kid, 0, -parseInt(v), t.manual_deduct, actorName) })}
                                className="bg-[#fafafa] border-[#4a4a4a]/40 text-[#4a4a4a] hover:bg-[#4a4a4a] hover:text-white hover:-translate-y-1 hover:shadow-lg border-b-4 active:border-b-0 active:translate-y-1 p-3 rounded-full text-sm font-black transition-all flex items-center justify-center shadow-sm">
                                {t.custom}
                            </button>
                        </div>

                        {/* Redeem Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => {
                                const kidMins = kid.total_minutes; const rate = familySettings?.point_to_minutes || 2;
                                if (Math.floor(kidMins / rate) < 1) return showModal({ title: '提醒', message: t.alert_mins_not_enough });
                                showModal({ type: 'prompt', title: t.prompt_redeem_points, message: t.prompt_rate_mins_to_pts?.replace('{rate}', rate).replace('{value}', kidMins), defaultValue: kidMins.toString(), unit: t.minutes_unit, rate: rate, mode: 'minsToPts', onConfirm: (val) => { const mins = parseInt(val); const pts = Math.floor(mins / rate); if (pts > 0 && mins <= kidMins) onUpdate(kid, pts, -(pts * rate), t.time_to_points, actorName); } });
                            }} className="bg-[#edf2f4] border-[#4a4a4a]/40 text-[#4a4a4a] hover:bg-[#8d99ae] hover:text-white hover:-translate-y-1 hover:shadow-lg border-b-4 active:border-b-0 active:translate-y-1 p-4 rounded-full text-sm font-black transition-all flex items-center justify-center gap-2 shadow-sm">
                                <Monitor className="w-5 h-5" /> ➔ <Star className="w-5 h-5 text-orange-400" />
                            </button>
                            <button onClick={() => {
                                const kidPts = kid.total_points; const rate = familySettings?.point_to_minutes || 2;
                                if (kidPts < 1) return showModal({ title: '提醒', message: t.alert_pts_not_enough });
                                showModal({ type: 'prompt', title: t.prompt_redeem_time, message: t.prompt_rate_pts_to_mins?.replace('{rate}', rate).replace('{value}', kidPts), defaultValue: '1', unit: t.points_label, rate: rate, mode: 'ptsToMins', onConfirm: (val) => { const want = parseInt(val); if (want && want <= kidPts) onUpdate(kid, -want, want * rate, t.points_to_time, actorName); } });
                            }} className="bg-[#e8f5e9] border-[#4a4a4a]/40 text-[#2e7d32] hover:bg-[#a5d6a7] hover:text-white hover:-translate-y-1 hover:shadow-lg border-b-4 active:border-b-0 active:translate-y-1 p-4 rounded-full text-sm font-black transition-all flex items-center justify-center gap-2 shadow-sm">
                                <Star className="w-5 h-5 text-orange-400" /> ➔ <Monitor className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Floating Toggle Button (Persistent) */}
                <div className="absolute bottom-6 right-6 z-[60] transition-all duration-300">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={`w-16 h-16 rounded-full shadow-[0_4px_0_#2d2d2d] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center pointer-events-auto border-4 border-white ring-4 ring-[#4a4a4a]/10 ${isMenuOpen ? 'bg-[#ff8a80] text-white rotate-90' : 'bg-[#4a4a4a] text-white hover:scale-110 hover:bg-[#ff8a80]'}`}
                    >
                        {isMenuOpen ? <X className="w-8 h-8" /> : <PlusCircle className="w-8 h-8" />}
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
