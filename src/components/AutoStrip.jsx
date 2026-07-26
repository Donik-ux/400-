import React, { useEffect, useRef } from 'react';

/**
 * Horizontal scroll-snap strip that auto-advances one card at a time —
 * pauses while the visitor's pointer/finger is on it and wraps back to the
 * start at the end. Used by every card showcase on the site.
 *
 * @param {{ interval?: number, className?: string, children: React.ReactNode }} props
 */
export default function AutoStrip({ interval = 2000, className = '', children }) {
  const ref = useRef(null);
  const paused = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      const el = ref.current;
      if (!el || paused.current) return;
      const card = el.children[0];
      if (!card) return;
      const styles = getComputedStyle(el);
      const gap = parseFloat(styles.columnGap || styles.gap) || 16;
      const step = card.getBoundingClientRect().width + gap;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - step / 2;
      el.scrollTo({ left: atEnd ? 0 : el.scrollLeft + step, behavior: 'smooth' });
    }, interval);
    return () => clearInterval(id);
  }, [interval]);

  return (
    <div
      ref={ref}
      onPointerEnter={() => { paused.current = true; }}
      onPointerLeave={() => { paused.current = false; }}
      onTouchStart={() => { paused.current = true; }}
      onTouchEnd={() => { setTimeout(() => { paused.current = false; }, 3000); }}
      onTouchCancel={() => { setTimeout(() => { paused.current = false; }, 3000); }}
      className={className}
    >
      {children}
    </div>
  );
}
