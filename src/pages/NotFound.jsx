import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft, Sparkles, Flame, Plane } from 'lucide-react';
import { useTranslation } from '../store/useLangStore';

const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="relative min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#f5f5f5] overflow-hidden">
      {/* Floating accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float absolute -top-16 -left-10 w-72 h-72 rounded-full bg-[#0071c2]/10 blur-3xl" />
        <div className="animate-float absolute -bottom-16 -right-10 w-80 h-80 rounded-full bg-[#febb02]/10 blur-3xl" style={{ animationDelay: '1.6s' }} />
        <Plane className="animate-float absolute top-16 right-[12%] w-10 h-10 text-[#003580]/10" style={{ animationDelay: '0.5s' }} />
        <Compass className="animate-float absolute bottom-16 left-[12%] w-12 h-12 text-[#febb02]/15" style={{ animationDelay: '2.1s' }} />
      </div>

      <div className="relative max-w-xl w-full bg-white border border-[#e7e7e7] rounded-3xl shadow-lift p-10 text-center page-fade">
        <div className="animate-float w-20 h-20 rounded-2xl bg-gradient-to-br from-[#003580] to-[#002250] text-[#febb02] flex items-center justify-center mx-auto mb-5 rotate-3 shadow-float">
          <Compass className="w-10 h-10" />
        </div>
        <p className="text-[12px] font-black uppercase tracking-widest text-[#0071c2] mb-2">{t('notFound.badge')}</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3 text-gradient">
          {t('notFound.title')}
        </h1>
        <p className="text-[14px] text-[#595959] font-medium mb-6">
          {t('notFound.sub')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => navigate('/')}
            className="px-5 py-3 rounded-xl border-2 border-[#e7e7e7] hover:border-[#0071c2] hover:bg-[#f0f5ff] text-[13px] font-black text-[#1a1a1a] transition active:scale-95 flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> {t('notFound.backHome')}
          </button>
          <button onClick={() => navigate('/hot-tours')}
            className="btn-gold px-5 py-3 text-[13px] flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" /> {t('notFound.aiStudio')}
          </button>
        </div>
        <div className="hairline my-7" />
        <div className="flex justify-center gap-5 text-[#595959]">
          <button onClick={() => navigate('/flights')} className="flex items-center gap-1.5 text-[12px] font-bold hover:text-[#0071c2] transition">
            <Plane className="w-3.5 h-3.5" /> {t('notFound.searchFlights')}
          </button>
          <button onClick={() => navigate('/hot-tours')} className="flex items-center gap-1.5 text-[12px] font-bold hover:text-[#0071c2] transition">
            <Flame className="w-3.5 h-3.5" /> {t('notFound.hotTours')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
