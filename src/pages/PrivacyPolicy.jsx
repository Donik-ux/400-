import React from 'react';
import { Lock } from 'lucide-react';
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

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50 py-14 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#003580] px-8 py-10 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Lock className="w-7 h-7" />
              <span className="text-[12px] font-black uppercase tracking-widest text-white/60">{t('legal.legal')}</span>
            </div>
            <h1 className="text-3xl font-black mb-2">{t('legal.privacy.title')}</h1>
            <p className="text-white/60 text-[13px]">{t('legal.operatedBy')}</p>
          </div>

          <div className="px-8 py-10">
            <Section num="1" title={t('legal.privacy.s1Title')}>
              <p>{t('legal.privacy.s1')}</p>
            </Section>

            <Section num="2" title={t('legal.privacy.s2Title')}>
              <p className="font-semibold text-gray-700 mb-1">{t('legal.privacy.s2Personal')}</p>
              <ul className="list-disc ml-5 space-y-1 mb-3">
                <li>{t('legal.privacy.s2a')}</li>
                <li>{t('legal.privacy.s2b')}</li>
              </ul>
              <p className="font-semibold text-gray-700 mb-1">{t('legal.privacy.s2Usage')}</p>
              <ul className="list-disc ml-5 space-y-1 mb-3">
                <li>{t('legal.privacy.s2c')}</li>
                <li>{t('legal.privacy.s2d')}</li>
                <li>{t('legal.privacy.s2e')}</li>
              </ul>
              <p className="font-semibold text-gray-700 mb-1">{t('legal.privacy.s2Travel')}</p>
              <ul className="list-disc ml-5 space-y-1">
                <li>{t('legal.privacy.s2f')}</li>
                <li>{t('legal.privacy.s2g')}</li>
                <li>{t('legal.privacy.s2h')}</li>
              </ul>
            </Section>

            <Section num="3" title={t('legal.privacy.s3Title')}>
              <p>{t('legal.privacy.s3Intro')}</p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>{t('legal.privacy.s3a')}</li>
                <li>{t('legal.privacy.s3b')}</li>
                <li>{t('legal.privacy.s3c')}</li>
                <li>{t('legal.privacy.s3d')}</li>
              </ul>
            </Section>

            <Section num="4" title={t('legal.privacy.s4Title')}>
              <p>{t('legal.privacy.s4a')} <strong>{t('legal.privacy.s4not')}</strong> {t('legal.privacy.s4b')}</p>
              <p className="mt-2">{t('legal.privacy.s4c')}</p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>{t('legal.privacy.s4d')}</li>
                <li>{t('legal.privacy.s4e')}</li>
              </ul>
            </Section>

            <Section num="5" title={t('legal.privacy.s5Title')}>
              <p>{t('legal.privacy.s5')}</p>
            </Section>

            <Section num="6" title={t('legal.privacy.s6Title')}>
              <p>{t('legal.privacy.s6')}</p>
            </Section>

            <Section num="7" title={t('legal.privacy.s7Title')}>
              <p>{t('legal.privacy.s7')}</p>
            </Section>

            <Section num="8" title={t('legal.privacy.s8Title')}>
              <p>{t('legal.privacy.s8Intro')}</p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>{t('legal.privacy.s8a')}</li>
                <li>{t('legal.privacy.s8b')}</li>
                <li>{t('legal.privacy.s8c')}</li>
              </ul>
              <p className="mt-3">
                <a href="mailto:support@maftravel.com" className="text-[#003580] font-semibold hover:underline">
                  support@maftravel.com
                </a>
              </p>
            </Section>

            <Section num="9" title={t('legal.privacy.s9Title')}>
              <p>{t('legal.privacy.s9')}</p>
            </Section>

            <Section num="10" title={t('legal.privacy.s10Title')}>
              <p>{t('legal.privacy.s10')}</p>
            </Section>

            <Section num="11" title={t('legal.privacy.s11Title')}>
              <p>{t('legal.privacy.s11')}</p>
            </Section>

            <Section num="12" title={t('legal.privacy.s12Title')}>
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
