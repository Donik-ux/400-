import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, CreditCard, Phone, Calendar, Globe, Save, CheckCircle,
  Shield, BookOpen, ArrowLeft, Edit2, Sparkles, MapPin, Wallet,
  Trash2, ArrowRight, Download, Clock, Map,
} from 'lucide-react';
import useAuthStore  from '../store/useAuthStore';
import useAdminStore from '../store/useAdminStore';
import useSavedPlansStore from '../store/useSavedPlansStore';
import useStore from '../store/useStore';
import { detectPassportCountry } from '../services/passportService';
import { useTranslation } from '../store/useLangStore';
import { downloadPlanPdf } from '../utils/planPdf';
import { heroFor } from '../utils/destinationImages';
import { toast } from '../components/Toast';

export default function Profile() {
  const { t } = useTranslation();
  const user        = useAuthStore(s => s.user);
  const getProfile  = useAuthStore(s => s.getProfile);
  const saveProfile = useAuthStore(s => s.saveProfile);
  const getBookingsByUser = useAdminStore(s => s.getBookingsByUser);
  const { plans, removePlan } = useSavedPlansStore();
  const { setItineraries, setItineraryMeta } = useStore();
  const navigate    = useNavigate();

  const saved = getProfile() || {};
  const [form, setForm] = useState({
    firstName:      saved.firstName   || user?.name?.split(' ')[0] || '',
    lastName:       saved.lastName    || user?.name?.split(' ').slice(1).join(' ') || '',
    phone:          saved.phone       || '',
    dob:            saved.dob         || '',
    nationality:    saved.nationality || '',
    passportNumber: saved.passportNumber || '',
    passportExpiry: saved.passportExpiry || '',
    address:        saved.address     || '',
  });
  const [saved2, setSaved2]   = useState(false);
  const [editing, setEditing] = useState(false);

  const passCountry = detectPassportCountry(form.passportNumber);
  const bookings    = getBookingsByUser(user?.id || '');

  const fill = (str, vars = {}) => String(str).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));

  const handleSave = () => {
    saveProfile(form);
    setSaved2(true);
    setEditing(false);
    setTimeout(() => setSaved2(false), 3000);
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  /* Restore a saved AI plan into the live store and reopen the planner */
  const openPlan = (plan) => {
    setItineraries(plan.itineraries || []);
    setItineraryMeta(plan.meta || null);
    navigate('/planner', { state: { restoredFormData: plan.formData } });
  };

  const handleRemovePlan = (id, dest) => {
    removePlan(id);
    toast.info(t('lists.plans.removedToast') || 'Plan removed', dest);
  };

  const fmtDate = (iso) => {
    try { return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return ''; }
  };

  return (
    <div className="bg-[#f5f5f5] min-h-screen -mt-[64px]">

      {/* ── Hero header ── */}
      <section className="relative bg-gradient-to-br from-[#001026] via-[#002250] to-[#003580] text-white overflow-hidden pt-[100px] pb-16">
        <div className="absolute inset-0 opacity-25 pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(circle at 25% 30%, #0071c2 0%, transparent 45%), radial-gradient(circle at 78% 65%, #f5b942 0%, transparent 38%)' }} />
        <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#f5b942]/15 blur-3xl pointer-events-none animate-float" />
        <div className="relative max-w-4xl mx-auto px-4 md:px-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/60 hover:text-white text-[13px] font-semibold mb-7 transition">
            <ArrowLeft className="w-4 h-4" /> {t('profilePage.back')}
          </button>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ffd76e] via-[#f5b942] to-[#d99a2b] flex items-center justify-center text-2xl font-black text-[#002250] ring-1 ring-white/30 shadow-lift">
                {user?.avatar || user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">{user?.name}</h1>
                <p className="text-white/65 text-[13px] font-medium">{user?.email}</p>
              </div>
            </div>
            {!editing ? (
              <button onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 text-white/85 text-[11px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition">
                <Edit2 className="w-4 h-4" /> {t('profilePage.editProfile')}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => setEditing(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/20 text-white/70 text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition">
                  {t('profilePage.cancel')}
                </button>
                <button onClick={handleSave}
                  className="btn-gold flex items-center gap-2 px-4 py-2.5 text-[11px] uppercase tracking-widest">
                  <Save className="w-4 h-4" /> {t('profilePage.save')}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-8 pb-20 page-fade">

        {saved2 && (
          <div className="flex items-center gap-3 bg-[#e8f5e9] border border-[#bbf7d0] rounded-2xl px-4 py-3 mb-5 shadow-soft">
            <CheckCircle className="w-4 h-4 text-[#008009]" />
            <p className="text-[#155724] text-sm font-bold">{t('profilePage.savedOk')}</p>
          </div>
        )}

        <div className="flex flex-col gap-5">

          {/* ── My AI Trip Plans ── */}
          <div className="bg-white border border-[#e7e7e7] rounded-2xl p-6 shadow-float">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-sm font-black uppercase tracking-widest text-[#9ca3af] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#f5b942]" /> {t('profilePage.myPlans') || 'My AI Trip Plans'}
                {plans.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-[#f0f5ff] text-[#0071c2] text-[11px] font-black rounded-full normal-case tracking-normal">{plans.length}</span>
                )}
              </h2>
              {plans.length > 0 && (
                <button onClick={() => navigate('/my-plans')}
                  className="text-[12px] font-black text-[#0071c2] hover:underline flex items-center gap-1">
                  {t('profilePage.viewAllPlans') || 'View all'} <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {plans.length === 0 ? (
              <div className="text-center py-8 rounded-2xl border border-dashed border-[#e0e0e0] bg-[#fafafa]">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f5b942] to-[#d99a2b] flex items-center justify-center mx-auto mb-3 rotate-3 shadow-soft">
                  <Map className="w-7 h-7 text-white" />
                </div>
                <p className="text-[15px] font-black text-[#1a1a1a] mb-1">{t('profilePage.noPlansTitle') || 'No saved plans yet'}</p>
                <p className="text-[13px] text-[#9ca3af] font-medium mb-5 max-w-sm mx-auto">
                  {t('profilePage.noPlansSub') || 'Generate a trip with our AI planner — it will be saved here automatically.'}
                </p>
                <button onClick={() => navigate('/planner')}
                  className="btn-gold px-5 py-3 text-[13px] inline-flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> {t('lists.plans.openPlanner') || 'Open AI Planner'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {plans.slice(0, 4).map((plan) => {
                  const dest   = plan.formData?.destination || t('lists.plans.tripFallback') || 'Trip';
                  const days   = plan.itineraries?.length || plan.formData?.days || 0;
                  const total  = plan.meta?.budgetBreakdown?.total;
                  const budget = Number(plan.formData?.budget) || 0;
                  const isAi   = plan.meta?.source === 'ai';
                  return (
                    <div key={plan.id} className="group bg-white border border-[#e7e7e7] rounded-2xl overflow-hidden shadow-soft hover:shadow-float lift flex flex-col">
                      <div className="relative h-28 bg-cover bg-center" style={{ backgroundImage: `url(${heroFor(dest)})` }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        <span className={`absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${isAi ? 'bg-[#f5b942] text-[#002250]' : 'bg-[#0071c2] text-white'}`}>
                          <Sparkles className="w-3 h-3" /> {isAi ? (t('lists.plans.aiPlanTag') || 'AI plan') : (t('lists.plans.planTag') || 'Plan')}
                        </span>
                        <button onClick={() => handleRemovePlan(plan.id, dest)}
                          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 flex items-center justify-center shadow hover:bg-red-50 hover:scale-110 transition"
                          aria-label={t('lists.plans.deletePlan') || 'Delete plan'}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                        <h3 className="absolute bottom-2 left-3 right-3 text-white text-[16px] font-black flex items-center gap-1.5 drop-shadow">
                          <MapPin className="w-4 h-4" /> {dest}
                        </h3>
                      </div>
                      <div className="p-3.5 flex flex-col flex-1">
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold text-[#595959] mb-3">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-[#0071c2]" /> {days} {t('profilePage.daysWord') || 'days'}</span>
                          {budget > 0 && <span className="flex items-center gap-1"><Wallet className="w-3 h-3 text-[#0071c2]" /> ${budget.toLocaleString()}</span>}
                          <span className="flex items-center gap-1 text-[#9ca3af]"><Clock className="w-3 h-3" /> {fmtDate(plan.savedAt)}</span>
                        </div>
                        <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-[#f0f0f0]">
                          {total != null ? (
                            <div className="text-[17px] font-black text-[#003580] leading-none">${Number(total).toLocaleString()}</div>
                          ) : <span className="text-[11px] text-[#9ca3af] font-bold">{t('lists.plans.openToView') || 'Open to view'}</span>}
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => downloadPlanPdf(plan)}
                              className="px-2.5 py-2 rounded-lg border-2 border-[#0071c2] text-[#0071c2] hover:bg-[#f0f5ff] text-[11px] font-black flex items-center gap-1 transition active:scale-95"
                              title={t('lists.plans.downloadPdf') || 'Download PDF'}>
                              <Download className="w-3.5 h-3.5" /> PDF
                            </button>
                            <button onClick={() => openPlan(plan)}
                              className="px-3 py-2 rounded-lg bg-[#0071c2] hover:bg-[#005fa3] text-white text-[11px] font-black flex items-center gap-1 transition active:scale-95 shadow-soft">
                              {t('lists.plans.open') || 'Open'} <ArrowRight className="w-3 h-3" />
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

          {/* ── Personal Info ── */}
          <div className="bg-white border border-[#e7e7e7] rounded-2xl p-6 shadow-soft hover:shadow-float transition">
            <h2 className="text-sm font-black uppercase tracking-widest text-[#9ca3af] mb-5 flex items-center gap-2">
              <User className="w-4 h-4 text-[#f5b942]" /> {t('profilePage.personalInfo')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { k: 'firstName', l: t('profilePage.firstName'),   type: 'text', ph: t('profilePage.phFirst'),       icon: User     },
                { k: 'lastName',  l: t('profilePage.lastName'),    type: 'text', ph: t('profilePage.phLast'),        icon: User     },
                { k: 'phone',     l: t('profilePage.phone'),       type: 'tel',  ph: t('profilePage.phPhone'),       icon: Phone    },
                { k: 'dob',       l: t('profilePage.dob'),         type: 'date', ph: '',                          icon: Calendar },
                { k: 'nationality', l: t('profilePage.nationality'), type: 'text', ph: t('profilePage.phNationality'), icon: Globe    },
                { k: 'address',   l: t('profilePage.address'),     type: 'text', ph: t('profilePage.phAddress'),     icon: Globe    },
              ].map(field => (
                <div key={field.k}>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1.5 flex items-center gap-1">
                    {field.l}
                  </label>
                  {editing ? (
                    <input type={field.type} placeholder={field.ph} value={form[field.k]}
                      onChange={e => f(field.k, e.target.value)}
                      className="w-full bg-[#f8f9fa] border-2 border-[#e7e7e7] rounded-xl px-4 py-3 text-sm text-[#1a1a1a] placeholder:text-[#b0b0b0] focus:outline-none focus:border-[#0071c2] focus:ring-4 focus:ring-[#0071c2]/15 transition"
                    />
                  ) : (
                    <p className="text-sm text-[#1a1a1a] font-semibold py-3">{form[field.k] || <span className="text-[#c0c0c0] font-medium">{t('profilePage.notSet')}</span>}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Passport / Travel Document ── */}
          <div className="bg-white border border-[#e7e7e7] rounded-2xl p-6 shadow-soft hover:shadow-float transition">
            <h2 className="text-sm font-black uppercase tracking-widest text-[#9ca3af] mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#f5b942]" /> {t('profilePage.passportSection')}
            </h2>
            <p className="text-[#9ca3af] text-xs font-medium mb-5">
              {t('profilePage.passportHint')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1.5 block">{t('profilePage.passportNumber')}</label>
                {editing ? (
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                    <input type="text" placeholder={t('profilePage.passportNumberPlaceholder')} value={form.passportNumber}
                      onChange={e => f('passportNumber', e.target.value.toUpperCase())}
                      className="w-full bg-[#f8f9fa] border-2 border-[#e7e7e7] rounded-xl pl-10 pr-4 py-3 text-sm text-[#1a1a1a] font-mono placeholder:text-[#b0b0b0] focus:outline-none focus:border-[#0071c2] focus:ring-4 focus:ring-[#0071c2]/15 transition uppercase"
                    />
                  </div>
                ) : (
                  <p className="text-sm font-mono text-[#1a1a1a] font-semibold py-3">{form.passportNumber || <span className="text-[#c0c0c0] font-sans font-medium">{t('profilePage.notSaved')}</span>}</p>
                )}
                {passCountry && form.passportNumber && (
                  <p className="text-xs text-[#008009] font-bold mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {passCountry.flag} {passCountry.country} {t('profilePage.formatVerified')}
                  </p>
                )}
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#9ca3af] mb-1.5 block">{t('profilePage.passportExpiry')}</label>
                {editing ? (
                  <input type="date" value={form.passportExpiry} onChange={e => f('passportExpiry', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-[#f8f9fa] border-2 border-[#e7e7e7] rounded-xl px-4 py-3 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#0071c2] focus:ring-4 focus:ring-[#0071c2]/15 transition"
                  />
                ) : (
                  <p className="text-sm text-[#1a1a1a] font-semibold py-3">
                    {form.passportExpiry ? new Date(form.passportExpiry).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : <span className="text-[#c0c0c0] font-medium">{t('profilePage.notSaved')}</span>}
                  </p>
                )}
              </div>
            </div>

            {!editing && !form.passportNumber && (
              <button onClick={() => setEditing(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#d0d0d0] text-[#9ca3af] text-[11px] font-bold hover:border-[#0071c2] hover:text-[#0071c2] transition">
                <CreditCard className="w-4 h-4" /> {t('profilePage.addPassport')}
              </button>
            )}
          </div>

          {/* ── Booking History ── */}
          <div className="bg-white border border-[#e7e7e7] rounded-2xl p-6 shadow-soft hover:shadow-float transition">
            <h2 className="text-sm font-black uppercase tracking-widest text-[#9ca3af] mb-5 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#f5b942]" /> {t('profilePage.recentBookings')}
            </h2>
            {bookings.length === 0 ? (
              <p className="text-[#9ca3af] text-sm text-center py-6 font-medium">{t('profilePage.noBookings')}</p>
            ) : (
              <div className="flex flex-col gap-1">
                {[...bookings].slice(0, 5).map(b => (
                  <div key={b.id} className="flex items-center justify-between py-3 border-b border-[#f0f0f0] last:border-0">
                    <div>
                      <p className="text-sm font-bold text-[#1a1a1a]">{b.itemName}</p>
                      <p className="text-xs text-[#9ca3af]">{b.date ? new Date(b.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#1a1a1a]">${b.total?.toLocaleString()}</p>
                      <span className={`text-[10px] font-black ${b.status === 'confirmed' ? 'text-[#008009]' : b.status === 'cancelled' ? 'text-red-500' : 'text-[#a45e00]'}`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
                {bookings.length > 5 && (
                  <button onClick={() => navigate('/my-bookings')} className="text-center text-[#0071c2] text-xs font-bold py-2 hover:underline transition">
                    {t('profilePage.viewAll')} {bookings.length} {t('profilePage.bookingsWord')} →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
