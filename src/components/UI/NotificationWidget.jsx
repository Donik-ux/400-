import React, { useState, useEffect } from 'react';
import { BellRing, BellOff, X, Gift, Plane, Package, Sparkles } from 'lucide-react';
import { useTranslation } from '../../store/useLangStore';

const DEALS = [
  { id: 1, icon: '✈️', title: 'Flash Sale: Dubai Flights', body: 'From $199! Only 48 hours left. Book now →', tag: 'flight' },
  { id: 2, icon: '🏖️', title: 'New Package: Maldives', body: 'Overwater villa from $3,299/person. Limited spots!', tag: 'package' },
  { id: 3, icon: '🏨', title: 'Hotel Deal: Burj Al Arab', body: '20% off when you book 30 days in advance.', tag: 'hotel' },
  { id: 4, icon: '🌍', title: 'Weekend Getaway to Istanbul', body: '4 days from $849 all-inclusive. Ends Sunday!', tag: 'package' },
  { id: 5, icon: '💥', title: 'Cyber Monday Travel Deals', body: 'Up to 40% off select packages. Use code CYBER40', tag: 'promo' },
];

const PERM_KEY = 'maf_notif_permission';
const SHOWN_KEY = 'maf_notif_shown';
const SNOOZE_KEY = 'maf_notif_snooze';
const SNOOZE_MS = 24 * 60 * 60 * 1000; // a dismissed prompt stays away for a day

const isSnoozed = () => {
  const ts = Number(localStorage.getItem(SNOOZE_KEY) || 0);
  return ts && Date.now() - ts < SNOOZE_MS;
};

function getShown() { try { return JSON.parse(localStorage.getItem(SHOWN_KEY)) || []; } catch { return []; } }
function markShown(id) {
  const shown = getShown();
  if (!shown.includes(id)) localStorage.setItem(SHOWN_KEY, JSON.stringify([...shown, id]));
}

export default function NotificationWidget() {
  const { t } = useTranslation();
  const [permission, setPermission] = useState(localStorage.getItem(PERM_KEY) || 'default');
  const [toast, setToast] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  // Ask permission banner — delayed, snoozable, and self-collapsing so it
  // never squats over a third of a phone screen.
  useEffect(() => {
    if (permission !== 'default' || isSnoozed()) return undefined;
    const show = setTimeout(() => setShowBanner(true), 12000);
    const hide = setTimeout(() => {
      setShowBanner(false);
      localStorage.setItem(SNOOZE_KEY, String(Date.now()));
    }, 26000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [permission]);

  // Show a random deal notification if permission granted
  useEffect(() => {
    if (permission !== 'granted') return;
    const shown = getShown();
    const unseen = DEALS.filter(d => !shown.includes(d.id));
    if (unseen.length === 0) return;
    const deal = unseen[Math.floor(Math.random() * unseen.length)];
    const t = setTimeout(() => {
      setToast(deal);
      markShown(deal.id);
      // Also fire browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        // Android Chrome throws "Illegal constructor" here — page-context
        // Notification construction requires a ServiceWorkerRegistration there.
        // The in-app toast above already covers the alert, so just swallow it.
        try { new Notification(deal.title, { body: deal.body, icon: '/vite.svg' }); } catch { /* unsupported on this platform */ }
      }
    }, 3000);
    return () => clearTimeout(t);
  }, [permission]);

  const requestPermission = async () => {
    setShowBanner(false);
    if (!('Notification' in window)) {
      setPermission('granted'); // fallback: in-app only
      localStorage.setItem(PERM_KEY, 'granted');
      return;
    }
    const result = await Notification.requestPermission();
    const perm = result === 'granted' ? 'granted' : 'denied';
    setPermission(perm);
    localStorage.setItem(PERM_KEY, perm);
  };

  const deny = () => {
    setShowBanner(false);
    setPermission('denied');
    localStorage.setItem(PERM_KEY, 'denied');
  };

  const snooze = () => {
    setShowBanner(false);
    localStorage.setItem(SNOOZE_KEY, String(Date.now()));
  };

  return (
    <>
      {/* Permission Banner */}
      {showBanner && (
        <div className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-24px)] max-w-sm animate-slide-up">
          <div className="bg-[#003580] text-white rounded-2xl px-3.5 py-3 sm:p-4 shadow-2xl flex items-center sm:items-start gap-3 border border-[#f5b942]/25">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <BellRing className="w-4 h-4 text-[#ffd76e]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] sm:text-sm font-bold leading-snug">{t('ui.notify.title')}</p>
              <p className="hidden sm:block text-white/60 text-xs">{t('ui.notify.body')}</p>
              <div className="flex gap-2 mt-2 sm:mt-3">
                <button onClick={requestPermission}
                  className="px-3.5 py-1.5 rounded-lg bg-white text-[#003580] text-[11px] sm:text-xs font-black uppercase tracking-widest hover:bg-white/90 transition-all">
                  {t('ui.notify.allow')}
                </button>
                <button onClick={deny}
                  className="px-3.5 py-1.5 rounded-lg border border-white/20 text-white/60 text-[11px] sm:text-xs font-bold hover:bg-white/10 transition-all">
                  {t('ui.notify.notNow')}
                </button>
              </div>
            </div>
            <button onClick={snooze} className="self-start text-white/30 hover:text-white" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Deal Toast */}
      {toast && (
        <div className="fixed top-6 right-4 left-4 sm:left-auto z-[200] w-auto sm:w-80 animate-slide-in-right">
          <div className="bg-white border border-[#e6dcc3] rounded-2xl p-4 shadow-2xl flex items-start gap-3">
            <div className="text-2xl shrink-0">{toast.icon}</div>
            <div className="flex-1">
              <p className="text-sm font-black text-[#1a1a1a] mb-0.5">{toast.title}</p>
              <p className="text-xs text-[#5c5245]">{toast.body}</p>
              <span className="inline-block mt-2 text-[9px] font-black px-2 py-0.5 rounded-full bg-[#0071c2]/10 text-[#0071c2] uppercase tracking-widest">
                {toast.tag}
              </span>
            </div>
            <button onClick={() => setToast(null)} className="text-[#d9c9a3] hover:text-[#5c5245] mt-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
