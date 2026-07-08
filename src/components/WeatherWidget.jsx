import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getCoords } from '../data/coords';
import { wmoInfo } from '../utils/wmoWeatherCodes';

export default function WeatherWidget({ city }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!city) return;
    const coords = getCoords(city);
    if (!coords) { setError(null); setData(null); return; }

    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=3`
    )
      .then(r => r.json())
      .then(d => { setData(d); setError(null); })
      .catch(() => setError('Failed to load'));
  }, [city]);

  if (!city || !getCoords(city)) return null;

  if (error) {
    return (
      <div className="text-[11px] text-[#93876f] font-medium px-3 py-2">
        Weather unavailable
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-[11px] text-[#93876f] font-medium">
        <Loader2 className="w-3 h-3 animate-spin" /> Loading weather…
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
        <Icon className="w-6 h-6 text-[#0071c2]" />
        <span className="text-[20px] font-black text-[#1a1a1a]">{Math.round(current.temperature)}°C</span>
      </div>
      <div className="flex items-center gap-3 text-[11px] font-bold text-[#5c5245]">
        {daily && daily.time?.slice(1).map((day, i) => (
          <span key={day} className="flex items-center gap-1">
            {new Date(day).toLocaleDateString('en', { weekday: 'short' })}
            <span className="text-[#1a1a1a]">{Math.round(daily.temperature_2m_max[i + 1])}°</span>
          </span>
        ))}
      </div>
    </div>
  );
}
