import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, Mail, Phone, MapPin, Send } from 'lucide-react';
import { useTranslation } from '../store/useLangStore';

export default function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);

  const nav = [
    { label: t('nav.home'),         to: '/'            },
    { label: t('nav.planner'),      to: '/planner'     },
    { label: t('nav2.whereToGoFooter'), to: '/where-to-go' },
    { label: t('nav.flights'),      to: '/flights'     },
    { label: t('nav2.tools'),       to: '/tools'       },
  ];

  const support = [
    { label: t('footer.supportLinks.support'), to: '#'        },
    { label: t('footer.supportLinks.contact'), to: '#'        },
    { label: t('nav2.termsOfUse'),             to: '/terms'   },
    { label: t('nav2.privacyPolicy'),          to: '/privacy' },
    { label: t('nav2.cookiePolicy'),           to: '/cookies' },
  ];

  return (
    <footer className="relative w-full bg-gradient-to-b from-[#003580] to-[#002250] text-white mt-12">
      {/* Gold hairline to echo the navbar accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#f5b942]/45 to-transparent" />
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-white/[0.12]">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4 cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <Compass className="w-[18px] h-[18px] text-[#003580]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[17px] font-black tracking-tight leading-none">MAFTRAVEL</span>
                <span className="text-[7px] font-bold text-white/40 uppercase tracking-widest mt-0.5">{t('footer.brandSub')}</span>
              </div>
            </div>
            <p className="text-[13px] text-white/55 leading-relaxed mb-6 font-medium">
              {t('footer.desc')}
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5 text-white/50 text-[12px] group cursor-pointer hover:text-white/80 transition-colors">
                <Mail className="w-3.5 h-3.5" /> 
                <span className="font-semibold">support@maftravel.com</span>
              </div>
              <div className="flex items-center gap-2.5 text-white/50 text-[12px] group cursor-pointer hover:text-white/80 transition-colors">
                <Mail className="w-3.5 h-3.5" /> 
                <span>maftravel@gmail.com</span>
              </div>
              <div className="flex items-center gap-2.5 text-white/50 text-[12px]">
                <Phone className="w-3.5 h-3.5" /> 
                <span>{t('home.contact.liveSub')}</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-white/40 mb-4">{t('footer.platform')}</p>
            <div className="flex flex-col gap-3">
              {nav.map(n => (
                <NavLink key={n.to} to={n.to} className="text-[13px] text-white/65 hover:text-white transition-premium font-medium">{n.label}</NavLink>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-white/40 mb-4">{t('footer.company')}</p>
            <div className="flex flex-col gap-3">
                {support.map(s => s.to === '#' ? (
                    <span key={s.label} className="text-[13px] text-white/65 hover:text-white cursor-pointer transition-premium font-medium">{s.label}</span>
                ) : (
                    <NavLink key={s.label} to={s.to} className="text-[13px] text-white/65 hover:text-white transition-premium font-medium">{s.label}</NavLink>
                ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <p className="text-[11px] font-black uppercase tracking-widest text-white/40 mb-2">{t('footer.newsletter')}</p>
            <p className="text-[12px] text-white/50 mb-4 leading-relaxed">{t('footer.newsletterSub')}</p>
            {joined ? (
              <div className="bg-white/10 rounded-lg p-3 border border-white/20 animate-pulse">
                <p className="text-white text-[12px] font-bold text-center">{t('footer.newsletterSuccess')}</p>
              </div>
            ) : (
              <div className="flex gap-2 p-1.5 bg-white/[0.08] border border-white/[0.15] rounded-xl focus-within:border-white/30 transition-all">
                <input type="email" placeholder={t('footer.emailPlaceholder')} value={email} onChange={e => setEmail(e.target.value)}
                  className="flex-1 bg-transparent px-2 text-[13px] text-white placeholder:text-white/30 focus:outline-none"
                />
                <button onClick={() => email && setJoined(true)}
                  className="px-3 py-2 bg-white text-[#003580] rounded-lg font-black text-[11px] hover:bg-white/90 active:scale-95 transition-premium uppercase tracking-tighter">
                  {t('footer.join')}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-[11px] text-white/35 font-bold uppercase tracking-widest">
              {t('footer.copy')}
            </p>
            <p className="text-[10px] text-white/20 font-medium">
              {t('footer.powered')}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <span>✈️ {t('footer.smartFlights')}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <span>🧠 {t('footer.aiPlanning')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
