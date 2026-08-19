import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getCoords } from '../data/coords';
import { useTranslation } from '../store/useLangStore';
import { tileUrl } from '../config/mapTiles';
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
  const { t, lang } = useTranslation();
  const zoomIn  = t('ui.map.zoomIn');
  const zoomOut = t('ui.map.zoomOut');
  if (!destinations.length) return null;

  const markers = destinations
    .map(d => {
      const coords = getCoords(typeof d === 'string' ? d : d.city || d.name);
      return coords ? { ...d, lat: coords.lat, lng: coords.lng } : null;
    })
    .filter(Boolean);

  if (!markers.length) return null;

  return (
    <div className={`relative z-0 [isolation:isolate] rounded-2xl overflow-hidden border border-[#dfe7ec] shadow-soft ${className}`}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-[350px] md:h-[450px]"
        scrollWheelZoom={false}
        attributionControl={false}
        zoomControl={false}
      >
        {/* Keyed on the language so switching it refetches the tiles rather
            than leaving the old labels painted on screen. */}
        <TileLayer key={lang} url={tileUrl(lang)} />
        {/* The default zoom buttons are hardcoded English; this one is not.
            Leaflet reads these titles once, when it builds the control, and
            translations for a language without a hand-written dictionary
            arrive a moment after mount — so the key remounts the control when
            the wording actually changes, rather than leaving English baked in. */}
        <ZoomControl
          key={`${zoomIn}|${zoomOut}`}
          position="topleft"
          zoomInTitle={zoomIn}
          zoomOutTitle={zoomOut}
        />
        {markers.map((m, i) => (
          <Marker key={i} position={[m.lat, m.lng]}>
            {m.city || m.name ? (
              <Popup>
                <div className="text-[13px] font-bold">{m.city || m.name}</div>
                {m.country && <div className="text-[11px] text-[#4a5867]">{m.country}</div>}
                {m.code && <div className="text-[10px] text-[#0172cb] font-black">{m.code}</div>}
              </Popup>
            ) : null}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
