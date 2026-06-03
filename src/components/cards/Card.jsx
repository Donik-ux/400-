import React from 'react';
import { cn } from '../../utils/cn';

const Card = ({ children, className, hover = true, padding = 'md', glow = false, ...props }) => {
  const paddings = { sm: 'p-5', md: 'p-6', lg: 'p-8', xl: 'p-10' };

  return (
    <div
      className={cn(
        'relative bg-gradient-to-b from-[#141414] to-[#0f0f0f] border border-white/[0.08] rounded-2xl',
        'shadow-[0_4px_24px_rgba(0,0,0,0.4)] ring-1 ring-inset ring-white/[0.02]',
        hover && 'card-hover hover:border-white/[0.14] cursor-default',
        glow && 'card-glow',
        paddings[padding],
        className
      )}
      {...props}
    >
      {/* subtle top hairline sheen */}
      <span className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.10] to-transparent" />
      {children}
    </div>
  );
};

export default Card;
// Additional code was removed here as it was a redundant copy of the above component with syntax errors.