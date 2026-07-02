import React, { useRef } from 'react';

/* Pointer-tracked 3D tilt + moving glare highlight. Pure presentation wrapper:
   children render untouched, the glare layer is pointer-events-none, and
   reduced-motion users get no tilt at all. */
export default function Tilt3D({ children, max = 8, className = '' }) {
  const ref = useRef(null);
  const glareRef = useRef(null);
  const raf = useRef(0);

  const move = (e) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ref.current;
    if (!el) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const px = (clientX - r.left) / r.width;
      const py = (clientY - r.top) / r.height;
      el.style.transition = 'transform 0.1s ease-out, box-shadow 0.35s ease';
      el.style.transform = `perspective(900px) rotateX(${((0.5 - py) * max).toFixed(2)}deg) rotateY(${((px - 0.5) * max).toFixed(2)}deg) translateY(-4px)`;
      el.style.boxShadow = 'var(--shadow-lift)';
      const g = glareRef.current;
      if (g) {
        g.style.opacity = '1';
        g.style.background = `radial-gradient(300px circle at ${(px * 100).toFixed(1)}% ${(py * 100).toFixed(1)}%, rgba(255,255,255,0.25), transparent 65%)`;
      }
    });
  };

  const leave = () => {
    cancelAnimationFrame(raf.current);
    const el = ref.current;
    if (el) {
      el.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1), box-shadow 0.5s ease';
      el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)';
      el.style.boxShadow = '';
    }
    if (glareRef.current) glareRef.current.style.opacity = '0';
  };

  return (
    <div
      ref={ref}
      onMouseMove={move}
      onMouseLeave={leave}
      className={`relative will-change-transform ${className}`}
    >
      {children}
      <div
        ref={glareRef}
        className="absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 pointer-events-none z-10"
      />
    </div>
  );
}
