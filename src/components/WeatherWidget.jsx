import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { resolveCoords } from '../services/geocode';
import { wmoInfo } from '../utils/wmoWeatherCodes';
import { useTranslation } from '../store/useLangStore';

export default function WeatherWidget({ city }) {
  if (!city) return null;
  // key remounts the inner widget per city, so data/error state always starts fresh
  return <WeatherInner key={city} city={city} />;
}

function WeatherInner({ city }) {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  // Null until the city resolves, so nothing renders for a place that turns
  // out not to exist — the old code decided that synchronously off a table of
  // fifty cities, which is why most destinations never showed weather at all.
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    resolveCoords(city).then((coords) => {
      if (cancelled) return;
      if (!coords) { setMissing(true); return; }
      return fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=3`
      )
        .then(r => { if (!r.ok) throw new Error('bad response'); return r.json(); })
        .then(d => {
          if (cancelled) return;
          if (!d || d.error || !d.current_weather) { setError('Failed to load'); return; }
          setData(d); setError(null);
        });
    }).catch(() => { if (!cancelled) setError('Failed to load'); });
    return () => { cancelled = true; };
  }, [city]);

  if (missing) return null;

  if (error) {
    return (
      <div className="text-[11px] text-[#697d95] font-medium px-3 py-2">
        {t('ui.weather.unavailable')}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-[11px] text-[#697d95] font-medium">
        <Loader2 className="w-3 h-3 animate-spin" /> {t('ui.weather.loading')}
      </div>
    );
  }

  const current = data.current_weather;
  const daily   = data.daily;
  const wmo     = wmoInfo(current.weathercode);
  const Icon    = wmo.icon;

  return (
    <div className="flex items-center gap-4 px-3 py-2">
      <div className="flex items-center gap-2">
        <Icon className="w-6 h-6 text-[#0172cb]" />
        <span className="text-[20px] font-black text-[#252a31]">{Math.round(current.temperature)}°C</span>
      </div>
      <div className="flex items-center gap-3 text-[11px] font-bold text-[#4a5867]">
        {daily && daily.time?.slice(1).map((day, i) => (
          <span key={day} className="flex items-center gap-1">
            {new Date(day).toLocaleDateString('en', { weekday: 'short' })}
            <span className="text-[#252a31]">{Math.round(daily.temperature_2m_max[i + 1])}°</span>
          </span>
        ))}
      </div>
    </div>
  );
}
