import React, { useEffect, useRef, useState } from 'react';

const FACE_ANGLE = 90;   // 4 faces → quarter turn per step
const HEIGHT = 144;      // px — must match the h-36 face height for the 3D math

/**
 * Rotating 3D prism band: each face pairs a headline stat with its related
 * trust point ("10,000+ happy travelers" | "Best price guarantee"), rotating
 * to the next face every 5 seconds. Press-and-hold pauses the rotation;
 * releasing resumes it.
 *
 * @param {{faces: Array<{stat: {icon, value, label}, trust: {icon, title, sub}}>}} props
 */
export default function StatsPrism({ faces }) {
  const [step, setStep] = useState(0);
  const held = useRef(false);

  useEffect(() => {
    const id = setInterval(() => { if (!held.current) setStep((s) => s + 1); }, 5000);
    return () => clearInterval(id);
  }, []);

  const hold = () => { held.current = true; };
  const release = () => { held.current = false; };

  const active = ((step % faces.length) + faces.length) % faces.length;

  return (
    <div>
      <div
        onPointerDown={hold} onPointerUp={release} onPointerLeave={release} onPointerCancel={release}
        onTouchStart={hold} onTouchEnd={release} onTouchCancel={release}
        className="select-none cursor-grab active:cursor-grabbing"
        style={{ perspective: '1400px' }}
      >
        <div
          className="relative h-36"
          style={{
            transformStyle: 'preserve-3d',
            transform: `translateZ(-${HEIGHT / 2}px) rotateX(${-FACE_ANGLE * step}deg)`,
            transition: 'transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {faces.map((f, i) => (
            <div
              key={i}
              className="absolute inset-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#00214f] to-[#001427] shadow-lift"
              style={{ transform: `rotateX(${i * FACE_ANGLE}deg) translateZ(${HEIGHT / 2}px)`, backfaceVisibility: 'hidden' }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#cf9c3f]/70 to-transparent" />
              <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full bg-[#d9a43e]/10 blur-2xl pointer-events-none" />

              <div className="relative h-full flex items-center">
                {/* Stat half */}
                <div className="flex-1 min-w-0 flex items-center justify-center gap-3 md:gap-4 px-3 md:px-8">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#cf9c3f]/12 text-[#e6c988] flex items-center justify-center shrink-0 ring-1 ring-[#cf9c3f]/25">
                    <f.stat.icon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-display font-semibold text-gradient-gold text-[20px] md:text-[30px] leading-none">{f.stat.value}</div>
                    <div className="text-[10px] md:text-[12px] font-bold text-white/50 mt-1 leading-snug">{f.stat.label}</div>
                  </div>
                </div>

                {/* Divider */}
                <div className="self-stretch my-5 w-px bg-gradient-to-b from-transparent via-[#cf9c3f]/40 to-transparent shrink-0" />

                {/* Trust half */}
                <div className="flex-1 min-w-0 flex items-center justify-center gap-3 md:gap-4 px-3 md:px-8">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/[0.08] text-white flex items-center justify-center shrink-0 ring-1 ring-white/15">
                    <f.trust.icon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] md:text-[16px] font-black text-white leading-snug line-clamp-2">{f.trust.title}</div>
                    <div className="text-[10px] md:text-[12px] font-semibold text-white/50 leading-snug line-clamp-2 mt-0.5">{f.trust.sub}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Face dots */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {faces.map((_, i) => (
          <button
            key={i}
            aria-label={`Slide ${i + 1}`}
            onClick={() => setStep((s) => s + ((i - (((s % faces.length) + faces.length) % faces.length) + faces.length) % faces.length))}
            className={`h-1.5 rounded-full transition-all ${i === active ? 'w-5 bg-[#cf9c3f]' : 'w-1.5 bg-[#d9c9a3] hover:bg-[#b8a888]'}`}
          />
        ))}
      </div>
    </div>
  );
}
