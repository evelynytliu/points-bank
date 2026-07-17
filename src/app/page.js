'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogIn, ShieldCheck, UserCheck, Shield, ArrowLeft, Globe, Loader2 } from 'lucide-react';
import { dictionaries } from '@/lib/dictionaries';
import Logo from '@/components/Logo';

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('parent'); // 'parent' or 'kid'
  const [kidStep, setKidStep] = useState('family'); // 'family' | 'member' | 'pin'

  // States for Login
  const [inviteCode, setInviteCode] = useState('');
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedKid, setSelectedKid] = useState(null);
  const [kidPin, setKidPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Language
  const [language, setLanguage] = useState('zh');
  const t = dictionaries[language] || dictionaries['zh'];

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) router.push('/dashboard');
    });
    // Kids stay logged in via local session — send them straight back to their dashboard
    if (localStorage.getItem('kid_session')) {
      router.push('/dashboard');
    }
  }, [router]);

  useEffect(() => {
    // Force Doodle Theme for Entry Page
    document.body.className = 'theme-doodle';

    // Wrap in setTimeout to avoid 'setState synchronously within effect' lint error
    const timer = setTimeout(() => {
      const savedLang = localStorage.getItem('app_language') || 'zh';
      setLanguage(savedLang);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  const toggleLanguage = () => setLanguage(prev => prev === 'zh' ? 'en' : 'zh');

  const handleParentLogin = async () => {
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });
  };

  // Simplify to one-string family identification
  const findFamily = async () => {
    const code = inviteCode.trim().toUpperCase();
    if (!code) return;
    setErrorMsg('');
    setIsSearching(true);

    try {
      // Use RPC for secure family lookup (requires supabase_security.sql to be run)
      const { data: families, error: fError } = await supabase.rpc('api_find_family', { code });

      if (fError || !families || !families.length) {
        return setErrorMsg(t.alert_no_family);
      }

      const familyId = families[0].id;

      // Use RPC for secure kids lookup
      const { data: kids, error: kError } = await supabase.rpc('api_get_family_kids', { target_family_id: familyId });

      if (kError || !kids.length) {
        return setErrorMsg(t.alert_no_kids);
      }

      // Important: Inject family_id back into kid objects because the RPC might not return it
      // This ensures dashboard has the correct family context
      const kidsWithFamily = kids.map(k => ({ ...k, family_id: familyId }));

      setFamilyMembers(kidsWithFamily);
      setKidStep('member');
    } finally {
      setIsSearching(false);
    }
  };

  const resetKidFlow = () => {
    setKidStep('family');
    setFamilyMembers([]);
    setSelectedKid(null);
    setKidPin('');
    setErrorMsg('');
  };

  const handleKidLogin = () => {
    if (!selectedKid || !kidPin) return;

    if (kidPin === (selectedKid.login_pin || '1234')) {
      localStorage.setItem('kid_session', JSON.stringify(selectedKid));
      router.push('/dashboard');
    } else {
      setErrorMsg(t.alert_pin_error);
      setKidPin('');
    }
  };

  const features = [
    { emoji: '⭐', title: t.feature1_title, desc: t.feature1_desc, bg: 'bg-[#fff8e1]' },
    { emoji: '📺', title: t.feature2_title, desc: t.feature2_desc, bg: 'bg-[#e3f2fd]' },
    { emoji: '🎁', title: t.feature3_title, desc: t.feature3_desc, bg: 'bg-[#fce4ec]' },
  ];

  return (
    <main className="min-h-screen relative overflow-hidden transition-colors duration-500">
      {/* Background Decor */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0,20 Q50,0 100,20 T200,20" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <path d="M0,80 Q50,100 100,80 T200,80" fill="none" stroke="currentColor" strokeWidth="0.5" />
      </svg>

      {/* Top Bar */}
      <div className="relative z-10 max-w-6xl mx-auto flex items-center justify-between px-6 pt-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white border-2 border-[#4a4a4a] shadow-[3px_3px_0px_#ff8a80] flex items-center justify-center overflow-hidden">
            <Logo className="w-7 h-7 text-[#4a4a4a]" />
          </div>
          <span className="font-black text-lg tracking-tight text-[#4a4a4a] uppercase">Points <span className="text-[#ff8a80]">Bank</span></span>
        </div>
        <button
          onClick={toggleLanguage}
          className="px-4 py-2 rounded-full transition-all border-2 flex items-center gap-2 font-black text-xs tracking-[0.15em] bg-white border-[#4a4a4a] text-[#4a4a4a] hover:scale-105 shadow-[3px_3px_0px_#d8c4b6]"
          title="Change Language"
        >
          <Globe className="w-4 h-4" />
          <span>{language === 'zh' ? 'EN' : '中文'}</span>
        </button>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left: Hero & Features */}
        <div className="space-y-10 text-center lg:text-left order-2 lg:order-1">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-[#4a4a4a] shadow-[3px_3px_0px_#d8c4b6] text-sm font-black text-[#4a4a4a]">
              <span className="text-base">👨‍👩‍👧‍👦</span> {t.hero_badge}
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-[#2d2d2d]">
              {t.hero_title_1}<br />
              <span className="relative inline-block mt-1">
                {t.hero_title_2}
                <span className="absolute -bottom-1 left-0 w-full h-4 bg-[#ff8a80]/30 -rotate-1 rounded-full -z-10" />
              </span>
            </h1>
            <p className="text-lg leading-relaxed text-[#666] font-medium max-w-xl mx-auto lg:mx-0">
              {t.hero_subtitle}
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-2 text-sm font-bold text-[#888]">
              <ShieldCheck className="w-4 h-4 text-[#81c784]" />
              <span>{t.free_start}</span>
            </div>
          </div>

          {/* How it works */}
          <div className="space-y-4">
            <div className="text-xs font-black uppercase tracking-[0.3em] text-[#ff8a80]">{t.how_it_works}</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {features.map((f, i) => (
                <div key={i} className={`${f.bg} border-2 border-[#4a4a4a] rounded-[24px_10px_24px_10px] p-5 text-left shadow-[4px_4px_0px_#d8c4b6] transition-transform hover:-translate-y-1`}>
                  <div className="text-3xl mb-3">{f.emoji}</div>
                  <div className="font-black text-[#4a4a4a] mb-1 flex items-center gap-2">
                    <span className="text-xs bg-[#4a4a4a] text-white rounded-full w-5 h-5 inline-flex items-center justify-center">{i + 1}</span>
                    {f.title}
                  </div>
                  <p className="text-sm text-[#666] leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Login Card */}
        <div className="order-1 lg:order-2 w-full max-w-[480px] mx-auto">
          <div className="glass-panel w-full p-8 md:p-10 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 mb-6 transition-all duration-500 overflow-hidden bg-white border-2 border-[#4a4a4a] rounded-full shadow-[4px_4px_0px_#ff8a80]">
              <Logo className="w-16 h-16 text-[#4a4a4a]" />
            </div>

            <h2 className="text-3xl font-black mb-6 tracking-tight flex items-center justify-center gap-2">
              <span className="text-[#4a4a4a] uppercase">POINTS</span>
              <span className="text-[#ff8a80]"> Bank</span>
            </h2>

            {/* Tab Switcher */}
            <div className="flex p-1 rounded-xl mb-8 bg-[#eee] border-[#4a4a4a] border-2 shadow-[2px_2px_0px_#d8c4b6]">
              <button
                onClick={() => { setActiveTab('parent'); setErrorMsg(''); }}
                className={`flex-1 py-3.5 rounded-xl text-base font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'parent' ? 'bg-[#4a4a4a] text-white' : 'text-[#666]'}`}
              >
                <Shield className="w-5 h-5" /> {t.parent}
              </button>
              <button
                onClick={() => { setActiveTab('kid'); resetKidFlow(); }}
                className={`flex-1 py-3.5 rounded-xl text-base font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'kid' ? 'bg-[#4a4a4a] text-white' : 'text-[#666]'}`}
              >
                <UserCheck className="w-5 h-5" /> {t.kid}
              </button>
            </div>

            {/* Inline Error Message */}
            {errorMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-[#fff0ef] border-2 border-[#ff8a80] text-[#d84315] text-sm font-bold animate-in fade-in slide-in-from-top-2 duration-300" role="alert">
                {errorMsg}
              </div>
            )}

            {activeTab === 'parent' ? (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="p-6 border rounded-2xl bg-[#fcfbf9] border-[#4a4a4a] border-dashed border-2">
                  <p className="text-lg mb-6 leading-relaxed font-medium text-[#555]">
                    {t.doodle_desc}
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
                      <label className="text-base font-black uppercase tracking-widest ml-1 text-[#555]">{t.step1_title}</label>
                      <input
                        type="text"
                        placeholder={t.step1_placeholder}
                        className="w-full rounded-2xl p-5 focus:ring-2 outline-none text-center font-bold tracking-[0.2em] text-2xl transition-all bg-[#fff] border-2 border-[#4a4a4a] text-[#4a4a4a] focus:ring-[#ff8a80] placeholder:text-[#ccc] shadow-[4px_4px_0px_#d8c4b6] placeholder:text-xs uppercase"
                        value={inviteCode}
                        onChange={e => setInviteCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                        onKeyDown={(e) => e.key === 'Enter' && findFamily()}
                      />
                    </div>
                    <button onClick={findFamily} disabled={isSearching} className="btn btn-primary w-full py-5 uppercase font-black tracking-widest shadow-xl disabled:opacity-60">
                      {isSearching ? (<><Loader2 className="w-5 h-5 animate-spin" /> {t.searching}</>) : t.enter_family}
                    </button>
                  </div>
                ) : kidStep === 'member' ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-2">
                      <button onClick={resetKidFlow} className="text-[#555] hover:text-[#2d2d2d] flex items-center gap-1 text-lg font-bold transition-colors"><ArrowLeft className="w-5 h-5" /> {t.back}</button>
                      <span className="text-base font-black uppercase tracking-widest text-[#ff8a80]">{t.step2_title}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {familyMembers.map(m => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setSelectedKid(m);
                            setKidStep('pin');
                            setErrorMsg('');
                          }}
                          className="p-6 border rounded-3xl font-black transition-all text-xl italic uppercase group overflow-hidden relative text-left pl-14 bg-white border-2 border-[#4a4a4a] text-[#4a4a4a] hover:bg-[#fff5f4] hover:border-[#ff8a80] shadow-[4px_4px_0px_#d8c4b6]"
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
                      <button onClick={() => { setKidStep('member'); setErrorMsg(''); }} className="text-[#555] hover:text-[#2d2d2d] flex items-center gap-1 text-lg font-bold transition-colors"><ArrowLeft className="w-5 h-5" /> {t.back}</button>
                      <span className="text-base font-black uppercase tracking-widest text-[#ff8a80]">{t.step3_title}</span>
                    </div>
                    <div className="text-center space-y-4">
                      <div className="text-4xl mb-2">{selectedKid?.avatar || '👶'}</div>
                      <h3 className="font-black text-2xl text-[#4a4a4a]">{selectedKid?.name}</h3>
                      <input
                        autoFocus
                        type="password"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        placeholder="****"
                        className="w-40 rounded-2xl p-4 focus:ring-2 outline-none text-center font-bold tracking-[0.5em] text-3xl transition-all bg-[#fff] border-2 border-[#4a4a4a] text-[#4a4a4a] focus:ring-[#ff8a80] placeholder:text-[#ccc] shadow-[4px_4px_0px_#d8c4b6]"
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

            <div className="flex items-center justify-center gap-2 mt-10 text-sm uppercase tracking-[0.3em] font-black opacity-40 text-[#555]">
              <ShieldCheck className="w-4 h-4" />
              <span>{t.encrypted_storage}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center pb-8 px-6">
        <p className="text-sm font-bold text-[#aaa]">
          Points Bank · {t.landing_footer}
        </p>
      </footer>
    </main>
  );
}
