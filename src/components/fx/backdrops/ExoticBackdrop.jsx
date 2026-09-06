import React, { useId } from 'react';
import './exotic.css';

/**
 * Exotic Tours backdrop: golden hour in the tropics.
 *
 * Design-only, like everything in this folder. It mounts inside the fixed
 * `.page-backdrop`, on top of the shared ground and under every card, so the
 * only places it is ever seen are gutters, section gaps and the space around
 * content. The composition is built for that: the sun sets in the bottom-left
 * corner, a lagoon cools the top-right, and the fronds reach in from those two
 * corners and dissolve before they meet the column of cards. The middle of the
 * viewport stays clean light ground, because on the tour page a heading and a
 * paragraph sit straight on it.
 *
 * Everything is CSS gradients and inline SVG: no image, no blur filter. The
 * glows are radial gradients (softness for free), the leaves are geometry
 * generated from fixed tables — a random frond would grow different leaflets
 * on every render — and the motion lives in exotic.css behind a
 * prefers-reduced-motion guard, so with motion reduced the scene simply holds
 * still and still looks finished.
 */

/* ---------- Palm frond ------------------------------------------------ */

/* The rachis (the frond's spine) is one quadratic Bezier in a 600×600 box,
   rising from the bottom-left corner and arching over to the right. Leaflets
   hang off it at fixed stations along the curve. */
const R0 = [30, 592];
const R1 = [150, 300];
const R2 = [572, 118];

const onRachis = (t) => {
  const u = 1 - t;
  return [
    u * u * R0[0] + 2 * u * t * R1[0] + t * t * R2[0],
    u * u * R0[1] + 2 * u * t * R1[1] + t * t * R2[1],
  ];
};
const rachisAngle = (t) => {
  const dx = 2 * (1 - t) * (R1[0] - R0[0]) + 2 * t * (R2[0] - R1[0]);
  const dy = 2 * (1 - t) * (R1[1] - R0[1]) + 2 * t * (R2[1] - R1[1]);
  return (Math.atan2(dy, dx) * 180) / Math.PI;
};

/* One leaflet: a tapered blade that bends towards its tip. Drawn along +x in
   its own frame and rotated into place, so the shape is the same everywhere
   and only length, sag and angle change. */
const leafletPath = (len, sag) => {
  const w = Math.max(2.6, len * 0.05);
  const cx = (len * 0.58).toFixed(1);
  return `M0 0Q${cx} ${-w.toFixed(1)} ${len.toFixed(1)} ${sag.toFixed(1)}Q${cx} ${w.toFixed(1)} 0 0Z`;
};

/* Leaflets are longest mid-frond and short at both ends, like the real thing.
   Upper and lower rows are staggered half a station apart so they do not pair
   up like the teeth of a comb; the lower row hangs further because gravity
   pulls the underside of a frond harder than the top. A short fixed table
   nudges each leaflet's length and angle — identical leaflets at identical
   spacing read as a comb, and a random nudge would change on every render. */
const NUDGE = [
  [0.94, -2.5], [1.05, 1.5], [0.98, 3], [1.07, -1], [0.92, 2], [1.02, -3],
  [0.9, 1], [1.06, 2.5], [1.0, -2], [0.95, 3.5], [1.04, -1.5],
];
const STATIONS = 22;
const LEAFLETS = [];
for (let i = 0; i < STATIONS; i++) {
  const step = 0.86 / (STATIONS - 1);
  for (const side of [-1, 1]) {
    const t = 0.10 + i * step + (side > 0 ? step * 0.5 : 0);
    if (t > 0.965) continue;
    const [scale, tilt] = NUDGE[(i * 2 + (side > 0 ? 1 : 0)) % NUDGE.length];
    const len = (46 + 126 * Math.sin(Math.PI * Math.min(1, t * 1.04))) * scale;
    const [x, y] = onRachis(t);
    const a = rachisAngle(t) + (side < 0 ? -34 : 70) + tilt;
    const sag = len * (side < 0 ? 0.11 : 0.17);
    LEAFLETS.push({ x: x.toFixed(1), y: y.toFixed(1), a: a.toFixed(1), d: leafletPath(len, sag) });
  }
}

/* The spine as a filled taper: thick at the base, gone to nothing at the tip.
   A stroked line has one width everywhere and reads as wire. */
const RACHIS = `M${R0[0] - 4} ${R0[1]}Q${R1[0] - 3} ${R1[1] - 3} ${R2[0]} ${R2[1]}Q${R1[0] + 3} ${R1[1] + 3} ${R0[0] + 4} ${R0[1]}Z`;

/* ---------- Monstera leaf --------------------------------------------- */

/* The leaf is built rather than traced. A heart-shaped top lobe is drawn by
   hand; below it, five strap-like segments a side, each an axis with an
   inner point, an angle, a length and a width. Adjacent straps leave a slit
   between them that is narrow at the midrib and opens a little towards the
   margin, which is the cut a real monstera makes. Segment ends are
   half-circles, and the upper three carry a fenestration along their axis.
   The midrib is x=200 in a 400-wide box; the left side is the right side
   mirrored, walked back up, so the outline closes as one path. */
const SEGMENTS = [
  /* inner x, inner y, angle, length, width */
  [240, 168, -2, 128, 50],
  [240, 232,  7, 124, 50],
  [236, 294, 17, 110, 46],
  [230, 350, 28,  90, 42],
  [220, 398, 42,  66, 34],
];
/* The top lobe, right side, as cubics [c1x, c1y, c2x, c2y, x, y] from the
   petiole up and around to the first slit. */
const AURICLE = [
  [232, 8, 318, -6, 350, 40],
  [376, 74, 366, 110, 334, 122],
  [306, 136, 270, 138, 250, 134],
];

const rad = (deg) => (deg * Math.PI) / 180;
const n1 = (n) => Number(n.toFixed(1));
const pt = ([x, y]) => `${x} ${y}`;

/* The corner points of one strap on side s (+1 right, -1 left): U = upper
   edge, D = lower edge, 0 = at the midrib, 1 = at the margin. cu/cl are the
   control points that bow each edge outward a touch, so the straps are not
   ruler-straight. */
const strap = ([ix, iy, a, L, w], s) => {
  const dx = Math.cos(rad(a)), dy = Math.sin(rad(a));
  const nx = -dy, ny = dx;
  const h = w / 2;
  const P = (x, y) => [n1(200 + s * (x - 200)), n1(y)];
  return {
    U0: P(ix - nx * h, iy - ny * h),
    U1: P(ix - nx * h + dx * L, iy - ny * h + dy * L),
    D1: P(ix + nx * h + dx * L, iy + ny * h + dy * L),
    D0: P(ix + nx * h, iy + ny * h),
    cu: P(ix - nx * (h + 7) + dx * L * 0.5, iy - ny * (h + 7) + dy * L * 0.5),
    cl: P(ix + nx * (h + 7) + dx * L * 0.5, iy + ny * (h + 7) + dy * L * 0.5),
    r: n1(h),
  };
};

const monsteraOutline = () => {
  const R = SEGMENTS.map((f) => strap(f, 1));
  const Lf = SEGMENTS.map((f) => strap(f, -1));
  /* The slit bottom: a small curve between two straps, pulled in towards
     the midrib so the cut ends rounded rather than as a sharp V. */
  const slit = (a, b, s) => `Q${n1((a[0] + b[0]) / 2 - s * 9)} ${n1((a[1] + b[1]) / 2)} ${pt(b)}`;

  let d = 'M200 40';
  for (const [a, b, c, e, x, y] of AURICLE) d += `C${a} ${b} ${c} ${e} ${x} ${y}`;
  d += `Q240 134 ${pt(R[0].U0)}`;
  R.forEach((f, k) => {
    d += `Q${pt(f.cu)} ${pt(f.U1)}A${f.r} ${f.r} 0 0 1 ${pt(f.D1)}Q${pt(f.cl)} ${pt(f.D0)}`;
    if (k < R.length - 1) d += slit(f.D0, R[k + 1].U0, 1);
  });
  d += 'Q206 438 200 456';
  d += `Q194 438 ${pt(Lf[4].D0)}`;
  for (let k = Lf.length - 1; k >= 0; k--) {
    const f = Lf[k];
    d += `Q${pt(f.cl)} ${pt(f.D1)}A${f.r} ${f.r} 0 0 1 ${pt(f.U1)}Q${pt(f.cu)} ${pt(f.U0)}`;
    if (k > 0) d += slit(f.U0, Lf[k - 1].D0, -1);
  }
  d += 'Q160 134 150 134';
  /* The top lobe again, mirrored and reversed: a reversed cubic swaps its
     control points and its endpoints. */
  for (let i = AURICLE.length - 1; i >= 0; i--) {
    const [a, b, c, e] = AURICLE[i];
    const [, , , , px, py] = i > 0 ? AURICLE[i - 1] : [0, 0, 0, 0, 200, 40];
    d += `C${400 - c} ${e} ${400 - a} ${b} ${400 - px} ${py}`;
  }
  return d + 'Z';
};

/* Fenestrations — the holes that make a monstera a monstera — as rotated
   elliptical sub-paths cut out with the even-odd rule. Each lies along its
   strap's axis a third of the way out from the midrib, which is where and
   how the real ones open. */
const HOLES = [];
for (const s of [1, -1]) {
  SEGMENTS.slice(0, 3).forEach(([ix, iy, a, L, w]) => {
    const dx = Math.cos(rad(a)) * s, dy = Math.sin(rad(a));
    const cx = 200 + s * (ix - 200) + dx * L * 0.34, cy = iy + dy * L * 0.34;
    const rx = n1(L * 0.19), ry = n1(w * 0.19), rot = s * a;
    const p0 = [n1(cx - dx * rx), n1(cy - dy * rx)];
    const p1 = [n1(cx + dx * rx), n1(cy + dy * rx)];
    HOLES.push(`M${pt(p0)}A${rx} ${ry} ${rot} 1 0 ${pt(p1)}A${rx} ${ry} ${rot} 1 0 ${pt(p0)}Z`);
  });
}

const MONSTERA = monsteraOutline() + HOLES.join('');

/* Side veins run from the midrib out along each strap, and one into each
   half of the top lobe. */
const VEINS = 'M200 60L318 44M200 60L82 44' + [1, -1].flatMap((s) =>
  SEGMENTS.map(([ix, iy, a, L]) => {
    const dx = Math.cos(rad(a)) * s, dy = Math.sin(rad(a));
    return `M200 ${iy}L${n1(200 + s * (ix - 200) + dx * L * 0.88)} ${n1(iy + dy * L * 0.88)}`;
  })).join('');

export default function ExoticBackdrop() {
  const uid = useId().replace(/:/g, '');
  const frondA = `bde-fa-${uid}`;
  const frondB = `bde-fb-${uid}`;
  const leaf = `bde-ml-${uid}`;

  /* The frond, drawn once and mounted twice at different sizes and depths.
     The fill fades from base to tip so the leaflets dissolve into the light
     before they reach the middle of the page. */
  const frond = (gradientId) => (
    <svg viewBox="0 0 600 600" fill={`url(#${gradientId})`}>
      <path d={RACHIS} />
      {LEAFLETS.map((l, i) => (
        <path key={i} d={l.d} transform={`translate(${l.x} ${l.y}) rotate(${l.a})`} />
      ))}
    </svg>
  );

  return (
    <div className="bd-exotic">
      {/* Warm sand haze over the whole lower-left and a cool ice-teal haze
          over the upper-right, plus a thin wash along the top and bottom
          edges that ties the two corners into one sky. These are the tones
          the ground takes on at golden hour; they are wide, pale and static. */}
      <div className="bd-exotic-haze" />

      {/* The sun, just below the bottom-left corner: terracotta at the core
          cooling to gold, with a small bright disc where it sits. Breathes. */}
      <div className="bd-exotic-sun" />

      {/* Spokes of light from the sun, turning slowly; masked to the corner. */}
      <div className="bd-exotic-rays" />

      {/* The lagoon: teal into blue from the top-right corner. Drifts. */}
      <div className="bd-exotic-lagoon" />

      {/* Two mote layers rising at different speeds. Each is a fixed table of
          gold and coral points tiled twice vertically; the layer scrolls one
          tile height and wraps, so the drift never shows a seam. */}
      <div className="bd-exotic-motes bd-exotic-motes--a" />
      <div className="bd-exotic-motes bd-exotic-motes--b" />

      {/* Gradient definitions live in one hidden SVG so every leaf shares them.
          Ids are per-instance (useId): the same motif twice on a page must not
          fight over the same url(#…). */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id={frondA} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#a8532f" stopOpacity="0.22" />
            <stop offset="0.55" stopColor="#c26d4a" stopOpacity="0.13" />
            <stop offset="1" stopColor="#d9a441" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id={frondB} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#d9a441" stopOpacity="0.15" />
            <stop offset="1" stopColor="#e8d3b0" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id={leaf} x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0" stopColor="#008f77" stopOpacity="0.14" />
            <stop offset="0.6" stopColor="#00a58e" stopOpacity="0.085" />
            <stop offset="1" stopColor="#0172cb" stopOpacity="0.03" />
          </linearGradient>
        </defs>
      </svg>

      {/* The back frond first, smaller and paler, so the front one overlaps
          it: two fronds at two depths are a palm; one is a clip-art leaf. */}
      <div className="bd-exotic-frond bd-exotic-frond--b">{frond(frondB)}</div>
      <div className="bd-exotic-frond bd-exotic-frond--a">{frond(frondA)}</div>

      {/* The monstera hangs from the top-right corner by its petiole and
          swings from there. Even-odd fill cuts the fenestrations out so the
          lagoon shows through them. */}
      <div className="bd-exotic-monstera">
        <svg viewBox="0 -40 400 500">
          <path d="M200 42V-40" stroke={`url(#${leaf})`} strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d={MONSTERA} fill={`url(#${leaf})`} fillRule="evenodd" />
          <g stroke="#008f77" strokeOpacity="0.08" strokeLinecap="round" fill="none">
            <path d="M200 44V444" strokeWidth="2.6" />
            <path d={VEINS} strokeWidth="1.2" />
          </g>
        </svg>
      </div>
    </div>
  );
}
