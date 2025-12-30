'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogIn, Sparkles, ShieldCheck, UserCheck, Shield, ChevronRight, ArrowLeft } from 'lucide-react';
import { dictionaries } from '@/lib/dictionaries';

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('parent'); // 'parent' or 'kid'
  const [kidStep, setKidStep] = useState('family'); // 'family' | 'member' | 'pin'

  // States for Login
  const [inviteCode, setInviteCode] = useState('');
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedKid, setSelectedKid] = useState(null);
  const [kidPin, setKidPin] = useState('');


  // Theme & Language

  // Theme & Language
  const [theme, setTheme] = useState('doodle');
  const [language, setLanguage] = useState('zh');
  // Avoid errors if dictionary is missing for some reason, fallback to zh
  const t = dictionaries[language] || dictionaries['zh'];

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) router.push('/dashboard');
    });
  }, [router]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('family_theme') || 'doodle';
    setTheme(savedTheme);
    const savedLang = localStorage.getItem('app_language') || 'zh';
    setLanguage(savedLang);
  }, []);

  useEffect(() => {
    if (theme === 'doodle') {
      document.body.classList.add('theme-doodle');
    } else {
      document.body.classList.remove('theme-doodle');
    }
    localStorage.setItem('family_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  const toggleTheme = () => setTheme(prev => prev === 'cyber' ? 'doodle' : 'cyber');
  const toggleLanguage = () => setLanguage(prev => prev === 'zh' ? 'en' : 'zh');

  const handleParentLogin = async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  };



  // Simplify to one-string family identification
  const findFamily = async () => {
    const code = inviteCode.trim().toUpperCase();
    if (!code) return;

    // 判斷是否為 UUID 格式 (避免 type error)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(code);

    let query = supabase.from('families').select('id');

    if (isUuid) {
      query = query.eq('id', code);
    } else {
      query = query.eq('short_id', code);
    }

    const { data: families, error: fError } = await query;

    if (fError || !families || !families.length) {
      return alert(t.alert_no_family);
    }

    const familyId = families[0].id;

    const { data: kids, error: kError } = await supabase
      .from('kids')
      .select('*')
      .eq('family_id', familyId);

    if (kError || !kids.length) {
      return alert(t.alert_no_kids);
    }

    setFamilyMembers(kids);
    setKidStep('member');
  };

  const resetKidFlow = () => {
    setKidStep('family');
    setFamilyMembers([]);
    setSelectedKid(null);
    setKidPin('');
  };

  const handleKidLogin = () => {
    if (!selectedKid || !kidPin) return;

    if (kidPin === (selectedKid.login_pin || '1234')) {
      localStorage.setItem('kid_session', JSON.stringify(selectedKid));
      router.push('/dashboard');
    } else {
      alert(t.alert_pin_error);
      setKidPin('');
    }
  };

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
          <span className={theme === 'cyber' ? 'text-cyan-400 italic' : 'text-[#ff8a80]'}> Bank</span>
        </h1>

        {/* Tab Switcher */}
        <div className={`flex p-1 rounded-xl mb-8 border ${theme === 'cyber' ? 'bg-black/40 border-white/5' : 'bg-[#eee] border-[#4a4a4a] border-2 shadow-[2px_2px_0px_#d8c4b6]'}`}>
          <button
            onClick={() => setActiveTab('parent')}
            className={`flex-1 py-3.5 rounded-xl text-base font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'parent'
              ? (theme === 'cyber' ? 'bg-white/10 text-white shadow-lg' : 'bg-[#4a4a4a] text-white')
              : (theme === 'cyber' ? 'text-slate-500' : 'text-[#666]')
              }`}
          >
            <Shield className="w-5 h-5" /> {t.parent}
          </button>
          <button
            onClick={() => { setActiveTab('kid'); resetKidFlow(); }}
            className={`flex-1 py-3.5 rounded-xl text-base font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'kid'
              ? (theme === 'cyber' ? 'bg-white/10 text-white shadow-lg' : 'bg-[#4a4a4a] text-white')
              : (theme === 'cyber' ? 'text-slate-500' : 'text-[#666]')
              }`}
          >
            <UserCheck className="w-5 h-5" /> {t.kid}
          </button>
        </div>

        {activeTab === 'parent' ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className={`p-6 border rounded-2xl ${theme === 'cyber' ? 'bg-white/[0.02] border-white/5' : 'bg-[#fcfbf9] border-[#4a4a4a] border-dashed border-2'}`}>
              <p className={`text-base mb-6 leading-relaxed font-medium ${theme === 'cyber' ? 'text-slate-400' : 'text-[#555]'}`}>
                {theme === 'cyber' ? t.login_desc : t.doodle_desc}
              </p>
              <button onClick={handleParentLogin} className="btn btn-primary w-full group py-4 font-black shadow-xl">
                <LogIn className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                {t.login_google}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 min-h-[300px] flex flex-col justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            {kidStep === 'family' ? (
              <div className="space-y-6">
                <div className="text-left space-y-1">
                  <label className={`text-sm font-black uppercase tracking-widest ml-1 ${theme === 'cyber' ? 'text-slate-500' : 'text-[#555]'}`}>{t.step1_title}</label>
                  <input
                    type="text"
                    placeholder={t.step1_placeholder}
                    className={`w-full rounded-2xl p-5 focus:ring-2 outline-none text-center font-bold tracking-[0.2em] text-xl transition-all ${theme === 'cyber'
                      ? 'bg-black/40 border border-white/10 text-white focus:ring-cyan-500 placeholder:text-slate-700'
                      : 'bg-[#fff] border-2 border-[#4a4a4a] text-[#4a4a4a] focus:ring-[#ff8a80] placeholder:text-[#ccc] shadow-[4px_4px_0px_#d8c4b6]'
                      } placeholder:text-xs uppercase`}
                    value={inviteCode}
                    onChange={e => setInviteCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                    onKeyDown={(e) => e.key === 'Enter' && findFamily()}
                  />
                </div>
                <button onClick={findFamily} className="btn btn-primary w-full py-5 uppercase font-black tracking-widest shadow-xl">
                  {t.enter_family}
                </button>
              </div>
            ) : kidStep === 'member' ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <button onClick={resetKidFlow} className={`${theme === 'cyber' ? 'text-slate-500 hover:text-white' : 'text-[#555] hover:text-[#2d2d2d]'} flex items-center gap-1 text-base font-bold transition-colors`}><ArrowLeft className="w-4 h-4" /> {t.back}</button>
                  <span className={`text-sm font-black uppercase tracking-widest ${theme === 'cyber' ? 'text-cyan-400' : 'text-[#ff8a80]'}`}>{t.step2_title}</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {familyMembers.map(m => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedKid(m);
                        setKidStep('pin');
                      }}
                      className={`p-6 border rounded-3xl font-black transition-all text-xl italic uppercase group overflow-hidden relative text-left pl-14 shadow-lg ${theme === 'cyber'
                        ? 'bg-white/5 border-white/10 text-white hover:bg-cyan-500 hover:text-black hover:border-cyan-400'
                        : 'bg-white border-2 border-[#4a4a4a] text-[#4a4a4a] hover:bg-[#fff5f4] hover:border-[#ff8a80] shadow-[4px_4px_0px_#d8c4b6]'
                        }`}
                    >
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">
                        {m.avatar || '👶'}
                      </div>
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <button onClick={() => setKidStep('member')} className={`${theme === 'cyber' ? 'text-slate-500 hover:text-white' : 'text-[#555] hover:text-[#2d2d2d]'} flex items-center gap-1 text-base font-bold transition-colors`}><ArrowLeft className="w-4 h-4" /> {t.back}</button>
                  <span className={`text-sm font-black uppercase tracking-widest ${theme === 'cyber' ? 'text-cyan-400' : 'text-[#ff8a80]'}`}>{t.step3_title}</span>
                </div>
                <div className="text-center space-y-4">
                  <div className="text-4xl mb-2">{selectedKid?.avatar || '👶'}</div>
                  <h3 className={`font-black text-2xl ${theme === 'cyber' ? 'text-white' : 'text-[#4a4a4a]'}`}>{selectedKid?.name}</h3>
                  <input
                    autoFocus
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    placeholder="****"
                    className={`w-32 rounded-2xl p-4 focus:ring-2 outline-none text-center font-bold tracking-[0.5em] text-2xl transition-all ${theme === 'cyber'
                      ? 'bg-black/40 border border-white/10 text-white focus:ring-cyan-500 placeholder:text-slate-700'
                      : 'bg-[#fff] border-2 border-[#4a4a4a] text-[#4a4a4a] focus:ring-[#ff8a80] placeholder:text-[#ccc] shadow-[4px_4px_0px_#d8c4b6]'
                      }`}
                    value={kidPin}
                    onChange={e => setKidPin(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleKidLogin()}
                  />
                </div>
                <button onClick={handleKidLogin} className="btn btn-primary w-full py-5 uppercase font-black tracking-widest shadow-xl">
                  {t.login_points_bank}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col items-center gap-4 mt-12">
          <div className={`flex items-center justify-center gap-2 text-sm uppercase tracking-[0.3em] font-black opacity-40 ${theme === 'cyber' ? 'text-slate-500' : 'text-[#555]'}`}>
            <ShieldCheck className="w-4 h-4" />
            <span>{t.encrypted_storage}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-full transition-all hover:rotate-12 border items-center justify-center flex ${theme === 'cyber' ? 'bg-white/10 border-white/20 text-cyan-400 hover:bg-white/20 hover:scale-110 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-white border-2 border-[#4a4a4a] text-[#ff8a80] hover:scale-110 shadow-[4px_4px_0px_#d8c4b6]'}`}
              title="切換風格 / Switch Theme"
            >
              {theme === 'cyber' ? <Sparkles className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleLanguage}
              className={`p-3.5 rounded-full transition-all hover:scale-110 border items-center justify-center flex font-black text-sm ${theme === 'cyber' ? 'bg-white/10 border-white/20 text-cyan-400 hover:bg-white/20 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'bg-white border-2 border-[#4a4a4a] text-[#ff8a80] shadow-[4px_4px_0px_#d8c4b6]'}`}
              title="切換語言 / Switch Language"
            >
              {language === 'zh' ? 'EN' : '中'}
            </button>
          </div>
        </div>
      </div>

      {/* Join Family Modal */}

    </main>
  );
}
