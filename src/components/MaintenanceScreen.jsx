import React from 'react';
import { Wrench, Mail } from 'lucide-react';
import { useTranslation } from '../store/useLangStore';
import useAdminStore from '../store/useAdminStore';
import { SUPPORT_EMAIL } from '../config/contact';

/**
 * Shown site-wide while the admin Settings tab has Maintenance Mode on.
 * Admins and the /admin + /login routes are exempt (see Layout) so the switch
 * can always be turned back off.
 */
export default function MaintenanceScreen() {
  const { t } = useTranslation();
  const settings = useAdminStore(s => s.settings);
  const siteName = (settings?.siteName || '').trim() || 'MAFTRAVEL';
  const email = (settings?.contactEmail || '').trim() || SUPPORT_EMAIL;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1c2127] via-[#00306f] to-[#252a31] text-white px-6">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <Wrench className="w-8 h-8 text-[#61d1bf]" />
        </div>
        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#61d1bf] mb-3">{siteName}</p>
        <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight mb-3">
          {t('ui.maintenance.title')}
        </h1>
        <p className="text-[15px] text-white/65 font-medium leading-relaxed mb-8">
          {t('ui.maintenance.body')}
        </p>
        <a href={`mailto:${email}`}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-[13px] font-black transition active:scale-95">
          <Mail className="w-4 h-4" /> {email}
        </a>
      </div>
    </div>
  );
}
