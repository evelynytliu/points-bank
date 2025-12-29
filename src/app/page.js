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

  const [theme, setTheme] = useState('cyber');

  useEffect(() => {
    const savedTheme = localStorage.getItem('family_theme') || 'doodle';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (theme === 'doodle') {
      document.body.classList.add('theme-doodle');
    } else {
      document.body.classList.remove('theme-doodle');
    }
    localStorage.setItem('family_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'cyber' ? 'doodle' : 'cyber');

  return (
    <main className={`min-h-screen flex items-center justify-center relative overflow-hidden p-4 transition-colors duration-500`}>
      {/* Background Decor */}
      {theme === 'cyber' ? (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
        </>
      ) : (
        <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,20 Q50,0 100,20 T200,20" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M0,80 Q50,100 100,80 T200,80" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      )}

      <div className="glass-panel w-full max-w-[480px] p-8 md:p-12 text-center z-10">
        <div className={`inline-flex items-center justify-center w-16 h-16 mb-6 transition-all duration-500 ${theme === 'cyber' ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl border border-cyan-500/30' : 'bg-white border-2 border-[#4a4a4a] rounded-full shadow-[4px_4px_0px_#ff8a80]'}`}>
          <Sparkles className={`w-8 h-8 ${theme === 'cyber' ? 'text-cyan-400' : 'text-[#ff8a80]'}`} />
        </div>

        <h1 className="text-4xl font-black mb-6 tracking-tight">
          <span className={`${theme === 'cyber' ? 'bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent italic' : 'text-[#4a4a4a]'} uppercase`}>POINTS</span>
          <span className={theme === 'cyber' ? 'text-cyan-400 italic' : 'text-[#ff8a80]'}> V3</span>
        </h1>

        {/* Tab Switcher */}
        <div className={`flex p-1 rounded-xl mb-8 border ${theme === 'cyber' ? 'bg-black/40 border-white/5' : 'bg-[#eee] border-[#4a4a4a] border-2 shadow-[2px_2px_0px_#d8c4b6]'}`}>
          <button
            onClick={() => setActiveTab('parent')}
            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'parent'
              ? (theme === 'cyber' ? 'bg-white/10 text-white shadow-lg' : 'bg-[#4a4a4a] text-white')
              : (theme === 'cyber' ? 'text-slate-500' : 'text-[#888]')
              }`}
          >
            <Shield className="w-4 h-4" /> 家長管理
          </button>
          <button
            onClick={() => { setActiveTab('kid'); resetKidFlow(); }}
            className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'kid'
              ? (theme === 'cyber' ? 'bg-white/10 text-white shadow-lg' : 'bg-[#4a4a4a] text-white')
              : (theme === 'cyber' ? 'text-slate-500' : 'text-[#888]')
              }`}
          >
            <UserCheck className="w-4 h-4" /> 小孩專區
          </button>
        </div>

        {activeTab === 'parent' ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className={`p-6 border rounded-2xl ${theme === 'cyber' ? 'bg-white/[0.02] border-white/5' : 'bg-[#fcfbf9] border-[#4a4a4a] border-dashed border-2'}`}>
              <p className={`text-sm mb-6 leading-relaxed font-medium ${theme === 'cyber' ? 'text-slate-400' : 'text-[#777]'}`}>
                {theme === 'cyber' ? '使用 Google 帳號登入後即可管理規則與進度。' : '登入家長帳號，開始這段溫馨的管教旅程。'}
              </p>
              <button onClick={handleParentLogin} className="btn btn-primary w-full group py-4 font-black shadow-xl">
                <LogIn className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                GOOGLE 帳號登入
              </button>
            </div>
            <button onClick={() => setShowJoinModal(true)} className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-110 ${theme === 'cyber' ? 'text-cyan-400/60 hover:text-cyan-400' : 'text-[#ff8a80]'}`}>
              我有家庭邀請碼
            </button>
          </div>
        ) : (
          <div className="space-y-6 min-h-[300px] flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            {kidStep === 'family' ? (
              <div className="space-y-6">
                <div className="text-left space-y-1">
                  <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'cyber' ? 'text-slate-500' : 'text-[#888]'}`}>第一步：輸入家庭訪問碼</label>
                  <input
                    type="text"
                    placeholder="例如: 6b5a7c8d"
                    className={`w-full rounded-2xl p-5 focus:ring-2 outline-none text-center font-bold tracking-[0.2em] text-xl transition-all ${theme === 'cyber'
                      ? 'bg-black/40 border border-white/10 text-white focus:ring-cyan-500 placeholder:text-slate-700'
                      : 'bg-[#fff] border-2 border-[#4a4a4a] text-[#4a4a4a] focus:ring-[#ff8a80] placeholder:text-[#ccc] shadow-[4px_4px_0px_#d8c4b6]'
                      } placeholder:text-xs uppercase`}
                    value={inviteCode}
                    onChange={e => setInviteCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && findFamily()}
                  />
                </div>
                <button onClick={findFamily} className="btn btn-primary w-full py-5 uppercase font-black tracking-widest shadow-xl">
                  進入家庭 🚀
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <button onClick={resetKidFlow} className={`${theme === 'cyber' ? 'text-slate-500 hover:text-white' : 'text-[#888] hover:text-[#2d2d2d]'} flex items-center gap-1 text-xs font-bold transition-colors`}><ArrowLeft className="w-3 h-3" /> 返回</button>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${theme === 'cyber' ? 'text-cyan-400' : 'text-[#ff8a80]'}`}>第二步：選你的名字</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {familyMembers.map(m => (
                    <button
                      key={m.id}
                      onClick={() => {
                        localStorage.setItem('kid_session', JSON.stringify(m));
                        router.push('/dashboard');
                      }}
                      className={`p-6 border rounded-3xl font-black transition-all text-xl italic uppercase group overflow-hidden relative text-left pl-10 shadow-lg ${theme === 'cyber'
                        ? 'bg-white/5 border-white/10 text-white hover:bg-cyan-500 hover:text-black hover:border-cyan-400'
                        : 'bg-white border-2 border-[#4a4a4a] text-[#4a4a4a] hover:bg-[#fff5f4] hover:border-[#ff8a80] shadow-[4px_4px_0px_#d8c4b6]'
                        }`}
                    >
                      <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full group-hover:scale-150 transition-transform ${theme === 'cyber' ? 'bg-cyan-400' : 'bg-[#ff8a80]'}`} />
                      {m.name}
                    </button>
                  ))}
                </div>
                <p className={`text-[10px] font-bold uppercase tracking-widest text-center mt-4 ${theme === 'cyber' ? 'text-slate-600' : 'text-[#aaa]'}`}>提示：家長密碼請在進去後再輸入</p>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col items-center gap-4 mt-12">
          <div className={`flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.3em] font-black opacity-40 ${theme === 'cyber' ? 'text-slate-500' : 'text-[#888]'}`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Encrypted Family Storage</span>
          </div>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-all hover:rotate-45 ${theme === 'cyber' ? 'text-cyan-400/40 hover:text-cyan-400' : 'text-[#ff8a80]/40 hover:text-[#ff8a80]'}`}
            title="切換風格"
          >
            {theme === 'cyber' ? <Sparkles className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Join Family Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className={`glass-panel p-10 max-w-sm w-full border ${theme === 'cyber' ? 'border-cyan-500/30' : 'border-[#4a4a4a] border-2 shadow-[8px_8px_0px_#d8c4b6]'}`}>
            <h3 className={`text-xl font-black mb-6 italic tracking-tight uppercase ${theme === 'cyber' ? 'text-white' : 'text-[#4a4a4a]'}`}>加入現有家庭</h3>
            <div className="space-y-6">
              <input
                type="text"
                placeholder="貼上邀請碼"
                className={`w-full rounded-xl p-4 focus:ring-2 outline-none font-mono text-xs text-center ${theme === 'cyber'
                  ? 'bg-black/40 border border-white/10 text-white focus:ring-cyan-500'
                  : 'bg-[#fff] border-2 border-[#4a4a4a] text-[#4a4a4a] focus:ring-[#ff8a80]'
                  }`}
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
