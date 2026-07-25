import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { heroFor, GENERIC_FALLBACKS } from '../utils/destinationImages';
import { fetchLivePhoto } from '../services/photoClient';

// Distinct search angles so the live photos are varied, not near-duplicates.
const QUERY_ANGLES = ['landmarks', 'old town', 'architecture', 'street life'];

/**
 * Fullscreen photo viewer for a destination: opens with the card's own photo
 * plus the destination hero, then upgrades to 3-5 distinct live photos of the
 * place via /api/photo (Unsplash) when configured. Generic travel photos pad
 * the set so there are always at least 3 slides.
 */
export default function PhotoLightbox({ destination, mainImage, onClose }) {
  const city = String(destination || '').split(',')[0].trim();
  const [photos, setPhotos] = useState(() =>
    [...new Set([mainImage, heroFor(city), ...GENERIC_FALLBACKS].filter(Boolean))].slice(0, 4));
  const [index, setIndex] = useState(0);

  // Swap in real, city-specific photos as they resolve (no-op without a key).
  useEffect(() => {
    let cancelled = false;
    Promise.all(QUERY_ANGLES.map((a) => fetchLivePhoto(`${city} ${a}`))).then((live) => {
      const found = live.filter(Boolean);
      if (cancelled || !found.length) return;
      setPhotos([...new Set([mainImage, ...found, heroFor(city)].filter(Boolean))].slice(0, 5));
    });
    return () => { cancelled = true; };
  }, [city, mainImage]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % photos.length);
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + photos.length) % photos.length);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [photos.length, onClose]);

  const prev = (e) => { e.stopPropagation(); setIndex((i) => (i - 1 + photos.length) % photos.length); };
  const next = (e) => { e.stopPropagation(); setIndex((i) => (i + 1) % photos.length); };

  return (
    <div onClick={onClose} className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-1.5 text-[13px] font-black">
          <MapPin className="w-4 h-4 text-[#febb02]" /> {destination}
          <span className="text-white/50 font-bold ml-2">{index + 1} / {photos.length}</span>
        </div>
        <button onClick={onClose} aria-label="Close"
          className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/25 transition active:scale-90">
          <X className="w-4.5 h-4.5" />
        </button>
      </div>

      <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <img src={photos[index]} alt={`${destination} photo ${index + 1}`}
          className="w-full max-h-[70vh] object-cover rounded-2xl shadow-2xl select-none" />
        {photos.length > 1 && (
          <>
            <button onClick={prev} aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/75 transition active:scale-90">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={next} aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/75 transition active:scale-90">
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      <div className="mt-4 flex gap-2 overflow-x-auto max-w-full px-2" onClick={(e) => e.stopPropagation()}>
        {photos.map((p, i) => (
          <button key={p} onClick={() => setIndex(i)}
            className={`shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition ${i === index ? 'border-[#febb02]' : 'border-transparent opacity-60 hover:opacity-100'}`}>
            <img src={p} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
