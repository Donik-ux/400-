import React, { useState } from 'react';
import { handleImgError } from '../utils/imageFallback';

/**
 * Smart image: shimmer placeholder → fade-in when loaded, falls back to a working
 * Unsplash URL on error, lazy-loads, respects `aspect` shorthand.
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

  return (
    <div
      className={`relative overflow-hidden ${aspect} ${wrapperClassName}`}
      aria-busy={!loaded}
    >
      {/* Shimmer placeholder */}
      {!loaded && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#eef2f6] via-[#f8f9fa] to-[#eef2f6]"
          style={{
            backgroundSize: '200% 100%',
            animation: 'sm-shimmer 1.4s linear infinite',
          }}
        />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        sizes={sizes}
        srcSet={srcSet}
        fetchpriority={fetchPriority}
        onLoad={(e) => { setLoaded(true); onLoaded?.(e); }}
        onError={(e) => { handleImgError(e); setLoaded(true); }}
        className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
        {...rest}
      />
      <style>{`@keyframes sm-shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }`}</style>
    </div>
  );
}
