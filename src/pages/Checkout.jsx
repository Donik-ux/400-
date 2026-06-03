import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CreditCard, Lock, Check, Plane, Package, ArrowLeft, Calendar, Users,
  Shield, AlertCircle, CheckCircle, Loader2, Globe, User, Phone, Fingerprint, Hotel,
  BadgePercent, Headphones, Sparkles,
} from 'lucide-react';
import useAuthStore  from '../store/useAuthStore';
import useAdminStore from '../store/useAdminStore';
import { lookupPassport, validatePassport } from '../services/passportService';
import { useTranslation } from '../store/useLangStore';
import { toast } from '../components/Toast';
import { handleImgError } from '../utils/imageFallback';

/* ─── Helpers ─── */
const fmtDate    = d  => d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';
const fmtCard    = v  => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
const fmtExpiry  = v  => { const n = v.replace(/\D/g, '').slice(0, 4); return n.length > 2 ? n.slice(0,2) + '/' + n.slice(2) : n; };
const mkConfirm  = () => 'MAF-' + Math.random().toString(36).toUpperCase().slice(2, 8);

/* ─── Input field (light theme) ─── */
const Field = ({ label, icon: Icon, error, children, hint }) => (
  <div>
    <label className="text-[10px] font-black uppercase tracking-widest text-[#9ca3af] mb-1.5 flex items-center gap-1.5">
      {Icon && <Icon className="w-3 h-3 text-[#0071c2]" />} {label}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1 flex items-center gap-1 font-semibold"><AlertCircle className="w-3 h-3" />{error}</p>}
    {hint && !error && <p className="text-[#9ca3af] text-xs mt-1 font-semibold">{hint}</p>}
  </div>
);

const INPUT_CLS = (err) =>
  `w-full bg-white border-2 rounded-xl px-4 py-3 text-[14px] font-semibold text-[#1a1a1a] placeholder:text-[#b0b0b0] outline-none transition ${
    err ? 'border-red-400 focus:border-red-500' : 'border-[#e7e7e7] hover:border-[#cbd5e1] focus:border-[#0071c2] focus:ring-4 focus:ring-[#0071c2]/10'
  }`;

/* ─── Main Checkout ─── */
export default function Checkout() {
  const { t } = useTranslation();
  const location  = useLocation();
  const navigate  = useNavigate();
  const user      = useAuthStore(s => s.user);
  const getProfile = useAuthStore(s => s.getProfile);
  const saveProfile = useAuthStore(s => s.saveProfile);
  const addBooking  = useAdminStore(s => s.addBooking);

  const { type, item, passengers: initPax = 1 } = location.state || {};

  const [step,       setStep]       = useState(1);     // 1=details, 2=payment, 3=done
  const [passengers, setPassengers] = useState(initPax);
  const [booking,    setBooking]    = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [travelDate, setTravelDate] = useState('');
  const [savePassport, setSavePassport] = useState(false);

  /* Passport verification state */
  const [passState, setPassState] = useState('idle'); // idle | checking | found | valid | invalid
  const [passCountry, setPassCountry] = useState(null);
  const passTimer = useRef(null);

  /* Traveler form */
  const profile = getProfile();
  const [traveler, setTraveler] = useState({
    firstName: profile?.firstName || user?.name?.split(' ')[0] || '',
    lastName:  profile?.lastName  || user?.name?.split(' ').slice(1).join(' ') || '',
    passport:  profile?.passportNumber || '',
    dob:       profile?.dob    || '',
    phone:     profile?.phone  || '',
    nationality: profile?.nationality || '',
    email:     user?.email || '',
  });
  const [tErrors, setTErrors] = useState({});

  /* Payment form */
  const [card, setCard] = useState({ name: `${traveler.firstName} ${traveler.lastName}`.trim(), number: '', expiry: '', cvv: '' });
  const [cErrors, setCErrors] = useState({});
  const [showCvv, setShowCvv] = useState(false);

  /* Price calculation */
  if (!item || !type) return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-[#e7e7e7] p-8 max-w-md mx-4 text-center shadow-sm">
        <AlertCircle className="w-10 h-10 text-[#febb02] mx-auto mb-3" />
        <p className="text-[#1a1a1a] font-bold mb-1">{t('checkout.noBooking') || 'No booking selected'}</p>
        <p className="text-[#595959] text-sm font-medium mb-5">Pick a flight or tour package to start checkout.</p>
        <button onClick={() => navigate('/')} className="px-5 py-3 rounded-lg bg-[#0071c2] hover:bg-[#005fa3] text-white text-[13px] font-black transition active:scale-95">
          {t('checkout.goHome') || 'Go to homepage'}
        </button>
      </div>
    </div>
  );

  const basePrice  = Number(item.price) * passengers;
  const taxAmount  = Math.round(basePrice * 0.08);
  const totalPrice = basePrice + taxAmount;

  /* ── Passport auto-lookup ── */
  const handlePassportChange = (value) => {
    const clean = value.toUpperCase().replace(/\s/g, '');
    setTraveler(tv => ({ ...tv, passport: clean }));
    setPassState('idle');
    setPassCountry(null);

    clearTimeout(passTimer.current);
    if (clean.length < 6) return;

    const validation = validatePassport(clean);
    if (!validation.valid) {
      setPassState('invalid');
      return;
    }

    setPassState('checking');
    passTimer.current = setTimeout(async () => {
      const result = await lookupPassport(clean, profile);
      if (result.found) {
        setTraveler(tv => ({
          ...tv,
          firstName:   result.firstName   || tv.firstName,
          lastName:    result.lastName    || tv.lastName,
          dob:         result.dob         || tv.dob,
          nationality: result.nationality || tv.nationality,
        }));
        setPassCountry(result.country);
        setPassState('found');
      } else if (result.valid) {
        setPassCountry(result.country);
        setPassState('valid');
      } else {
        setPassState('invalid');
      }
    }, 500);
  };

  /* ── Validation ── */
  const validateDetails = () => {
    const e = {};
    if (!traveler.firstName.trim())  e.firstName = t('checkout.required') || 'Required';
    if (!traveler.lastName.trim())   e.lastName  = t('checkout.required') || 'Required';
    if (!traveler.passport.trim())   e.passport  = t('checkout.required') || 'Required';
    if (passState === 'invalid')     e.passport  = t('checkout.invalidPassport') || 'Invalid passport';
    if (!traveler.phone.trim())      e.phone     = t('checkout.required') || 'Required';
    if (!travelDate)                 e.travelDate = t('checkout.selectDate') || 'Pick a date';
    setTErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePayment = () => {
    const e = {};
    const num = card.number.replace(/\s/g, '');
    if (!card.name.trim())   e.name   = t('checkout.cardNameReq') || 'Cardholder name is required';
    if (num.length < 16)     e.number = t('checkout.card16') || 'Enter 16-digit card number';
    if (card.expiry.length < 5) e.expiry = t('checkout.enterMMYY') || 'MM/YY';
    if (card.cvv.length < 3)    e.cvv   = t('checkout.enter3cvv') || '3 digits';
    setCErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNextStep = () => {
    if (!validateDetails()) return;
    if (savePassport) {
      saveProfile({
        firstName: traveler.firstName,
        lastName:  traveler.lastName,
        dob:       traveler.dob,
        phone:     traveler.phone,
        nationality: traveler.nationality,
        passportNumber: traveler.passport,
      });
    }
    setCard(c => ({ ...c, name: `${traveler.firstName} ${traveler.lastName}`.trim() }));
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePayment = async () => {
    if (!validatePayment()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 2200));
    const b = addBooking({
      userId:      user.id,
      userName:    `${traveler.firstName} ${traveler.lastName}`,
      userEmail:   traveler.email || user.email,
      type,
      itemId:      item.id,
      itemName:    type === 'flight'
        ? `${item.from} → ${item.to} (${item.code || item.airlineCode})`
        : type === 'package'
          ? `${item.name} (${item.duration} days)`
          : `${item.name} (${item.city})`,
      date:        travelDate,
      passengers,
      total:       totalPrice,
      confirmCode: mkConfirm(),
      traveler:    { firstName: traveler.firstName, lastName: traveler.lastName, passport: traveler.passport, dob: traveler.dob },
    });
    setBooking(b);
    setLoading(false);
    setStep(3);
    toast.success('Booking confirmed', `Confirmation code: ${b.confirmCode || b.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (step === 3 && booking) {
    return <ConfirmationScreen booking={booking} type={type} item={item} total={totalPrice} navigate={navigate} traveler={traveler} t={t} />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">

      {/* ── Top stripe (Booking-style) ── */}
      <div className="bg-[#003580] text-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
          <button onClick={() => step === 1 ? navigate(-1) : setStep(1)}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-[12px] font-bold mb-3 transition">
            <ArrowLeft className="w-4 h-4" /> {t('checkout.back') || 'Back'}
          </button>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
            {step === 1 ? 'Almost there — tell us about the traveler' : 'Secure payment'}
          </h1>
          <p className="text-[13px] text-white/70 font-medium mt-1">
            Your booking with MAFTRAVEL is encrypted and protected.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 page-fade">

        {/* Stepper */}
        <div className="flex items-center gap-3 md:gap-4 mb-7">
          {[
            { n: 1, label: t('checkout.stepTraveler') || 'Traveler details' },
            { n: 2, label: t('checkout.stepPayment')  || 'Payment'         },
            { n: 3, label: 'Confirmation' },
          ].map((s, i, arr) => (
            <React.Fragment key={s.n}>
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-black transition shrink-0 ${
                  step > s.n ? 'bg-[#008009] text-white'
                  : step === s.n ? 'bg-[#003580] text-white ring-4 ring-[#003580]/15'
                  : 'bg-white border border-[#e7e7e7] text-[#9ca3af]'
                }`}>
                  {step > s.n ? <Check className="w-4 h-4" /> : s.n}
                </div>
                <span className={`text-[13px] font-bold hidden sm:block truncate ${
                  step === s.n ? 'text-[#1a1a1a]' : 'text-[#9ca3af]'
                }`}>{s.label}</span>
              </div>
              {i < arr.length - 1 && (
                <div className={`flex-1 h-[3px] rounded-full ${
                  step > s.n ? 'bg-[#008009]' : 'bg-[#e7e7e7]'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: Form ── */}
          <div className="lg:col-span-2">

            {/* ── STEP 1: Traveler Info ── */}
            {step === 1 && (
              <div className="bg-white border border-[#e7e7e7] rounded-2xl p-6 md:p-7 flex flex-col gap-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#f0f5ff] flex items-center justify-center text-[#0071c2] shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-black text-[#1a1a1a]">{t('checkout.travelerInfo') || 'Traveler information'}</h2>
                    <p className="text-[#595959] text-[13px] font-medium">{t('checkout.travelerSub') || 'Enter the lead traveler exactly as it appears on their passport.'}</p>
                  </div>
                </div>

                {/* Passport */}
                <Field label={t('checkout.passportNumber') || 'Passport number'} icon={Fingerprint} error={tErrors.passport}
                  hint={passState === 'valid' ? `${passCountry?.flag || ''} ${passCountry?.country || ''} ${t('profile.formatVerified') || 'format verified'}` : undefined}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={t('checkout.passportPh') || 'e.g. AN1234567'}
                      value={traveler.passport}
                      maxLength={20}
                      onChange={e => handlePassportChange(e.target.value)}
                      className={`${INPUT_CLS(tErrors.passport)} font-mono uppercase pr-32 tracking-wider`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {passState === 'checking' && (
                        <Loader2 className="w-4 h-4 text-[#9ca3af] animate-spin" />
                      )}
                      {passState === 'found' && (
                        <div className="flex items-center gap-1.5 bg-[#e8f5e9] border border-[#008009]/25 rounded-full px-2 py-0.5">
                          <CheckCircle className="w-3.5 h-3.5 text-[#008009]" />
                          <span className="text-[9px] font-black text-[#008009] uppercase tracking-wider">{t('checkout.autoFilled') || 'auto-filled'}</span>
                        </div>
                      )}
                      {passState === 'valid' && (
                        <div className="flex items-center gap-1 bg-[#f0f5ff] border border-[#0071c2]/25 rounded-full px-2 py-0.5">
                          <Shield className="w-3 h-3 text-[#0071c2]" />
                          <span className="text-[9px] font-black text-[#0071c2] uppercase tracking-wider">{t('checkout.verified') || 'verified'}</span>
                        </div>
                      )}
                      {passState === 'invalid' && traveler.passport.length >= 6 && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>

                  {passState === 'found' && (
                    <div className="mt-2 p-3 bg-[#e8f5e9] border border-[#008009]/25 rounded-xl flex items-center gap-2.5">
                      <CheckCircle className="w-4 h-4 text-[#008009] shrink-0" />
                      <p className="text-[#155724] text-[12px] font-semibold">
                        {t('checkout.passportRecognized') || 'We recognized this passport and auto-filled your details.'}
                      </p>
                    </div>
                  )}

                  {passState === 'idle' && !traveler.passport && (
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {['🇰🇬 ID/AN…', '🇰🇿 N12…', '🇺🇿 AA…', '🇺🇸 A1234…'].map(f => (
                        <span key={f} className="text-[10px] text-[#9ca3af] font-bold bg-[#f8f9fa] border border-[#eef2f6] rounded-lg px-2 py-1 text-center">{f}</span>
                      ))}
                    </div>
                  )}
                </Field>

                {/* Names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label={t('checkout.firstName') || 'First name'} icon={User} error={tErrors.firstName}>
                    <input type="text" placeholder={t('profile.phFirst') || 'John'} value={traveler.firstName}
                      onChange={e => setTraveler(tv => ({ ...tv, firstName: e.target.value }))}
                      className={INPUT_CLS(tErrors.firstName)}
                    />
                  </Field>
                  <Field label={t('checkout.lastName') || 'Last name'} icon={User} error={tErrors.lastName}>
                    <input type="text" placeholder={t('profile.phLast') || 'Smith'} value={traveler.lastName}
                      onChange={e => setTraveler(tv => ({ ...tv, lastName: e.target.value }))}
                      className={INPUT_CLS(tErrors.lastName)}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label={t('checkout.dob') || 'Date of birth'} icon={Calendar} error={tErrors.dob}>
                    <input type="date" value={traveler.dob}
                      onChange={e => setTraveler(tv => ({ ...tv, dob: e.target.value }))}
                      className={INPUT_CLS(tErrors.dob)}
                    />
                  </Field>
                  <Field label={t('checkout.nationality') || 'Nationality'} icon={Globe} error={tErrors.nationality}>
                    <input type="text" placeholder={t('profile.phNationality') || 'Kyrgyz'} value={traveler.nationality}
                      onChange={e => setTraveler(tv => ({ ...tv, nationality: e.target.value }))}
                      className={INPUT_CLS(tErrors.nationality)}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label={t('checkout.phone') || 'Phone'} icon={Phone} error={tErrors.phone}>
                    <input type="tel" placeholder={t('profile.phPhone') || '+996 700 000 000'} value={traveler.phone}
                      onChange={e => setTraveler(tv => ({ ...tv, phone: e.target.value }))}
                      className={INPUT_CLS(tErrors.phone)}
                    />
                  </Field>
                  <Field label={t('checkout.travelDate') || 'Travel date'} icon={Calendar} error={tErrors.travelDate}>
                    <input type="date" value={travelDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setTravelDate(e.target.value)}
                      className={INPUT_CLS(tErrors.travelDate)}
                    />
                  </Field>
                </div>

                {/* Passengers stepper */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#9ca3af] mb-2 flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-[#0071c2]" /> {t('checkout.passengers') || 'Travelers'}
                  </label>
                  <div className="flex items-center gap-3 bg-[#f8f9fa] border border-[#e7e7e7] rounded-xl px-4 py-2.5 w-fit">
                    <button onClick={() => setPassengers(p => Math.max(1, p - 1))}
                      className="w-9 h-9 rounded-lg bg-white border-2 border-[#0071c2] text-[#0071c2] text-lg font-black transition active:scale-95 hover:bg-[#f0f5ff] disabled:opacity-40"
                      disabled={passengers <= 1}>−</button>
                    <span className="text-[18px] font-black text-[#1a1a1a] w-8 text-center">{passengers}</span>
                    <button onClick={() => setPassengers(p => Math.min(9, p + 1))}
                      className="w-9 h-9 rounded-lg bg-white border-2 border-[#0071c2] text-[#0071c2] text-lg font-black transition active:scale-95 hover:bg-[#f0f5ff] disabled:opacity-40"
                      disabled={passengers >= 9}>+</button>
                    <span className="text-[#9ca3af] text-[12px] font-semibold ml-1">{t('checkout.maxPax') || 'Max 9'}</span>
                  </div>
                </div>

                {/* Save passport toggle */}
                {!profile?.passportNumber && traveler.passport && passState !== 'invalid' && (
                  <label className="flex items-center gap-3 cursor-pointer group bg-[#f8f9fa] border border-[#e7e7e7] rounded-xl px-4 py-3"
                    onClick={() => setSavePassport(v => !v)}>
                    <div className={`w-10 h-6 rounded-full transition-all relative shrink-0 ${savePassport ? 'bg-[#0071c2]' : 'bg-[#cbd5e1]'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${savePassport ? 'left-5' : 'left-1'}`} />
                    </div>
                    <span className="text-[13px] font-bold text-[#1a1a1a] group-hover:text-[#003580] transition">
                      {t('checkout.savePassport') || 'Save passport for next time'}
                    </span>
                  </label>
                )}

                <button onClick={handleNextStep}
                  className="w-full py-4 rounded-xl bg-[#0071c2] hover:bg-[#005fa3] text-white text-[14px] font-black tracking-wide transition active:scale-[0.98] mt-2 flex items-center justify-center gap-2">
                  {t('checkout.continueToPayment') || 'Continue to payment'}
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>
            )}

            {/* ── STEP 2: Payment ── */}
            {step === 2 && (
              <div className="bg-white border border-[#e7e7e7] rounded-2xl p-6 md:p-7 flex flex-col gap-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#e8f5e9] flex items-center justify-center">
                    <Lock className="w-5 h-5 text-[#008009]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-[18px] font-black text-[#1a1a1a]">{t('checkout.securePayment') || 'Secure payment'}</h2>
                    <p className="text-[#595959] text-[12px] font-medium">{t('checkout.sslEncrypted') || '256-bit SSL · PCI-DSS compliant'}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {['VISA', 'MC', 'AMEX'].map(c => (
                      <span key={c} className="px-2 py-1 rounded-md bg-[#f0f5ff] text-[#0071c2] text-[10px] font-black border border-[#dceaff]">{c}</span>
                    ))}
                  </div>
                </div>

                <Field label={t('checkout.cardholder') || 'Cardholder name'} icon={User} error={cErrors.name}>
                  <input type="text" placeholder="John Smith" value={card.name}
                    onChange={e => setCard(c => ({ ...c, name: e.target.value }))}
                    className={INPUT_CLS(cErrors.name)}
                  />
                </Field>

                <Field label={t('checkout.cardNumber') || 'Card number'} icon={CreditCard} error={cErrors.number}>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9ca3af]" />
                    <input type="text" placeholder="4242 4242 4242 4242" maxLength={19}
                      value={card.number} onChange={e => setCard(c => ({ ...c, number: fmtCard(e.target.value) }))}
                      className={`${INPUT_CLS(cErrors.number)} pl-11 font-mono tracking-widest`}
                    />
                    {card.number.startsWith('4') && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-[#0071c2]">VISA</span>}
                    {card.number.startsWith('5') && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-orange-500">MC</span>}
                    {card.number.startsWith('3') && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-[#008009]">AMEX</span>}
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label={t('checkout.expiry') || 'Expiry'} error={cErrors.expiry}>
                    <input type="text" placeholder="MM/YY" maxLength={5}
                      value={card.expiry} onChange={e => setCard(c => ({ ...c, expiry: fmtExpiry(e.target.value) }))}
                      className={`${INPUT_CLS(cErrors.expiry)} font-mono`}
                    />
                  </Field>
                  <Field label={t('checkout.cvv') || 'CVV'} error={cErrors.cvv}>
                    <div className="relative">
                      <input type={showCvv ? 'text' : 'password'} placeholder="•••" maxLength={4}
                        value={card.cvv} onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0,4) }))}
                        className={`${INPUT_CLS(cErrors.cvv)} font-mono pr-12`}
                      />
                      <button type="button" onClick={() => setShowCvv(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0071c2] hover:text-[#003580] transition text-[11px] font-black uppercase tracking-wider">
                        {showCvv ? (t('checkout.hide') || 'Hide') : (t('checkout.show') || 'Show')}
                      </button>
                    </div>
                  </Field>
                </div>

                {/* Traveler summary */}
                <div className="bg-[#f8f9fa] border border-[#e7e7e7] rounded-xl p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#9ca3af] mb-3">{t('checkout.bookingFor') || 'Booking for'}</p>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[13px]">
                    <div><p className="text-[#9ca3af] text-[11px] font-bold uppercase tracking-wider">{t('checkout.name') || 'Name'}</p><p className="font-black text-[#1a1a1a]">{traveler.firstName} {traveler.lastName}</p></div>
                    <div><p className="text-[#9ca3af] text-[11px] font-bold uppercase tracking-wider">{t('checkout.passport') || 'Passport'}</p><p className="font-mono font-bold text-[#1a1a1a]">{traveler.passport}</p></div>
                    <div><p className="text-[#9ca3af] text-[11px] font-bold uppercase tracking-wider">{t('checkout.travelDate') || 'Date'}</p><p className="font-bold text-[#1a1a1a]">{fmtDate(travelDate)}</p></div>
                    <div><p className="text-[#9ca3af] text-[11px] font-bold uppercase tracking-wider">{t('checkout.passengers') || 'Travelers'}</p><p className="font-bold text-[#1a1a1a]">{passengers}</p></div>
                  </div>
                </div>

                <button onClick={handlePayment} disabled={loading}
                  className="w-full py-4 rounded-xl bg-[#febb02] hover:bg-[#ffb700] text-[#1a1a1a] text-[14px] font-black tracking-wide transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-sm">
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />{t('checkout.processing') || 'Processing your payment…'}</>
                  ) : (
                    <><Lock className="w-4 h-4" />{(t('checkout.pay') || 'Pay')} ${totalPrice.toLocaleString()}</>
                  )}
                </button>

                <p className="text-center text-[#9ca3af] text-[12px] font-semibold flex items-center justify-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#008009]" />
                  {t('checkout.neverStored') || 'We never store your card details.'}
                </p>
              </div>
            )}
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-[#e7e7e7] rounded-2xl overflow-hidden sticky top-[80px] shadow-sm">

              {/* Item preview with image */}
              {item.image && (
                <div className="relative h-32 w-full overflow-hidden">
                  <img src={item.image} alt={item.name} loading="lazy" onError={handleImgError}
                    className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                  <div className="absolute bottom-2 left-3 right-3 text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/85">{type === 'flight' ? 'Flight' : type === 'package' ? 'Tour Package' : 'Hotel Stay'}</p>
                    <p className="text-[14px] font-black truncate">{type === 'flight' ? `${item.from} → ${item.to}` : item.name}</p>
                  </div>
                </div>
              )}

              <div className="p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#9ca3af] mb-3">{t('checkout.orderSummary') || 'Order summary'}</p>

                <div className="flex items-start gap-3 mb-4 pb-4 border-b border-[#f0f0f0]">
                  <div className="w-10 h-10 rounded-xl bg-[#f0f5ff] flex items-center justify-center shrink-0">
                    {type === 'flight' ? <Plane className="w-5 h-5 text-[#0071c2]" /> :
                     type === 'package' ? <Package className="w-5 h-5 text-[#0071c2]" /> :
                     <Hotel className="w-5 h-5 text-[#0071c2]" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[14px] font-black text-[#1a1a1a] leading-tight">
                      {type === 'flight' ? `${item.from} → ${item.to}` : item.name}
                    </p>
                    <p className="text-[12px] text-[#595959] font-medium mt-0.5 truncate">
                      {type === 'flight'
                        ? `${item.airline || ''} · ${item.cabin || 'Economy'}`
                        : type === 'package'
                          ? `${item.duration} days · ${item.destination}`
                          : `${item.stars}★ · ${item.city}`}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-[13px]">
                  <div className="flex justify-between">
                    <span className="text-[#595959] font-medium">${item.price} × {passengers} {t('checkout.pax') || 'pax'}</span>
                    <span className="text-[#1a1a1a] font-bold">${basePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#595959] font-medium">{t('checkout.serviceTax') || 'Taxes & service fee (8%)'}</span>
                    <span className="text-[#1a1a1a] font-bold">${taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-[#f0f0f0]">
                    <span className="text-[#1a1a1a] font-black">{t('checkout.total') || 'Total'}</span>
                    <span className="text-[22px] text-[#003580] font-black leading-none">${totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                {travelDate && (
                  <div className="mt-4 pt-4 border-t border-[#f0f0f0] flex items-center gap-2 text-[12px] text-[#595959] font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-[#0071c2] shrink-0" />
                    <span>{fmtDate(travelDate)}</span>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-[#f0f0f0] flex flex-col gap-2">
                  {[
                    { icon: BadgePercent, txt: t('checkout.freeCancel')   || 'Free cancellation until 48 h before' },
                    { icon: Sparkles,     txt: t('checkout.instantConfirm') || 'Instant confirmation by email'      },
                    { icon: Headphones,   txt: t('checkout.support24')    || '24 / 7 customer support'             },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <p.icon className="w-3.5 h-3.5 text-[#008009] shrink-0" />
                      <span className="text-[12px] text-[#1a1a1a] font-semibold">{p.txt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#f8f9fa] border-t border-[#e7e7e7] px-5 py-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#008009]" />
                <span className="text-[11px] font-bold text-[#595959]">SSL-encrypted · GDPR-safe · MAFTRAVEL Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Confirmation Screen (light theme) ─── */
function ConfirmationScreen({ booking, total, navigate, traveler, t }) {
  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full page-fade">
        <div className="bg-white border border-[#e7e7e7] rounded-3xl p-8 md:p-10 shadow-sm text-center">
          <div className="relative mx-auto mb-5 w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-[#008009]/10 animate-ping opacity-50" />
            <div className="relative w-20 h-20 rounded-full bg-[#e8f5e9] border-2 border-[#008009]/30 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-[#008009]" />
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-[#1a1a1a] mb-2">{t('checkout.confirmed') || 'Booking confirmed!'}</h1>
          <p className="text-[#595959] text-[14px] font-medium mb-7">
            {t('checkout.confirmedSub') || 'A confirmation email has been sent to'} <span className="font-black text-[#1a1a1a]">{booking.userEmail}</span>.
          </p>

          <div className="bg-[#f8f9fa] border border-[#e7e7e7] rounded-2xl p-5 text-left mb-6">
            <div className="text-center mb-4 pb-4 border-b border-[#e7e7e7]">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#9ca3af] mb-1">{t('checkout.confirmNumber') || 'Confirmation number'}</p>
              <p className="text-2xl font-black text-[#003580] font-mono tracking-wider">{booking.confirmCode || booking.id}</p>
            </div>
            <div className="flex flex-col gap-2.5 text-[13px]">
              <Row label={t('checkout.traveler') || 'Traveler'} value={`${traveler.firstName} ${traveler.lastName}`} />
              <Row label={t('checkout.booking')  || 'Booking'}  value={booking.itemName} />
              <Row label={t('checkout.type')     || 'Type'}     value={<span className="capitalize">{booking.type}</span>} />
              <Row label={t('checkout.passengers') || 'Travelers'} value={booking.passengers} />
              <Row label={t('checkout.travelDate') || 'Travel date'} value={booking.date ? fmtDate(booking.date) : '—'} />
              <Row label={t('checkout.passport') || 'Passport'} value={<span className="font-mono">{traveler.passport}</span>} />
              <div className="pt-3 mt-1 border-t border-[#e7e7e7] flex justify-between font-black items-center">
                <span className="text-[#1a1a1a]">{t('checkout.totalPaid') || 'Total paid'}</span>
                <span className="text-[22px] text-[#003580]">${(booking.total || total).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => navigate('/my-bookings')}
              className="flex-1 py-3.5 rounded-xl bg-[#0071c2] hover:bg-[#005fa3] text-white text-[13px] font-black tracking-wide transition active:scale-95">
              {t('checkout.myBookings') || 'View my bookings'}
            </button>
            <button onClick={() => navigate('/')}
              className="flex-1 py-3.5 rounded-xl border-2 border-[#e7e7e7] hover:border-[#0071c2] hover:bg-[#f0f5ff] text-[#1a1a1a] text-[13px] font-black tracking-wide transition">
              {t('checkout.home') || 'Back to homepage'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const Row = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4">
    <span className="text-[#9ca3af] font-bold shrink-0 text-[12px] uppercase tracking-wider">{label}</span>
    <span className="text-[#1a1a1a] font-bold text-right">{value}</span>
  </div>
);
