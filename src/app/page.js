'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogIn, Sparkles, ShieldCheck, UserCheck, Shield, ChevronRight, ArrowLeft } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('parent'); // 'parent' or 'kid'
  const [kidStep, setKidStep] = useState('family'); // 'family' | 'member' | 'pin'

  // States for Login
  const [inviteCode, setInviteCode] = useState('');
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedKid, setSelectedKid] = useState(null);
  const [kidPin, setKidPin] = useState('');

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [parentInviteCode, setParentInviteCode] = useState('');

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) router.push('/dashboard');
    });
  }, [router]);

  const handleParentLogin = async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  };

  const handleJoinFamily = async () => {
    if (!parentInviteCode.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('請先點擊 Google 登入後再加入家庭。');
      return;
    }
    const { error } = await supabase.rpc('join_family', { target_family_id: parentInviteCode });
    if (error) alert('加入失敗: ' + error.message);
    else {
      alert('成功加入家庭！');
      router.push('/dashboard');
    }
  };

  // Simplify to one-string family identification
  const findFamily = async () => {
    if (!inviteCode.trim()) return;

    const { data: familyData, error: fError } = await supabase
      .from('families')
      .select('id')
      .eq('short_id', inviteCode.trim())
      .single();

    if (fError || !familyData) {
      return alert('找不到該家庭代碼，請詢問家長。');
    }

    const { data: kids, error: kError } = await supabase
      .from('kids')
      .select('*')
      .eq('family_id', familyData.id);

    if (kError || !kids.length) {
      return alert('該家庭目前沒有小孩成員，請家長先在後台新增。');
    }

    setFamilyMembers(kids);
    setKidStep('member');
  };

  const resetKidFlow = () => {
    setKidStep('family');
    setFamilyMembers([]);
  };

  return (
    <main className="container-center relative overflow-hidden bg-[#050508]">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />

      <div className="glass-panel w-full max-w-[480px] p-8 md:p-12 text-center z-10 border-white/[0.05]">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl border border-cyan-500/30 shadow-inner">
          <Sparkles className="w-8 h-8 text-cyan-400" />
        </div>

        <h1 className="text-4xl font-black mb-6 tracking-tight">
          <span className="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent italic tracking-tighter uppercase">POINTS</span>
          <span className="text-cyan-400 italic"> V3</span>
        </h1>

        {/* Tab Switcher */}
        <div className="flex bg-black/40 p-1 rounded-xl mb-8 border border-white/5">
          <button
            onClick={() => setActiveTab('parent')}
            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'parent' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500'}`}
          >
            <Shield className="w-4 h-4" /> 家長管理
          </button>
          <button
            onClick={() => { setActiveTab('kid'); resetKidFlow(); }}
            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'kid' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500'}`}
          >
            <UserCheck className="w-4 h-4" /> 小孩專區
          </button>
        </div>

        {activeTab === 'parent' ? (
          <div className="space-y-6">
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
              <p className="text-slate-400 text-sm mb-6 leading-relaxed font-medium">使用 Google 帳號登入後即可管理您家庭的點數規則與進度。</p>
              <button onClick={handleParentLogin} className="btn btn-primary w-full group py-4 font-black shadow-xl shadow-cyan-500/10">
                <LogIn className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                GOOGLE 帳號登入
              </button>
            </div>
            <button onClick={() => setShowJoinModal(true)} className="text-cyan-400/60 hover:text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] transition-all">
              我有家庭邀請碼
            </button>
          </div>
        ) : (
          <div className="space-y-6 min-h-[300px] flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4">
            {kidStep === 'family' ? (
              <div className="space-y-6">
                <div className="text-left space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">第一步：輸入家庭訪問碼</label>
                  <input
                    type="text"
                    placeholder="例如: 6b5a7c8d"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 text-white focus:ring-2 focus:ring-cyan-500 outline-none text-center font-bold tracking-[0.2em] text-xl placeholder:text-slate-700 placeholder:text-xs uppercase"
                    value={inviteCode}
                    onChange={e => setInviteCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && findFamily()}
                  />
                </div>
                <button onClick={findFamily} className="btn btn-primary w-full py-5 uppercase font-black tracking-widest shadow-xl shadow-cyan-500/10">
                  進入家庭 🚀
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <button onClick={resetKidFlow} className="text-slate-500 hover:text-white flex items-center gap-1 text-xs font-bold"><ArrowLeft className="w-3 h-3" /> 返回</button>
                  <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">第二步：選你的名字</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {familyMembers.map(m => (
                    <button
                      key={m.id}
                      onClick={() => {
                        localStorage.setItem('kid_session', JSON.stringify(m));
                        router.push('/dashboard');
                      }}
                      className="p-6 bg-white/5 border border-white/10 rounded-3xl text-white font-black hover:bg-cyan-500 hover:text-black hover:border-cyan-400 transition-all text-xl italic uppercase group overflow-hidden relative text-left pl-10"
                    >
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-cyan-400 rounded-full group-hover:scale-150 transition-transform" />
                      {m.name}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest text-center mt-4">提示：家長密碼請在進去後再輸入</p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-slate-500 text-[10px] mt-12 uppercase tracking-[0.3em] font-black opacity-40">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Encrypted Family Storage</span>
        </div>
      </div>

      {/* Join Family Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="glass-panel p-10 max-w-sm w-full border-cyan-500/30">
            <h3 className="text-xl font-black mb-6 italic text-white tracking-tight uppercase">加入現有家庭</h3>
            <div className="space-y-6">
              <input
                type="text"
                placeholder="貼上邀請碼"
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500 outline-none font-mono text-xs text-center"
                value={parentInviteCode}
                onChange={e => setParentInviteCode(e.target.value)}
              />
              <div className="flex gap-4">
                <button onClick={() => setShowJoinModal(false)} className="btn btn-ghost flex-1 text-xs">取消</button>
                <button onClick={handleJoinFamily} className="btn btn-primary flex-1 text-xs font-black">加入家庭</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
