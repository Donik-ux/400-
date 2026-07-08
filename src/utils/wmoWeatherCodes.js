// Open-Meteo uses the WMO weather interpretation codes for its `weathercode`
// field. Shared between WeatherWidget and the date-recommendation UI so both
// render the same icon/label for a given code.
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, Wind } from 'lucide-react';

export const WMO_CODES = {
  0:  { icon: Sun,        label: 'Clear' },
  1:  { icon: Sun,        label: 'Mainly clear' },
  2:  { icon: Cloud,      label: 'Partly cloudy' },
  3:  { icon: Cloud,      label: 'Overcast' },
  45: { icon: Wind,       label: 'Foggy' },
  48: { icon: Wind,       label: 'Depositing rime fog' },
  51: { icon: CloudDrizzle, label: 'Light drizzle' },
  53: { icon: CloudDrizzle, label: 'Moderate drizzle' },
  55: { icon: CloudDrizzle, label: 'Dense drizzle' },
  61: { icon: CloudRain,  label: 'Slight rain' },
  63: { icon: CloudRain,  label: 'Moderate rain' },
  65: { icon: CloudRain,  label: 'Heavy rain' },
  71: { icon: CloudSnow,  label: 'Slight snow' },
  73: { icon: CloudSnow,  label: 'Moderate snow' },
  75: { icon: CloudSnow,  label: 'Heavy snow' },
  95: { icon: CloudLightning, label: 'Thunderstorm' },
};

export const wmoInfo = (code) => WMO_CODES[code] || { icon: Cloud, label: 'Unknown' };
