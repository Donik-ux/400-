import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Snowflake, Ship, Plane, Crown, Compass, Calendar, Check, Sparkles,
  MessageCircle, ArrowRight, Globe, Users, Sun, Binoculars, Lightbulb,
} from 'lucide-react';
import { useTranslation } from '../store/useLangStore';
import useSEO from '../hooks/useSEO';
import { whatsappLink } from '../config/contact';
import { handleImgError } from '../utils/imageFallback';
import Price from '../components/Price';
import GoldDust from '../components/fx/GoldDust';

const HERO_IMG = 'https://images.unsplash.com/photo-1516569422572-d9e0514b9598?auto=format&fit=crop&w=1800&q=80';

const ROUTE_IMGS = [
  'https://images.unsplash.com/photo-1494564605686-2e931f77a8e2?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1551415923-a2297c7fda79?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1551986782-d0169b3f8fa7?auto=format&fit=crop&w=900&q=80',
];

/* Dedicated landing for travelers dreaming of the White Continent.
   CTAs reuse the existing flows: the AI planner deep-link (same shape the
   Home AI tab builds) and the WhatsApp expert channel. */
export default function Antarctica() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useSEO({
    title: t('antarctica.seo.title'),
    description: t('antarctica.seo.description'),
    url: 'https://maftravel.com/antarctica',
    keywords: ['Antarctica cruise', 'Antarctica expedition', 'Drake Passage', 'Ushuaia', 'polar travel', 'white continent'],
  });

  // Same direct-mode deep-link the Home AI tab produces, prefilled for Antarctica
  const buildPlan = () => {
    const days = 10;
    const balance = 9000;
    const qs = new URLSearchParams({ to: 'Antarctica', days: String(days), balance: String(balance), from: 'Dubai' });
    navigate(`/trip-plan?${qs.toString()}`, {
      state: {
        item: {
          id: `direct-${Date.now()}`,
          name: `${days}-day trip to Antarctica`,
          destination: 'Antarctica',
          duration: days,
          price: balance,
          category: 'adventure',
          image: HERO_IMG,
          description: `A ${days}-day expedition plan for Antarctica on a $${balance} budget.`,
        },
        type: 'package',
        fromCity: 'Dubai',
        startDate: '',
        returnDate: '',
        purpose: 'Polar expedition',
      },
    });
  };

  const routes = [
    { icon: Ship,  img: ROUTE_IMGS[0], title: t('antarctica.routes.r1Title'), desc: t('antarctica.routes.r1Desc'), tag: t('antarctica.routes.r1Tag'), price: 8990,  days: 10 },
    { icon: Plane, img: ROUTE_IMGS[1], title: t('antarctica.routes.r2Title'), desc: t('antarctica.routes.r2Desc'), tag: t('antarctica.routes.r2Tag'), price: 12490, days: 8 },
    { icon: Crown, img: ROUTE_IMGS[2], title: t('antarctica.routes.r3Title'), desc: t('antarctica.routes.r3Desc'), tag: t('antarctica.routes.r3Tag'), price: 24900, days: 12 },
  ];

  const seasons = [
    { icon: Snowflake,  label: t('antarctica.season.nov'), desc: t('antarctica.season.novDesc') },
    { icon: Sun,        label: t('antarctica.season.dec'), desc: t('antarctica.season.decDesc') },
    { icon: Binoculars, label: t('antarctica.season.feb'), desc: t('antarctica.season.febDesc') },
  ];

  const included = [
    t('antarctica.included.i1'), t('antarctica.included.i2'), t('antarctica.included.i3'),
    t('antarctica.included.i4'), t('antarctica.included.i5'), t('antarctica.included.i6'),
  ];

  const stats = [
    { icon: Globe,     value: t('antarctica.stats.continent'), label: t('antarctica.stats.continentSub') },
    { icon: Users,     value: t('antarctica.stats.visitors'),  label: t('antarctica.stats.visitorsSub') },
    { icon: Calendar,  value: t('antarctica.stats.season'),    label: t('antarctica.stats.seasonSub') },
    { icon: Binoculars,value: t('antarctica.stats.wildlife'),  label: t('antarctica.stats.wildlifeSub') },
  ];

  return (
    <div className="min-h-screen bg-[#faf6ed] -mt-[64px]">

      {/* ─── HERO — the ice at night ─────────────────────────────── */}
      <section className="relative aurora-bg text-white overflow-hidden pt-[120px] pb-20 md:pb-28">
        <div className="absolute inset-0 pointer-events-none opacity-[0.28] mix-blend-soft-light"
             style={{ backgroundImage: `url(${HERO_IMG})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'saturate(0.9)' }} />
        <div className="film-grain" />
        <div className="absolute inset-0 sheen-top pointer-events-none" />
        <GoldDust className="absolute inset-0" density={0.8} />
        <div className="absolute -left-32 top-10 w-96 h-96 rounded-full bg-[#7cc4d9]/25 blur-3xl pointer-events-none animate-float" />
        <div className="absolute -right-24 -bottom-10 w-80 h-80 rounded-full bg-[#febb02]/12 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-3xl">
            <div className="badge-editorial px-4 py-1.5 rounded-full text-[10.5px] font-black uppercase tracking-[0.16em] mb-5">
              <Snowflake className="w-3.5 h-3.5 text-[#7cc4d9]" /> {t('antarctica.hero.badge')}
            </div>
            <h1 className="font-display text-[clamp(40px,6.6vw,80px)] font-semibold tracking-[-0.045em] leading-[0.95] mb-5 text-balance break-words [text-shadow:0_2px_30px_rgba(0,0,0,0.35)]">
              {t('antarctica.hero.titleLead')} <span className="italic font-medium text-gradient-gold gold-animate">{t('antarctica.hero.titleHighlight')}</span> —<br className="hidden md:block" /> {t('antarctica.hero.titleTail')}
            </h1>
            <p className="text-[15px] md:text-[18px] text-white/80 font-medium max-w-xl mb-8 leading-relaxed">
              {t('antarctica.hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={buildPlan} className="btn-gold px-7 py-3.5 rounded-xl text-[#1a1a1a] font-black text-[14px] flex items-center gap-2 active:scale-95 transition">
                <Sparkles className="w-4 h-4" /> {t('antarctica.hero.ctaPlan')}
              </button>
              <a href={whatsappLink(t('antarctica.cta.whatsappPrefill'))} target="_blank" rel="noopener noreferrer"
                className="px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 font-black text-[14px] flex items-center gap-2 active:scale-95 transition">
                <MessageCircle className="w-4 h-4" /> {t('antarctica.hero.ctaExpert')}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── STATS BAND ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {stats.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="relative overflow-hidden bg-gradient-to-br from-[#00214f] to-[#001427] rounded-2xl shadow-lift p-4 md:p-5 text-center lift">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#7cc4d9]/70 to-transparent" />
              <div className="relative w-10 h-10 mx-auto rounded-xl bg-[#7cc4d9]/12 text-[#7cc4d9] flex items-center justify-center mb-2 ring-1 ring-[#7cc4d9]/25">
                <s.icon className="w-5 h-5" />
              </div>
              <div className="relative font-display text-[22px] md:text-[26px] font-semibold text-gradient-gold leading-none">{s.value}</div>
              <div className="relative text-[11px] md:text-[12px] font-bold text-white/50 mt-1.5">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── ROUTES / EXPEDITIONS ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 reveal">
        <div className="eyebrow-lux mb-2">
          <Compass className="w-3.5 h-3.5" /> {t('antarctica.routes.eyebrow')}
        </div>
        <h2 className="font-display text-engraved text-2xl md:text-[34px] font-bold text-[#1a1a1a] tracking-tight">{t('antarctica.routes.heading')}</h2>
        <p className="text-[14px] text-[#5c5245] font-medium max-w-2xl mt-2 mb-7">{t('antarctica.routes.sub')}</p>

        <div className="grid md:grid-cols-3 gap-4">
          {routes.map((r, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className={`group lift card-sheen bg-white rounded-2xl overflow-hidden border border-[#e6dcc3] flex flex-col ${i === 2 ? 'edge-gilded' : 'shadow-soft'}`}>
              <div className="relative h-44 overflow-hidden">
                <img src={r.img} alt={r.title} loading="lazy" onError={handleImgError}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
                <span className="absolute top-2.5 left-2.5 bg-[#febb02] text-[#1a1a1a] text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md shadow-float">{r.tag}</span>
                <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-white">
                  <r.icon className="w-4 h-4 text-[#ffd76e]" />
                  <span className="text-[15px] font-black [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">{r.title}</span>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <p className="text-[13px] text-[#5c5245] font-medium leading-relaxed flex-1">{r.desc}</p>
                <div className="flex items-end justify-between border-t border-[#efe6d2] pt-3 mt-4">
                  <div>
                    <div className="text-[10px] text-[#93876f] font-bold uppercase">{r.days} {t('antarctica.routes.daysLabel')} · {t('antarctica.routes.fromLabel')}</div>
                    <div className="text-[20px] font-black text-[#003580]"><Price amount={r.price} /></div>
                  </div>
                  <button onClick={buildPlan}
                    className="text-[12px] font-black text-white bg-[#0071c2] hover:bg-[#005fa3] px-3 py-2 rounded-lg transition shadow-soft flex items-center gap-1 active:scale-95">
                    {t('antarctica.hero.ctaPlan').split(' ')[0]} <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── SEASON ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-6 reveal">
        <div className="relative overflow-hidden bg-gradient-to-br from-[#00214f] to-[#001427] rounded-3xl p-7 md:p-10 text-white shadow-float">
          <div className="pattern-lux" />
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-[#7cc4d9]/20 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="eyebrow-lux eyebrow-lux--light mb-2">
              <Calendar className="w-3.5 h-3.5" /> {t('antarctica.season.eyebrow')}
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-6">{t('antarctica.season.heading')}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {seasons.map((s, i) => (
                <div key={i} className="bg-white/[0.07] backdrop-blur rounded-2xl p-5 border border-white/10 hover:border-[#7cc4d9]/40 transition">
                  <s.icon className="w-5 h-5 text-[#7cc4d9] mb-3" />
                  <div className="text-[15px] font-black mb-1">{s.label}</div>
                  <p className="text-[13px] text-white/70 font-medium leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── WHAT'S INCLUDED ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 reveal">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="eyebrow-lux mb-2">
              <Check className="w-3.5 h-3.5" /> {t('antarctica.included.eyebrow')}
            </div>
            <h2 className="font-display text-engraved text-2xl md:text-[34px] font-bold text-[#1a1a1a] tracking-tight mb-2">{t('antarctica.included.heading')}</h2>
            <p className="text-[14px] text-[#5c5245] font-medium mb-6 max-w-xl">{t('antarctica.included.sub')}</p>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {included.map((line, i) => (
                <div key={i} className="flex items-start gap-2.5 bg-white border border-[#e6dcc3] rounded-xl px-3.5 py-3 shadow-soft">
                  <span className="mt-0.5 w-5 h-5 rounded-md bg-[#e9f3ea] text-[#2e7d4f] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" strokeWidth={3} />
                  </span>
                  <span className="text-[12.5px] font-bold text-[#1a1a1a] leading-snug">{line}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="note-warn rounded-2xl p-6 shadow-soft">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#febb02] to-[#e0a435] text-[#1a1a1a] flex items-center justify-center shrink-0">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[15px] font-black text-warn mb-1.5">{t('antarctica.included.tipTitle')}</p>
                <p className="text-[13px] text-[#8a5c17]/90 font-medium leading-relaxed">{t('antarctica.included.tipBody')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-14 reveal">
        <div className="panel-inlay relative overflow-hidden aurora-bg rounded-3xl p-8 md:p-12 text-white shadow-float text-center">
          <div className="film-grain" />
          <div className="relative max-w-2xl mx-auto">
            <Snowflake className="w-8 h-8 text-[#7cc4d9] mx-auto mb-4 animate-float" />
            <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-[-0.02em] mb-3 text-balance">{t('antarctica.cta.heading')}</h2>
            <p className="text-[14px] md:text-[15px] text-white/80 font-medium mb-7 leading-relaxed">{t('antarctica.cta.body')}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={buildPlan} className="btn-gold px-7 py-3.5 rounded-xl text-[#1a1a1a] font-black text-[14px] flex items-center gap-2 active:scale-95 transition">
                <Sparkles className="w-4 h-4" /> {t('antarctica.cta.btnPlan')}
              </button>
              <a href={whatsappLink(t('antarctica.cta.whatsappPrefill'))} target="_blank" rel="noopener noreferrer"
                className="px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 font-black text-[14px] flex items-center gap-2 active:scale-95 transition">
                <MessageCircle className="w-4 h-4" /> {t('antarctica.cta.btnWhatsApp')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
