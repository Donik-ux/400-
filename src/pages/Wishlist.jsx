import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Plane, Trash2, ArrowRight, Package, Sparkles, MapPin, Calendar,
  Star, ShoppingBag, Globe2, Filter,
} from 'lucide-react';
import useWishlistStore from '../store/useWishlistStore';
import useSEO from '../hooks/useSEO';
import { useTranslation } from '../store/useLangStore';
import { heroFor } from '../utils/destinationImages';
import { toast } from '../components/Toast';
import SmartImage from '../components/SmartImage';

export default function Wishlist() {
  const { items, removeFromWishlist, clearWishlist } = useWishlistStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all'); // all | flight | package

  useSEO({
    title: 'My Wishlist · Saved Trips & Flights',
    description: 'Your saved flights and tour packages. Pick one and let MAFTRAVEL build the plan.',
  });

  /* ── Derive a uniform card model from any wishlist entry ── */
  const cards = useMemo(() => items.map(entry => {
    const d = entry.data || {};
    if (entry.type === 'flight') {
      const fromCity = (d.from || '').split('(')[0].trim();
      const toCity   = (d.to   || '').split('(')[0].trim();
      return {
        key: `flight-${entry.id}`, type: 'flight',
        title: `${fromCity || 'Flight'} → ${toCity || ''}`,
        sub: `${d.airline || 'Flight'} · ${d.cabin || 'Economy'}`,
        price: d.price,
        image: heroFor(toCity || fromCity),
        meta: d.departure ? `Departs ${d.departure}` : null,
        cta: () => navigate('/flights'),
        rawId: entry.id, rawType: entry.type,
      };
    }
    // package or any other type — most cards have destination + image
    const dest = d.destination || d.city || d.name || 'Tour';
    return {
      key: `${entry.type}-${entry.id}`, type: entry.type,
      title: d.name || dest,
      sub: d.destination ? d.destination : (d.duration ? `${d.duration} days` : 'Tour package'),
      price: d.price,
      image: d.image || heroFor(dest),
      meta: d.duration ? `${d.duration} days` : null,
      rating: d.rating,
      cta: () => navigate('/hot-tours'),
      rawId: entry.id, rawType: entry.type,
    };
  }), [items, navigate]);

  const counts = useMemo(() => ({
    all:     cards.length,
    flight:  cards.filter(c => c.type === 'flight').length,
    package: cards.filter(c => c.type !== 'flight').length,
  }), [cards]);

  const visible = filter === 'all' ? cards : cards.filter(c => filter === 'flight' ? c.type === 'flight' : c.type !== 'flight');

  const fill = (str, vars = {}) => String(str).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));

  const handleRemove = (id, type, title) => {
    removeFromWishlist(id, type);
    toast.info(t('lists.wishlist.removedToast'), title);
  };

  const handleClear = () => {
    if (cards.length === 0) return;
    clearWishlist();
    toast.info(t('lists.wishlist.clearedToast'), fill(t('lists.wishlist.clearedToastBody'), { count: cards.length }));
  };

  return (
    <div className="bg-[#f5f5f5] min-h-screen -mt-[64px]">
      {/* ── Hero header ── */}
      <section className="relative bg-gradient-to-br from-[#002250] via-[#003580] to-[#0071c2] text-white overflow-hidden pt-[100px] pb-14">
        <div className="absolute inset-0 opacity-25 pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(circle at 25% 30%, #0071c2 0%, transparent 45%), radial-gradient(circle at 75% 70%, #febb02 0%, transparent 35%)' }} />
        <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#febb02]/15 blur-3xl pointer-events-none animate-float" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#febb02] text-[#1a1a1a] text-[11px] font-black uppercase tracking-widest mb-4 shadow-float">
            <Heart className="w-3.5 h-3.5 fill-[#1a1a1a]" /> {t('wishlist.badge') || 'Saved Items'}
          </div>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.05] mb-2">{t('wishlist.title') || 'My Wishlist'}</h1>
              <p className="text-[14px] md:text-[15px] text-white/80 font-medium">{fill(t('lists.wishlist.savedCount'), { count: cards.length })}</p>
            </div>
            {cards.length > 0 && (
              <button onClick={handleClear}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[12px] font-black transition active:scale-95">
                <Trash2 className="w-3.5 h-3.5" /> {t('wishlist.clearAll') || 'Clear all'}
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* ── Filter tabs ── */}
        {cards.length > 0 && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <Filter className="w-4 h-4 text-[#9ca3af]" />
            {[
              { v: 'all',     l: t('lists.wishlist.filterAll'),     n: counts.all     },
              { v: 'flight',  l: t('lists.wishlist.filterFlights'), n: counts.flight  },
              { v: 'package', l: t('lists.wishlist.filterTours'),   n: counts.package },
            ].map(({ v, l, n }) => (
              <button key={v} onClick={() => setFilter(v)}
                className={`px-3.5 py-2 rounded-xl text-[12px] font-black border transition ${
                  filter === v
                    ? 'bg-[#003580] text-white border-[#003580]'
                    : 'bg-white border-[#e7e7e7] text-[#1a1a1a] hover:border-[#0071c2]'
                }`}>
                {l} <span className={filter === v ? 'text-white/70' : 'text-[#9ca3af]'}>· {n}</span>
              </button>
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {cards.length === 0 && (
          <div className="bg-white border border-[#e7e7e7] rounded-3xl p-10 md:p-16 text-center shadow-float relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#febb02]/20 blur-3xl pointer-events-none animate-float" />
            <div className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-[#0071c2]/10 blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#febb02] to-[#ff8a00] flex items-center justify-center mx-auto mb-5 rotate-3 shadow-lift">
                <Heart className="w-10 h-10 text-white fill-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-[#1a1a1a] mb-2">{t('wishlist.empty') || 'Your wishlist is empty'}</h2>
              <p className="text-[14px] text-[#595959] font-medium mb-7 max-w-md mx-auto leading-relaxed">
                {t('wishlist.emptySub') || 'Save flights and tour packages by tapping the heart icon. They\'ll appear here so you can come back and book later.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={() => navigate('/hot-tours')}
                  className="btn-gold px-6 py-3.5 text-[13px] flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" /> {t('lists.wishlist.openStudio')}
                </button>
                <button onClick={() => navigate('/flights')}
                  className="px-6 py-3.5 rounded-xl border-2 border-[#e7e7e7] hover:border-[#0071c2] hover:bg-[#f0f5ff] text-[13px] font-black text-[#1a1a1a] flex items-center justify-center gap-2 transition active:scale-95">
                  <Plane className="w-4 h-4" /> {t('lists.wishlist.searchFlights')}
                </button>
              </div>

              {/* Suggested popular destinations */}
              <div className="mt-10 pt-7 relative">
                <div className="hairline absolute top-0 left-0 right-0" />
                <p className="text-[11px] font-black uppercase tracking-widest text-[#9ca3af] mb-3">{t('lists.wishlist.tryPopular')}</p>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2.5 max-w-2xl mx-auto">
                  {['Dubai', 'Bali', 'Istanbul', 'Tokyo', 'Paris'].map(c => (
                    <button key={c} onClick={() => navigate(`/trip-plan?to=${encodeURIComponent(c)}&days=7&balance=2000`)}
                      className="relative aspect-square overflow-hidden rounded-xl border border-[#e7e7e7] group lift shadow-soft">
                      <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-110">
                        <SmartImage src={heroFor(c)} alt={c} wrapperClassName="absolute inset-0" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                      <span className="absolute bottom-1.5 left-2 right-2 text-left text-white text-[11px] font-black drop-shadow">{c}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Wishlist grid ── */}
        {visible.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {visible.map((card, i) => (
                <motion.div
                  key={card.key}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.18 } }}
                  transition={{ duration: 0.28, delay: i * 0.04 }}
                  className="group bg-white border border-[#e7e7e7] rounded-2xl overflow-hidden shadow-soft lift flex flex-col"
                >
                  <div className="relative overflow-hidden">
                    <div className="transition-transform duration-500 ease-out group-hover:scale-[1.05]">
                      <SmartImage src={card.image} alt={card.title} aspect="aspect-[16/10]" />
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent pointer-events-none" />

                    <span className={`absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      card.type === 'flight'
                        ? 'bg-[#0071c2] text-white'
                        : 'bg-[#febb02] text-[#1a1a1a]'
                    }`}>
                      {card.type === 'flight' ? <Plane className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                      {card.type === 'flight' ? t('lists.wishlist.flightTag') : t('lists.wishlist.tourTag')}
                    </span>

                    <button onClick={() => handleRemove(card.rawId, card.rawType, card.title)}
                      className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-white/95 flex items-center justify-center shadow hover:bg-red-50 hover:scale-110 transition group/heart"
                      aria-label="Remove from wishlist">
                      <Heart className="w-4 h-4 fill-red-500 text-red-500 group-hover/heart:scale-110 transition" />
                    </button>

                    {card.rating && (
                      <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-1 bg-white/95 rounded-md text-[11px] font-black text-[#1a1a1a]">
                        <Star className="w-3 h-3 fill-[#febb02] text-[#febb02]" /> {card.rating}
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-1 text-[11px] text-[#595959] font-bold mb-1">
                      <MapPin className="w-3 h-3 text-[#0071c2]" /> {card.sub}
                    </div>
                    <h3 className="text-[15px] font-black text-[#1a1a1a] mb-2 line-clamp-2 leading-snug">{card.title}</h3>
                    {card.meta && (
                      <div className="flex items-center gap-1 text-[11px] text-[#9ca3af] font-bold mb-3">
                        <Calendar className="w-3 h-3" /> {card.meta}
                      </div>
                    )}

                    <div className="mt-auto flex items-end justify-between pt-3 border-t border-[#f0f0f0]">
                      <div>
                        {card.price ? (
                          <>
                            <div className="text-[10px] text-[#9ca3af] font-bold uppercase">{t('lists.wishlist.from')}</div>
                            <div className="text-[20px] font-black text-[#003580] leading-none">${card.price.toLocaleString()}</div>
                          </>
                        ) : (
                          <div className="text-[12px] text-[#9ca3af] font-bold">{t('lists.wishlist.viewDetails')}</div>
                        )}
                      </div>
                      <button onClick={card.cta}
                        className="px-4 py-2.5 rounded-xl bg-[#0071c2] hover:bg-[#005fa3] text-white text-[12px] font-black flex items-center gap-1.5 transition active:scale-95 shadow-soft group-hover:shadow-float">
                        {t('wishlist.viewDetails') || 'View'} <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* "No matches in this filter" sub-state */}
        {cards.length > 0 && visible.length === 0 && (
          <div className="bg-white border border-[#e7e7e7] rounded-2xl p-12 text-center shadow-soft">
            <div className="w-14 h-14 rounded-2xl bg-[#f8f9fa] border border-[#e7e7e7] flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-7 h-7 text-[#c9d1d9]" />
            </div>
            <p className="text-[#1a1a1a] font-black mb-1">{t('lists.wishlist.noMatchTitle')}</p>
            <p className="text-[#9ca3af] text-sm mb-4">{t('lists.wishlist.noMatchSub')}</p>
            <button onClick={() => setFilter('all')}
              className="px-5 py-2.5 rounded-xl bg-[#0071c2] hover:bg-[#005fa3] text-white text-[13px] font-black transition active:scale-95 shadow-soft">
              {t('lists.wishlist.showAll')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
