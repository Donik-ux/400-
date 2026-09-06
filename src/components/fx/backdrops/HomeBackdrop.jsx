import React, { useEffect, useId, useState } from 'react';
import './home.css';

/**
 * Home motif: the world's routes.
 *
 * Decoration only. It sits inside PageBackdrop under every card on the page
 * and shows in the gutters and the gaps between sections. The picture: home
 * glows teal in the bottom-left corner, three dashed great circles lift off
 * the planet's limb there and fan out towards a cold blue far-away in the
 * top-right, and one tiny airliner creeps along the longest of them.
 *
 * The scene is a fixed 1440x900 drawing scaled to cover the viewport
 * (`xMidYMid slice`) — the same crop rule at every size, so a waypoint tuned
 * to sit in the 144px gutter at 1440 is still in the gutter at 1920. Phones
 * get a separate portrait scene with a single route: the desktop one cropped
 * to 390px wide would be a corner of a corner.
 *
 * Two SVGs rather than one. Everything that moves — the airliner and the two
 * beacon pings — lives in its own layer, so the dashed routes underneath are
 * painted once and never redrawn. The airliner's keyframes in home.css are
 * sampled from ROUTES[0] here — regenerate them if the path changes.
 */

/* [d, dash, width, opacity]. All three leave the same origin and head right,
   so one horizontal gradient colours them all: teal near home, blue far away,
   and almost nothing across the middle 40% of the screen, where the page's
   own headings sit straight on the ground. Different dash cadences are what
   keep three lines from one point reading as a fan of the same line. */
const ROUTES = [
  ['M98 706 C520 300 940 60 1332 152',   '7 9',     1.6, 1],    // long haul — the airliner's
  ['M98 706 C480 540 1010 470 1400 548', '1.4 6.6', 1.5, 0.9],  // short and flat — the Gulf
  ['M98 706 C210 420 330 180 640 -40',   '13 11',   1.1, 0.75], // north, off the top of the map
];

/* [x, y, ring r, label, label x, label y, anchor]. The labelled waypoints sit
   inside the gutters of a 1440 layout; the unlabelled dots are stopovers that
   only show when a section gap scrolls past them. Fixed positions, not
   random — a random scatter would redraw on every render. */
const WAYPOINTS = [
  [98,   706, 7, 'TAS', 88,   746, 'end'],
  [1332, 152, 5, 'JFK', 1346, 156, 'start'],
  [1400, 548, 5, 'DXB', 1388, 578, 'end'],
  [295,  308, 3, null],
  [1033, 143, 3, null],
];

/* The same crop rule as `preserveAspectRatio="xMidYMid slice"`: cover the
   viewport, keep the centre. Read on mount and on resize; nothing else here
   touches state. */
function stageScale() {
  if (typeof window === 'undefined') return 1;
  return Math.max(window.innerWidth / 1440, window.innerHeight / 900);
}
function useStageScale() {
  const [scale, setScale] = useState(stageScale);
  useEffect(() => {
    const onResize = () => setScale(stageScale());
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return scale;
}

export default function HomeBackdrop() {
  const scale = useStageScale();
  const uid   = useId().replace(/:/g, '');
  const route = `bd-home-route-${uid}`;
  const trail = `bd-home-trail-${uid}`;
  const halo  = `bd-home-halo-${uid}`;

  return (
    <div className="bd-home">
      {/* Light first: home is warm teal, far away is cold blue, and a breath
          of ivory bottom-right keeps the whole ground from going clinical. */}
      <div className="bd-home-glow bd-home-glow--teal" />
      <div className="bd-home-glow bd-home-glow--blue" />
      <div className="bd-home-glow bd-home-glow--ivory" />

      {/* Static layer: the limb, the routes, the waypoints. */}
      <svg className="bd-home-routes bd-home-routes--desk" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={route} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1440" y2="0">
            <stop offset="0"    stopColor="#00a58e" stopOpacity="0.62" />
            <stop offset="0.10" stopColor="#00a58e" stopOpacity="0.55" />
            <stop offset="0.28" stopColor="#0596a5" stopOpacity="0.13" />
            <stop offset="0.50" stopColor="#0184b5" stopOpacity="0.09" />
            <stop offset="0.72" stopColor="#0179c2" stopOpacity="0.13" />
            <stop offset="0.88" stopColor="#0172cb" stopOpacity="0.50" />
            <stop offset="1"    stopColor="#0172cb" stopOpacity="0.58" />
          </linearGradient>
        </defs>

        {/* The planet's limb, curving through the bottom-left corner with the
            origin sitting exactly on it: the routes lift off the world, they
            do not start from a dot in space. A wide, nearly invisible band
            outside the line is its atmosphere. */}
        <g fill="none" stroke="#008f77">
          <circle cx="-440" cy="1270" r="806" strokeWidth="10" strokeOpacity="0.035" vectorEffect="non-scaling-stroke" />
          <circle cx="-440" cy="1270" r="779" strokeWidth="1"  strokeOpacity="0.20"  vectorEffect="non-scaling-stroke" />
          <circle cx="-440" cy="1270" r="754" strokeWidth="1"  strokeOpacity="0.08"  vectorEffect="non-scaling-stroke" />
        </g>

        <g fill="none" stroke={`url(#${route})`} strokeLinecap="round">
          {ROUTES.map(([d, dash, w, o]) => (
            <path key={d} d={d} strokeWidth={w} strokeDasharray={dash} opacity={o} vectorEffect="non-scaling-stroke" />
          ))}
        </g>

        {/* Waypoints take the route gradient too, so a stopover in the middle
            of the screen is as quiet as the line it sits on. */}
        <g stroke={`url(#${route})`} fill={`url(#${route})`}>
          {WAYPOINTS.map(([x, y, r, label, lx, ly, anchor]) => (
            <g key={`${x}-${y}`}>
              <circle cx={x} cy={y} r={r} fill="none" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
              <circle cx={x} cy={y} r={r * 0.36} stroke="none" />
              {label && <text className="bd-home-code" x={lx} y={ly} textAnchor={anchor}>{label}</text>}
            </g>
          ))}
        </g>
      </svg>

      {/* Portrait scene for phones: one route and its origin, nothing else. */}
      <svg className="bd-home-routes bd-home-routes--mobile" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={`${route}-m`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="390" y2="0">
            <stop offset="0"   stopColor="#00a58e" stopOpacity="0.30" />
            <stop offset="0.5" stopColor="#0184b5" stopOpacity="0.12" />
            <stop offset="1"   stopColor="#0172cb" stopOpacity="0.30" />
          </linearGradient>
        </defs>
        <circle cx="-260" cy="1000" r="451" fill="none" stroke="#008f77" strokeOpacity="0.18" strokeWidth="1" />
        <path d="M36 660 C150 470 260 250 420 120" fill="none" stroke={`url(#${route}-m)`}
          strokeWidth="1.5" strokeDasharray="6 8" strokeLinecap="round" />
        <circle cx="36" cy="660" r="5"   fill="none" stroke="#00a58e" strokeOpacity="0.3" strokeWidth="1.2" />
        <circle cx="36" cy="660" r="1.8" fill="#00a58e" fillOpacity="0.4" />
        <circle cx="211" cy="368" r="1.6" fill="#0184b5" fillOpacity="0.35" />
      </svg>

      {/* Live layer: the beacons. Two circles animating opacity/scale inside an
          SVG repaint a dirty rect the size of a coin — measured at nothing. */}
      <svg className="bd-home-live" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
        <circle className="bd-home-ping"                   cx="98"   cy="706" r="30" fill="none" stroke="#00a58e" strokeWidth="1.2" />
        <circle className="bd-home-ping bd-home-ping--far" cx="1332" cy="152" r="22" fill="none" stroke="#0172cb" strokeWidth="1.2" />
      </svg>

      {/* The airliner lives OUTSIDE the SVG on purpose. Chromium cannot
          composite a transform on an SVG child, so animating it there
          re-laid-out the whole scene every frame (~144 layouts/s idle,
          measured). On an HTML box the transform keyframes run on the
          compositor. The stage is a 1440x900 box scaled with the same rule
          as `xMidYMid slice` — max(vw/1440, vh/900), centred — so the plane's
          px coordinates land exactly on the dashed route drawn above. */}
      <div className="bd-home-stage" style={{ '--bd-home-s': scale }}>
        <div className="bd-home-plane">
          {/* Drawn centred on 0,0 with its nose to +x, so the keyframes'
              rotate() turns it about its own centre. Side profile, like the hero's: fin, stabiliser and swept
              wing are the three marks that make a 30px silhouette an airliner
              rather than a dart. The white halo lifts it off the dot grid; the
              trail thickens towards the engine and is gone a mile back. */}
          <svg viewBox="-70 -20 140 40" width="140" height="40">
            <defs>
              {/* userSpaceOnUse on purpose: a horizontal line has a zero-height
                  bounding box, and a bbox gradient on it does not render at all. */}
              <linearGradient id={trail} gradientUnits="userSpaceOnUse" x1="-64" y1="0" x2="-16" y2="0">
                <stop offset="0" stopColor="#00a58e" stopOpacity="0" />
                <stop offset="1" stopColor="#00a58e" stopOpacity="0.55" />
              </linearGradient>
              <radialGradient id={halo}>
                <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle r="15" fill={`url(#${halo})`} opacity="0.55" />
            <path d="M-16 0.2 H-64" stroke={`url(#${trail})`} strokeWidth="1.5" strokeLinecap="round" />
            <g fill="#1c2127" fillOpacity="0.8">
              <path d="M5 -0.8 L-2.5 -4.4 L-4.8 -4.2 L0 -0.8 Z" fillOpacity="0.45" />
              <path d="M-9.5 0.4 L-13.5 3 L-15.2 2.9 L-12 0.3 Z" />
              <path d="M5 0.5 L-4 5.4 L-6.8 5.2 L-1 0.6 Z" />
              <path d="M15 0 C14.2 -1.5 12 -2.3 9 -2.5 L-5 -2.5 L-12 -1.6 L-13.5 -0.6 L-13.5 0.4 L-6 2.2 L9 2.3 C12 2.3 14.2 1.5 15 0 Z" />
              <path d="M-5 -2.4 L-8.5 -8.6 L-11.2 -8.4 L-12 -2.2 Z" fill="#00a58e" fillOpacity="0.9" />
            </g>
            <path d="M-3 -1.1 H9" stroke="#f7f9fb" strokeWidth="0.8" strokeDasharray="0.8 1.6" strokeOpacity="0.6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
