import React, { useId } from 'react';
import './flights.css';

/**
 * Flights backdrop: the view from a window seat at cruising altitude.
 *
 * Design-only, like everything in this folder — it renders inside
 * `.page-backdrop`, behind every card on /flights, takes no input and is
 * hidden from assistive tech by its parent.
 *
 * The picture is built in four planes, far to near:
 *   1. The sky wash — a deeper blue overhead, bright white on the horizon, a
 *      sun off the top-right with the 22° halo you only see from up here.
 *   2. Cloud bands — cumulus tops from above (flat base, lumpy crown, shadow
 *      underneath) and a streak of wind-combed cirrus. Each is one element
 *      and one CSS background; no image, no blur.
 *   3. Two contrails: twin engine threads dissipating into a wide haze, with
 *      the aircraft that is drawing them at the head. They cross at a shallow
 *      angle in the left third of the viewport, the way they do in the photo
 *      everyone takes through the window.
 *   4. A corner of an aeronautical chart low-right — latitude arcs, meridians,
 *      a tick ring and one dashed route between two waypoints.
 *
 * All geometry is fixed. A random cloud field would redraw differently on
 * every render; this one is composed. Motion lives in flights.css, inside the
 * prefers-reduced-motion guard — with motion reduced it is a still photograph.
 */

/* Top view of an airliner, nose pointing +x, about 20 units long. Swept
   wings, swept tailplane, a fin seen edge-on as the fuselage line. It is
   drawn twice at the contrail head: once in navy a unit south-east as a
   shadow, so the white speck has an edge against the white haze behind it. */
const AIRCRAFT =
  'M10 0 L1 -1.4 L-6 -9.5 L-7.6 -9.3 L-2.4 -1.3 L-7 -1.1 L-9.6 -4.2 L-10.6 -4 ' +
  'L-9.2 -1 L-10.4 0 L-9.2 1 L-10.6 4 L-9.6 4.2 L-7 1.1 L-2.4 1.3 L-7.6 9.3 ' +
  'L-6 9.5 L1 1.4 Z';

/**
 * One contrail, head at the right of its 1000×40 box. A contrail is not a
 * line: it is two lines (one per engine) that are crisp at the aircraft and,
 * a few kilometres back, have spread into a single soft band. So there are
 * three strokes here — a wide faint haze, then the twin threads on top —
 * all on the same gradient that runs from nothing at the tail to full at
 * the head. Under the threads a slightly wider blue stroke gives them an
 * edge on the pale ground without making them darker than the sky.
 */
function Contrail({ id }) {
  const white = `${id}-w`;
  const blue  = `${id}-b`;
  return (
    <svg viewBox="0 0 1000 40" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={white} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0"    stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="1"    stopColor="#ffffff" stopOpacity="1" />
        </linearGradient>
        <linearGradient id={blue} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0"    stopColor="#015aa3" stopOpacity="0" />
          <stop offset="0.5"  stopColor="#015aa3" stopOpacity="0.10" />
          <stop offset="1"    stopColor="#015aa3" stopOpacity="0.26" />
        </linearGradient>
      </defs>

      {/* Dissipated haze: the oldest part of the trail, already a band. */}
      <path d="M0 20 H930" stroke={`url(#${white})`} strokeWidth="10" strokeLinecap="round" opacity="0.55" />

      {/* Blue underlay, then the twin engine threads. */}
      <g strokeLinecap="round" fill="none">
        <path d="M0 18.2 H956 M0 21.8 H956" stroke={`url(#${blue})`}  strokeWidth="3.6" />
        <path d="M0 18.2 H956 M0 21.8 H956" stroke={`url(#${white})`} strokeWidth="1.8" />
      </g>

      {/* The aircraft, a little ahead of where the threads end: the vapour
          forms a few lengths behind the engines, not at them. */}
      <g transform="translate(972 20) scale(0.82)">
        <path d={AIRCRAFT} fill="#0d1b33" opacity="0.28" transform="translate(1.2 1.4)" />
        <path d={AIRCRAFT} fill="#ffffff" />
      </g>
    </svg>
  );
}

/* Chart geometry, in a 600×600 box whose pole is at (700,700), off the
   bottom-right corner. Latitude arcs are circles about the pole; meridians
   are rays from it. Waypoints sit on the arcs at fixed bearings — the numbers
   are cos/sin of 215°, 225° and 240° at radii 430 and 560, rounded. */
const LAT_RADII    = [300, 430, 560];
const MERIDIAN_DEG = [198, 214, 230, 246, 262];
const WAYPOINTS    = [[348, 453], [304, 304], [485, 328]];

function meridianEnd(deg) {
  const r = 760; // long enough to leave the box in every direction used
  const a = (deg * Math.PI) / 180;
  return [700 + r * Math.cos(a), 700 + r * Math.sin(a)];
}

/**
 * The chart corner. Strokes are brand navy-blue at 10–16% so they read as
 * printed hairlines on paper, not as UI. The tick ring is one dashed stroke
 * drawn thick: the dashes stand perpendicular to the arc, which is exactly
 * what a ring of chart ticks looks like, for the cost of one element.
 */
function Graticule() {
  return (
    <svg viewBox="0 0 600 600" preserveAspectRatio="xMaxYMax meet">
      <g fill="none" stroke="#015aa3" strokeWidth="1">
        {/* Latitude arcs — outer one dashed, as the printed grid alternates. */}
        <circle cx="700" cy="700" r={LAT_RADII[0]} strokeOpacity="0.14" />
        <circle cx="700" cy="700" r={LAT_RADII[1]} strokeOpacity="0.14" />
        <circle cx="700" cy="700" r={LAT_RADII[2]} strokeOpacity="0.12" strokeDasharray="3 7" />

        {/* Meridians converging on the pole. */}
        {MERIDIAN_DEG.map((deg) => {
          const [x, y] = meridianEnd(deg);
          return <path key={deg} d={`M700 700 L${x.toFixed(1)} ${y.toFixed(1)}`} strokeOpacity="0.11" />;
        })}

        {/* Tick ring just outside the middle arc. */}
        <circle cx="700" cy="700" r="438" strokeWidth="7" strokeOpacity="0.13" strokeDasharray="1.2 11.9" />
      </g>

      {/* One route: a dashed great circle lifting between two of the
          waypoints, in the house style RouteGlobe uses. */}
      <path d="M348 453 Q 396 336 485 328" fill="none" stroke="#00a58e" strokeOpacity="0.32"
        strokeWidth="1.5" strokeDasharray="5 8" strokeLinecap="round" />

      {/* Waypoints: ring and dot, in the brand teal — the only warm-ish
          colour on this page's sky, and there to say "route", not "sky". */}
      {WAYPOINTS.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="5.5" fill="none" stroke="#00a58e" strokeOpacity="0.36" />
          <circle cx={x} cy={y} r="1.9" fill="#00a58e" fillOpacity="0.62" />
        </g>
      ))}

      {/* Two crosshair marks off the grid — the odd fix a chart always has. */}
      <g stroke="#015aa3" strokeOpacity="0.16" strokeWidth="1">
        <path d="M528 486 v10 M523 491 h10" />
        <path d="M566 372 v10 M561 377 h10" />
      </g>
    </svg>
  );
}

export default function FlightsBackdrop() {
  const uid = useId().replace(/:/g, '');
  return (
    <div className="bd-flights">
      <div className="bd-flights-sky" />

      {/* Far cloud first, near cloud last — paint order is depth order. */}
      <div className="bd-flights-cloud bd-flights-cloud--a" />
      <div className="bd-flights-cirrus">
        <div className="bd-flights-cloud bd-flights-cloud--d" />
      </div>
      <div className="bd-flights-cloud bd-flights-cloud--c" />

      {/* Contrails sit between the far and near clouds: the aircraft drawing
          them are above cloud C but below the cloud nearest the viewer. */}
      <div className="bd-flights-contrail bd-flights-contrail--east">
        <Contrail id={`bdf-${uid}-e`} />
      </div>
      <div className="bd-flights-contrail bd-flights-contrail--west">
        <Contrail id={`bdf-${uid}-w`} />
      </div>

      <div className="bd-flights-cloud bd-flights-cloud--b" />

      <div className="bd-flights-grid">
        <Graticule />
      </div>
    </div>
  );
}
