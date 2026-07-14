import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { whatsappLink, WHATSAPP_CONFIGURED } from '../config/contact';
import { useTranslation } from '../store/useLangStore';

/**
 * Floating WhatsApp contact button — fixed bottom-left so it never collides
 * with the notification widget (bottom-right). Pops a small prompt bubble on
 * first idle, dismissible by the user.
 */
export default function WhatsAppButton() {
  const { t } = useTranslation();
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    if (!WHATSAPP_CONFIGURED) return undefined;
    if (sessionStorage.getItem('wa-bubble-dismissed')) return undefined;
    const id = setTimeout(() => setShowBubble(true), 6000);
    return () => clearTimeout(id);
  }, []);

  if (!WHATSAPP_CONFIGURED) return null;

  const dismiss = (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    setShowBubble(false);
    sessionStorage.setItem('wa-bubble-dismissed', '1');
  };

  return (
    <div className="fixed bottom-5 left-5 z-[60] flex items-end gap-2 print:hidden">
      <a
        href={whatsappLink(t('whatsapp.prefill'))}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('whatsapp.aria')}
        className="group relative w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1ebe5b] shadow-[0_8px_24px_rgba(37,211,102,0.5)] flex items-center justify-center text-white active:scale-95 transition-all"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30 group-hover:opacity-0" />
        <MessageCircle className="relative w-7 h-7" fill="currentColor" strokeWidth={0} />
        <span className="relative" />
      </a>

      {showBubble && (
        <div className="relative mb-1 max-w-[230px] bg-white rounded-2xl rounded-bl-sm shadow-float border border-[#e6dcc3] px-3.5 py-3 page-fade">
          <button onClick={dismiss} aria-label="Close"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center shadow-soft hover:scale-110 transition">
            <X className="w-3.5 h-3.5" />
          </button>
          <p className="text-[13px] font-black text-[#1a1a1a] leading-snug">{t('whatsapp.bubbleTitle')}</p>
          <p className="text-[12px] text-[#5c5245] font-medium leading-snug mt-0.5">{t('whatsapp.bubbleBody')}</p>
        </div>
      )}
    </div>
  );
}
