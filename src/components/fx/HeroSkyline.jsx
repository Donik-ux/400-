import React from 'react';

/**
 * Ambient hero backdrop: a world skyline with an airliner crossing it.
 *
 * Design-only, like everything else in this folder — it renders behind the
 * headline, takes no input and is hidden from assistive tech.
 *
 * Drawn as inline SVG rather than shipped as a GIF or video: it is a couple of
 * kilobytes instead of a couple of megabytes, stays sharp at any width, and
 * recolours with the brand instead of baking a background into pixels. The
 * landmarks are the ones this site actually sells routes to.
 *
 * The plane's motion lives in index.css (`heroPlane`), inside the same
 * prefers-reduced-motion guard the rest of the page's ambient animation uses —
 * with motion reduced it simply sits still over the skyline.
 */
export default function HeroSkyline() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Skyline — anchored to the bottom edge, faint enough to stay behind
          the headline rather than compete with it. */}
      {/* Lifted off the section's own bottom edge: the search card floats over
          the last ~120px of the hero, and a horizon drawn under it is a horizon
          nobody sees. */}
      <svg
        className="absolute bottom-[86px] md:bottom-[104px] left-0 w-full h-[170px] md:h-[230px] text-[#7fb2e8]"
        viewBox="0 0 1440 260"
        preserveAspectRatio="xMidYMax slice"
        fill="currentColor"
        opacity="0.17"
      >
        {/* Pyramids — Cairo */}
        <path d="M30 260 L108 138 L186 260 Z" />
        <path d="M158 260 L206 186 L254 260 Z" opacity="0.8" />

        {/* Statue of Liberty — New York */}
        <g transform="translate(300 0)">
          <path d="M-14 260 L-14 228 L20 228 L20 260 Z" />
          <path d="M-6 228 L-1 168 L11 168 L16 228 Z" />
          <circle cx="5" cy="156" r="8" />
          <path d="M-3 150 L-8 140 L-1 146 L5 134 L11 146 L18 140 L13 150 Z" />
          <path d="M12 164 L26 124 L32 126 L18 168 Z" />
          <path d="M24 110 L36 110 L33 126 L27 126 Z" />
          <path d="M30 96 L36 110 L24 110 Z" />
        </g>

        {/* Eiffel Tower — Paris */}
        <g transform="translate(430 0)">
          <path d="M-42 260 L-12 148 L-6 148 L-6 62 L-2 40 L2 62 L2 148 L8 148 L38 260 L20 260 L-2 176 L-24 260 Z" />
          <rect x="-16" y="146" width="32" height="6" />
          <rect x="-27" y="196" width="54" height="5" />
        </g>

        {/* Registan — Samarkand */}
        <g transform="translate(610 0)">
          <rect x="-64" y="196" width="128" height="64" />
          <path d="M-64 196 A64 62 0 0 1 64 196 Z" opacity="0.55" />
          <path d="M-34 196 A34 42 0 0 1 34 196 Z" />
          <path d="M0 142 L4 150 L-4 150 Z" />
          <rect x="-84" y="168" width="12" height="92" />
          <path d="M-84 168 A6 10 0 0 1 -72 168 Z" />
          <rect x="72" y="168" width="12" height="92" />
          <path d="M72 168 A6 10 0 0 1 84 168 Z" />
        </g>

        {/* Big Ben — London */}
        <g transform="translate(760 0)">
          <rect x="-16" y="112" width="32" height="148" />
          <circle cx="0" cy="136" r="9" opacity="0.5" />
          <path d="M-16 112 L0 76 L16 112 Z" />
          <path d="M0 76 L0 62" stroke="currentColor" strokeWidth="3" />
        </g>

        {/* Taj Mahal — Agra */}
        <g transform="translate(900 0)">
          <rect x="-62" y="210" width="124" height="50" />
          <path d="M-34 210 A34 46 0 0 1 34 210 Z" />
          <path d="M0 156 L3 164 L-3 164 Z" />
          <rect x="-56" y="182" width="9" height="78" opacity="0.8" />
          <rect x="47" y="182" width="9" height="78" opacity="0.8" />
        </g>

        {/* Hagia Sophia — Istanbul */}
        <g transform="translate(1060 0)">
          <rect x="-70" y="214" width="140" height="46" />
          <path d="M-44 214 A44 40 0 0 1 44 214 Z" />
          <path d="M-70 214 A26 22 0 0 1 -18 214 Z" opacity="0.7" />
          <path d="M18 214 A26 22 0 0 1 70 214 Z" opacity="0.7" />
          <rect x="-82" y="160" width="9" height="100" />
          <path d="M-82 160 A4.5 9 0 0 1 -73 160 Z" />
          <rect x="73" y="160" width="9" height="100" />
          <path d="M73 160 A4.5 9 0 0 1 82 160 Z" />
        </g>

        {/* Burj Khalifa — Dubai */}
        <g transform="translate(1210 0)">
          <path d="M-26 260 L-20 172 L-12 172 L-10 104 L-4 104 L-2 46 L0 20 L2 46 L4 104 L10 104 L12 172 L20 172 L26 260 Z" />
        </g>

        {/* Colosseum — Rome */}
        <g transform="translate(1350 0)">
          <path d="M-78 260 L-78 196 A78 44 0 0 1 78 196 L78 260 Z" />
          <rect x="-58" y="212" width="16" height="30" fill="#02182f" opacity="0.55" rx="8" />
          <rect x="-26" y="206" width="16" height="36" fill="#02182f" opacity="0.55" rx="8" />
          <rect x="8" y="206" width="16" height="36" fill="#02182f" opacity="0.55" rx="8" />
          <rect x="40" y="212" width="16" height="30" fill="#02182f" opacity="0.55" rx="8" />
        </g>
      </svg>

      {/* The plane flies through the band between the navbar and the headline —
          the hero's top padding, the one strip here with nothing in it. Across
          the middle it cut straight through the words.

          Drawn in side profile rather than from below. A wide-body seen from
          underneath is nearly as wide as it is long — a square silhouette in a
          strip of sky this shallow — and with the wings the only feature in
          view it read as a fighter. From the side the aircraft is three times
          longer than it is tall, which is the shape this band wants, and the
          tail fin, the stabiliser, the underslung engine and the window line
          are all things only an airliner has. */}
      <div className="hero-plane absolute left-0 top-[64px] w-full">
        <svg width="176" height="44" viewBox="0 0 176 44" fill="none" className="text-[#9fd3ff]">
          {/* Contrail, fading out behind the aircraft. */}
          <path d="M2 25 H46" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            strokeDasharray="3 11" opacity="0.35" />

          <g fill="currentColor" opacity="0.9">
            {/* Tail fin and stabiliser first, so the fuselage overlaps their
                roots the way the real joints do. The fin's trailing edge stops
                short of the tail cone: run the two together and the whole rear
                end fills in as one wedge. */}
            <path d="M88 20 L76 5.5 L68 6.2 L67 21 Z" />
            {/* The stabiliser drops away as it goes back, the same way the wing
                does — it is the same aircraft at the same angle. Swept upward
                instead it ran along the rising tail cone and the two fused
                into one long spike. */}
            <path d="M80 24.9 L62 29.4 L56 30.2 L69 27.9 Z" />

            {/* Swept wing, dropping away as it goes back: the aircraft is seen
                from a little below, the way one crossing the sky is. */}
            <path d="M134 29.4 L100 37.8 L92 37.4 L114 29.9 Z" />

            {/* Engine, slung under the wing root on its pylon — without the
                pylon the nacelle floats under the belly as a loose capsule. */}
            <path d="M131 29.5 L138.5 29.4 L142 32.4 L132.5 32.6 Z" />
            <rect x="124" y="31.4" width="22" height="5.6" rx="2.8" />

            {/* Fuselage: nose cone, a long rear taper and the upswept tail. */}
            <path d="M171 25
                     C169 22.2 163 20.4 156 20
                     L100 19.6 L88 19.8 L60 21.6 L60 22.6 L88 29.2 L156 30
                     C163 29.8 169 27.8 171 25 Z" />
          </g>

          {/* Windows and the flight-deck glass, in the sky's own colour so they
              read as openings rather than as paint. */}
          <path d="M104 24.4 H152" stroke="#02182f" strokeWidth="1.8" strokeLinecap="round"
            strokeDasharray="1.6 4.2" opacity="0.45" />
          <path d="M159 22.4 L165.5 23.4 L165 24.6 L158.5 24.1 Z" fill="#02182f" opacity="0.5" />
        </svg>
      </div>
    </div>
  );
}
