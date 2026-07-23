import React, { useEffect, useRef, useState } from 'react';
import { handleImgError } from '../utils/imageFallback';
import { hasCuratedHero } from '../utils/destinationImages';
import { fetchLivePhoto } from '../services/photoClient';

/**
 * Smart image: shimmer placeholder → fade-in when loaded, falls back to a working
 * Unsplash URL on error, lazy-loads, respects `aspect` shorthand.
 *
 * Also progressively upgrades to a real, live-searched photo of `alt` (the
 * destination name) when either: the given `src` has no hand-picked match
 * (so it's showing a generic filler photo), or `src` fails to load (a
 * hand-picked photo ID was taken down from Unsplash). No-ops silently if the
 * photo proxy isn't configured — the existing `src` just stays as-is.
 *
 * Props:
 *  - src, alt
 *  - className: applied to <img>
 *  - wrapperClassName: applied to outer container (use for aspect ratio / rounded / etc.)
 *  - aspect: tailwind aspect class (e.g. 'aspect-[4/3]')
 *  - sizes, srcSet, fetchPriority (passthrough)
 *  - onLoaded (optional callback)
 */
export default function SmartImage({
  src,
  alt = '',
  className = '',
  wrapperClassName = '',
  aspect = '',
  sizes,
  srcSet,
  fetchPriority = 'auto',
  onLoaded,
  ...rest
}) {
  const [loaded, setLoaded] = useState(false);
  const [liveSrc, setLiveSrc] = useState(null);
  // Identity of the (alt, src) pair `liveSrc` was resolved for — lets us
  // ignore a stale liveSrc left over from a previous destination without
  // needing a synchronous reset inside the effect below.
  const liveSrcFor = useRef(null);
  const upgradeAttempted = useRef(false);
  const identity = `${alt}::${src}`;

  const currentSrc = (liveSrc && liveSrcFor.current === identity) ? liveSrc : src;

  // Proactively upgrade destinations with no hand-picked photo (the generic
  // filler loads fine, so onError never fires for it).
  useEffect(() => {
    upgradeAttempted.current = false;
    if (alt && !hasCuratedHero(alt)) {
      upgradeAttempted.current = true;
      fetchLivePhoto(alt).then((url) => {
        if (url) { liveSrcFor.current = identity; setLiveSrc(url); }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- identity encodes alt+src
  }, [identity]);

  // On a load failure, try a live replacement; if that also comes up empty,
  // fall back to the generic rotation so the image never stays broken.
  const tryLiveUpgrade = (imgEl) => {
    if (upgradeAttempted.current || !alt) return false;
    upgradeAttempted.current = true;
    fetchLivePhoto(alt).then((url) => {
      if (url) { liveSrcFor.current = identity; setLiveSrc(url); }
      else if (imgEl) { handleImgError({ currentTarget: imgEl }); setLoaded(true); }
    });
    return true;
  };

  return (
    <div
      className={`relative overflow-hidden ${aspect} ${wrapperClassName}`}
      aria-busy={!loaded}
    >
      {/* Shimmer placeholder */}
      {!loaded && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#efe6d2] via-[#f6f1e4] to-[#efe6d2]"
          style={{
            backgroundSize: '200% 100%',
            animation: 'sm-shimmer 1.4s linear infinite',
          }}
        />
      )}
      <img
        src={currentSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        sizes={sizes}
        srcSet={srcSet}
        fetchPriority={fetchPriority}
        onLoad={(e) => { setLoaded(true); onLoaded?.(e); }}
        onError={(e) => {
          // A dead hand-picked photo ID: try a live replacement first: only
          // fall back to the generic rotation if that also fails.
          if (!tryLiveUpgrade(e.currentTarget)) { handleImgError(e); setLoaded(true); }
        }}
        className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        {...rest}
      />
      <style>{`@keyframes sm-shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
    </div>
  );
}
