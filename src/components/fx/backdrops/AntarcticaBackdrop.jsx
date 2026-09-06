import React, { useId } from 'react';
import './antarctica.css';

/**
 * Ambient backdrop for /antarctica: a polar night, seen from the ice.
 *
 * Design-only, like the rest of this folder. It mounts inside PageBackdrop's
 * fixed layer, on top of the shared light ground and under every card and
 * hero band, so it is only ever seen in the gutters, the section gaps and
 * around content. Everything strong lives at the edges; the centre column,
 * where headings sometimes sit straight on the ground, stays near-silent.
 *
 * The ground is pale, so this is not a black sky with white stars — that
 * would mean painting the whole viewport dark and fighting every paragraph.
 * Instead the night is suggested: navy dusk pooling in the top corners, an
 * aurora laid on as translucent tints of green, violet and ice, stars drawn
 * as ice-blue glints with a deep core (a white dot on a white ground is no
 * dot at all), and, along the bottom, the one silhouette that says Antarctica
 * rather than "winter": tabular icebergs — flat-topped, sheer-sided — with
 * pack ice in front and a hint of their reflection in black water.
 *
 * All motion is in antarctica.css, inside a prefers-reduced-motion guard.
 * With motion reduced this is a finished still: the ribbons rest at their
 * skewed poses, the snow hangs, the stars hold.
 *
 * Colour is Antarctica's own from the brand palette: ice #9fd6e8,
 * deep #1f6d94, aurora green #7fe3c1, violet #8b8bdc, navy #0d1b33.
 */

/* Stars: [x%, y%, radius px, opacity, twinkle group].
   Fixed rather than random so the field is the same on every render.
   They gather in the top corners, over the dusk, and thin to almost nothing
   across the centre where text may sit. Group 1 and 2 twinkle on different
   clocks; group 0 holds still. */
const STARS = [
  // top-left cluster
  [3, 6, 1.4, 0.34, 1], [7, 14, 1.0, 0.24, 0], [11, 4, 1.1, 0.28, 2], [14, 22, 0.9, 0.20, 0],
  [5, 30, 1.2, 0.26, 2], [17, 11, 1.3, 0.30, 1], [9, 39, 0.9, 0.18, 0], [20, 33, 1.0, 0.20, 0],
  [2, 20, 0.9, 0.22, 0], [15, 46, 0.8, 0.14, 2],
  // top-right cluster (the moon sits among these)
  [97, 5, 1.3, 0.32, 2], [92, 20, 1.1, 0.26, 0], [84, 8, 1.0, 0.24, 1], [88, 30, 1.2, 0.26, 2],
  [95, 38, 1.0, 0.22, 0], [81, 25, 0.9, 0.20, 0], [98, 26, 1.4, 0.34, 1], [86, 44, 0.8, 0.14, 0],
  [79, 15, 0.9, 0.18, 0],
  // a few faint ones across the middle, so the sky does not stop at the columns
  [30, 9, 0.8, 0.12, 0], [44, 5, 0.9, 0.13, 2], [58, 12, 0.8, 0.11, 0], [70, 6, 0.9, 0.13, 1],
  [37, 19, 0.7, 0.09, 0], [63, 23, 0.7, 0.09, 0],
];

/* Snow: [x%, y% of one wrap cycle (0..50), radius px].
   Two layers at two depths. The near layer is larger, faster and kept to the
   gutters; the far layer is tiny, slow, and free to cross the page because at
   that size it never competes with text. Each flake is drawn twice, half a
   layer apart, so the translateY loop wraps without a seam. */
const SNOW_NEAR = [
  [4, 3, 2.6], [13, 16, 2.2], [8, 29, 2.4], [19, 44, 2.0],
  [86, 9, 2.8], [93, 22, 2.3], [81, 38, 2.1],
];
const SNOW_FAR = [
  [27, 7, 1.3], [41, 21, 1.1], [58, 4, 1.4], [66, 36, 1.2],
  [35, 42, 1.0], [74, 17, 1.3], [50, 28, 1.1], [22, 33, 1.0],
];

function Star([x, y, r, o]) {
  const cx = `${x}%`;
  const cy = `${y}%`;
  return (
    <g key={`${x}-${y}`}>
      {/* Halo first, then the deep core: a glint on pale ground is a dark
          point inside a soft blue bloom, the reverse of a star on black. */}
      <circle cx={cx} cy={cy} r={+(r * 3.4).toFixed(2)} fill="#9fd6e8" opacity={+(o * 0.9).toFixed(3)} />
      <circle cx={cx} cy={cy} r={r} fill="#1f6d94" opacity={o} />
      {r >= 1.2 && <circle cx={cx} cy={cy} r={+(r * 0.42).toFixed(2)} fill="#ffffff" opacity={0.85} />}
    </g>
  );
}

function SnowLayer({ flakes, className, fill, opacity }) {
  return (
    <svg className={`bd-antarctica-snow ${className}`} width="100%" height="100%">
      {flakes.map(([x, y, r]) => (
        <g key={`${x}-${y}`} fill={fill} opacity={opacity}>
          <circle cx={`${x}%`} cy={`${y}%`} r={r} />
          <circle cx={`${x}%`} cy={`${y + 50}%`} r={r} />
        </g>
      ))}
    </svg>
  );
}

export default function AntarcticaBackdrop() {
  const uid = useId().replace(/:/g, '');
  const bergGrad = `bd-antarctica-berg-${uid}`;
  const floeGrad = `bd-antarctica-floe-${uid}`;
  const bergsId  = `bd-antarctica-bergs-${uid}`;

  return (
    <div className="bd-antarctica">
      {/* Dusk pooling in the top corners, a cold tint across the top of the
          sky, and the sea's ice-light rising from the bottom. One element,
          all gradients, static. */}
      <div className="bd-antarctica-dusk" />

      {/* Moon with a 22° halo — the ring ice crystals draw around a moon in
          air this cold. Drawn as a glow with a thin bordered ring, no SVG. */}
      <div className="bd-antarctica-moon" />

      {/* Aurora: three ribbons across the upper third, each a row of soft
          radial lobes so the colour arrives and leaves without an edge. The
          strong lobes sit at the ends; each ribbon crosses the centre column
          at a whisper. Rays (the striations aurora curtains have) are painted
          by the ribbon's ::before, masked to the ends only. */}
      <div className="bd-antarctica-aurora bd-antarctica-aurora--1" />
      <div className="bd-antarctica-aurora bd-antarctica-aurora--2" />
      <div className="bd-antarctica-aurora bd-antarctica-aurora--3" />

      {/* A meteor across the top-right dusk, once every 41 s. */}
      <div className="bd-antarctica-meteor" />

      {/* Two bergs adrift on the sea-light above the pack ice, one each
          side, moving a few vw over a minute and a half. Flat-topped like
          the horizon's — this is Antarctica, not the Arctic. */}
      <svg className="bd-antarctica-berg bd-antarctica-berg--l" viewBox="0 0 220 80" width="220" height="80">
        <path d="M0 80 L6 46 L38 40 L52 22 L120 18 L150 30 L196 34 L220 52 L220 80 Z" fill="#c9e6f0" fillOpacity="0.55" />
        <path d="M52 22 L120 18 L150 30 L120 32 L60 34 Z" fill="#ffffff" fillOpacity="0.7" />
        <path d="M0 80 L220 80 L220 88 L0 88 Z" fill="#1f6d94" fillOpacity="0.10" />
      </svg>
      <svg className="bd-antarctica-berg bd-antarctica-berg--r" viewBox="0 0 180 70" width="180" height="70">
        <path d="M0 70 L10 40 L46 34 L70 14 L130 16 L158 28 L180 44 L180 70 Z" fill="#c9e6f0" fillOpacity="0.5" />
        <path d="M70 14 L130 16 L158 28 L120 28 L74 26 Z" fill="#ffffff" fillOpacity="0.65" />
      </svg>

      {/* Stars. Percent coordinates rather than a viewBox, so the field keeps
          its place in the corners at every viewport instead of being scaled
          and cropped with the page. */}
      <svg className="bd-antarctica-stars" width="100%" height="100%">
        <g>{STARS.filter((s) => s[4] === 0).map(Star)}</g>
        <g className="bd-antarctica-twinkle-a">{STARS.filter((s) => s[4] === 1).map(Star)}</g>
        <g className="bd-antarctica-twinkle-b">{STARS.filter((s) => s[4] === 2).map(Star)}</g>
      </svg>

      {/* Snowfall, two depths. */}
      <SnowLayer flakes={SNOW_FAR}  className="bd-antarctica-snow--far"  fill="#1f6d94" opacity="0.16" />
      <SnowLayer flakes={SNOW_NEAR} className="bd-antarctica-snow--near" fill="#9fd6e8" opacity="0.62" />

      {/* Ice horizon. Tabular bergs far off — flat tops and sheer faces, the
          Antarctic shape — then pack-ice plates in front, sitting on a dark
          waterline that carries a sliver of the bergs' reflection. The big
          shapes are at the ends of the line; under the content column the
          horizon drops to a few low plates. Anchored bottom-centre, sliced,
          so it stays the same scale at any width. */}
      <svg
        className="bd-antarctica-floes"
        viewBox="0 0 1440 150"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          <linearGradient id={bergGrad} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0"   stopColor="#9fd6e8" stopOpacity="0.30" />
            <stop offset="1"   stopColor="#9fd6e8" stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id={floeGrad} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0"   stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="0.5" stopColor="#c9e6f0" stopOpacity="0.70" />
            <stop offset="1"   stopColor="#1f6d94" stopOpacity="0.18" />
          </linearGradient>
        </defs>

        {/* Far bergs, base on the waterline at y=124. */}
        <path
          id={bergsId}
          fill={`url(#${bergGrad})`}
          d="M0 124 V70 L38 66 L52 52 L120 50 L134 62 L196 60 L206 124 Z
             M250 124 L262 104 L318 100 L330 124 Z
             M600 124 L612 114 L700 112 L708 124 Z
             M820 124 L830 116 L880 115 L886 124 Z
             M1130 124 L1140 106 L1200 104 L1212 124 Z
             M1250 124 L1262 58 L1330 54 L1352 40 L1440 46 V124 Z"
        />

        {/* Open water: a band of the deep, then the bergs mirrored into it. */}
        <rect x="0" y="124" width="1440" height="26" fill="#1f6d94" opacity="0.07" />
        <use href={`#${bergsId}`} transform="translate(0 248) scale(1 -1)" opacity="0.30" />
        <line x1="0" y1="124" x2="1440" y2="124" stroke="#9fd6e8" strokeOpacity="0.45" strokeWidth="1" />

        {/* Pack ice in front — plates with a lit top and a shadowed face,
            heaviest at the ends, low and sparse under the content. */}
        <g fill={`url(#${floeGrad})`}>
          <path d="M-10 130 V112 L70 106 L160 110 L240 104 L296 112 L340 130 Z" />
          <path d="M1100 130 L1150 110 L1230 106 L1300 112 L1380 104 L1450 110 V130 Z" />
          <path d="M520 128 L540 120 L600 118 L630 128 Z" />
          <path d="M880 128 L900 121 L960 119 L980 128 Z" />
          {/* loose fragments drifting in the water at the corners */}
          <path d="M380 134 L392 129 L426 128 L436 134 Z" opacity="0.8" />
          <path d="M1020 136 L1034 131 L1070 130 L1080 136 Z" opacity="0.8" />
        </g>
        {/* Shadow under the front plates, so they sit on the water rather than float. */}
        <g fill="#1f6d94" opacity="0.10">
          <path d="M-10 130 H340 L332 134 H-10 Z" />
          <path d="M1100 130 H1450 V134 H1108 Z" />
        </g>
      </svg>
    </div>
  );
}
