'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Gift, Image as ImageIcon, Sparkles, Trophy, Edit2, Upload, Loader2, Camera } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '@/lib/supabase';

export default function WishGoalModal({ isOpen, onClose, kid, goal, onSave, onDelete, t, theme }) {
    const [isEditing, setIsEditing] = useState(!goal);
    const [title, setTitle] = useState(goal?.title || '');
    const [targetPoints, setTargetPoints] = useState(goal?.target_points || 100);
    const [imageUrl, setImageUrl] = useState(goal?.image_url || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Image compression utility
    const compressImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800; // Resize to max 800px width
                    const scaleSize = MAX_WIDTH / img.width;
                    const width = scaleSize < 1 ? MAX_WIDTH : img.width;
                    const height = scaleSize < 1 ? img.height * scaleSize : img.height;

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Canvas to Blob failed'));
                        }
                    }, 'image/webp', 0.8); // Compress to 80% quality WebP
                };
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            if (!supabase) throw new Error("Supabase not initialized");

            const compressedBlob = await compressImage(file);
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;

            const { data, error } = await supabase.storage
                .from('wish_goals')
                .upload(fileName, compressedBlob, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) throw error;

            const { data: publicUrlData } = supabase.storage
                .from('wish_goals')
                .getPublicUrl(fileName);

            setImageUrl(publicUrlData.publicUrl);
        } catch (error) {
            console.error('Upload failed:', error);
            alert(t.alert_upload_failed + error.message);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Reset state when goal changes or modal opens
    useEffect(() => {
        if (isOpen) {
            setTitle(goal?.title || '');
            setTargetPoints(goal?.target_points || 100);
            setImageUrl(goal?.image_url || '');
            setIsEditing(!goal);
            setIsSaving(false);
        }
    }, [isOpen, goal]);



    const progress = Math.min(100, Math.max(0, (kid.total_points / (goal?.target_points || 1)) * 100));
    const isCompleted = kid.total_points >= (goal?.target_points || Infinity);
    const remaining = Math.max(0, (goal?.target_points || 0) - kid.total_points);

    const handleSave = async () => {
        if (!title.trim()) return alert(t.alert_enter_wish_name);
        if (targetPoints <= 0) return alert(t.alert_target_points_greater_zero);

        setIsSaving(true);
        try {
            await onSave({
                title,
                target_points: parseInt(targetPoints),
                image_url: imageUrl
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Save failed", error);
            // Alert is handled in parent, but we should ensure we stop loading
        } finally {
            setIsSaving(false);
        }
    };

    const triggerConfetti = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 2000 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    // Effect for completion
    useEffect(() => {
        if (!isEditing && isCompleted && isOpen) {
            triggerConfetti();
        }
    }, [isCompleted, isEditing, isOpen]);

    const isJar = theme === 'jar';
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={`relative w-full max-w-sm overflow-hidden rounded-3xl ${isJar ? 'bg-[#1e1b4b] border border-purple-500/30 shadow-[0_0_50px_rgba(139,92,246,0.3)]' : (theme === 'doodle' ? 'bg-[#fffbf0] border-4 border-[#4a4a4a] shadow-[8px_8px_0px_#4a4a4a]' : 'bg-[#0f172a] border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.2)]')}`}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    disabled={isSaving}
                    className={`absolute top-3 right-3 z-20 p-2 rounded-full transition-all ${isJar ? 'bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 hover:text-white' : (theme === 'doodle' ? 'bg-white border-2 border-[#4a4a4a] text-[#4a4a4a] hover:bg-[#ff8a80] hover:text-white' : 'bg-black/50 text-white hover:bg-white/20')} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="p-6">
                    {/* Header */}
                    <div className="text-center mb-5">
                        <motion.div
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 text-2xl shadow-lg ${isJar ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-purple-500/50' : (theme === 'doodle' ? 'bg-[#ff8a80] text-white border-2 border-[#4a4a4a]' : 'bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-cyan-500/50')}`}
                        >
                            {isCompleted ? '🏆' : '🎯'}
                        </motion.div>
                        <h2 className={`text-xl font-black uppercase tracking-tight ${isJar ? 'text-white' : (theme === 'doodle' ? 'text-[#4a4a4a]' : 'text-white')}`}>
                            {isEditing ? (goal ? t.wish_edit : t.wish_setup_new) : t.wish_progress}
                        </h2>
                    </div>

                    {!isEditing ? (
                        /* View Mode */
                        <div className="flex flex-col gap-4">
                            {/* Target Content */}
                            <div>
                                <div className={`relative w-full rounded-2xl overflow-hidden group ${isJar ? 'bg-black/30 border border-purple-500/20' : (theme === 'doodle' ? 'bg-white border-2 border-[#4a4a4a]' : 'bg-black/30 border border-white/10')} ${imageUrl ? 'shadow-sm flex items-center justify-center bg-black/5' : 'aspect-[4/3] flex items-center justify-center p-4'}`}>
                                    {imageUrl ? (
                                        <img src={imageUrl} alt={title} className="max-w-full max-h-[200px] w-auto h-auto object-contain transition-transform duration-700 group-hover:scale-105" />
                                    ) : (
                                        <div className="relative z-10 flex flex-col items-center justify-center text-center w-full h-full">
                                            <Gift className={`w-16 h-16 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 opacity-5 pointer-events-none ${theme === 'doodle' ? 'text-black' : 'text-white'}`} />
                                            <h3 className={`text-2xl font-black uppercase tracking-tight leading-tight break-words max-w-full relative z-10 ${isJar ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]' : (theme === 'doodle' ? 'text-[#4a4a4a]' : 'text-white')}`}>
                                                {title}
                                            </h3>
                                        </div>
                                    )}
                                </div>

                                {/* External Title for Image Mode */}
                                {imageUrl && (
                                    <h3 className={`text-lg font-black uppercase tracking-tight text-center mt-3 mb-1 line-clamp-1 ${isJar ? 'text-white' : (theme === 'doodle' ? 'text-[#4a4a4a]' : 'text-white')}`}>
                                        {title}
                                    </h3>
                                )}
                            </div>

                            {/* Progress Bar (Star Track for Jar) */}
                            <div className="space-y-1">
                                <div className="flex justify-between items-end px-1">
                                    <span className={`font-black text-xl ${isJar ? 'text-purple-300' : (theme === 'doodle' ? 'text-[#4a4a4a]' : 'text-cyan-400')}`}>
                                        {kid.total_points} <span className="text-xs opacity-60">{t.pts}</span>
                                    </span>
                                    <span className={`font-bold text-xs ${isJar ? 'text-purple-200/60' : (theme === 'doodle' ? 'text-[#888]' : 'text-slate-400')}`}>
                                        {t.goal_label} {targetPoints}
                                    </span>
                                </div>

                                {isJar ? (
                                    /* Star Track Progress Bar */
                                    <div className="relative py-2">
                                        <div className="flex justify-between gap-1 text-purple-900/40 relative z-0">
                                            {/* Background Skeleton Stars */}
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Sparkles key={i} className="w-8 h-8 fill-current" strokeWidth={1.5} />
                                            ))}
                                        </div>
                                        <div className="absolute top-2 left-0 h-8 overflow-hidden transition-all duration-1000 ease-out z-10" style={{ width: `${progress}%` }}>
                                            <div className="flex justify-between gap-1 w-full min-w-[max-content]">
                                                {/* Filled Gold Stars */}
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Sparkles key={i} className="w-8 h-8 text-[#fbbf24] fill-[#fbbf24] drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] animate-pulse" style={{ animationDuration: '3s' }} strokeWidth={0} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Standard Linear Progress Bar */
                                    <div className={`h-6 w-full rounded-full overflow-hidden p-1 ${theme === 'doodle' ? 'bg-[#eee] border-2 border-[#4a4a4a]' : 'bg-white/5 border border-white/10'}`}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className={`h-full rounded-full relative ${theme === 'doodle' ? 'bg-[#ff8a80]' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`}
                                        >
                                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                                        </motion.div>
                                    </div>
                                )}

                                <div className="text-center mt-1">
                                    {isCompleted ? (
                                        <motion.div
                                            animate={{ scale: [1, 1.05, 1] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            className={`font-black text-lg ${isJar ? 'text-green-400 drop-shadow-md' : (theme === 'doodle' ? 'text-green-500' : 'text-green-400')}`}
                                        >
                                            {t.wish_completed}
                                        </motion.div>
                                    ) : (
                                        <div className={`font-bold text-sm ${isJar ? 'text-purple-200/60' : (theme === 'doodle' ? 'text-[#888]' : 'text-slate-400')}`}>
                                            {t.wish_remaining_prefix} <span className={`${isJar ? 'text-[#fbbf24]' : (theme === 'doodle' ? 'text-[#ff8a80]' : 'text-cyan-400')} text-base mx-1`}>{remaining}</span> {t.wish_remaining_suffix}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-3 border-t border-dashed border-white/10">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm ${isJar ? 'bg-purple-500/20 text-purple-200 hover:bg-purple-500/30' : (theme === 'doodle' ? 'bg-[#f5f5f5] text-[#4a4a4a] hover:bg-[#e0e0e0]' : 'bg-white/5 text-white hover:bg-white/10')}`}
                                >
                                    <Edit2 className="w-3.5 h-3.5" /> {t.wish_edit_btn}
                                </button>
                                {goal && (
                                    <button
                                        onClick={onDelete}
                                        className={`px-3 py-2 rounded-xl font-bold transition-all text-sm ${isJar ? 'text-red-300 hover:bg-red-500/20' : (theme === 'doodle' ? 'text-red-400 hover:bg-red-50' : 'text-slate-500 hover:text-red-400 hover:bg-red-500/10')}`}
                                    >
                                        {t.delete}
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* Edit Mode */
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${isJar ? 'text-purple-300/60' : (theme === 'doodle' ? 'text-[#888]' : 'text-slate-500')}`}>{t.wish_name_label}</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder={t.wish_name_placeholder}
                                    className={`w-full p-3 rounded-xl font-bold outline-none transition-all text-sm ${isJar ? 'bg-black/30 text-white border border-purple-500/30 focus:border-purple-500' : (theme === 'doodle' ? 'bg-[#f5f5f5] text-[#4a4a4a] border-2 border-[#eee] focus:border-[#ff8a80]' : 'bg-black/30 text-white border border-white/10 focus:border-cyan-500')}`}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${isJar ? 'text-purple-300/60' : (theme === 'doodle' ? 'text-[#888]' : 'text-slate-500')}`}>{t.target_points_label}</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={targetPoints}
                                        onChange={e => setTargetPoints(parseFloat(e.target.value) || 0)}
                                        className={`w-full p-3 pl-10 rounded-xl font-black text-lg outline-none transition-all ${isJar ? 'bg-black/30 text-white border border-purple-500/30 focus:border-purple-500' : (theme === 'doodle' ? 'bg-[#f5f5f5] text-[#4a4a4a] border-2 border-[#eee] focus:border-[#ff8a80]' : 'bg-black/30 text-white border border-white/10 focus:border-cyan-500')}`}
                                    />
                                    <Target className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isJar ? 'text-purple-400' : (theme === 'doodle' ? 'text-[#bbb]' : 'text-slate-500')}`} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className={`block text-xs font-bold ml-1 ${isJar ? 'text-purple-300' : (theme === 'doodle' ? 'text-[#4a4a4a]' : 'text-slate-400')}`}>
                                    {t.wish_image_label}
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${isJar ? 'text-purple-400' : (theme === 'doodle' ? 'text-[#4a4a4a]/40' : 'text-slate-500')}`}>
                                            <ImageIcon className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="url"
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            className={`w-full pl-9 pr-3 py-2.5 rounded-xl outline-none transition-all text-sm ${isJar ? 'bg-purple-900/20 border border-purple-500/30 focus:border-purple-500 text-white placeholder-purple-300/40' : (theme === 'doodle' ? 'bg-[#f0f0f0] focus:ring-2 focus:ring-[#4a4a4a] text-[#4a4a4a]' : 'bg-white/5 border border-white/10 focus:border-cyan-400/50 text-white placeholder-slate-500')}`}
                                            placeholder={t.wish_image_placeholder}
                                        />
                                    </div>

                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="hidden"
                                    />

                                    <button
                                        type="button"
                                        onClick={handleUploadClick}
                                        disabled={isUploading}
                                        className={`px-3 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 ${isJar ? 'bg-purple-600 text-white hover:bg-purple-500 border border-purple-400/50' : (theme === 'doodle' ? 'bg-[#4a4a4a] text-white hover:bg-[#2d2d2d]' : 'bg-white/10 text-cyan-400 hover:bg-white/20 border border-white/10')}`}
                                        title={t.upload_from_device}
                                    >
                                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            {imageUrl && (
                                <div className="h-14 w-14 rounded-lg overflow-hidden border mx-auto mt-1">
                                    <img src={imageUrl} alt="preview" className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                                </div>
                            )}


                            <div className="pt-2 flex gap-2">
                                {goal && (
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        disabled={isSaving}
                                        className={`px-4 py-2.5 rounded-xl font-bold text-sm ${isJar ? 'text-purple-300 hover:bg-purple-900/40' : (theme === 'doodle' ? 'text-[#888] hover:bg-gray-100' : 'text-slate-400 hover:bg-white/5')} ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {t.cancel}
                                    </button>
                                )}
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className={`flex-1 py-2.5 px-4 rounded-xl font-black shadow-lg transition-transform flex items-center justify-center gap-2 text-sm
                                        ${isJar ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-purple-500/40' : (theme === 'doodle' ? 'bg-[#4a4a4a] text-white hover:bg-[#333]' : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white')}
                                        ${isSaving ? 'opacity-70 cursor-not-allowed scale-100' : 'active:scale-95'}
                                    `}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        </>
                                    ) : (
                                        <>
                                            <SaveIcon className="w-3.5 h-3.5" /> {t.save}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div >
        </div >
    );
}

function SaveIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
        </svg>
    )
}
