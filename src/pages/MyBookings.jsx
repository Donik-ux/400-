import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plane, Package, Calendar, Users, CheckCircle, Clock, XCircle, Search,
  ArrowRight, BookOpen, MapPin, Sparkles, Filter, FileText,
} from 'lucide-react';
import useAuthStore  from '../store/useAuthStore';
import useAdminStore from '../store/useAdminStore';
import useSEO from '../hooks/useSEO';
import { useTranslation } from '../store/useLangStore';
import { heroFor } from '../utils/destinationImages';
import SmartImage from '../components/SmartImage';

const STATUS_META = (t) => ({
  saved:     { cls: 'bg-[#f0f5ff] text-[#0071c2] border-[#dceaff]',  icon: BookOpen,    label: t('lists.bookings.statusSaved') },
  confirmed: { cls: 'bg-[#e8f5e9] text-[#008009] border-[#bbf7d0]',  icon: CheckCircle, label: t('bookings.status.confirmed') || 'Confirmed' },
  pending:   { cls: 'bg-[#fff7e6] text-[#a45e00] border-[#ffd76e]',  icon: Clock,       label: t('bookings.status.pending')   || 'Pending'   },
  cancelled: { cls: 'bg-red-50 text-red-600 border-red-200',          icon: XCircle,     label: t('bookings.status.cancelled') || 'Cancelled' },
});

// Pull a destination name out of a bookings record so we can fetch a hero image
const destinationOf = (b) => {
  if (!b) return '';
  if (b.type === 'flight') {
    return (b.itemName?.split('→')[1] || '').split('(')[0].trim();
  }
  if (b.plan?.header?.title) {
    const after = b.plan.header.title.split('–')[1];
    if (after) return after.trim();
  }
  // package: "Bali Tropical Paradise (10 days)" — strip parens / duration
  return String(b.itemName || '').replace(/\(.*?\)/g, '').trim();
};

export default function MyBookings() {
  const user     = useAuthStore(s => s.user);
  const { getBookingsByUser } = useAdminStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const fill = (str, vars = {}) => String(str).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useSEO({
    title: 'My Trip Plans — Saved Journeys',
    description: 'All your saved trip plans and booking history with MAFTRAVEL — free planning, no payment.',
    keywords: ['my plans', 'trip history', 'saved trips'],
  });

  const STATUS = STATUS_META(t);

  const bookings = useMemo(
    () => getBookingsByUser(user?.id || '').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [user?.id, getBookingsByUser]
  );

  const counts = useMemo(() => ({
    all:       bookings.length,
    saved:     bookings.filter(b => b.status === 'saved').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending:   bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  }), [bookings]);

  const filtered = useMemo(() => {
    return bookings
      .filter(b => filter === 'all' || b.status === filter)
      .filter(b => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
          b.itemName?.toLowerCase().includes(s) ||
          (b.confirmCode || '').toLowerCase().includes(s)
        );
      });
  }, [bookings, filter, search]);

  return (
    <div className="bg-[#f5f5f5] min-h-screen -mt-[64px]">
      {/* ── Hero header ── */}
      <section className="relative bg-gradient-to-br from-[#002250] via-[#003580] to-[#0071c2] text-white overflow-hidden pt-[100px] pb-14">
        <div className="absolute inset-0 opacity-25 pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(circle at 25% 30%, #0071c2 0%, transparent 45%), radial-gradient(circle at 75% 70%, #febb02 0%, transparent 35%)' }} />
        <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#febb02]/15 blur-3xl pointer-events-none animate-float" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#febb02] text-[#1a1a1a] text-[11px] font-black uppercase tracking-widest mb-4 shadow-float">
            <BookOpen className="w-3.5 h-3.5" /> {t('bookings.badge') || 'Travel History'}
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.05] mb-2">
            {t('bookings.title') || 'My Trip Plans'}
          </h1>
          <p className="text-[14px] md:text-[15px] text-white/80 font-medium">
            {fill(t('lists.bookings.savedCount'), { count: bookings.length })}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* ── Search + filters ── */}
        {bookings.length > 0 && (
          <div className="mb-6 flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
              <input
                type="text"
                placeholder={t('lists.bookings.searchPh')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white border-2 border-[#e7e7e7] focus:border-[#0071c2] rounded-xl pl-10 pr-4 py-2.5 text-[14px] font-semibold text-[#1a1a1a] placeholder:text-[#b0b0b0] outline-none transition"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <Filter className="w-4 h-4 text-[#9ca3af] shrink-0" />
              {[
                { v: 'all',       l: t('lists.bookings.filterAll'),       n: counts.all       },
                { v: 'saved',     l: t('lists.bookings.filterSaved'),     n: counts.saved     },
                { v: 'confirmed', l: t('lists.bookings.filterConfirmed'), n: counts.confirmed },
                { v: 'pending',   l: t('lists.bookings.filterPending'),   n: counts.pending   },
                { v: 'cancelled', l: t('lists.bookings.filterCancelled'), n: counts.cancelled },
              ].filter(f => f.v === 'all' || f.n > 0).map(({ v, l, n }) => (
                <button key={v} onClick={() => setFilter(v)}
                  className={`px-3.5 py-2 rounded-xl text-[12px] font-black border whitespace-nowrap transition ${
                    filter === v
                      ? 'bg-[#003580] text-white border-[#003580]'
                      : 'bg-white border-[#e7e7e7] text-[#1a1a1a] hover:border-[#0071c2]'
                  }`}>
                  {l} <span className={filter === v ? 'text-white/70' : 'text-[#9ca3af]'}>· {n}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {bookings.length === 0 && (
          <div className="bg-white border border-[#e7e7e7] rounded-3xl p-10 md:p-16 text-center shadow-float relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#0071c2]/15 blur-3xl pointer-events-none animate-float" />
            <div className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-[#febb02]/10 blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#003580] to-[#0071c2] flex items-center justify-center mx-auto mb-5 -rotate-3 shadow-lift">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-[#1a1a1a] mb-2">{t('bookings.empty') || 'No plans saved yet'}</h2>
              <p className="text-[14px] text-[#595959] font-medium mb-7 max-w-md mx-auto leading-relaxed">
                {t('bookings.emptySub') || 'When you save a trip plan, it lands here so you can revisit, print, or share it anytime.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => navigate('/hot-tours')}
                  className="btn-gold px-6 py-3.5 text-[13px] flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" /> {t('lists.bookings.startStudio')}
                </button>
                <button onClick={() => navigate('/flights')}
                  className="px-6 py-3.5 rounded-xl border-2 border-[#e7e7e7] hover:border-[#0071c2] hover:bg-[#f0f5ff] text-[#1a1a1a] text-[13px] font-black flex items-center justify-center gap-2 transition active:scale-95">
                  <Plane className="w-4 h-4" /> {t('lists.bookings.searchFlights')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Bookings grid ── */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((b, i) => {
              const meta = STATUS[b.status] || STATUS.pending;
              const Icon = meta.icon;
              const dest = destinationOf(b);
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: i * 0.04 }}
                  className="group bg-white border border-[#e7e7e7] rounded-2xl overflow-hidden shadow-soft lift flex flex-col"
                >
                  {/* Destination hero */}
                  <div className="relative overflow-hidden">
                    <div className="transition-transform duration-500 ease-out group-hover:scale-[1.05]">
                      <SmartImage src={heroFor(dest)} alt={b.itemName} aspect="aspect-[16/9]" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

                    <span className={`absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      b.type === 'flight'
                        ? 'bg-[#0071c2] text-white'
                        : b.type === 'plan'
                        ? 'bg-[#febb02] text-[#1a1a1a]'
                        : 'bg-white text-[#003580]'
                    }`}>
                      {b.type === 'flight' ? <Plane className="w-3 h-3" /> : b.type === 'plan' ? <FileText className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                      {b.type === 'plan' ? t('lists.bookings.tripPlanTag') : b.type}
                    </span>

                    <span className={`absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-black uppercase tracking-wider ${meta.cls}`}>
                      <Icon className="w-3 h-3" /> {meta.label}
                    </span>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-white/85 mb-0.5">
                        <MapPin className="w-3 h-3 text-[#febb02]" /> {dest || t('lists.bookings.destination')}
                      </div>
                      <p className="text-[15px] font-black leading-tight line-clamp-1">{b.itemName}</p>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center justify-between text-[11px] text-[#595959] font-bold mb-3 flex-wrap gap-x-3 gap-y-1">
                      {b.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#0071c2]" />
                          {new Date(b.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#0071c2]" />{fill(t('lists.bookings.paxValue'), { count: b.passengers })}
                      </span>
                    </div>

                    {b.confirmCode && (
                      <div className="text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest mb-2">
                        {t('lists.bookings.confirmation')}{' '}
                        <span className="font-mono text-[#1a1a1a] tracking-wider">{b.confirmCode}</span>
                      </div>
                    )}

                    <div className="mt-auto flex items-end justify-between pt-3 border-t border-[#f0f0f0]">
                      <div>
                        <div className="text-[10px] text-[#9ca3af] font-bold uppercase">{t('lists.bookings.total')}</div>
                        <div className="text-[20px] font-black text-[#003580] leading-none">${(b.total || 0).toLocaleString()}</div>
                      </div>
                      <button onClick={() => navigate('/trip-plan', { state: { item: { id: b.itemId || b.id, name: b.itemName, destination: dest, duration: 5, price: b.total, image: heroFor(dest) }, type: 'package' } })}
                        className="px-4 py-2.5 rounded-xl bg-[#0071c2] hover:bg-[#005fa3] text-white text-[12px] font-black flex items-center gap-1.5 transition active:scale-95 shadow-soft group-hover:shadow-float">
                        {t('lists.bookings.open')} <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* No matches in filter sub-state */}
        {bookings.length > 0 && filtered.length === 0 && (
          <div className="bg-white border border-[#e7e7e7] rounded-2xl p-12 text-center shadow-soft">
            <div className="w-14 h-14 rounded-2xl bg-[#f8f9fa] border border-[#e7e7e7] flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-[#c9d1d9]" />
            </div>
            <p className="text-[#1a1a1a] font-black mb-1">{t('lists.bookings.noMatchTitle')}</p>
            <p className="text-[#9ca3af] text-sm mb-4">{t('lists.bookings.noMatchSub')}</p>
            <button onClick={() => { setFilter('all'); setSearch(''); }}
              className="px-5 py-2.5 rounded-xl bg-[#0071c2] hover:bg-[#005fa3] text-white text-[13px] font-black transition active:scale-95 shadow-soft">
              {t('lists.bookings.clearFilters')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
