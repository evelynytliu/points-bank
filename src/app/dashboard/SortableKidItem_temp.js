
function SortableKidItem({
    kid,
    family,
    t,
    editingKidId,
    editName,
    setEditName,
    editPin,
    setEditPin,
    saveEditKid,
    cancelEditKid,
    startEditKid,
    deleteKid,
    showAvatarPicker,
    setShowAvatarPicker,
    updateKidAvatar
}) {
    const dragControls = useDragControls();

    return (
        <Reorder.Item
            value={kid}
            className="relative"
            dragListener={false}
            dragControls={dragControls}
        >
            <div className={`p-4 rounded-2xl border ${family?.theme === 'doodle' ? 'bg-[#fdfbf7] border-[#eee]' : 'bg-white/5 border-white/5'} cursor-default select-none flex flex-col md:flex-row md:items-center gap-3 md:gap-4`}>
                {/* Left: Avatar & Name */}
                <div className="flex items-center gap-3 w-full md:w-auto md:flex-1 min-w-0">
                    <div
                        className={`p-2 rounded-lg cursor-grab active:cursor-grabbing touch-none ${family?.theme === 'doodle' ? 'text-[#ccc] hover:bg-black/5' : 'text-slate-600 hover:bg-white/5'}`}
                        onPointerDown={(e) => dragControls.start(e)}
                    >
                        <GripVertical className="w-5 h-5" />
                    </div>
                    <button
                        onClick={() => setShowAvatarPicker(showAvatarPicker === kid.id ? null : kid.id)}
                        className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-xl transition-all hover:scale-110 active:scale-95 ${family?.theme === 'doodle' ? 'bg-white shadow-sm border-[#eee]' : 'bg-black/40 border-white/10'} border`}
                    >
                        {kid.avatar || '👶'}
                    </button>
                    {editingKidId === kid.id ? (
                        <input
                            autoFocus
                            className={`flex-1 min-w-0 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-cyan-500 ${family?.theme === 'doodle' ? 'bg-white border-[#4a4a4a] text-[#4a4a4a]' : 'text-white'}`}
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder={t.enter_kid_name}
                        />
                    ) : (
                        <span className={`font-bold truncate text-lg ${family?.theme === 'doodle' ? 'text-[#4a4a4a]' : 'text-white'}`}>{kid.name}</span>
                    )}
                </div>

                {/* Right: PIN & Actions */}
                <div className={`flex items-center justify-between md:justify-end gap-4 w-full md:w-auto ${editingKidId === kid.id ? 'pl-0' : 'pl-14 md:pl-0'}`}>
                    {editingKidId === kid.id ? (
                        // Edit Mode: PIN Input
                        <div className="flex items-center gap-2">
                            <label className={`text-xs font-black uppercase ${family?.theme === 'doodle' ? 'text-slate-400' : 'text-slate-500'}`}>PIN</label>
                            <input
                                type="text"
                                maxLength={4}
                                className={`w-16 text-center font-mono text-sm py-1.5 rounded-lg border focus:outline-none focus:ring-1 ${family?.theme === 'doodle' ? 'bg-white border-[#4a4a4a] text-[#4a4a4a] focus:ring-[#ff8a80]' : 'bg-black/40 border-white/10 text-cyan-400 focus:ring-cyan-500'}`}
                                value={editPin}
                                onChange={(e) => setEditPin(e.target.value.replace(/\D/g, ''))}
                            />
                        </div>
                    ) : (
                        // Display Mode: Text Only PIN
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black uppercase tracking-wider ${family?.theme === 'doodle' ? 'text-[#ccc]' : 'text-slate-600'}`}>PIN</span>
                            <span className={`font-mono font-bold text-sm ${family?.theme === 'doodle' ? 'text-[#888]' : 'text-slate-400'}`}>
                                {kid.login_pin || '1234'}
                            </span>
                        </div>
                    )}

                    {editingKidId === kid.id ? (
                        <div className="flex gap-1">
                            <button onClick={() => saveEditKid(kid.id)} className="p-2 text-green-500 hover:scale-110 transition-all rounded-full hover:bg-green-500/10" title="儲存"><CheckCircle2 className="w-5 h-5" /></button>
                            <button onClick={cancelEditKid} className="p-2 text-red-500 hover:scale-110 transition-all rounded-full hover:bg-red-500/10" title="取消"><X className="w-5 h-5" /></button>
                        </div>
                    ) : (
                        <div className="flex gap-1">
                            <button onClick={() => startEditKid(kid)} className={`p-2 rounded-xl transition-all ${family?.theme === 'doodle' ? 'text-slate-400 hover:text-blue-500 hover:bg-blue-50' : 'text-slate-500 hover:text-blue-400 hover:bg-blue-500/20'}`} title="修改資料"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => deleteKid(kid)} className={`p-2 rounded-xl transition-all ${family?.theme === 'doodle' ? 'text-slate-400 hover:text-[#ff8a80] hover:bg-red-50' : 'text-slate-500 hover:text-red-400 hover:bg-red-500/20'}`} title="刪除小孩"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    )}
                </div>
            </div>

            {/* Avatar Picker Overlay */}
            {showAvatarPicker === kid.id && (
                <div className="absolute top-16 left-0 z-10 w-full p-4 bg-[#2a2a2a] rounded-2xl shadow-2xl border border-white/10 animate-in fade-in zoom-in-95 duration-200">
                    <div className="grid grid-cols-8 gap-2">
                        {AVATARS.map(emoji => (
                            <button
                                key={emoji}
                                onClick={() => updateKidAvatar(kid.id, emoji)}
                                className={`p-2 text-xl rounded-xl hover:bg-black/5 flex items-center justify-center transition-all hover:scale-125 ${kid.avatar === emoji ? 'bg-orange-400/20' : ''}`}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </Reorder.Item>
    );
}
