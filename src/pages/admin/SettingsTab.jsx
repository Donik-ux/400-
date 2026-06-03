import React, { useState } from 'react';
import { Settings, Save, RotateCcw, Globe, DollarSign, Mail, Phone, Percent, AlertTriangle } from 'lucide-react';
import useAdminStore from '../../store/useAdminStore';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'RUB', 'KGS', 'UZS'];
const LANGUAGES  = [{ value: 'en', label: 'English' }, { value: 'uz', label: "O'zbek" }];

export default function SettingsTab() {
  const settings       = useAdminStore(s => s.settings);
  const updateSettings = useAdminStore(s => s.updateSettings);
  const resetSettings  = useAdminStore(s => s.resetSettings);

  const [form, setForm]     = useState({ ...settings });
  const [saved, setSaved]   = useState(false);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    resetSettings();
    setForm({ ...settings });
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* General */}
      <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-white/50 mb-5 flex items-center gap-2">
          <Globe className="w-4 h-4" /> General Settings
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1.5 block">Site Name</label>
            <input value={form.siteName} onChange={e => f('siteName', e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/20 transition-all" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1.5 block">Currency</label>
            <select value={form.currency} onChange={e => f('currency', e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/20 transition-all">
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1.5 block">Default Language</label>
            <select value={form.language} onChange={e => f('language', e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/20 transition-all">
              {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-white/50 mb-5 flex items-center gap-2">
          <Mail className="w-4 h-4" /> Contact Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1.5 block">Contact Email</label>
            <input type="email" value={form.contactEmail} onChange={e => f('contactEmail', e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/20 transition-all" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1.5 block">Contact Phone</label>
            <input type="tel" value={form.contactPhone} onChange={e => f('contactPhone', e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/20 transition-all" />
          </div>
        </div>
      </div>

      {/* Business */}
      <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-white/50 mb-5 flex items-center gap-2">
          <Percent className="w-4 h-4" /> Business Settings
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1.5 block">Commission Rate (%)</label>
            <input type="number" min="0" max="100" value={form.commission} onChange={e => f('commission', Number(e.target.value))}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/20 transition-all" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1.5 block">Primary Color</label>
            <div className="flex gap-2">
              <input type="color" value={form.primaryColor} onChange={e => f('primaryColor', e.target.value)}
                className="w-12 h-10 rounded-xl border border-white/[0.08] bg-white/[0.04] cursor-pointer p-1" />
              <input value={form.primaryColor} onChange={e => f('primaryColor', e.target.value)}
                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/20 transition-all" />
            </div>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="mt-4 flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <div>
              <p className="text-sm font-bold text-white">Maintenance Mode</p>
              <p className="text-[10px] text-white/35 uppercase tracking-widest">Site will show maintenance page</p>
            </div>
          </div>
          <button
            onClick={() => f('maintenanceMode', !form.maintenanceMode)}
            className={`relative w-11 h-6 rounded-full transition-all duration-300 ${form.maintenanceMode ? 'bg-yellow-400' : 'bg-white/[0.1]'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 ${form.maintenanceMode ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${saved ? 'bg-green-400 text-[#0A0A0A]' : 'bg-white text-[#0A0A0A] hover:bg-white/90'}`}>
          <Save className="w-4 h-4" /> {saved ? 'Saved!' : 'Save Settings'}
        </button>
        <button onClick={handleReset}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/[0.08] text-white/50 text-[11px] font-black uppercase tracking-widest hover:bg-white/[0.04] transition-all">
          <RotateCcw className="w-4 h-4" /> Reset Defaults
        </button>
      </div>
    </div>
  );
}
