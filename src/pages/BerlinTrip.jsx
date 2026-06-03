import React, { useState } from 'react';
import {
  MapPin, Plane, Hotel, UtensilsCrossed, Car, Activity,
  Wallet, Lightbulb, CheckCircle2, Calendar, ArrowLeft, Map,
  Copy, Download,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from '../store/useLangStore';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const BUDGET = {
  total:         2900,
  flight:         650,
  accommodation: 1080,
  food:           450,
  transport:      250,
  activities:     120,
  shopping:       300,
  hotelName:     'Berlin City Hotel',
};

const TIPS = [
  'Buy a Berlin Welcome Card for unlimited public transport + museum discounts.',
  'Book Reichstag visit online in advance — free but requires registration.',
  'Görlitz train: book at least 1 day ahead for the best DB fare (~€30 each way).',
  'Museum Island: buy the day pass (€24) to cover all 5 museums.',
  'Tap water is drinkable everywhere in Berlin — save on bottle costs.',
];

// Structured locations with coordinates
const MAP_LOCATIONS = [
  { day: 2, name: 'Brandenburg Gate',                    address: 'Pariser Platz, 10117 Berlin',             price: 'Free',                         lat: 52.5163, lng: 13.3777, emoji: '🏛️' },
  { day: 2, name: 'Reichstag Building',                  address: 'Platz der Republik 1, 11011 Berlin',      price: 'Free (registration required)',  lat: 52.5186, lng: 13.3762, emoji: '🏛️' },
  { day: 2, name: 'Alexanderplatz',                      address: '10178 Berlin',                            price: 'Free',                          lat: 52.5219, lng: 13.4132, emoji: '🗼' },
  { day: 3, name: 'East Side Gallery',                   address: 'Mühlenstraße, 10243 Berlin',              price: 'Free',                          lat: 52.5051, lng: 13.4397, emoji: '🎨' },
  { day: 3, name: 'Checkpoint Charlie',                  address: 'Friedrichstraße 43-45, 10117 Berlin',     price: 'Street: Free / Museum: ~€15',   lat: 52.5075, lng: 13.3904, emoji: '🪖' },
  { day: 3, name: 'Holocaust Memorial',                  address: 'Cora-Berliner-Straße 1, 10117 Berlin',    price: 'Free',                          lat: 52.5138, lng: 13.3784, emoji: '🕊️' },
  { day: 4, name: 'Görlitz Old Town',                    address: 'Untermarkt, 02826 Görlitz',               price: 'Free',                          lat: 51.1542, lng: 14.9888, emoji: '🏰' },
  { day: 5, name: 'Tiergarten',                          address: 'Straße des 17. Juni, 10785 Berlin',       price: 'Free',                          lat: 52.5145, lng: 13.3501, emoji: '🌳' },
  { day: 6, name: 'Museum Island',                       address: 'Am Lustgarten, 10117 Berlin',             price: '~€24',                          lat: 52.5169, lng: 13.4019, emoji: '🏺' },
  { day: 8, name: 'Kurfürstendamm',                      address: 'Berlin',                                  price: 'Free entry',                    lat: 52.5027, lng: 13.3317, emoji: '🛍️' },
  { day: 8, name: 'Mall of Berlin',                      address: 'Leipziger Platz 12, 10117 Berlin',        price: 'Free entry',                    lat: 52.5096, lng: 13.3807, emoji: '🛒' },
  { day: 1, name: 'Berlin Brandenburg Airport',          address: 'Willy-Brandt-Platz, 12529 Schönefeld',   price: 'Transfer ~€30–40',              lat: 52.3667, lng: 13.5033, emoji: '✈️' },
];

const DAY_COLORS = {
  1: 'bg-gray-500',
  2: 'bg-blue-500',
  3: 'bg-purple-500',
  4: 'bg-amber-500',
  5: 'bg-green-500',
  6: 'bg-pink-500',
  7: 'bg-cyan-500',
  8: 'bg-orange-500',
};

const ITINERARY = [
  {
    day: 1, date: 'Wednesday, April 1, 2026', title: 'Arrival & Transfer',
    items: [
      '06:00 — Arrival at Tashkent International Airport',
      '08:00 — Flight to Germany (via Istanbul/Dubai)',
      '16:00 — Arrival at Berlin Brandenburg Airport',
      '17:00 — Transfer to hotel (Taxi ~€30–40)',
      '18:30 — Hotel check-in', '20:00 — Dinner at hotel', '22:00 — Rest',
    ],
  },
  {
    day: 2, date: 'Thursday, April 2, 2026', title: 'Berlin Classics',
    items: [
      '08:00 — Breakfast at hotel',
      '09:30 — Visit Brandenburg Gate',
      'Address: Pariser Platz, 10117 Berlin', 'Price: Free',
      '11:00 — Visit Reichstag Building',
      'Address: Platz der Republik 1, 11011 Berlin', 'Price: Free (registration required)',
      '13:00 — Lunch (~€15–20)', '15:00 — Visit Alexanderplatz',
      'Address: 10178 Berlin', '18:30 — Dinner', '21:00 — Return to hotel',
    ],
  },
  {
    day: 3, date: 'Friday, April 3, 2026', title: 'Cold War & Culture',
    items: [
      '08:00 — Breakfast',
      '09:30 — Visit East Side Gallery',
      'Address: Mühlenstraße, 10243 Berlin', 'Price: Free',
      '11:30 — Visit Checkpoint Charlie',
      'Address: Friedrichstraße 43-45, 10117 Berlin', 'Price: Street: Free / Museum: ~€15',
      '13:00 — Lunch',
      '15:00 — Visit Memorial to the Murdered Jews of Europe',
      'Address: Cora-Berliner-Straße 1, 10117 Berlin', 'Price: Free',
      '18:30 — Dinner', '21:00 — Hotel',
    ],
  },
  {
    day: 4, date: 'Saturday, April 4, 2026', title: 'Görlitz Day Trip',
    items: [
      '07:00 — Breakfast', '08:00 — Train to Görlitz (~3 hours, ~€60–70)',
      '11:00 — Old Town walk',
      'Address: Untermarkt, 02826 Görlitz', 'Price: Free',
      '13:00 — Lunch', '15:00 — Walk to Germany–Poland bridge',
      '17:00 — Return to Berlin', '20:00 — Arrival', '21:00 — Hotel',
    ],
  },
  {
    day: 5, date: 'Sunday, April 5, 2026', title: 'Tiergarten & Relaxation',
    items: [
      '08:00 — Breakfast', '10:00 — Visit Tiergarten',
      'Address: Straße des 17. Juni, 10785 Berlin', 'Price: Free',
      '13:00 — Lunch', '15:00 — Walking / relaxation', '18:30 — Dinner', '21:00 — Hotel',
    ],
  },
  {
    day: 6, date: 'Monday, April 6, 2026', title: 'Museum Island',
    items: [
      '08:00 — Breakfast', '10:00 — Visit Museum Island',
      'Address: Am Lustgarten, 10117 Berlin', 'Price: ~€24',
      '13:00 — Lunch', '17:00 — Return',
    ],
  },
  {
    day: 7, date: 'Tuesday, April 7, 2026', title: 'Free Day',
    items: [
      '08:00 — Breakfast', '10:00 — Free day (cafés, city walk)',
      '13:00 — Lunch', '18:30 — Dinner', '21:00 — Hotel',
    ],
  },
  {
    day: 8, date: 'Wednesday, April 8, 2026', title: 'Shopping Day',
    items: [
      '08:00 — Breakfast', '10:00 — Visit Kurfürstendamm', 'Address: Berlin',
      '13:00 — Lunch', '15:00 — Visit Mall of Berlin',
      'Address: Leipziger Platz 12, 10117 Berlin', '19:00 — Dinner', '21:00 — Hotel',
    ],
  },
  {
    day: 9, date: 'Thursday, April 9, 2026', title: 'Final City Walk',
    items: [
      '08:00 — Breakfast', '10:00 — Final city walk',
      '13:00 — Lunch', '18:00 — Packing', '20:00 — Dinner',
    ],
  },
  {
    day: 10, date: 'Friday, April 10, 2026', title: 'Return Home',
    items: ['06:00 — Transfer to airport (~€40)', '08:00 — Flight to Tashkent', '16:00 — Arrival'],
  },
];

const BudgetBar = ({ label, amount, total, color, icon: Icon }) => {
  const pct = total > 0 ? Math.round((amount / total) * 100) : 0;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-white/30" />
          <span className="text-[11px] font-bold text-white/50 uppercase tracking-[0.12em]">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-black text-white">${amount.toLocaleString()}</span>
          <span className="text-[10px] text-white/25">{pct}%</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const budgetRows = [
  { label: 'Flight',        amount: BUDGET.flight,         icon: Plane,            color: 'bg-sky-400'    },
  { label: 'Accommodation', amount: BUDGET.accommodation,  icon: Hotel,            color: 'bg-blue-400'   },
  { label: 'Food',          amount: BUDGET.food,           icon: UtensilsCrossed,  color: 'bg-orange-400' },
  { label: 'Transport',     amount: BUDGET.transport,      icon: Car,              color: 'bg-green-400'  },
  { label: 'Attractions',   amount: BUDGET.activities,     icon: Activity,         color: 'bg-purple-400' },
  { label: 'Shopping',      amount: BUDGET.shopping,       icon: Wallet,           color: 'bg-pink-400'   },
];

// Auto-fit map to markers
function FitBounds({ locations }) {
  const map = useMap();
  React.useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(l => [l.lat, l.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [locations, map]);
  return null;
}

// Custom numbered marker
function createNumberedIcon(num, color = '#0071c2') {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:30px;height:30px;border-radius:50%;
      background:${color};border:2px solid white;
      display:flex;align-items:center;justify-content:center;
      color:white;font-weight:900;font-size:12px;
      box-shadow:0 2px 8px rgba(0,0,0,0.4);
    ">${num}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -18],
  });
}

const DAY_COLOR_HEX = {
  1: '#6b7280', 2: '#3b82f6', 3: '#8b5cf6', 4: '#f59e0b',
  5: '#10b981', 6: '#ec4899', 7: '#06b6d4', 8: '#f97316',
};

const BerlinTrip = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [copyStatus, setCopyStatus]   = useState('');
  const [activeTab, setActiveTab]     = useState('itinerary'); // 'itinerary' | 'map'
  const [filterDay, setFilterDay]     = useState(null);

  const filteredLocations = filterDay
    ? MAP_LOCATIONS.filter(l => l.day === filterDay)
    : MAP_LOCATIONS;

  const buildItineraryText = () => {
    const header = [
      'Travel Plan – Berlin, Germany',
      'Travel Dates: April 1 – April 10, 2026',
      'Route: Tashkent → Berlin → Tashkent',
      'Purpose: Tourism and cultural exploration', '',
    ].join('\n');
    const dayBlocks = ITINERARY.map((day) => {
      const lines = [`Day ${day.day} – ${day.date}`, day.title, ''];
      lines.push(...day.items);
      return lines.join('\n');
    }).join('\n\n');
    return `${header}${dayBlocks}`;
  };

  const handleCopyItinerary = async () => {
    try {
      await navigator.clipboard.writeText(buildItineraryText());
      setCopyStatus(t('berlin.copied'));
      setTimeout(() => setCopyStatus(''), 2500);
    } catch {
      setCopyStatus(t('berlin.copyFail'));
      setTimeout(() => setCopyStatus(''), 2500);
    }
  };

  const handleDownloadItinerary = () => {
    const blob = new Blob([buildItineraryText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Berlin-Travel-Plan.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#0A0A0A] min-h-screen">

      {/* ── Hero Banner ── */}
      <div className="relative h-[380px] md:h-[460px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1587330979470-3595ac045ab0?auto=format&fit=crop&w=1400&q=80"
          alt="Berlin"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/60 via-transparent to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-12 lg:px-20 pb-12">
          <div className="max-w-7xl mx-auto w-full">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white/40 hover:text-white text-[12px] font-bold uppercase tracking-[0.14em] mb-6 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {t('berlinTrip.back')}
            </button>
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-[#febb02] text-[#1a1a1a] shadow-[0_4px_14px_rgba(245,185,66,0.35)]">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                {t('berlin.dates')} · {t('berlin.days')}
              </span>
            </div>
            <h1 className="text-[40px] md:text-[60px] font-black tracking-[-0.03em] text-white leading-tight flex items-center gap-3 drop-shadow-lg">
              <MapPin className="w-8 h-8 text-white/60 shrink-0" />
              {t('berlin.hero')}
            </h1>
            <p className="text-[14px] text-white/50 mt-2">
              {t('berlin.route')} · {t('berlin.purpose')}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={handleCopyItinerary}
                className="btn-gold inline-flex items-center gap-2 rounded-full px-6 py-3 text-[12px] uppercase tracking-[0.14em]"
              >
                <Copy className="w-4 h-4" />
                {t('berlin.copy')}
              </button>
              <button
                onClick={handleDownloadItinerary}
                className="inline-flex items-center gap-2 rounded-full glass-dark border border-white/[0.16] text-white px-6 py-3 text-[12px] font-black uppercase tracking-[0.14em] hover:border-white/30 transition-all"
              >
                <Download className="w-4 h-4" />
                {t('berlin.download')}
              </button>
              {copyStatus && (
                <span className="text-[12px] font-bold text-green-300">{copyStatus}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="px-6 md:px-12 lg:px-20 -mt-12 mb-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[
            { label: t('berlin.planLabel'), title: t('berlin.planTitle'), sub: t('berlin.planSub') },
            { label: t('berlin.datesLabel'), title: t('berlin.dates'), sub: t('berlin.datesSub') },
            { label: t('berlin.routeLabel'), title: t('berlin.route'), sub: t('berlin.routeSub') },
          ].map((c) => (
            <div key={c.label} className="group bg-gradient-to-b from-[#141414] to-[#0f0f0f] border border-white/[0.08] rounded-3xl p-6 shadow-[0_32px_80px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-[#febb02]/30">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#febb02]" />
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">{c.label}</div>
              </div>
              <div className="text-[20px] font-black text-white">{c.title}</div>
              <p className="mt-3 text-[13px] text-white/60 leading-relaxed">{c.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tab Switch ── */}
      <div className="px-6 md:px-12 lg:px-20 mb-8 relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex gap-1 p-1 bg-white/[0.05] border border-white/[0.08] rounded-xl">
            <button
              onClick={() => setActiveTab('itinerary')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
                activeTab === 'itinerary'
                  ? 'bg-white text-[#0A0A0A]'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              {t('berlin.tabItinerary')}
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[13px] font-bold transition-all ${
                activeTab === 'map'
                  ? 'bg-white text-[#0A0A0A]'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <Map className="w-4 h-4" />
              {t('berlin.tabMap')}
            </button>
          </div>
        </div>
      </div>

      {/* ── MAP TAB ── */}
      {activeTab === 'map' && (
        <div className="px-6 md:px-12 lg:px-20 pb-16">
          <div className="max-w-7xl mx-auto">

            {/* Day filter */}
            <div className="flex flex-wrap gap-2 mb-5">
              <button
                onClick={() => setFilterDay(null)}
                className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all border ${
                  !filterDay
                    ? 'bg-white text-[#0A0A0A] border-white'
                    : 'text-white/50 border-white/20 hover:border-white/40 hover:text-white'
                }`}
              >
                {t('berlin.allDays')}
              </button>
              {[2,3,4,5,6,8].map(d => (
                <button
                  key={d}
                  onClick={() => setFilterDay(filterDay === d ? null : d)}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all border ${
                    filterDay === d
                      ? 'bg-white text-[#0A0A0A] border-white'
                      : 'text-white/50 border-white/20 hover:border-white/40 hover:text-white'
                  }`}
                >
                  {t('berlinTrip.day')} {d}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Map */}
              <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-white/[0.08]" style={{ height: 520 }}>
                <MapContainer
                  center={[52.52, 13.405]}
                  zoom={12}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <FitBounds locations={filteredLocations} />
                  {filteredLocations.map((loc, i) => (
                    <Marker
                      key={loc.name}
                      position={[loc.lat, loc.lng]}
                      icon={createNumberedIcon(i + 1, DAY_COLOR_HEX[loc.day] || '#0071c2')}
                    >
                      <Popup>
                        <div style={{ minWidth: 180 }}>
                          <div style={{ fontSize: 18, marginBottom: 4 }}>{loc.emoji} <strong>{loc.name}</strong></div>
                          <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>{loc.address}</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#003580' }}>{t('berlinTrip.day')} {loc.day} · {loc.price}</div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              {/* Location list */}
              <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-5 overflow-y-auto" style={{ maxHeight: 520 }}>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-4">
                  {filteredLocations.length} {t('berlin.locationsLabel')}
                </div>
                <div className="space-y-3">
                  {filteredLocations.map((loc, i) => (
                    <div key={loc.name} className="flex gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12] transition-all">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-black shrink-0 mt-0.5"
                        style={{ background: DAY_COLOR_HEX[loc.day] || '#0071c2' }}
                      >
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-bold text-white truncate">{loc.emoji} {loc.name}</div>
                        <div className="text-[11px] text-white/40 mt-0.5 truncate">{loc.address}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.07] text-white/50">
                            {t('berlinTrip.day')} {loc.day}
                          </span>
                          <span className="text-[10px] text-green-400">{loc.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ITINERARY TAB ── */}
      {activeTab === 'itinerary' && (
        <div className="px-6 md:px-12 lg:px-20 py-4">
          <div className="max-w-7xl mx-auto space-y-16">

            {/* Budget + Tips */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 relative bg-gradient-to-br from-[#141414] to-[#0e0e0e] border border-white/[0.07] rounded-2xl p-8 overflow-hidden">
                <div className="absolute -top-24 -right-20 w-64 h-64 rounded-full bg-[#febb02]/[0.06] blur-3xl pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Wallet className="w-3.5 h-3.5 text-[#febb02]" />
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{t('berlin.budget')}</div>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[36px] font-black text-gradient-gold leading-none">${BUDGET.total.toLocaleString()}</span>
                        <span className="text-[13px] text-white/30">{t('berlin.estimated')}</span>
                      </div>
                    </div>
                    <div className="px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] shrink-0">
                      <div className="text-[9px] font-black uppercase tracking-[0.15em] text-white/30 mb-0.5">{t('berlin.hotel')}</div>
                      <div className="text-[12px] font-bold text-white/70">{BUDGET.hotelName}</div>
                    </div>
                  </div>
                  <div className="space-y-5">
                    {budgetRows.map((row) => (
                      <BudgetBar key={row.label} {...row} total={BUDGET.total} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex-1 relative bg-[#111111] border border-white/[0.07] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-4 h-4 text-white/25" />
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">{t('berlin.tipsTitle')}</span>
                </div>
                <ul className="space-y-3">
                  {TIPS.map((tip, i) => (
                    <li key={i} className="flex gap-2.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400/60 shrink-0 mt-0.5" />
                      <span className="text-[12px] text-white/50 leading-snug">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Day-by-day */}
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-white/25 mb-6">
                {t('berlin.dayByDay')}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {ITINERARY.map((dayPlan) => (
                  <div
                    key={dayPlan.day}
                    className="group relative bg-gradient-to-b from-[#141414] to-[#0f0f0f] border border-white/[0.07] rounded-2xl p-7 pl-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.14] hover:shadow-[0_18px_48px_rgba(0,0,0,0.55)]"
                  >
                    <span className={`absolute left-0 top-0 bottom-0 w-1 ${DAY_COLORS[dayPlan.day] || 'bg-gray-500'} opacity-70 group-hover:opacity-100 transition-opacity`} />
                    <div className="flex flex-col gap-2 mb-5">
                      <div className="flex items-center gap-2.5">
                        <span className={`flex items-center justify-center w-8 h-8 rounded-lg text-white text-[12px] font-black shrink-0 ${DAY_COLORS[dayPlan.day] || 'bg-gray-500'}`}>{dayPlan.day}</span>
                        <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/40">{t('berlinTrip.day')} {dayPlan.day}</div>
                      </div>
                      <div className="text-[13px] font-semibold text-white/70">{dayPlan.date}</div>
                      <div className="text-[15px] font-bold text-white mt-1">{dayPlan.title}</div>
                    </div>
                    <ul className="space-y-3">
                      {dayPlan.items.map((item, index) => {
                        const isMeta = item.startsWith('Address:') || item.startsWith('Price:');
                        return (
                          <li
                            key={index}
                            className={`leading-relaxed ${isMeta ? 'text-[12px] text-white/40 pl-4' : 'text-[13px] text-white/70'}`}
                          >
                            {item}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Total cost */}
            <div className="flex justify-center pb-8">
              <div className="inline-flex items-center gap-4 px-9 py-4 rounded-2xl bg-gradient-to-br from-[#141414] to-[#0e0e0e] border border-[#febb02]/20 shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
                <div className="w-10 h-10 rounded-xl bg-[#febb02]/10 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-[#febb02]" />
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">{t('berlin.totalCost')}</div>
                  <div className="text-[26px] font-black text-gradient-gold leading-tight">~${BUDGET.total.toLocaleString()}</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default BerlinTrip;
