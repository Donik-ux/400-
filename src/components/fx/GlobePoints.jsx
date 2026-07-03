import React, { useEffect, useRef } from 'react';

/* Hand-rolled 3D point globe with gold flight arcs — pure canvas, no extra deps.
   Presentational only: pointer-events pass through; reduced-motion users get a
   single static frame instead of the rotation loop. */

const CITIES = [
  { lat: 41.3, lon: 69.2 },   // Tashkent
  { lat: 25.2, lon: 55.3 },   // Dubai
  { lat: 41.0, lon: 28.9 },   // Istanbul
  { lat: 48.9, lon: 2.35 },   // Paris
  { lat: 35.7, lon: 139.7 },  // Tokyo
  { lat: 4.2,  lon: 73.5 },   // Maldives
  { lat: -8.4, lon: 115.2 },  // Bali
  { lat: 1.35, lon: 103.8 },  // Singapore
  { lat: -72, lon: 45 },      // Antarctica — the flagship expedition gets its own arc
];
const ROUTES = [[0, 1], [1, 5], [2, 3], [1, 4], [7, 6], [0, 2], [1, 8]];

const toVec = (lat, lon) => {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return [Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta)];
};

const slerp = (a, b, t) => {
  let dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  dot = Math.min(1, Math.max(-1, dot));
  const th = Math.acos(dot);
  if (th < 1e-4) return [a[0], a[1], a[2]];
  const s = Math.sin(th);
  const wa = Math.sin((1 - t) * th) / s;
  const wb = Math.sin(t * th) / s;
  return [a[0] * wa + b[0] * wb, a[1] * wa + b[1] * wb, a[2] * wa + b[2] * wb];
};

export default function GlobePoints({ className = '' }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Fibonacci sphere — even point distribution without pole clustering
    const N = 620;
    const pts = [];
    const ga = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const th = ga * i;
      pts.push([Math.cos(th) * r, y, Math.sin(th) * r, i % 17 === 0]);
    }
    const cities = CITIES.map(c => toVec(c.lat, c.lon));

    let raf = 0;
    let running = false;
    let w = 0, h = 0, dpr = 1;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
    };

    const TILT = -0.35;
    const ct = Math.cos(TILT), st = Math.sin(TILT);
    const project = (vx, vy, vz, ang) => {
      const ca = Math.cos(ang), sa = Math.sin(ang);
      const x = vx * ca + vz * sa;
      const z = -vx * sa + vz * ca;
      const y2 = vy * ct - z * st;
      const z2 = vy * st + z * ct;
      const R = Math.min(w, h) * 0.40;
      const persp = 2.6 / (2.6 - z2);
      return [w / 2 + x * R * persp, h / 2 - y2 * R * persp, z2];
    };

    const draw = (now) => {
      const ang = now * 0.00008;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // sphere points — pale blue with a scatter of gold, depth-faded
      for (const p of pts) {
        const [sx, sy, z] = project(p[0], p[1], p[2], ang);
        const front = z > 0;
        const a = front ? 0.26 + z * 0.62 : 0.07;
        ctx.fillStyle = p[3]
          ? `rgba(245,185,66,${Math.min(1, a * 1.25).toFixed(3)})`
          : `rgba(170,206,255,${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(sx, sy, front ? 1.2 + z * 1.3 : 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // flight arcs — lifted great-circle paths with a travelling gold pulse
      for (let ri = 0; ri < ROUTES.length; ri++) {
        const A = cities[ROUTES[ri][0]];
        const B = cities[ROUTES[ri][1]];
        const S = 44;
        let prev = null;
        for (let i = 0; i <= S; i++) {
          const t = i / S;
          const v = slerp(A, B, t);
          const lift = 1 + 0.3 * Math.sin(Math.PI * t);
          const p = project(v[0] * lift, v[1] * lift, v[2] * lift, ang);
          if (prev) {
            const zAvg = (prev[2] + p[2]) / 2;
            if (zAvg > -0.15) {
              ctx.strokeStyle = `rgba(255,201,87,${(0.14 + Math.max(0, zAvg) * 0.55).toFixed(3)})`;
              ctx.lineWidth = 1.2;
              ctx.beginPath();
              ctx.moveTo(prev[0], prev[1]);
              ctx.lineTo(p[0], p[1]);
              ctx.stroke();
            }
          }
          prev = p;
        }
        const tp = (now * 0.00012 + ri * 0.37) % 1;
        const v = slerp(A, B, tp);
        const lift = 1 + 0.3 * Math.sin(Math.PI * tp);
        const p = project(v[0] * lift, v[1] * lift, v[2] * lift, ang);
        if (p[2] > -0.05) {
          ctx.fillStyle = 'rgba(255,215,110,0.95)';
          ctx.shadowColor = 'rgba(255,187,2,0.9)';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(p[0], p[1], 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // city markers — gold dot + halo ring on the visible hemisphere
      for (const c of cities) {
        const p = project(c[0], c[1], c[2], ang);
        if (p[2] > 0) {
          ctx.fillStyle = 'rgba(255,187,2,0.9)';
          ctx.beginPath();
          ctx.arc(p[0], p[1], 2.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = 'rgba(255,187,2,0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(p[0], p[1], 5.5, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    };

    const loop = (now) => {
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(loop);
      }
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw(0);
    });
    ro.observe(wrap);

    let io = null;
    let visible = false;
    let zoomed = false;
    const sync = () => ((visible && !zoomed) ? start() : stop());
    // Freeze the loop while the user pinch-zooms — mid-gesture canvas repaints
    // make iOS Safari flicker.
    const vv = window.visualViewport;
    const onVv = () => { zoomed = (vv?.scale || 1) > 1.02; sync(); };
    if (reduced) {
      draw(0);
    } else {
      // Only burn frames while the globe is actually on screen
      io = new IntersectionObserver(
        ([e]) => { visible = e.isIntersecting; sync(); },
        { threshold: 0.05 },
      );
      io.observe(wrap);
      vv?.addEventListener('resize', onVv);
    }

    return () => {
      stop();
      ro.disconnect();
      if (io) io.disconnect();
      vv?.removeEventListener('resize', onVv);
    };
  }, []);

  return (
    <div ref={wrapRef} className={`pointer-events-none ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
