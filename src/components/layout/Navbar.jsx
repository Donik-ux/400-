import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Compass, Menu, X, ChevronDown, User, LogOut, BookOpen, ShieldCheck, Heart, LayoutDashboard, Map } from 'lucide-react';
import { useTranslation } from '../../store/useLangStore';
import useAuthStore  from '../../store/useAuthStore';
import useWishlistStore from '../../store/useWishlistStore';
import GlobalSearch from '../UI/GlobalSearch';
import { langNames } from '../../utils/translations';

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen,   setUserOpen]   = useState(false);
  const [langOpen,   setLangOpen]   = useState(false);
  const navigate                    = useNavigate();
  const { lang, setLang, t }        = useTranslation();
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
        setUserOpen(false); setLangOpen(false);
      }
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const links = [
    { to: '/',             label: t('nav.home')            },
    { to: '/where-to-go',  label: t('nav2.whereToGo')      },
    { to: '/flights',      label: t('nav.flights')         },
    { to: '/hot-tours',    label: t('nav2.hotTours')       },
    { to: '/exotic-tours', label: t('nav.exotic')          },
  ];

  const handleLogout = () => { logout(); navigate('/'); setUserOpen(false); };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-premium ${
        scrolled
          ? 'bg-[#00112b]/80 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,8,24,0.55)] border-b border-white/10'
          : 'bg-gradient-to-r from-[#001026] via-[#002250] to-[#001a3d] border-b border-white/[0.06]'
      }`}>
        {/* ambient gold glow */}
        <div className="pointer-events-none absolute -top-12 left-1/3 w-80 h-24 bg-[#f5b942]/10 blur-3xl rounded-full" />
        {/* Gold hairline accent */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f5b942]/55 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 h-[64px] flex items-center justify-between gap-4">
          {/* Logo */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 group shrink-0">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#ffd76e] via-[#f5b942] to-[#d99a2b] flex items-center justify-center shadow-[0_4px_16px_rgba(245,185,66,0.5)] ring-1 ring-white/30 group-hover:scale-105 group-hover:rotate-[8deg] transition-premium">
              <span className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/40 to-transparent" />
              <Compass className="relative w-[19px] h-[19px] text-[#002250]" strokeWidth={2.5} />
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-[15px] font-black tracking-tight bg-gradient-to-r from-white to-white/75 bg-clip-text text-transparent">MAFTRAVEL</span>
              <span className="text-[9px] font-bold text-[#f5b942] tracking-[0.2em] uppercase mt-1">Travel Smarter</span>
            </div>
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5">
            {links.map(({ to, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-premium ${isActive ? 'text-[#f5b942] bg-[#f5b942]/10' : 'text-white/65 hover:text-white hover:bg-white/[0.07]'}`
                }
              >
                {({ isActive }) => (
                  <span className="relative">
                    {label}
                    <span className={`absolute -bottom-1.5 left-0 right-0 h-[2.5px] rounded-full bg-[#f5b942] transition-premium ${isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`} />
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <div className="mr-1">
              <GlobalSearch />
            </div>

            {/* Wishlist (Desktop) */}
            {user && (
              <button onClick={() => navigate('/wishlist')}
                className="relative p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-premium">
                <Heart className={`w-5 h-5 ${wishlistItems.length > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                {wishlistItems.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#002250]"></span>
                )}
              </button>
            )}

            {/* Language */}
            <div className="relative hidden md:block" data-dropdown>
              <button onClick={() => { setLangOpen(v => !v); setUserOpen(false); }}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-[12px] font-bold text-white/75 hover:text-white hover:bg-white/10 transition-premium border border-white/15">
                {langNames[lang]}
                <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              {langOpen && (
                <div className="absolute right-0 top-full mt-2 w-28 bg-[#002a63] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 page-fade">
                  {Object.entries(langNames).map(([code, label]) => (
                    <button key={code} onClick={() => { setLang(code); setLangOpen(false); }}
                      className={`w-full px-4 py-2.5 text-left text-[12px] font-bold transition-premium ${lang === code ? 'text-[#f5b942] bg-white/[0.06]' : 'text-white/70 hover:bg-white/[0.06] hover:text-white'}`}>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth */}
            {user ? (
              <div className="relative hidden md:block" data-dropdown>
                <button onClick={() => { setUserOpen(v => !v); setLangOpen(false); }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-white/15 hover:border-[#f5b942]/50 hover:bg-white/10 transition-premium">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#f5b942] to-[#d99a2b] flex items-center justify-center text-[11px] font-black text-[#002250] shadow-sm">
                    {user.avatar}
                  </div>
                  <span className="text-[13px] font-semibold text-white max-w-28 truncate">{user.name}</span>
                  <ChevronDown className={`w-3 h-3 text-white/50 transition-transform ${userOpen ? 'rotate-180' : ''}`} />
                </button>
                {userOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#002a63] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 page-fade">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-[13px] font-bold text-white">{user.name}</p>
                      <p className="text-[11px] text-white/45 truncate">{user.email}</p>
                    </div>
                    {user.role === 'admin' && (
                      <button onClick={() => { navigate('/admin'); setUserOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-[#f5b942] hover:bg-white/[0.06] border-b border-white/10 transition-premium">
                        <ShieldCheck className="w-4 h-4" /> {t('nav.adminPanel')}
                      </button>
                    )}
                    <button onClick={() => { navigate('/dashboard'); setUserOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-sky-300 hover:bg-white/[0.06] border-b border-white/10 transition-premium">
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
                      className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-semibold text-red-400 hover:bg-red-500/10 border-t border-white/10 transition-premium">
                      <LogOut className="w-4 h-4" /> {t('nav.signOut')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <button onClick={() => navigate('/login')}
                  className="px-4 py-2 text-[13px] font-semibold text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-premium">
                  {t('nav.signIn')}
                </button>
                <button onClick={() => navigate('/register')}
                  className="px-4 py-2 text-[13px] font-black text-[#002250] bg-gradient-to-br from-[#f5b942] to-[#e0a435] hover:shadow-[0_6px_20px_rgba(245,185,66,0.45)] hover:-translate-y-px rounded-lg shadow-sm transition-premium">
                  {t('nav.register')}
                </button>
              </div>
            )}

            {/* Mobile burger */}
            <button className="md:hidden p-2 rounded-lg border border-white/15 text-white hover:bg-white/10 transition-premium"
              onClick={() => setMobileOpen(v => !v)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 top-[64px] z-40 bg-[#002250] flex flex-col px-4 pt-4 pb-8 gap-1 md:hidden overflow-y-auto page-fade">
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `py-3.5 px-4 rounded-lg text-[14px] font-semibold border-b border-white/10 transition-premium ${isActive ? 'text-[#f5b942] bg-white/[0.06]' : 'text-white'}`
              }>{label}</NavLink>
          ))}
          {user && (
            <>
              <button onClick={() => { navigate('/profile'); setMobileOpen(false); }}
                className="py-3.5 px-4 rounded-lg text-[14px] font-semibold text-white/75 border-b border-white/10 text-left flex items-center gap-2">
                <User className="w-4 h-4" /> {t('nav.myProfile')}
              </button>
              <button onClick={() => { navigate('/my-plans'); setMobileOpen(false); }}
                className="py-3.5 px-4 rounded-lg text-[14px] font-semibold text-white/75 border-b border-white/10 text-left flex items-center gap-2">
                <Map className="w-4 h-4" /> {t('nav2.myTripPlans')}
              </button>
              <button onClick={() => { navigate('/my-bookings'); setMobileOpen(false); }}
                className="py-3.5 px-4 rounded-lg text-[14px] font-semibold text-white/75 border-b border-white/10 text-left flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> {t('nav.myBookings')}
              </button>
              {user.role === 'admin' && (
                <button onClick={() => { navigate('/admin'); setMobileOpen(false); }}
                  className="py-3.5 px-4 rounded-lg text-[14px] font-semibold text-[#f5b942] border-b border-white/10 text-left flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> {t('nav.adminPanel')}
                </button>
              )}
            </>
          )}
          <div className="mt-3 flex gap-2">
            {Object.entries(langNames).map(([code, label]) => (
              <button key={code} onClick={() => setLang(code)}
                className={`px-4 py-2 rounded-lg text-[12px] font-bold border transition-premium ${lang === code ? 'bg-[#f5b942] text-[#002250] border-[#f5b942]' : 'text-white/70 border-white/20'}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2">
            {user ? (
              <button onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="w-full py-3 rounded-lg border border-red-400/30 text-red-400 text-[13px] font-semibold flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" /> {t('nav.signOut')}
              </button>
            ) : (
              <>
                <button onClick={() => { navigate('/login'); setMobileOpen(false); }}
                  className="w-full py-3 rounded-lg border border-[#f5b942]/50 text-[#f5b942] text-[13px] font-bold">
                  {t('nav.signIn')}
                </button>
                <button onClick={() => { navigate('/register'); setMobileOpen(false); }}
                  className="w-full py-3 rounded-lg bg-gradient-to-br from-[#f5b942] to-[#e0a435] text-[#002250] text-[13px] font-black">
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
