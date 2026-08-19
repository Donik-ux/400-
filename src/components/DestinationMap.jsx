import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { resolveMany } from '../services/geocode';
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

/**
 * Frame the pins that are actually on the map.
 *
 * The centre above is Tashkent, so a Tashkent→Accra route used to open with
 * the destination somewhere off the left edge. That was easy to miss while
 * most cities had no coordinates and therefore no pin at all; now that every
 * city gets one, the view has to follow them.
 */
function FitToMarkers({ markers }) {
  const map = useMap();
  const key = markers.map((m) => `${m.lat},${m.lng}`).join('|');

  useEffect(() => {
    if (!markers.length) return;
    if (markers.length === 1) {
      map.setView([markers[0].lat, markers[0].lng], 6);
      return;
    }
    map.fitBounds(markers.map((m) => [m.lat, m.lng]), { padding: [40, 40], maxZoom: 8 });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on the positions themselves
  }, [key]);

  return null;
}

export default function DestinationMap({ destinations = [], className = '' }) {
  const { t, lang } = useTranslation();
  const zoomIn  = t('ui.map.zoomIn');
  const zoomOut = t('ui.map.zoomOut');
  const [markers, setMarkers] = useState([]);

  // Coordinates now come from the geocoder, so a city outside the curated
  // table gets a pin too — which means resolving them is async and the map
  // renders once they land, rather than dropping the marker silently.
  const names = destinations
    .map((d) => (typeof d === 'string' ? d : d.city || d.name))
    .filter(Boolean);
  const namesKey = names.join('|');

  useEffect(() => {
    let cancelled = false;
    resolveMany(names).then((coords) => {
      if (cancelled) return;
      setMarkers(destinations
        .map((d, i) => (coords[i] ? { ...(typeof d === 'string' ? { city: d } : d), ...coords[i] } : null))
        .filter(Boolean));
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on the city names, not the array identity
  }, [namesKey]);

  if (!destinations.length || !markers.length) return null;

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
        <FitToMarkers markers={markers} />
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
