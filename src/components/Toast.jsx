import React, { useEffect } from 'react';
import { create } from 'zustand';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X, Sparkles } from 'lucide-react';
import { useTranslation } from '../store/useLangStore';

let uid = 0;

const useToastStore = create((set, get) => ({
  toasts: [],
  push: (toast) => {
    const id = ++uid;
    set({ toasts: [...get().toasts, { id, duration: 3800, type: 'success', ...toast }] });
    return id;
  },
  remove: (id) => set({ toasts: get().toasts.filter(t => t.id !== id) }),
}));

export const toast = {
  success: (title, description) => useToastStore.getState().push({ type: 'success', title, description }),
  error:   (title, description) => useToastStore.getState().push({ type: 'error',   title, description }),
  info:    (title, description) => useToastStore.getState().push({ type: 'info',    title, description }),
  ai:      (title, description) => useToastStore.getState().push({ type: 'ai',      title, description }),
};

const STYLE = {
  success: { icon: CheckCircle, bar: 'bg-[#008009]',  iconCls: 'text-[#008009]', tint: 'bg-[#e8f5e9]'  },
  error:   { icon: AlertCircle, bar: 'bg-red-500',    iconCls: 'text-red-500',   tint: 'bg-red-50'     },
  info:    { icon: Info,        bar: 'bg-[#0071c2]',  iconCls: 'text-[#0071c2]', tint: 'bg-[#f0f5ff]'  },
  ai:      { icon: Sparkles,    bar: 'bg-[#febb02]',  iconCls: 'text-[#a45e00]', tint: 'bg-[#fff7e6]'  },
};

const ToastItem = ({ t, onClose }) => {
  const { t: tr } = useTranslation();
  const S = STYLE[t.type] || STYLE.info;
  const Icon = S.icon;
  useEffect(() => {
    const tm = setTimeout(onClose, t.duration);
    return () => clearTimeout(tm);
  }, [t.duration, onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className="bg-white border border-[#e7e7e7] rounded-2xl shadow-xl overflow-hidden flex min-w-[260px] max-w-sm pointer-events-auto"
      role="status"
    >
      <div className={`w-1.5 ${S.bar}`} />
      <div className={`p-3 flex items-start gap-3 flex-1 ${S.tint}`}>
        <div className={`mt-0.5 ${S.iconCls}`}><Icon className="w-5 h-5" /></div>
        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-black text-[#1a1a1a] leading-tight">{t.title}</p>
          {t.description && <p className="text-[12px] font-semibold text-[#595959] mt-0.5 leading-snug">{t.description}</p>}
        </div>
        <button onClick={onClose} className="p-1 -mr-1 rounded-md hover:bg-black/5 text-[#9ca3af] shrink-0" aria-label={tr('ui.toast.dismiss')}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

export default function ToastContainer() {
  const toasts = useToastStore(s => s.toasts);
  const remove = useToastStore(s => s.remove);

  return (
    <div className="fixed top-[76px] right-4 z-[60] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map(t => (
          <ToastItem key={t.id} t={t} onClose={() => remove(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}
