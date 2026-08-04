import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Mail, Phone, Youtube } from 'lucide-react';
import { useTranslation } from '../store/useLangStore';
import useAdminStore from '../store/useAdminStore';
import { SUPPORT_EMAIL } from '../config/contact';

export default function Footer() {
  const { t } = useTranslation();
  // Contact details are editable from the admin Settings tab; the hard-coded
  // support address stays as the fallback when the field is blank.
  const settings = useAdminStore(s => s.settings);
  const contactEmail = (settings?.contactEmail || '').trim() || SUPPORT_EMAIL;
  const contactPhone = (settings?.contactPhone || '').trim();
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);
  const [mailError, setMailError] = useState('');

  // Clicking Join with an empty/malformed address used to do nothing at all,
  // which reads as a broken button — say why instead.
  const handleJoin = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMailError(t('footer.emailInvalid'));
      return;
    }
    setMailError('');
    setJoined(true);
  };

  const nav = [
    { label: t('nav.home'),         to: '/'            },
    { label: t('nav.planner'),      to: '/planner'     },
    { label: t('nav.exotic'),       to: '/exotic-tours' },
    { label: t('nav.flights'),      to: '/flights'     },
    { label: t('nav2.tools'),       to: '/tools'       },
  ];

  const support = [
    { label: t('footer.supportLinks.support'), href: `mailto:${contactEmail}` },
    { label: t('footer.supportLinks.contact'), href: `mailto:${contactEmail}` },
    { label: t('nav2.termsOfUse'),             to: '/terms'   },
    { label: t('nav2.privacyPolicy'),          to: '/privacy' },
    { label: t('nav2.cookiePolicy'),           to: '/cookies' },
  ];

  return (
    <footer className="relative w-full bg-[#f5f7f9] border-t border-[#dfe7ec] text-[#252a31] mt-12">
      <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-12 pb-20 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-10 border-b border-[#dfe7ec]">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4 cursor-pointer group" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
              <img src="/images/maf-logo.png" alt="MAF Travel"
                className="w-10 h-10 rounded-lg object-cover group-hover:scale-105 transition-premium" />
              <div className="flex flex-col">
                <span className="text-[17px] font-black tracking-tight leading-none">MAFTRAVEL</span>
                <span className="text-[7px] font-bold text-[#697d95] uppercase tracking-widest mt-0.5">{t('footer.brandSub')}</span>
              </div>
            </div>
            <p className="text-[13px] text-[#4a5867] leading-relaxed mb-4 font-medium">
              {t('footer.desc')}
            </p>
            <a href="https://youtube.com/@maftravel" target="_blank" rel="noopener noreferrer"
              aria-label="MAFTRAVEL on YouTube"
              className="inline-flex items-center gap-2 text-[13px] font-bold text-[#4a5867] hover:text-[#252a31] transition-premium group">
              <span className="w-8 h-8 rounded-lg bg-white border border-[#dfe7ec] flex items-center justify-center group-hover:bg-[#ff0000] group-hover:border-[#ff0000] transition-premium">
                <Youtube className="w-4 h-4" />
              </span>
              YouTube
            </a>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#697d95] mb-4">{t('footer.platform')}</p>
            <div className="flex flex-col gap-3">
              {nav.map(n => (
                <NavLink key={n.to} to={n.to} className="text-[13px] text-[#4a5867] hover:text-[#0172cb] transition-premium font-semibold">{n.label}</NavLink>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#697d95] mb-4">{t('footer.company')}</p>
            <div className="flex flex-col gap-3">
                {support.map(s => s.href ? (
                    <a key={s.label} href={s.href} className="text-[13px] text-[#4a5867] hover:text-[#0172cb] transition-premium font-semibold">{s.label}</a>
                ) : (
                    <NavLink key={s.label} to={s.to} className="text-[13px] text-[#4a5867] hover:text-[#0172cb] transition-premium font-semibold">{s.label}</NavLink>
                ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#697d95] mb-2">{t('footer.newsletter')}</p>
            <p className="text-[12px] text-[#697d95] mb-4 leading-relaxed">{t('footer.newsletterSub')}</p>
            {joined ? (
              <div className="bg-[#e9f3ea] rounded-lg p-3 border border-[#cfe3d2]">
                <p className="text-[#2e7d4f] text-[12px] font-bold text-center">{t('footer.newsletterSuccess')}</p>
              </div>
            ) : (
              <>
                <div className="flex gap-2 p-1.5 bg-white border border-[#dfe7ec] rounded-xl focus-within:border-[#0172cb] transition-all">
                  <input type="email" placeholder={t('footer.emailPlaceholder')} value={email}
                    onChange={e => { setEmail(e.target.value); if (mailError) setMailError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleJoin()}
                    className="flex-1 min-w-0 bg-transparent px-2 text-[13px] text-[#252a31] placeholder:text-[#94a3af] focus:outline-none"
                  />
                  <button onClick={handleJoin}
                    className="shrink-0 max-w-[55%] px-3.5 py-2 rounded-lg bg-[#0172cb] hover:bg-[#015aa3] text-white text-[11px] font-black uppercase tracking-tighter truncate transition">
                    {t('footer.join')}
                  </button>
                </div>
                {mailError && <p className="mt-2 text-[11px] font-bold text-[#b3402e]">{mailError}</p>}
              </>
            )}
          </div>
        </div>

        <div className="pt-8 pb-2 flex flex-col items-center gap-2 text-center">
          <p className="text-[13px] text-[#4a5867] font-medium">{t('footer.questions')}</p>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-5">
            <a href={`mailto:${contactEmail}`}
              className="inline-flex items-center gap-2 text-[14px] font-bold text-[#0172cb] hover:text-[#015aa3] transition-colors">
              <Mail className="w-4 h-4" />
              {contactEmail}
            </a>
            {contactPhone && (
              <a href={`tel:${contactPhone.replace(/[^\d+]/g, '')}`}
                className="inline-flex items-center gap-2 text-[14px] font-bold text-[#0172cb] hover:text-[#015aa3] transition-colors">
                <Phone className="w-4 h-4" />
                {contactPhone}
              </a>
            )}
          </div>
        </div>

        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p className="text-[12px] text-[#697d95] font-medium">
              {t('footer.copy')}
            </p>
            <p className="text-[10px] text-[#94a3af] font-medium max-w-full break-words text-center md:text-left">
              {t('footer.powered')}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="text-[9.5px] font-black uppercase tracking-[0.14em] text-[#008f77] bg-white px-3 py-1.5 rounded-full border border-[#dfe7ec]">
              <span>✈️ {t('footer.smartFlights')}</span>
            </div>
            <div className="text-[9.5px] font-black uppercase tracking-[0.14em] text-[#008f77] bg-white px-3 py-1.5 rounded-full border border-[#dfe7ec]">
              <span>🧠 {t('footer.aiPlanning')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
