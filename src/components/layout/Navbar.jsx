import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, User, LogOut, BookOpen, ShieldCheck, Heart, LayoutDashboard, Map } from 'lucide-react';
import { useTranslation } from '../../store/useLangStore';
import useAuthStore  from '../../store/useAuthStore';
import useWishlistStore from '../../store/useWishlistStore';
import GlobalSearch from '../UI/GlobalSearch';
import LanguageSwitcher from '../LanguageSwitcher';
import CurrencySwitcher from '../CurrencySwitcher';

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen,   setUserOpen]   = useState(false);
  const navigate                    = useNavigate();
  const { t }                       = useTranslation();
  const user    = useAuthStore(s => s.user);
  const logout  = useAuthStore(s => s.logout);
  const wishlistItems = useWishlistStore(s => s.items);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest('[data-dropdown]')) {
        setUserOpen(false);
      }
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const links = [
    { to: '/',             label: t('nav.home')            },
    { to: '/flights',      label: t('nav.flights')         },
    { to: '/exotic-tours', label: t('nav.exotic')          },
  ];

  const handleLogout = () => { logout(); navigate('/'); setUserOpen(false); };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#e8edf1] transition-premium ${
        scrolled ? 'shadow-[0_4px_16px_-6px_rgba(16,24,40,0.16)]' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-[64px] flex items-center justify-between gap-2">
          {/* Logo */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 group shrink-0">
            {/* maf-mark.png is the emblem alone. The full maf-logo.png is a
                1050x725 lockup whose lower third is the words "MAF TRAVEL", so
                squeezing it into a 40px square cropped the artwork and repeated
                the wordmark that already sits beside it in text. */}
            <img src="/images/maf-mark.png" alt="MAF Travel" width="40" height="40"
              className="w-10 h-10 rounded-lg object-contain bg-[#0d1b33] group-hover:scale-105 transition-premium" />
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-[18px] font-black tracking-tight text-[#252a31]">MAFTRAVEL</span>
              <span className="text-[9px] font-bold text-[#008f77] tracking-[0.22em] uppercase mt-1">{t('footer.brandSub')}</span>
            </div>
          </button>

          {/* Desktop links — tighter at lg so long-locale labels never push the
              auth buttons off-screen; full padding returns at xl */}
          <div className="hidden xl:flex items-center gap-1 shrink-0">
            {links.map(({ to, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-premium ${isActive ? 'text-[#0172cb] bg-[#e8f4fd]' : 'text-[#4a5867] hover:text-[#252a31] hover:bg-[#eef2f5]'}`
                }
              >{label}</NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language (Mobile) — desktop gets the full switcher further right */}
            <div className="md:hidden">
              <LanguageSwitcher align="right" showName={false} />
            </div>

            <div className="mr-1">
              <GlobalSearch />
            </div>

            {/* Wishlist (Desktop) */}
            {user && (
              <button onClick={() => navigate('/wishlist')}
                className="relative p-2 rounded-lg text-[#4a5867] hover:text-[#252a31] hover:bg-[#eef2f5] transition-premium">
                <Heart className={`w-5 h-5 ${wishlistItems.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                {wishlistItems.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                )}
              </button>
            )}

            {/* Currency */}
            <div className="hidden md:block">
              <CurrencySwitcher align="right" />
            </div>

            {/* Language — compact (flag + code) so long-locale nav rows fit */}
            <div className="hidden md:block">
              <LanguageSwitcher align="right" showName={false} />
            </div>

            {/* Auth */}
            {user ? (
              <div className="relative hidden md:block" data-dropdown>
                <button onClick={() => { setUserOpen(v => !v); }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-[#dfe7ec] hover:border-[#0172cb] hover:bg-[#eef2f5] transition-premium">
                  <div className="w-7 h-7 rounded-full bg-[#00a58e] flex items-center justify-center text-[11px] font-black text-white">
                    {user.avatar}
                  </div>
                  <span className="text-[13px] font-bold text-[#252a31] max-w-28 truncate">{user.name}</span>
                  <ChevronDown className={`w-3 h-3 text-[#697d95] transition-transform ${userOpen ? 'rotate-180' : ''}`} />
                </button>
                {userOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#1c2127] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 page-fade">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-[13px] font-bold text-white">{user.name}</p>
                      <p className="text-[11px] text-white/45 truncate">{user.email}</p>
                    </div>
                    {user.role === 'admin' && (
                      <button onClick={() => { navigate('/admin'); setUserOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-[#009882] hover:bg-white/[0.06] border-b border-white/10 transition-premium">
                        <ShieldCheck className="w-4 h-4" /> {t('nav.adminPanel')}
                      </button>
                    )}
                    <button onClick={() => { navigate('/dashboard'); setUserOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-[#7fc4c9] hover:bg-white/[0.06] border-b border-white/10 transition-premium">
                      <LayoutDashboard className="w-4 h-4" /> {t('nav2.myDashboard')}
                    </button>
                    <button onClick={() => { navigate('/profile'); setUserOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white transition-premium">
                      <User className="w-4 h-4" /> {t('nav.myProfile')}
                    </button>
                    <button onClick={() => { navigate('/my-plans'); setUserOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white transition-premium">
                      <Map className="w-4 h-4" /> {t('nav2.myTripPlans')}
                    </button>
                    <button onClick={() => { navigate('/wishlist'); setUserOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white transition-premium">
                      <Heart className="w-4 h-4" /> {t('nav2.myWishlist')}
                    </button>
                    <button onClick={() => { navigate('/my-bookings'); setUserOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-white/75 hover:bg-white/[0.06] hover:text-white transition-premium">
                      <BookOpen className="w-4 h-4" /> {t('nav.myBookings')}
                    </button>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-[#ff9c8a] hover:bg-[#ff9c8a]/10 border-t border-white/10 transition-premium">
                      <LogOut className="w-4 h-4" /> {t('nav.signOut')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2 shrink-0">
                <button onClick={() => navigate('/login')}
                  className="px-3 xl:px-4 py-2 text-[13px] font-bold whitespace-nowrap text-[#4a5867] hover:text-[#252a31] hover:bg-[#eef2f5] rounded-full transition-premium">
                  {t('nav.signIn')}
                </button>
                <button onClick={() => navigate('/register')}
                  className="shrink-0 px-4 py-2 text-[13px] font-black whitespace-nowrap text-white bg-[#0172cb] hover:bg-[#015aa3] rounded-full transition-premium">
                  {t('nav.register')}
                </button>
              </div>
            )}

            {/* Burger — also serves md–lg widths where long-locale link rows can't fit */}
            <button className="xl:hidden p-2 rounded-lg border border-[#dfe7ec] text-[#252a31] hover:bg-[#eef2f5] transition-premium"
              onClick={() => setMobileOpen(v => !v)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 top-[64px] z-40 bg-white flex flex-col px-4 pt-4 pb-8 gap-1 xl:hidden overflow-y-auto page-fade">
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `py-3.5 px-4 rounded-lg text-[14px] font-bold border-b border-[#e8edf1] transition-premium ${isActive ? 'text-[#0172cb] bg-[#e8f4fd]' : 'text-[#252a31]'}`
              }>{label}</NavLink>
          ))}
          {user && (
            <>
              <button onClick={() => { navigate('/profile'); setMobileOpen(false); }}
                className="py-3.5 px-4 rounded-lg text-[14px] font-bold text-[#4a5867] border-b border-[#e8edf1] text-left flex items-center gap-2">
                <User className="w-4 h-4" /> {t('nav.myProfile')}
              </button>
              <button onClick={() => { navigate('/my-plans'); setMobileOpen(false); }}
                className="py-3.5 px-4 rounded-lg text-[14px] font-bold text-[#4a5867] border-b border-[#e8edf1] text-left flex items-center gap-2">
                <Map className="w-4 h-4" /> {t('nav2.myTripPlans')}
              </button>
              <button onClick={() => { navigate('/my-bookings'); setMobileOpen(false); }}
                className="py-3.5 px-4 rounded-lg text-[14px] font-bold text-[#4a5867] border-b border-[#e8edf1] text-left flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> {t('nav.myBookings')}
              </button>
              {user.role === 'admin' && (
                <button onClick={() => { navigate('/admin'); setMobileOpen(false); }}
                  className="py-3.5 px-4 rounded-lg text-[14px] font-bold text-[#0172cb] border-b border-[#e8edf1] text-left flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> {t('nav.adminPanel')}
                </button>
              )}
            </>
          )}
          <div className="mt-3 flex flex-col gap-2">
            <CurrencySwitcher align="left" full />
            <LanguageSwitcher align="left" full />
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {user ? (
              <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="w-full py-3 rounded-lg border border-[#eccfc7] text-[#b3402e] text-[13px] font-bold flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" /> {t('nav.signOut')}
              </button>
            ) : (
              <>
                <button onClick={() => { navigate('/login'); setMobileOpen(false); }}
                  className="w-full py-3 rounded-lg border border-[#dfe7ec] text-[#252a31] text-[13px] font-bold">
                  {t('nav.signIn')}
                </button>
                <button onClick={() => { navigate('/register'); setMobileOpen(false); }}
                  className="w-full py-3 rounded-lg bg-[#0172cb] text-white text-[13px] font-black">
                  {t('nav.registerFree')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
