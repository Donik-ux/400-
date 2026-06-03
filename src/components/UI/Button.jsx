import React from 'react';
import { cn } from '../../utils/cn';

const Button = ({ children, variant = 'primary', size = 'md', className, ...props }) => {
  const base =
    'group relative inline-flex items-center justify-center gap-2 rounded-2xl font-black uppercase tracking-widest transition-premium active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#febb02]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A] disabled:opacity-30 disabled:pointer-events-none select-none cursor-pointer';

  const variants = {
    primary:
      'bg-white text-[#0A0A0A] hover:bg-white/95 hover:scale-[1.03] hover:-translate-y-0.5 shadow-[0_8px_24px_-6px_rgba(255,255,255,0.25)] hover:shadow-[0_12px_32px_-6px_rgba(255,255,255,0.35)]',
    gold:
      'btn-gold !rounded-2xl tracking-widest hover:scale-[1.03]',
    outline:
      'bg-transparent text-white border border-white/[0.16] hover:border-white/45 hover:bg-white/[0.07] hover:scale-[1.03] hover:-translate-y-0.5',
    soft:
      'bg-white/[0.07] text-white border border-white/[0.06] hover:bg-white/[0.13] hover:border-white/[0.12] hover:scale-[1.03] hover:-translate-y-0.5',
    ghost:
      'bg-transparent text-white/50 hover:bg-white/[0.07] hover:text-white hover:scale-[1.02]',
    dark:
      'bg-[#111111] text-white border border-white/[0.08] hover:border-white/25 hover:bg-[#171717] hover:scale-[1.03] hover:-translate-y-0.5 shadow-[0_6px_20px_-8px_rgba(0,0,0,0.6)]',
  };

  const sizes = {
    sm: 'px-5 py-2.5 text-[10px]',
    md: 'px-7 py-3.5 text-[11px]',
    lg: 'px-10 py-4 text-[11px]',
  };

  return (
    <button className={cn(base, variants[variant] || variants.primary, sizes[size], className)} {...props}>
      {children}
    </button>
  );
};

export default Button;
