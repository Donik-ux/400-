import React from 'react';
import { Camera } from 'lucide-react';
import SmartImage from './SmartImage';
import { heroFor } from '../utils/destinationImages';

/**
 * Swipeable strip of photos for each real place in the itinerary — each
 * card starts on the destination's generic photo and self-upgrades to a
 * live, place-specific photo via SmartImage (see photoClient.js/api/photo.js).
 */
export default function AttractionGallery({ places, destination, label }) {
  if (!places?.length) return null;
  const fallback = heroFor(destination);

  return (
    <div className="bg-white border border-[#e6dcc3] rounded-2xl p-4 shadow-soft">
      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#0071c2] mb-3 px-1">
        <Camera className="w-3.5 h-3.5" /> {label}
      </div>
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 -mx-1 px-1 scroll-smooth">
        {places.map((name) => (
          <div key={name} className="relative shrink-0 w-36 h-48 md:w-40 md:h-52 rounded-xl overflow-hidden snap-start shadow-soft">
            <SmartImage src={fallback} alt={`${name}, ${destination}`} wrapperClassName="absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
            <div className="absolute bottom-2 left-2 right-2 text-white text-[11px] font-black leading-tight line-clamp-2">
              {name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
