import React, { useId } from 'react';

/**
 * The brand's quiet background motif: a wireframe globe with one dashed route
 * lifting off it, sitting in a soft teal glow.
 *
 * It is decoration, not information — every stroke is low-contrast and the
 * whole thing is aria-hidden, so it can sit under a headline or a form without
 * competing with them. Mount it inside a `relative` dark surface and size it
 * with `className`; the SVG fills whatever box it is given.
 *
 * Gradient ids are per-instance (useId), so two of these on one page do not
 * collide over the same `url(#…)` reference.
 */
export default function RouteGlobe({ className = '' }) {
  const uid = useId().replace(/:/g, '');
  const glow  = `rg-glow-${uid}`;
  const route = `rg-route-${uid}`;

  return (
    <div className={`pointer-events-none ${className}`} aria-hidden="true">
      <svg className="h-full w-full" viewBox="0 0 640 900" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id={glow} cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="#00a58e" stopOpacity="0.22" />
            <stop offset="65%" stopColor="#00a58e" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#00a58e" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={route} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%"   stopColor="#61d1bf" stopOpacity="0" />
            <stop offset="50%"  stopColor="#61d1bf" stopOpacity="0.60" />
            <stop offset="100%" stopColor="#61d1bf" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Atmosphere behind the wireframe, so the globe sits in light */}
        <circle cx="330" cy="450" r="400" fill={`url(#${glow})`} />

        {/* Graticule: horizon, equator and two meridians */}
        <g fill="none" stroke="#9fdfd3" strokeOpacity="0.14" strokeWidth="1">
          <circle  cx="330" cy="450" r="290" />
          <ellipse cx="330" cy="450" rx="290" ry="104" />
          <ellipse cx="330" cy="450" rx="290" ry="104" transform="rotate(58 330 450)" />
          <ellipse cx="330" cy="450" rx="104" ry="290" />
        </g>

        {/* One route lifting off the globe, with its two waypoints */}
        <path d="M96 636 C 210 500 430 452 604 236" fill="none"
          stroke={`url(#${route})`} strokeWidth="1.75" strokeDasharray="6 9" strokeLinecap="round" />
        <g>
          <circle cx="223" cy="530" r="5"   fill="none" stroke="#61d1bf" strokeOpacity="0.45" />
          <circle cx="223" cy="530" r="1.8" fill="#61d1bf" fillOpacity="0.7" />
          <circle cx="411" cy="412" r="5"   fill="none" stroke="#61d1bf" strokeOpacity="0.32" />
          <circle cx="411" cy="412" r="1.8" fill="#61d1bf" fillOpacity="0.5" />
        </g>
      </svg>
    </div>
  );
}
