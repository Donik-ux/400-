import React from 'react';
import { cn } from '../../utils/cn';

const Input = ({ label, icon: Icon, className, wrapperClassName, ...props }) => {
  return (
    <div className={cn('group flex flex-col gap-2.5', wrapperClassName)}>
      {label && (
        <label className="text-[10px] uppercase font-black tracking-[0.18em] text-white/40 flex items-center gap-1.5 transition-premium group-focus-within:text-white/70">
          {Icon && <Icon className="w-3 h-3 text-white/30 transition-premium group-focus-within:text-[#febb02]" />}
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full bg-white/[0.05] border border-white/[0.09] rounded-xl px-5 py-3.5 outline-none',
          'text-white font-medium text-sm placeholder:text-white/25',
          'transition-premium hover:border-white/[0.16] hover:bg-white/[0.07]',
          'focus:border-[#0071c2]/70 focus:bg-white/[0.08] focus:ring-2 focus:ring-[#0071c2]/25',
          'aria-[invalid=true]:border-red-400/70 aria-[invalid=true]:focus:border-red-400 aria-[invalid=true]:focus:ring-red-400/25',
          className
        )}
        {...props}
      />
    </div>
  );
};

export default Input;
