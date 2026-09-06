import { useEffect } from 'react';

/**
 * White cards glow softly where the pointer is.
 *
 * Design-only. One passive pointermove listener for the whole site: it finds
 * the card under the pointer (any white, rounded, bordered surface — the
 * site's card idiom in Tailwind terms), writes the pointer's position into
 * two CSS variables on it and marks it `.spot-lit`; the glow itself is a
 * background-image in index.css, so no card gains positioning, overflow or
 * a pseudo-element, and dropdowns inside cards still escape. Renders nothing.
 * Skipped on touch (no hover) and under reduced motion.
 */
const CARD = '.rounded-2xl.bg-white, .rounded-xl.bg-white, .rounded-3xl.bg-white';

export default function CardSpotlight() {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const coarse  = window.matchMedia('(pointer: coarse)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (coarse || reduced) return undefined;

    let lit = null, raf = 0, ev = null;
    const paint = () => {
      raf = 0;
      const card = ev.target instanceof Element ? ev.target.closest(CARD) : null;
      if (card !== lit) {
        if (lit) lit.classList.remove('spot-lit');
        lit = card;
        if (lit) lit.classList.add('spot-lit');
      }
      if (lit) {
        const r = lit.getBoundingClientRect();
        lit.style.setProperty('--sx', `${(ev.clientX - r.left).toFixed(0)}px`);
        lit.style.setProperty('--sy', `${(ev.clientY - r.top).toFixed(0)}px`);
      }
    };
    const onMove = (e) => { ev = e; if (!raf) raf = requestAnimationFrame(paint); };
    const onLeave = () => { if (lit) { lit.classList.remove('spot-lit'); lit = null; } };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
      onLeave();
    };
  }, []);
  return null;
}
