import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from '../store/useLangStore';

const INTRO_KEY = 'imaf_intro_seen';
/* If the video never reaches 'playing' (blocked autoplay, slow network,
   broken codec) we bail out so the splash can't trap the visitor. */
const START_DEADLINE_MS = 3000;
const HARD_CAP_MS = 15000;

export default function IntroSplash() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(() => {
    if (sessionStorage.getItem(INTRO_KEY)) return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      sessionStorage.setItem(INTRO_KEY, '1');
      return false;
    }
    return true;
  });
  const [closing, setClosing] = useState(false);
  const videoRef = useRef(null);
  const startedRef = useRef(false);

  const close = useCallback(() => {
    sessionStorage.setItem(INTRO_KEY, '1');
    setClosing(true);
    setTimeout(() => setVisible(false), 450);
  }, []);

  useEffect(() => {
    if (!visible) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const bail = setTimeout(() => {
      if (!startedRef.current) close();
    }, START_DEADLINE_MS);
    const cap = setTimeout(close, HARD_CAP_MS);

    const video = videoRef.current;
    if (video) {
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(close);
    }

    return () => {
      clearTimeout(bail);
      clearTimeout(cap);
      document.body.style.overflow = prevOverflow;
    };
  }, [visible, close]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[10100] flex items-center justify-center bg-white transition-opacity duration-[450ms] ${
        closing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="MAF Travel intro"
    >
      <video
        ref={videoRef}
        src="/intro.mp4"
        className="w-full h-full object-contain md:object-cover"
        muted
        playsInline
        autoPlay
        preload="auto"
        onPlaying={() => { startedRef.current = true; }}
        onEnded={close}
        onError={close}
      />

      <img
        src="/images/maf-logo.png"
        alt="MAF Travel"
        className="absolute top-5 left-5 h-10 w-auto sm:top-7 sm:left-7 sm:h-12"
        draggable="false"
      />

      <button
        onClick={close}
        className="absolute bottom-6 right-6 px-5 py-2.5 rounded-full bg-[#252a31]/85 text-white text-[13px] font-bold uppercase tracking-wider backdrop-blur-sm hover:bg-[#252a31] active:scale-95 transition-all"
      >
        {t('ui.intro.skip')}
      </button>
    </div>
  );
}
