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

  // Ask permission banner after 5 seconds
  useEffect(() => {
    if (permission === 'default') {
      const t = setTimeout(() => setShowBanner(true), 5000);
      return () => clearTimeout(t);
    }
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
        new Notification(deal.title, { body: deal.body, icon: '/vite.svg' });
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

  return (
    <>
      {/* Permission Banner */}
      {showBanner && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm mx-4 animate-slide-up">
          <div className="bg-[#003580] text-white rounded-2xl p-4 shadow-2xl flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <BellRing className="w-4 h-4 text-yellow-300" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold mb-0.5">{t('ui.notify.title')}</p>
              <p className="text-white/60 text-xs">{t('ui.notify.body')}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={requestPermission}
                  className="px-4 py-1.5 rounded-lg bg-white text-[#003580] text-xs font-black uppercase tracking-widest hover:bg-white/90 transition-all">
                  {t('ui.notify.allow')}
                </button>
                <button onClick={deny}
                  className="px-4 py-1.5 rounded-lg border border-white/20 text-white/60 text-xs font-bold hover:bg-white/10 transition-all">
                  {t('ui.notify.notNow')}
                </button>
              </div>
            </div>
            <button onClick={() => setShowBanner(false)} className="text-white/30 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Deal Toast */}
      {toast && (
        <div className="fixed top-6 right-4 z-[200] w-80 animate-slide-in-right">
          <div className="bg-white border border-[#e7e7e7] rounded-2xl p-4 shadow-2xl flex items-start gap-3">
            <div className="text-2xl shrink-0">{toast.icon}</div>
            <div className="flex-1">
              <p className="text-sm font-black text-[#1a1a1a] mb-0.5">{toast.title}</p>
              <p className="text-xs text-[#595959]">{toast.body}</p>
              <span className="inline-block mt-2 text-[9px] font-black px-2 py-0.5 rounded-full bg-[#0071c2]/10 text-[#0071c2] uppercase tracking-widest">
                {toast.tag}
              </span>
            </div>
            <button onClick={() => setToast(null)} className="text-[#c9d1d9] hover:text-[#595959] mt-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
