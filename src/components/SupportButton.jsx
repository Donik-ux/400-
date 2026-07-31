import React, { useState, useEffect } from 'react';
import { Mail, X } from 'lucide-react';
import { SUPPORT_EMAIL, supportMailto } from '../config/contact';
import { useTranslation } from '../store/useLangStore';

/**
 * Floating "write to support" button — fixed bottom-left so it never collides
 * with the notification widget (bottom-right). Pops a small prompt bubble on
 * first idle, dismissible by the user.
 */
export default function SupportButton() {
  const { t } = useTranslation();
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('support-bubble-dismissed')) return undefined;
    const id = setTimeout(() => setShowBubble(true), 6000);
    return () => clearTimeout(id);
  }, []);

  const dismiss = (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    setShowBubble(false);
    sessionStorage.setItem('support-bubble-dismissed', '1');
  };

  return (
    <div className="fixed bottom-5 left-5 z-[60] flex items-end gap-2 print:hidden">
      <a
        href={supportMailto(t('support.subject'), t('support.prefill'))}
        aria-label={t('support.aria')}
        title={SUPPORT_EMAIL}
        className="group relative w-14 h-14 rounded-full bg-[#009882] hover:bg-[#007f6d] shadow-[0_8px_24px_rgba(0,152,130,0.5)] flex items-center justify-center text-white active:scale-95 transition-all"
      >
        <span className="absolute inset-0 rounded-full bg-[#009882] animate-ping opacity-30 group-hover:opacity-0" />
        <Mail className="relative w-6 h-6" strokeWidth={2.2} />
      </a>

      {showBubble && (
        <div className="relative mb-1 max-w-[230px] bg-white rounded-2xl rounded-bl-sm shadow-float border border-[#dfe7ec] px-3.5 py-3 page-fade">
          <button onClick={dismiss} aria-label="Close"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#252a31] text-white flex items-center justify-center shadow-soft hover:scale-110 transition">
            <X className="w-3.5 h-3.5" />
          </button>
          <p className="text-[13px] font-black text-[#252a31] leading-snug">{t('support.bubbleTitle')}</p>
          <p className="text-[12px] text-[#4a5867] font-medium leading-snug mt-0.5">{t('support.bubbleBody')}</p>
        </div>
      )}
    </div>
  );
}
