import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import { useTranslation } from '../store/useLangStore';

const DISCLAIMER_KEY = 'imaf_disclaimer_accepted';

export default function DisclaimerModal() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [read, setRead] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(DISCLAIMER_KEY);
    if (!accepted) setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(DISCLAIMER_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-[#003580] px-7 py-5 flex items-center gap-3">
          <Shield className="w-6 h-6 text-yellow-300 shrink-0" />
          <div>
            <h2 className="text-white font-black text-[17px] leading-tight">MAFTRAVEL</h2>
            <p className="text-white/60 text-[11px] uppercase tracking-widest font-bold">{t('ui.disclaimer.eyebrow')}</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-7 py-6 max-h-[60vh] overflow-y-auto">
          <div className="flex items-start gap-3 mb-5 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[13px] font-bold text-amber-800">
              {t('ui.disclaimer.warning')}
            </p>
          </div>

          <div className="space-y-4 text-[13px] text-[#595959] leading-relaxed">
            <p>
              <strong className="text-[#1a1a1a]">{t('ui.disclaimer.s1Title')}</strong>{' '}
              {t('ui.disclaimer.s1Body')}
            </p>
            <p>
              <strong className="text-[#1a1a1a]">{t('ui.disclaimer.s2Title')}</strong>{' '}
              {t('ui.disclaimer.s2Body')}
            </p>
            <p>
              <strong className="text-[#1a1a1a]">{t('ui.disclaimer.s3Title')}</strong>{' '}
              {t('ui.disclaimer.s3Body')}
            </p>
            <p>
              <strong className="text-[#1a1a1a]">{t('ui.disclaimer.s4Title')}</strong>{' '}
              {t('ui.disclaimer.s4Body')}
            </p>
            <p>
              <strong className="text-[#1a1a1a]">{t('ui.disclaimer.s5Title')}</strong>{' '}
              {t('ui.disclaimer.s5Body')}
            </p>
            <p>
              <strong className="text-[#1a1a1a]">{t('ui.disclaimer.s6Title')}</strong>{' '}
              {t('ui.disclaimer.s6Body')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-[#f0f0f0] bg-[#f8f9fa]">
          <label className="flex items-start gap-3 cursor-pointer mb-5 select-none">
            <div
              onClick={() => setRead(v => !v)}
              className={`w-5 h-5 rounded shrink-0 mt-0.5 border-2 flex items-center justify-center transition-all cursor-pointer ${
                read ? 'bg-[#003580] border-[#003580]' : 'border-[#c9d1d9] bg-white'
              }`}
            >
              {read && <CheckCircle className="w-3.5 h-3.5 text-white" />}
            </div>
            <span className="text-[13px] text-[#595959] leading-snug">
              {t('ui.disclaimer.checkbox')}
            </span>
          </label>

          <button
            onClick={handleAccept}
            disabled={!read}
            className={`w-full py-3.5 rounded-2xl font-black text-[14px] uppercase tracking-wider transition-all ${
              read
                ? 'bg-[#003580] text-white hover:bg-[#002060] active:scale-95'
                : 'bg-[#e7e7e7] text-[#9ca3af] cursor-not-allowed'
            }`}
          >
            {t('ui.disclaimer.accept')}
          </button>

          <p className="text-center text-[11px] text-[#9ca3af] mt-3">
            {t('ui.disclaimer.footnote')}
          </p>
        </div>
      </div>
    </div>
  );
}
