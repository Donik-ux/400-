import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, MapPin, Calendar, Wallet, Trash2, ArrowRight, Map, Clock, Download,
} from 'lucide-react';
import useSavedPlansStore from '../store/useSavedPlansStore';
import useStore from '../store/useStore';
import useSEO from '../hooks/useSEO';
import { useTranslation } from '../store/useLangStore';
import { heroFor } from '../utils/destinationImages';
import { downloadPlanPdf } from '../utils/planPdf';
import { toast } from '../components/Toast';
import SmartImage from '../components/SmartImage';

export default function MyPlans() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { plans, removePlan, clearPlans } = useSavedPlansStore();
  const { setItineraries, setItineraryMeta } = useStore();
  const fill = (str, vars = {}) => String(str).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));

  useSEO({
    title: 'My Trip Plans · Saved AI Itineraries',
    description: 'All your saved AI-generated travel plans in one place — reopen any plan, review the budget and itinerary.',
  });

  /* Restore a saved plan into the live store and open the planner */
  const openPlan = (plan) => {
    setItineraries(plan.itineraries || []);
    setItineraryMeta(plan.meta || null);
    navigate('/planner', { state: { restoredFormData: plan.formData } });
  };

  const handleRemove = (id, dest) => {
    removePlan(id);
    toast.info(t('lists.plans.removedToast'), dest);
  };

  const handleClear = () => {
    if (!plans.length) return;
    clearPlans();
    toast.info(t('lists.plans.clearedToast'), fill(t('lists.plans.clearedToastBody'), { count: plans.length }));
  };

  const fmtDate = (iso) => {
    try { return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return ''; }
  };

  return (
    <div className="bg-[#f5f5f5] min-h-screen -mt-[64px]">
      {/* ── Hero header ── */}
      <section className="relative bg-gradient-to-br from-[#002250] via-[#002a63] to-[#003580] text-white overflow-hidden pt-[100px] pb-14">
        <div className="absolute inset-0 opacity-25 pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(circle at 25% 30%, #0071c2 0%, transparent 45%), radial-gradient(circle at 75% 70%, #f5b942 0%, transparent 35%)' }} />
        <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#f5b942]/15 blur-3xl pointer-events-none animate-float" />
        <div className="relative max-w-7xl mx-auto px-4 md:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f5b942] text-[#002250] text-[11px] font-black uppercase tracking-widest mb-4 shadow-float">
            <Sparkles className="w-3.5 h-3.5" /> {t('lists.plans.badge')}
          </div>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-[1.05] mb-2">{t('lists.plans.title')}</h1>
              <p className="text-[14px] md:text-[15px] text-white/80 font-medium">
                {fill(t(plans.length === 1 ? 'lists.plans.subOne' : 'lists.plans.subMany'), { count: plans.length })}
              </p>
            </div>
            {plans.length > 0 && (
              <button onClick={handleClear}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[12px] font-black transition active:scale-95">
                <Trash2 className="w-3.5 h-3.5" /> {t('lists.plans.clearAll')}
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* ── Empty state ── */}
        {plans.length === 0 && (
          <div className="bg-white border border-[#e7e7e7] rounded-3xl p-10 md:p-16 text-center shadow-float relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-[#f5b942]/20 blur-3xl pointer-events-none animate-float" />
            <div className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-[#0071c2]/10 blur-3xl pointer-events-none" />
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#f5b942] to-[#d99a2b] flex items-center justify-center mx-auto mb-5 rotate-3 shadow-lift">
                <Map className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-[#1a1a1a] mb-2">{t('lists.plans.emptyTitle')}</h2>
              <p className="text-[14px] text-[#595959] font-medium mb-7 max-w-md mx-auto leading-relaxed">
                {t('lists.plans.emptySubA')} <strong>“{t('lists.plans.emptySubBtn')}”</strong>{t('lists.plans.emptySubB')}
              </p>
              <button onClick={() => navigate('/planner')}
                className="btn-gold px-6 py-3.5 text-[13px] inline-flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" /> {t('lists.plans.openPlanner')}
              </button>
            </div>
          </div>
        )}

        {/* ── Plans grid ── */}
        {plans.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 page-fade">
            {plans.map((plan) => {
              const dest   = plan.formData?.destination || t('lists.plans.tripFallback');
              const days   = plan.itineraries?.length || plan.formData?.days || 0;
              const total  = plan.meta?.budgetBreakdown?.total;
              const budget = Number(plan.formData?.budget) || 0;
              const isAi   = plan.meta?.source === 'ai';
              return (
                <div key={plan.id}
                  className="group bg-white border border-[#e7e7e7] rounded-2xl overflow-hidden shadow-soft lift flex flex-col">
                  <div className="relative overflow-hidden">
                    <div className="transition-transform duration-500 ease-out group-hover:scale-[1.05]">
                      <SmartImage src={heroFor(dest)} alt={dest} aspect="aspect-[16/10]" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent pointer-events-none" />
                    <span className={`absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      isAi ? 'bg-[#f5b942] text-[#002250]' : 'bg-[#0071c2] text-white'
                    }`}>
                      <Sparkles className="w-3 h-3" /> {isAi ? t('lists.plans.aiPlanTag') : t('lists.plans.planTag')}
                    </span>
                    <button onClick={() => handleRemove(plan.id, dest)}
                      className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-white/95 flex items-center justify-center shadow hover:bg-red-50 hover:scale-110 transition"
                      aria-label={t('lists.plans.deletePlan')}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                    <h3 className="absolute bottom-2.5 left-3 right-3 text-white text-[18px] font-black flex items-center gap-1.5 drop-shadow">
                      <MapPin className="w-4 h-4" /> {dest}
                    </h3>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] font-bold text-[#595959] mb-3">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#0071c2]" /> {fill(t('lists.plans.daysValue'), { days })}</span>
                      {budget > 0 && <span className="flex items-center gap-1"><Wallet className="w-3 h-3 text-[#0071c2]" /> {fill(t('lists.plans.budgetValue'), { budget: budget.toLocaleString() })}</span>}
                      <span className="flex items-center gap-1 text-[#9ca3af]"><Clock className="w-3 h-3" /> {fmtDate(plan.savedAt)}</span>
                    </div>

                    <div className="mt-auto flex items-end justify-between pt-3 border-t border-[#f0f0f0]">
                      <div>
                        {total != null ? (
                          <>
                            <div className="text-[10px] text-[#9ca3af] font-bold uppercase">{t('lists.plans.planCost')}</div>
                            <div className="text-[20px] font-black text-[#003580] leading-none">${Number(total).toLocaleString()}</div>
                          </>
                        ) : (
                          <div className="text-[12px] text-[#9ca3af] font-bold">{t('lists.plans.openToView')}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => downloadPlanPdf(plan)}
                          className="px-3 py-2.5 rounded-xl border-2 border-[#0071c2] text-[#0071c2] hover:bg-[#f0f5ff] text-[12px] font-black flex items-center gap-1.5 transition active:scale-95"
                          title={t('lists.plans.downloadPdf') || 'Download PDF'}>
                          <Download className="w-3.5 h-3.5" /> PDF
                        </button>
                        <button onClick={() => openPlan(plan)}
                          className="px-4 py-2.5 rounded-xl bg-[#0071c2] hover:bg-[#005fa3] text-white text-[12px] font-black flex items-center gap-1.5 transition active:scale-95 shadow-soft group-hover:shadow-float">
                          {t('lists.plans.open')} <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
