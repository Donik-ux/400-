import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * The site's ground, painted once behind everything.
 *
 * Design-only, like the rest of this folder. The layer is `position: fixed`
 * with a negative z-index straight in the root stacking context (nothing
 * between it and <html> is positioned with a z-index, transformed or
 * isolated), so it sits under every in-flow element on the page — cards,
 * heroes, navbar, modals all keep exactly the z-order they had. Its own
 * `contain: strict` makes a stacking context for its children only.
 * Anything with an opaque background simply covers it; it shows in gutters,
 * margins and around the content.
 *
 * Layers, back to front:
 *  1. `__ground` — the gradient and dot grid every route shares (what
 *     `.page-ground` used to paint per page; that class is transparent now).
 *  2. `__tint` — a whisper of the hour: peach at dawn, gold at dusk, indigo
 *     at night, nothing by day. Same site, but it feels like *now*.
 *  3. `__scroll` — slides up a few vh as the page scrolls (CSS scroll-driven
 *     animation, compositor only, no JS), so the fixed scene has depth
 *     against the content moving over it.
 *  4. `__motif` — the per-route scene, lazy-loaded so a page never downloads
 *     the scenery of another. It leans a few px towards the pointer (one CSS
 *     variable pair, written straight to the DOM, rAF-throttled) and fades in
 *     on every motif change instead of popping.
 *  5. `__dust` — two fields of brand-coloured motes rising at two speeds, on
 *     every route, so even a form page has something alive in its margins.
 *  6. `__sweep` — a band of light crossing the page once every 44 s.
 *  7. `__cursor` — a soft brightening of the ground under the pointer.
 */
const HomeBackdrop       = lazy(() => import('./backdrops/HomeBackdrop'));
const FlightsBackdrop    = lazy(() => import('./backdrops/FlightsBackdrop'));
const ExoticBackdrop     = lazy(() => import('./backdrops/ExoticBackdrop'));
const AntarcticaBackdrop = lazy(() => import('./backdrops/AntarcticaBackdrop'));
const DefaultBackdrop    = lazy(() => import('./backdrops/DefaultBackdrop'));

function motifKeyFor(pathname) {
  if (pathname === '/')                     return 'home';
  if (pathname.startsWith('/flights'))      return 'flights';
  if (pathname.startsWith('/exotic-tours')) return 'exotic';
  if (pathname.startsWith('/antarctica'))   return 'antarctica';
  if (pathname.startsWith('/admin'))        return 'none';
  return 'default';
}

const MOTIFS = {
  home:       <HomeBackdrop />,
  flights:    <FlightsBackdrop />,
  exotic:     <ExoticBackdrop />,
  antarctica: <AntarcticaBackdrop />,
  default:    <DefaultBackdrop />,
  none:       null,
};

/* Local hour → phase of day. Read once per mount; nobody keeps a page open
   across a dawn, and if they do the next navigation catches up. */
function dayPhase(hour = new Date().getHours()) {
  if (hour >= 5  && hour < 9)  return 'dawn';
  if (hour >= 17 && hour < 21) return 'dusk';
  if (hour >= 21 || hour < 5)  return 'night';
  return 'day';
}

/* Pointer parallax: -1..1 across the viewport, written as CSS variables on
   the root layer. No React state — a state update per mouse move would
   re-render the scene for a two-number change the compositor reads itself.
   Skipped entirely on touch (no hover, and stacked transforms are what the
   iOS pinch-zoom whiteout feeds on) and under reduced motion. */
function usePointerLean(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === 'undefined') return undefined;
    const coarse  = window.matchMedia('(pointer: coarse)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (coarse || reduced) return undefined;

    let raf = 0, nx = 0, ny = 0, px = 0, py = 0, on = 0;
    const paint = () => {
      raf = 0;
      el.style.setProperty('--bd-mx', nx.toFixed(3));
      el.style.setProperty('--bd-my', ny.toFixed(3));
      el.style.setProperty('--bd-px', `${px.toFixed(0)}px`);
      el.style.setProperty('--bd-py', `${py.toFixed(0)}px`);
      el.style.setProperty('--bd-on', String(on));
    };
    const onMove = (e) => {
      px = e.clientX; py = e.clientY; on = 1;
      nx = (px / window.innerWidth)  * 2 - 1;
      ny = (py / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const onLeave = () => { nx = 0; ny = 0; on = 0; if (!raf) raf = requestAnimationFrame(paint); };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [ref]);
}

export default function PageBackdrop() {
  const { pathname } = useLocation();
  const motif = motifKeyFor(pathname);
  const root  = useRef(null);
  usePointerLean(root);

  // The boundary is keyed by motif, not by pathname. React Router commits
  // route changes inside a transition, and an already-mounted Suspense that
  // suspends inside a transition holds the WHOLE transition — the page swap
  // included — until the lazy chunk lands. A fresh boundary per motif shows
  // its (empty) fallback at once, so scenery never gates content. Keying by
  // motif rather than path also keeps /exotic-tours → /exotic-tours/:id from
  // remounting the scene and restarting its animations.
  return (
    <div className="page-backdrop" aria-hidden="true" ref={root}>
      <div className="page-backdrop__ground" />
      <div className="page-backdrop__tint" data-phase={dayPhase()} />
      <div className="page-backdrop__scroll">
        <div className="page-backdrop__motif" key={motif}>
          <Suspense fallback={null}>{MOTIFS[motif]}</Suspense>
        </div>
        <div className="page-backdrop__dust page-backdrop__dust--far" />
        <div className="page-backdrop__dust page-backdrop__dust--near" />
      </div>
      {/* Above the scene, below the page: a light that passes, and a light
          that follows. Both are pure transform/opacity. */}
      <div className="page-backdrop__sweep" />
      <div className="page-backdrop__cursor" />
    </div>
  );
}
