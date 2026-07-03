import React, { useEffect, useRef } from 'react';

/* Drifting gold-dust atmosphere — pure canvas, presentational only.
   Same contract as GlobePoints: pointer-events pass through, IO-paused
   off-screen, reduced-motion users get a single static frame. */
export default function GoldDust({ className = '', density = 1 }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = 0, h = 0, dpr = 1, raf = 0, running = false;
    let parts = [];

    const spawn = () => {
      const n = Math.min(90, Math.round(((w * h) / 22000) * density));
      parts = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.6,
        vy: 0.06 + Math.random() * 0.14,
        sway: 6 + Math.random() * 18,
        ph: Math.random() * Math.PI * 2,
        tw: 0.5 + Math.random() * 1.2,
        gold: Math.random() < 0.72,
      }));
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = rect.width; h = rect.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      spawn();
    };

    const draw = (now) => {
      const t = now * 0.001;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        const y = ((((p.y - t * p.vy * 60) % (h + 24)) + (h + 24)) % (h + 24)) - 12;
        const x = p.x + Math.sin(t * 0.35 + p.ph) * p.sway;
        const a = 0.16 + 0.28 * (0.5 + 0.5 * Math.sin(t * p.tw + p.ph * 3));
        ctx.fillStyle = p.gold
          ? `rgba(255,205,92,${a.toFixed(3)})`
          : `rgba(178,208,255,${(a * 0.6).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (now) => { draw(now); raf = requestAnimationFrame(loop); };
    const start = () => { if (!running) { running = true; raf = requestAnimationFrame(loop); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    resize();
    const ro = new ResizeObserver(() => { resize(); if (reduced) draw(0); });
    ro.observe(wrap);

    let io = null;
    let visible = false;
    let zoomed = false;
    const sync = () => ((visible && !zoomed) ? start() : stop());
    // Freeze the loop while the user pinch-zooms — mid-gesture canvas repaints
    // make iOS Safari flicker.
    const vv = window.visualViewport;
    const onVv = () => { zoomed = (vv?.scale || 1) > 1.02; sync(); };
    if (reduced) draw(0);
    else {
      io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }, { threshold: 0.05 });
      io.observe(wrap);
      vv?.addEventListener('resize', onVv);
    }
    return () => { stop(); ro.disconnect(); if (io) io.disconnect(); vv?.removeEventListener('resize', onVv); };
  }, [density]);

  return (
    <div ref={wrapRef} className={`pointer-events-none ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
