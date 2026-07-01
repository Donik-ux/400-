import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCoords } from '../data/coords';
import { Loader2 } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const DEFAULT_CENTER = [41.2995, 69.2401];
const DEFAULT_ZOOM   = 3;

export default function DestinationMap({ destinations = [], className = '' }) {
  if (!destinations.length) return null;

  const markers = destinations
    .map(d => {
      const coords = getCoords(typeof d === 'string' ? d : d.city || d.name);
      return coords ? { ...d, lat: coords.lat, lng: coords.lng } : null;
    })
    .filter(Boolean);

  if (!markers.length) return null;

  return (
    <div className={`rounded-2xl overflow-hidden border border-[#e6dcc3] shadow-soft ${className}`}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-[350px] md:h-[450px]"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m, i) => (
          <Marker key={i} position={[m.lat, m.lng]}>
            {m.city || m.name ? (
              <Popup>
                <div className="text-[13px] font-bold">{m.city || m.name}</div>
                {m.country && <div className="text-[11px] text-[#5c5245]">{m.country}</div>}
                {m.code && <div className="text-[10px] text-[#0071c2] font-black">{m.code}</div>}
              </Popup>
            ) : null}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
