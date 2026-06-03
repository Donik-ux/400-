import React from 'react';
import { Cookie } from 'lucide-react';
import { useTranslation } from '../store/useLangStore';

const Section = ({ num, title, children }) => (
  <div className="mb-8">
    <h2 className="text-[15px] font-black text-[#003580] mb-3 flex items-center gap-2">
      <span className="w-6 h-6 rounded-full bg-[#003580] text-white text-[11px] font-black flex items-center justify-center flex-shrink-0">{num}</span>
      {title}
    </h2>
    <div className="text-[14px] text-gray-600 leading-relaxed pl-8">{children}</div>
  </div>
);

export default function CookiePolicy() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50 py-14 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#003580] px-8 py-10 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Cookie className="w-7 h-7" />
              <span className="text-[12px] font-black uppercase tracking-widest text-white/60">{t('legal.legal')}</span>
            </div>
            <h1 className="text-3xl font-black mb-2">{t('legal.cookies.title')}</h1>
            <p className="text-white/60 text-[13px]">{t('legal.operatedBy')}</p>
          </div>

          <div className="px-8 py-10">
            <Section num="1" title={t('legal.cookies.s1Title')}>
              <p>{t('legal.cookies.s1')}</p>
            </Section>

            <Section num="2" title={t('legal.cookies.s2Title')}>
              <p>{t('legal.cookies.s2Intro')}</p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>{t('legal.cookies.s2a')}</li>
                <li>{t('legal.cookies.s2b')}</li>
                <li>{t('legal.cookies.s2c')}</li>
              </ul>
            </Section>

            <Section num="3" title={t('legal.cookies.s3Title')}>
              <div className="space-y-2">
                <div className="flex gap-3 items-start">
                  <span className="mt-0.5 w-2 h-2 rounded-full bg-[#003580] flex-shrink-0"></span>
                  <p><strong className="text-gray-700">{t('legal.cookies.s3aT')}</strong> — {t('legal.cookies.s3aD')}</p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="mt-0.5 w-2 h-2 rounded-full bg-[#003580] flex-shrink-0"></span>
                  <p><strong className="text-gray-700">{t('legal.cookies.s3bT')}</strong> — {t('legal.cookies.s3bD')}</p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="mt-0.5 w-2 h-2 rounded-full bg-[#003580] flex-shrink-0"></span>
                  <p><strong className="text-gray-700">{t('legal.cookies.s3cT')}</strong> — {t('legal.cookies.s3cD')}</p>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="mt-0.5 w-2 h-2 rounded-full bg-[#003580] flex-shrink-0"></span>
                  <p><strong className="text-gray-700">{t('legal.cookies.s3dT')}</strong> — {t('legal.cookies.s3dD')}</p>
                </div>
              </div>
            </Section>

            <Section num="4" title={t('legal.cookies.s4Title')}>
              <p>{t('legal.cookies.s4')}</p>
            </Section>

            <Section num="5" title={t('legal.cookies.s5Title')}>
              <p>{t('legal.cookies.s5')}</p>
            </Section>

            <Section num="6" title={t('legal.cookies.s6Title')}>
              <p>{t('legal.cookies.s6')}</p>
            </Section>

            <Section num="7" title={t('legal.cookies.s7Title')}>
              <p>{t('legal.cookies.s7')}</p>
            </Section>

            <Section num="8" title={t('legal.cookies.s8Title')}>
              <p>
                <a href="mailto:support@maftravel.com" className="text-[#003580] font-semibold hover:underline">
                  support@maftravel.com
                </a>
              </p>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
