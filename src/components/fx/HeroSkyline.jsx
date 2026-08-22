import React from 'react';

/**
 * Ambient hero backdrop: dusk over a world skyline, with an airliner crossing.
 *
 * Design-only, like everything else in this folder — it renders behind the
 * headline, takes no input and is hidden from assistive tech.
 *
 * Everything here is CSS gradients and inline SVG, no image file. The band used
 * to wash a 1800px photograph of a Maldives beach across itself at 20% opacity:
 * a megabyte of download to tint a city skyline with the wrong subject. This is
 * a couple of kilobytes, stays sharp at any width, and recolours with the brand
 * instead of baking a background into pixels.
 *
 * Depth comes from three bands at three distances — hazy landmarks far off, a
 * lit city block in front of them, and the aircraft nearest of all — rather
 * than from one silhouette floating on flat colour. The landmarks are the ones
 * this site actually sells routes to.
 *
 * The plane's motion lives in index.css (`heroPlane`), inside the same
 * prefers-reduced-motion guard the rest of the page's ambient animation uses —
 * with motion reduced it simply sits still over the skyline.
 */

/* Stars: [x%, y%, radius px, opacity]. Fixed rather than random — a random
   field would redraw differently on every render. They thin out towards the
   bottom of the field, where the city's own glow washes them out. */
const STARS = [
  [4, 11, 1.1, 0.40], [11, 26, 0.9, 0.28], [17, 7, 1.3, 0.48], [23, 19, 0.8, 0.22],
  [29, 32, 1.0, 0.30], [34, 9, 0.9, 0.26], [41, 22, 1.2, 0.42], [47, 14, 0.8, 0.20],
  [52, 29, 1.1, 0.33], [58, 6, 1.0, 0.32], [63, 20, 0.9, 0.24], [69, 34, 1.2, 0.34],
  [74, 11, 0.8, 0.22], [80, 25, 1.1, 0.32], [86, 16, 0.9, 0.26], [91, 31, 1.0, 0.26],
  [96, 8, 1.2, 0.38], [14, 17, 0.8, 0.17], [26, 10, 0.9, 0.21], [44, 35, 0.9, 0.19],
  [50, 8, 0.8, 0.17], [66, 27, 0.8, 0.16], [78, 37, 0.9, 0.17], [94, 22, 0.9, 0.20],
  [8, 40, 0.8, 0.14], [20, 44, 0.9, 0.15], [37, 42, 0.8, 0.13], [55, 46, 0.9, 0.14],
  [72, 43, 0.8, 0.12], [88, 47, 0.9, 0.13],
];

const STAR_FIELD = STARS
  .map(([x, y, r, o]) =>
    `radial-gradient(circle at ${x}% ${y}%, rgba(205,231,255,${o}) 0 ${r}px, rgba(205,231,255,0) ${r + 0.7}px)`)
  .join(',');

/* Cloud bank: wide, soft ellipses. Low enough in the sky to sit under the
   aircraft's flight path and above the skyline. */
const CLOUDS = [
  'radial-gradient(58% 30px at 16% 38%, rgba(146,193,242,0.11), transparent 72%)',
  'radial-gradient(44% 22px at 58% 24%, rgba(146,193,242,0.08), transparent 72%)',
  'radial-gradient(66% 26px at 87% 54%, rgba(146,193,242,0.07), transparent 72%)',
  'radial-gradient(38% 18px at 36% 66%, rgba(146,193,242,0.06), transparent 72%)',
].join(',');

/* The ordinary city the monuments stand in: [x, width, height] on the 1440x260
   skyline viewBox. It fills the gaps between the landmarks so the band reads as
   one horizon rather than as nine cut-outs floating apart, and it stays low —
   tops around y=170, well under the landmarks — because the only sky this hero
   has to spare is the strip right at the horizon. Its windows are lit, which is
   what makes a distant city look inhabited at dusk. */
const FILLER_TOWERS = [
  [-10, 74, 52], [70, 46, 74], [122, 58, 40], [196, 40, 86], [244, 84, 56],
  [340, 52, 72], [400, 64, 44], [478, 46, 88], [532, 78, 54], [620, 42, 68],
  [670, 70, 42], [750, 48, 80], [806, 82, 50], [898, 40, 90], [946, 62, 58],
  [1018, 54, 74], [1080, 76, 46], [1166, 44, 82], [1218, 92, 56], [1318, 50, 70],
  [1376, 74, 48],
];

export default function HeroSkyline() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Dusk gradient. #011328 — the navy sampled out of the logo artwork —
          holds the middle; it deepens overhead and warms towards the horizon,
          which is what stops the band reading as one flat rectangle. */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg,#010a15 0%,#011328 38%,#04213d 74%,#06304f 100%)' }} />

      {/* Stars, thinning out before they reach the city glow. */}
      <div className="absolute inset-x-0 top-0 h-[62%]" style={{ backgroundImage: STAR_FIELD }} />

      {/* Cloud bank. */}
      <div className="absolute inset-x-0 top-[16%] h-[52%]" style={{ backgroundImage: CLOUDS }} />

      {/* The city's own light on the horizon — the reason the sky is lighter
          at the bottom of a night skyline than at the top. */}
      <div className="absolute inset-x-0 bottom-[56px] h-[320px]"
        style={{
          background:
            'radial-gradient(92% 100% at 50% 100%, rgba(34,126,196,0.40) 0%, rgba(14,64,110,0.18) 42%, rgba(1,19,40,0) 74%)',
        }} />

      {/* Skyline — the monuments, held back in haze so the headline stays the
          loudest thing here, over a low city that closes the gaps between them.
          Lifted off the section's own bottom edge: the search card floats over
          the last ~120px of the hero, and a horizon drawn under it is a horizon
          nobody sees. */}
      <svg
        className="absolute bottom-[86px] md:bottom-[104px] left-0 w-full h-[170px] md:h-[230px] text-[#8fc0f0]"
        viewBox="0 0 1440 260"
        preserveAspectRatio="xMidYMax slice"
        fill="currentColor"
      >
        <defs>
          {/* Two window motifs, alternated tower by tower: one grid across the
              whole block would read as woven fabric rather than as a city. */}
          <pattern id="mafWinA" width="20" height="22" patternUnits="userSpaceOnUse">
            <rect x="3" y="5" width="3" height="4" fill="#ffd7a4" opacity="0.70" />
            <rect x="12" y="5" width="3" height="4" fill="#ffd7a4" opacity="0.30" />
            <rect x="7" y="14" width="3" height="4" fill="#ffd7a4" opacity="0.52" />
            <rect x="15" y="14" width="3" height="4" fill="#ffd7a4" opacity="0.20" />
          </pattern>
          <pattern id="mafWinB" width="18" height="20" patternUnits="userSpaceOnUse">
            <rect x="4" y="4" width="3" height="4" fill="#ffd7a4" opacity="0.34" />
            <rect x="11" y="9" width="3" height="4" fill="#ffd7a4" opacity="0.62" />
            <rect x="5" y="14" width="3" height="4" fill="#ffd7a4" opacity="0.26" />
          </pattern>
        </defs>

        {/* The city and its lights are drawn at their own opacities rather than
            inside the landmarks' group: at the group's 0.17 the lit windows
            would be too faint to see at all, and they are the whole point. */}
        {FILLER_TOWERS.map(([x, w, h], i) => (
          <g key={x}>
            <rect x={x} y={260 - h} width={w} height={h} opacity="0.12" />
            <rect x={x} y={260 - h} width={w} height={h}
              fill={`url(#${i % 2 ? 'mafWinB' : 'mafWinA'})`} opacity="0.34" />
          </g>
        ))}

        <g opacity="0.17">
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
        </g>
      </svg>

      {/* Haze at street level. Distant things fade towards the colour of the
          air between you and them, so the city dissolves into the glow instead
          of ending on a hard cut — and it takes the busiest, most window-dense
          strip out from directly behind the wish bar's chips. */}
      <div className="absolute inset-x-0 bottom-[86px] md:bottom-[104px] h-[76px]"
        style={{ background: 'linear-gradient(180deg,rgba(7,48,82,0) 0%,rgba(8,54,92,0.5) 62%,rgba(9,60,100,0.72) 100%)' }} />

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
          <defs>
            {/* The trail thickens and brightens towards the aircraft instead of
                stopping dead. A dashed line read as a dotted rule; a real one
                is dense at the engine and gone by the time it is a mile back. */}
            <linearGradient id="mafTrail" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="currentColor" stopOpacity="0" />
              <stop offset="0.55" stopColor="currentColor" stopOpacity="0.18" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0.5" />
            </linearGradient>
            {/* A cylinder lit from above is bright along the crown and dark
                along the belly. Flat fill made the aircraft a paper cut-out;
                these three gradients are what give it a body. */}
            <linearGradient id="mafBody" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d2ebff" />
              <stop offset="0.5" stopColor="#a3d5ff" />
              <stop offset="1" stopColor="#6ba6da" />
            </linearGradient>
            <linearGradient id="mafWing" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#aedaff" />
              <stop offset="1" stopColor="#7ab2e0" />
            </linearGradient>
            <linearGradient id="mafFin" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4bd8c2" />
              <stop offset="1" stopColor="#1aa494" />
            </linearGradient>
          </defs>
          <path d="M0 26.6 C16 26.4 34 25.8 52 25.2" stroke="url(#mafTrail)"
            strokeWidth="2.6" strokeLinecap="round" fill="none" />

          <g opacity="0.9">
            {/* The far wing, drawn before the fuselage so the belly cuts off
                its root and only the outer half shows. It is a flatter sweep
                than the near one and a darker blue — a wing on the other side
                of the aeroplane is further away and in its shadow. Done as a
                transparency of the same blue it read as a smudge, not a wing. */}
            <path d="M130 28.8 L106 33.9 L99 33.5 L118 29 Z" fill="#5f96c6" />

            {/* Stabiliser before the fuselage too, so the joint is a joint. It
                drops away as it goes back, the same way the wing does — it is
                the same aircraft at the same angle. Swept upward instead it ran
                along the rising tail cone and the two fused into one spike. */}
            <path d="M80 24.9 L62 29.4 L56 30.2 L69 27.9 Z" fill="url(#mafWing)" />

            {/* Swept wing, dropping away as it goes back: the aircraft is seen
                from a little below, the way one crossing the sky is. The blade
                at the tip is the winglet — the one silhouette detail that dates
                an airliner to this century rather than the 1970s. */}
            <path d="M134 29.4 L100 37.8 L92 37.4 L114 29.9 Z" fill="url(#mafWing)" />
            <path d="M99.8 37.9 L98.8 34 L95.4 34.3 L92.6 37.5 Z" fill="url(#mafWing)" />

            {/* Engine, slung under the wing root on its pylon — without the
                pylon the nacelle floats under the belly as a loose capsule.
                The dark disc at the front is the intake and the cone behind is
                the exhaust: a plain capsule reads as a pill, and those two ends
                are the whole difference between a pill and a turbofan. */}
            <path d="M131 29.5 L138.5 29.4 L142 32.4 L132.5 32.6 Z" fill="#7ab2e0" />
            <path d="M124 32.8 L120 33.7 L120 34.9 L124 35.8 Z" fill="#5f96c6" />
            <rect x="124" y="31.4" width="22" height="5.6" rx="2.8" fill="url(#mafBody)" />
            <ellipse cx="145.4" cy="34.2" rx="1.5" ry="2.6" fill="#02182f" opacity="0.4" />

            {/* Fuselage: nose cone, a long rear taper and the upswept tail. The
                nose tip sits below the centreline — airliner noses droop, and
                a symmetrical one looks like a tube with a cap on it. */}
            <path d="M171 25.6
                     C169 22.4 163 20.4 156 20
                     L100 19.6 L88 19.8 L60 21.6 L60 22.6 L88 29.2 L156 30
                     C164 29.9 169 28.2 171 25.6 Z" fill="url(#mafBody)" />

            {/* Livery. The brand's teal runs off the fin and onto the rear
                fuselage the way a real one does, so it is MAFTRAVEL's aircraft
                rather than a clip-art one. The sweep is the deeper teal and the
                fin the lighter, or the whole tail would set as one slab. */}
            <path d="M96 19.65 L88 19.8 L60 21.6 L60 22.6 L80 27.3 Z" fill="#199589" />
            {/* The fin's trailing edge stops short of the tail cone: run the
                two together and the whole rear end fills in as one wedge. */}
            <path d="M88 20 L76 5.5 L68 6.2 L67 21 Z" fill="url(#mafFin)" />
            <path d="M104 28.5 L150 28.85 C153 28.9 155 29.05 156.4 29.25
                     L156 29.95 C154 29.75 152 29.6 150 29.55 L104 29.2 Z"
              fill="#2ec5b0" opacity="0.8" />

            {/* Windows and the flight-deck glass, in the sky's own colour so
                they read as openings rather than as paint. */}
            <path d="M104 24.2 H152" stroke="#02182f" strokeWidth="1.8" strokeLinecap="round"
              strokeDasharray="1.6 4.2" opacity="0.45" />
            <path d="M159 22.6 L165.5 23.6 L165 24.8 L158.5 24.3 Z" fill="#02182f" opacity="0.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}
