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
                    style={{ transform: isMenuOpen ? 'translateY(0)' : 'translateY(110%)' }} // Move slightly further down when closed
                >
                    <div className="bg-[#fffbf0]/98 backdrop-blur-md border-t-4 border-[#4a4a4a] rounded-t-[2.5rem] p-4 pb-6 shadow-[0_-10px_60px_rgba(0,0,0,0.2)] space-y-3 pointer-events-auto">

                        {/* 1. Goal & Stats Stats Row (Ultra Compact) */}
                        <div className="bg-white/60 rounded-2xl p-2.5 border border-[#4a4a4a]/10 flex items-center gap-3">
                            {/* Goal */}
                            <div onClick={() => setShowGoalModal(true)} className="flex-1 cursor-pointer group/goal hover:bg-white rounded-xl p-1.5 transition-colors min-w-0">
                                {goal ? (
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-base">🎯</span>
                                            <span className="text-xs font-bold text-[#4a4a4a] truncate">{goal.title}</span>
                                        </div>
                                        <div className="w-full h-1.5 rounded-full overflow-hidden bg-[#eee] border border-[#4a4a4a]/20">
                                            <div className="h-full rounded-full bg-[#ff8a80]" style={{ width: `${Math.min(100, Math.max(0, (visualPoints / (goal.target_points || 1)) * 100))}%` }} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 text-xs font-bold text-[#888] opacity-60">
                                        <PlusCircle className="w-4 h-4" /> <span>願望</span>
                                    </div>
                                )}
                            </div>
                            <div className="w-px h-8 bg-[#4a4a4a]/10" />
                            {/* Stats */}
                            <div className="flex gap-2">
                                <div className="flex flex-col items-center min-w-[50px]">
                                    <Monitor className="w-3 h-3 text-[#ff8a80] mb-0.5" />
                                    <span className="text-sm font-black text-[#4a4a4a] leading-none"><AnimatedCounter value={visualPoints * (familySettings?.point_to_minutes || 2)} /></span>
                                </div>
                                <div className="flex flex-col items-center min-w-[50px]">
                                    <Coins className="w-3 h-3 text-green-600 mb-0.5" />
                                    <span className="text-sm font-black text-[#4a4a4a] leading-none"><AnimatedCounter value={visualPoints * (familySettings?.point_to_cash || 5)} /></span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Progress Bar (Slim) */}
                        <div className="relative w-full h-6 bg-[#eee] border border-[#4a4a4a]/20 rounded-full flex items-center justify-center overflow-hidden">
                            <div className={`absolute top-0 left-0 h-full transition-all duration-1000 ${isDanger ? 'bg-[#ff8a80]' : isWarning ? 'bg-[#ffd180]' : 'bg-[#88d8b0]'}`} style={{ width: `${timePercent}%` }}></div>
                            <div className="relative z-10 flex items-center gap-1 font-black text-[#4a4a4a] text-xs">
                                <span className="opacity-80"><Monitor className="w-3 h-3 inline mr-1" />{visualMinutes} / {timeLimit}</span>
                            </div>
                        </div>

                        {/* 3. Actions Grid */}
                        <div className="flex flex-col gap-2">
                            {/* Row A: Quick Deduct (4 items) */}
                            <div className="grid grid-cols-4 gap-2">
                                {[5, 15, 30].map(val => (
                                    <button key={val} onClick={() => {
                                        showModal({ type: 'confirm', title: t.quick_deduct, message: `${t.confirm_deduct} ${val} ${t.minutes_unit}?`, onConfirm: () => onUpdate(kid, 0, -val, t.quick_deduct, actorName) });
                                    }} className="bg-[#ffebee] hover:bg-[#ffcdd2] text-[#c62828] border border-[#ffcdd2] active:scale-95 py-2.5 rounded-xl text-sm font-black transition-all shadow-sm">
                                        -{val}
                                    </button>
                                ))}
                                <button onClick={() => showModal({ type: 'prompt', title: t.prompt_custom_deduct, onConfirm: (v) => v && onUpdate(kid, 0, -parseInt(v), t.manual_deduct, actorName) })}
                                    className="bg-white hover:bg-gray-50 text-[#555] border border-gray-200 active:scale-95 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center justify-center">
                                    <span className="text-xs">自訂</span>
                                </button>
                            </div>

                            {/* Row B: Redeem & Close */}
                            <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                                {/* Redeem Time */}
                                <button onClick={() => {
                                    const kidPts = kid.total_points; const rate = familySettings?.point_to_minutes || 2;
                                    if (kidPts < 1) return showModal({ title: '提醒', message: t.alert_pts_not_enough });
                                    showModal({ type: 'prompt', title: t.prompt_redeem_time, message: t.prompt_rate_pts_to_mins?.replace('{rate}', rate).replace('{value}', kidPts), defaultValue: '1', unit: t.points_label, rate: rate, mode: 'ptsToMins', onConfirm: (val) => { const want = parseInt(val); if (want && want <= kidPts) onUpdate(kid, -want, want * rate, t.points_to_time, actorName); } });
                                }} className="bg-[#e8f5e9] hover:bg-[#c8e6c9] text-[#2e7d32] border border-[#c8e6c9] active:scale-95 py-3 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1">
                                    <Star className="w-3.5 h-3.5 text-orange-400 fill-current" />➔<Monitor className="w-3.5 h-3.5" />
                                    <span>換時間</span>
                                </button>

                                {/* Redeem Cash */}
                                <button onClick={() => {
                                    // Placeholder for Cash Redeem (if logic differs, adapt here. Assuming similar flow or TODO)
                                    // For now using same logic flow but different message presumably? Or just visual placeholder?
                                    // User asked for 2 redeem buttons.
                                    // Assuming "Points -> Cash"
                                    const kidPts = kid.total_points;
                                    if (kidPts < 1) return showModal({ title: '提醒', message: t.alert_pts_not_enough });
                                    // Using generic prompt for now
                                    showModal({ title: '兌換現金', message: '目前僅支援記錄，請家長手動發放零用錢。' });
                                }} className="bg-[#fff8e1] hover:bg-[#ffecb3] text-[#f57f17] border border-[#ffecb3] active:scale-95 py-3 rounded-2xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1">
                                    <Star className="w-3.5 h-3.5 text-orange-400 fill-current" />➔<Coins className="w-3.5 h-3.5" />
                                    <span>換現金</span>
                                </button>

                                {/* Close Button */}
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="bg-[#4a4a4a] text-white hover:bg-[#333] active:scale-95 w-14 rounded-2xl flex items-center justify-center shadow-md"
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
                        className="w-16 h-16 rounded-full shadow-[0_4px_0_#2d2d2d] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center pointer-events-auto border-4 border-white ring-4 ring-[#4a4a4a]/10 bg-[#4a4a4a] text-white hover:scale-110 hover:bg-[#ff8a80]"
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
