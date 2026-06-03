import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, Mail, Lock, Eye, EyeOff, AlertCircle, UserCheck, Plane, Globe2, ShieldCheck } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useSEO from '../hooks/useSEO';
import { useTranslation } from '../store/useLangStore';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [show, setShow]       = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  useSEO({
    title: 'Sign In — Your Travel Account',
    description: 'Sign in to your MAFTRAVEL account to manage bookings, save itineraries, and access exclusive travel deals.',
    keywords: ['MAFTRAVEL login', 'travel account', 'sign in'],
  });

  const login      = useAuthStore(s => s.login);
  const guestLogin = useAuthStore(s => s.guestLogin);
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const result = login(form.email, form.password);
    setLoading(false);
    if (result.success) navigate(from, { replace: true });
    else setError(result.error);
  };

  const handleGuest = () => {
    guestLogin();
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] grid lg:grid-cols-2">

      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#003580] via-[#00306f] to-[#002250] p-12 text-white">
        {/* Floating accents */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="animate-float absolute -top-10 -right-10 w-72 h-72 rounded-full bg-[#0071c2]/30 blur-3xl" />
          <div className="animate-float absolute bottom-0 -left-16 w-80 h-80 rounded-full bg-[#febb02]/15 blur-3xl" style={{ animationDelay: '1.5s' }} />
          <Plane className="animate-float absolute top-24 right-24 w-10 h-10 text-white/15" style={{ animationDelay: '0.6s' }} />
          <Globe2 className="animate-float absolute bottom-28 left-24 w-12 h-12 text-white/10" style={{ animationDelay: '2.2s' }} />
        </div>

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <Compass className="w-5 h-5 text-[#febb02]" />
          </div>
          <span className="text-xl font-black tracking-tight">MAFTRAVEL</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-black leading-tight tracking-tight mb-4">
            {t('auth.login.heroLine1')}<br />{t('auth.login.heroLine2')}
          </h2>
          <p className="text-white/70 text-[15px] leading-relaxed mb-8">
            {t('auth.login.heroSub')}
          </p>
          <div className="flex flex-col gap-3 text-sm text-white/80">
            <div className="flex items-center gap-3"><ShieldCheck className="w-4 h-4 text-[#febb02] shrink-0" /> {t('auth.login.trustSecure')}</div>
            <div className="flex items-center gap-3"><Globe2 className="w-4 h-4 text-[#febb02] shrink-0" /> {t('auth.login.trustTravelers')}</div>
          </div>
        </div>

        <div className="relative z-10 text-white/40 text-xs">{t('auth.copyright')}</div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm page-fade">

        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8 lg:hidden">
          <div className="w-9 h-9 rounded-lg bg-[#003580] flex items-center justify-center">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-[#003580]">MAFTRAVEL</span>
        </div>

        <div className="bg-white border border-[#e7e7e7] rounded-2xl p-7 shadow-lift">
          <h1 className="text-2xl font-black text-[#1a1a1a] mb-1">{t('auth.login.title')}</h1>
          <p className="text-[#9ca3af] text-sm mb-6">{t('auth.login.sub')}</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1.5 block">
                {t('auth.login.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c9d1d9]" />
                <input type="email" required value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder={t('auth.login.emailPlaceholder')}
                  className="w-full bg-white border-[1.5px] border-[#e7e7e7] rounded-xl pl-10 pr-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#c9d1d9] focus:outline-none focus:border-[#0071c2] focus:ring-2 focus:ring-[#0071c2]/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1.5 block">
                {t('auth.login.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#c9d1d9]" />
                <input type={show ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder={t('auth.login.passwordPlaceholder')}
                  className="w-full bg-white border-[1.5px] border-[#e7e7e7] rounded-xl pl-10 pr-10 py-3 text-sm text-[#1a1a1a] placeholder:text-[#c9d1d9] focus:outline-none focus:border-[#0071c2] focus:ring-2 focus:ring-[#0071c2]/10 transition-all"
                />
                <button type="button" onClick={() => setShow(v => !v)}
                  aria-label={show ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c9d1d9] hover:text-[#595959] transition-all">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-[#0071c2] text-white text-[14px] font-bold hover:bg-[#005fa3] transition-premium disabled:opacity-50 disabled:cursor-not-allowed mt-1 flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(0,113,194,0.3)]">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('auth.login.submitting')}</>
              ) : (
                <>{t('auth.login.submit')}</>
              )}
            </button>
          </form>

          <p className="text-center text-[#9ca3af] text-sm mt-5">
            {t('auth.login.noAccount')}{' '}
            <Link to="/register" className="text-[#0071c2] hover:text-[#003580] font-bold transition-all">{t('auth.login.create')}</Link>
          </p>

          <button type="button" onClick={handleGuest}
            className="w-full mt-3 py-3 rounded-xl border-[1.5px] border-[#e7e7e7] bg-white text-[#1a1a1a] text-[14px] font-bold hover:border-[#0071c2]/40 hover:bg-[#f8f9fa] transition-premium flex items-center justify-center gap-2">
            <UserCheck className="w-4 h-4 text-[#0071c2]" />
            {t('auth.login.guest')}
          </button>
        </div>

        <div className="mt-4 p-3 bg-white border border-[#e7e7e7] rounded-xl text-center shadow-soft">
          <p className="text-[#c9d1d9] text-xs">
            {t('auth.login.adminLabel')} <span className="text-[#9ca3af]">admin@maftravel.com</span> / <span className="text-[#9ca3af]">Admin@2026</span>
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
