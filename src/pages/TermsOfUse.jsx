import React from 'react';
import { Shield } from 'lucide-react';
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

export default function TermsOfUse() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gray-50 py-14 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-[#003580] px-8 py-10 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-7 h-7" />
              <span className="text-[12px] font-black uppercase tracking-widest text-white/60">{t('legal.legal')}</span>
            </div>
            <h1 className="text-3xl font-black mb-2">{t('legal.terms.title')}</h1>
            <p className="text-white/60 text-[13px]">{t('legal.operatedBy')}</p>
          </div>

          <div className="px-8 py-10">
            <Section num="1" title={t('legal.terms.s1Title')}>
              <p>{t('legal.terms.s1a')}</p>
              <p className="mt-2">{t('legal.terms.s1b')}</p>
            </Section>

            <Section num="2" title={t('legal.terms.s2Title')}>
              <p>{t('legal.terms.s2Intro')}</p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>{t('legal.terms.s2a')}</li>
                <li>{t('legal.terms.s2b')}</li>
                <li>{t('legal.terms.s2c')}</li>
                <li>{t('legal.terms.s2d')}</li>
              </ul>
              <p className="mt-2">{t('legal.terms.s2Outro')}</p>
            </Section>

            <Section num="3" title={t('legal.terms.s3Title')}>
              <p>{t('legal.terms.s3a')}</p>
              <p className="mt-2">{t('legal.terms.s3b')}</p>
            </Section>

            <Section num="4" title={t('legal.terms.s4Title')}>
              <p>{t('legal.terms.s4Intro')}</p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>{t('legal.terms.s4a')}</li>
                <li>{t('legal.terms.s4b')}</li>
                <li>{t('legal.terms.s4c')}</li>
              </ul>
              <p className="mt-2">{t('legal.terms.s4Outro')}</p>
            </Section>

            <Section num="5" title={t('legal.terms.s5Title')}>
              <p>{t('legal.terms.s5Intro')}</p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>{t('legal.terms.s5a')}</li>
                <li>{t('legal.terms.s5b')}</li>
                <li>{t('legal.terms.s5c')}</li>
                <li>{t('legal.terms.s5d')}</li>
              </ul>
              <p className="mt-2">{t('legal.terms.s5Outro')}</p>
            </Section>

            <Section num="6" title={t('legal.terms.s6Title')}>
              <p>{t('legal.terms.s6Intro')}</p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>{t('legal.terms.s6a')}</li>
                <li>{t('legal.terms.s6b')}</li>
                <li>{t('legal.terms.s6c')}</li>
              </ul>
              <p className="mt-2">{t('legal.terms.s6Outro')}</p>
            </Section>

            <Section num="7" title={t('legal.terms.s7Title')}>
              <p>{t('legal.terms.s7Intro')}</p>
              <ul className="list-disc ml-5 mt-2 space-y-1">
                <li>{t('legal.terms.s7a')}</li>
                <li>{t('legal.terms.s7b')}</li>
                <li>{t('legal.terms.s7c')}</li>
              </ul>
            </Section>

            <Section num="8" title={t('legal.terms.s8Title')}>
              <p>{t('legal.terms.s8a')}</p>
              <p className="mt-2">{t('legal.terms.s8b')}</p>
            </Section>

            <Section num="9" title={t('legal.terms.s9Title')}>
              <p>{t('legal.terms.s9')}</p>
            </Section>

            <Section num="10" title={t('legal.terms.s10Title')}>
              <p>{t('legal.terms.s10')}</p>
            </Section>

            <Section num="11" title={t('legal.terms.s11Title')}>
              <p>{t('legal.terms.s11')}</p>
            </Section>

            <Section num="12" title={t('legal.terms.s12Title')}>
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
