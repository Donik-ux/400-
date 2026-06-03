import { useState, useMemo } from 'react';
import {
  LayoutDashboard, Package, Trash2, Edit2,
  CircleCheck, Clock, Search, Plus, Plane,
  BarChart3, X, Save, CircleAlert, ArrowUpRight, ArrowDownRight,
  Bell, Settings, TrendingUp, LogOut, BookOpen, DollarSign, CircleX
} from 'lucide-react';
import { useTranslation } from '../../store/useLangStore';
import useAdminStore from '../../store/useAdminStore';
import useAuthStore  from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import AnalyticsTab    from './AnalyticsTab';
import NotificationsTab from './NotificationsTab';
import SettingsTab     from './SettingsTab';

const getTabs = (t, unreadCount) => [
  { id: 'dashboard',     label: t('admin.dashboard'), icon: LayoutDashboard },
  { id: 'packages',      label: t('admin.packages'),  icon: Package },
  { id: 'analytics',    label: 'Analytics',          icon: BarChart3 },
  { id: 'notifications', label: 'Notifications',      icon: Bell, badge: unreadCount },
  { id: 'settings',      label: 'Settings',           icon: Settings },
];

const STATUS_STYLES = {
  confirmed: 'text-green-400 bg-green-400/10 border-green-400/20',
  pending:   'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
};

/* ─── Shared components ─── */
const Badge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
    {status === 'confirmed' ? <CircleCheck className="w-3 h-3 mr-1" /> : status === 'cancelled' ? <CircleX className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
    {status}
  </span>
);

const StatCard = ({ icon: Icon, label, value, sub, color = 'text-white', trend = null }) => (
  <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-premium group">
    <div className="flex items-start justify-between mb-4">
      <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center group-hover:bg-white/[0.08] transition-premium"><Icon className={`w-5 h-5 ${color}`} /></div>
      {trend && (
        <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${trend > 0 ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
          {trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <p className={`text-2xl font-black ${color} mb-1`}>{value}</p>
    <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">{label}</p>
    {sub && <p className="text-[10px] text-white/20 mt-1 uppercase tracking-tighter">{sub}</p>}
  </div>
);

/* ─── Main Admin Panel ─── */
export default function AdminDashboard() {
  const [tab, setTab]    = useState('dashboard');
  const { t }            = useTranslation();
  const logout           = useAuthStore(s => s.logout);
  const navigate         = useNavigate();
  const notifications    = useAdminStore(s => s.notifications);
  const unreadCount      = notifications.filter(n => !n.read).length;

  const TABS = getTabs(t, unreadCount);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-[#0D0D0D] border-r border-white/[0.06] flex flex-col fixed left-0 top-0 bottom-0 z-30 hidden md:flex">
        <div className="px-6 py-5 border-b border-white/[0.06]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0071c2] mb-0.5">MAFTRAVEL</p>
          <p className="text-sm font-black text-white">{t('admin.title')}</p>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {TABS.map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-[12px] font-bold uppercase tracking-[0.1em] transition-premium ${tab === tb.id ? 'bg-white text-[#0A0A0A]' : 'text-white/40 hover:text-white hover:bg-white/[0.04]'}`}>
              <tb.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{tb.label}</span>
              {tb.badge > 0 && (
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${tab === tb.id ? 'bg-black/20 text-black' : 'bg-blue-400/20 text-blue-400'}`}>{tb.badge}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-white/[0.06]">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-[0.1em] text-red-400/80 hover:text-red-400 hover:bg-red-400/[0.06] transition-premium">
            <LogOut className="w-4 h-4" /> {t('admin.signOut')}
          </button>
        </div>
      </aside>

      {/* Mobile tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0D0D0D] border-t border-white/[0.06] flex">
        {TABS.map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)}
            className={`flex-1 py-3 flex flex-col items-center gap-1 text-[9px] font-black uppercase tracking-widest transition-premium ${tab === tb.id ? 'text-white' : 'text-white/30'}`}>
            <div className="relative">
              <tb.icon className="w-5 h-5" />
              {tb.badge > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-400 text-[7px] font-black flex items-center justify-center text-white">{tb.badge}</span>}
            </div>
            {tb.label.slice(0,4)}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 md:ml-64 px-4 md:px-8 py-6 pb-24 md:pb-6 min-h-screen page-fade">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black text-white">{TABS.find(tb => tb.id === tab)?.label}</h1>
            <p className="text-white/35 text-sm">MAFTRAVEL — Admin</p>
          </div>
        </div>

        {tab === 'dashboard'     && <DashboardTab />}
        {tab === 'packages'      && <PackagesTab />}
        {tab === 'analytics'     && <AnalyticsTab />}
        {tab === 'notifications' && <NotificationsTab />}
        {tab === 'settings'      && <SettingsTab />}
      </main>
    </div>
  );
}

/* ─────────────────── DASHBOARD ─────────────────── */
function DashboardTab() {
  const { t } = useTranslation();
  const { bookings, packages, getStats } = useAdminStore();
  const getAllUsers = useAuthStore(s => s.getAllUsers);
  const [activityRange, setActivityRange] = useState('week');
  const stats = getStats();

  const users = getAllUsers().filter(u => u.role === 'user');
  const recent = [...bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const usageChart = useMemo(() => buildUsageChartData(activityRange, users, bookings), [activityRange, users, bookings]);
  const maxValue = Math.max(...usageChart.counts, 1);
  const totalActive = usageChart.counts.reduce((sum, value) => sum + value, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard icon={BookOpen}    label={t('admin.stats.total')}     value={stats.totalBookings}       color="text-blue-400"   trend={12} />
        <StatCard icon={CircleCheck} label={t('admin.stats.confirmed')}     value={stats.confirmedBookings}   color="text-green-400"  trend={5} />
        <StatCard icon={Clock}       label={t('admin.stats.pending')}       value={stats.pendingBookings}     color="text-yellow-400" trend={-2} />
        <StatCard icon={DollarSign}  label={t('admin.stats.revenue')}       value={`$${stats.totalRevenue.toLocaleString()}`} color="text-white" trend={8} />
        <StatCard icon={Package}     label={t('admin.stats.packages')}      value={stats.totalPackages}       color="text-purple-400" />
        <StatCard icon={Plane}       label={t('admin.stats.flights')}       value={stats.totalFlights}        color="text-cyan-400"   />
      </div>

      <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-5">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white/50">{t('admin.activity.title')}</h3>
            <p className="mt-1 text-xs text-white/40">{t('admin.activity.sub')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['week', 'month'].map(rangeOption => (
              <button key={rangeOption} type="button" onClick={() => setActivityRange(rangeOption)}
                className={`px-3 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition ${activityRange === rangeOption ? 'bg-white text-[#0A0A0A]' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                {t(`admin.activity.range.${rangeOption}`)}
              </button>
            ))}
            <button type="button" onClick={() => window.print()} className="px-3 py-2 rounded-full border border-white/[0.12] text-[10px] font-black uppercase tracking-[0.2em] text-white/70 hover:bg-white/[0.06]">
              {t('admin.activity.print')}
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="flex items-center justify-between gap-4 text-sm">
            <div className="text-white/60">{t('admin.activity.totalActive')}</div>
            <div className="text-white font-black">{totalActive}</div>
          </div>

          <div className="space-y-4">
            {usageChart.labels.map((label, index) => (
              <div key={label} className="space-y-2">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-white/50">
                  <span>{label}</span>
                  <span>{usageChart.counts[index]}</span>
                </div>
                <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                  <div style={{ width: `${(usageChart.counts[index] / maxValue) * 100}%` }}
                    className="h-full rounded-full bg-cyan-400 transition-all duration-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-5">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/50 mb-5">Popular Packages</h3>
            <div className="space-y-4">
                {packages.slice(0, 3).map(p => (
                    <div key={p.id} className="flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/[0.04] overflow-hidden border border-white/[0.06]">
                                <img src={p.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all" alt="" />
                            </div>
                            <div>
                                <p className="text-[13px] font-bold text-white mb-0.5">{p.name}</p>
                                <p className="text-[10px] text-white/30 uppercase tracking-widest">{p.destination}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[13px] font-black text-white">${p.price}</p>
                            <p className="text-[10px] text-green-400 font-bold uppercase tracking-tighter">Active</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-5">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/50 mb-5">System Health</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Server Status</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[14px] font-black text-white">Online</span>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">API Sync</p>
                    <div className="flex items-center gap-2">
                        <CircleCheck className="w-4 h-4 text-cyan-400" />
                        <span className="text-[14px] font-black text-white">Synced</span>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Database</p>
                    <div className="flex items-center gap-2">
                        <Save className="w-4 h-4 text-purple-400" />
                        <span className="text-[14px] font-black text-white">Optimized</span>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Security</p>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span className="text-[14px] font-black text-white">Shielded</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-5">
        <h3 className="text-sm font-black uppercase tracking-widest text-white/50 mb-5">{t('admin.recent.title')}</h3>
        <div className="flex flex-col gap-3">
          {recent.length === 0 ? (
            <p className="text-white/25 text-sm text-center py-6">{t('admin.recent.none')}</p>
          ) : recent.map(b => (
            <div key={b.id} className="flex items-center justify-between gap-4 py-3 border-b border-white/[0.04] last:border-0 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center">
                  {b.type === 'flight' ? <Plane className="w-4 h-4 text-white/40" /> : <Package className="w-4 h-4 text-white/40" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{b.userName}</p>
                  <p className="text-xs text-white/35">{b.itemName}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge status={b.status} />
                <span className="text-sm font-black text-white">${b.total?.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function buildUsageChartData(range, users, bookings) {
  const now = new Date();

  if (range === 'month') {
    const weekBlocks = Array.from({ length: 4 }, (_, index) => {
      const blockStart = new Date(now);
      blockStart.setDate(now.getDate() - 27 + index * 7);
      const blockEnd = new Date(blockStart);
      blockEnd.setDate(blockStart.getDate() + 6);
      return { start: blockStart, end: blockEnd };
    });

    return {
      labels: weekBlocks.map(({ start }) => start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      counts: weekBlocks.map(({ start, end }) => countActiveUsersInRange(start, end, users, bookings)),
    };
  }

  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(now);
    day.setDate(now.getDate() - 6 + index);
    return day;
  });

  return {
    labels: days.map(day => day.toLocaleDateString('en-US', { weekday: 'short' })),
    counts: days.map(day => countActiveUsersInRange(day, day, users, bookings)),
  };
}

function countActiveUsersInRange(start, end, users, bookings) {
  const startTime = new Date(start);
  startTime.setHours(0, 0, 0, 0);
  const endTime = new Date(end);
  endTime.setHours(23, 59, 59, 999);
  const activeIds = new Set();

  users.forEach(user => {
    const created = Date.parse(user.createdAt);
    if (!Number.isNaN(created) && created >= startTime.getTime() && created <= endTime.getTime()) {
      activeIds.add(user.id);
    }
  });

  bookings.forEach(booking => {
    const created = Date.parse(booking.createdAt);
    if (!Number.isNaN(created) && created >= startTime.getTime() && created <= endTime.getTime()) {
      activeIds.add(booking.userId || booking.userEmail || booking.id);
    }
  });

  return activeIds.size;
}

/* ─────────────────── PACKAGES ─────────────────── */
const EMPTY_PKG = { name: '', destination: '', duration: 7, price: '', category: 'cultural', image: '', description: '', includes: '', highlights: '' };

function PackagesTab() {
  const { packages, addPackage, updatePackage, deletePackage } = useAdminStore();
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(EMPTY_PKG);
  const [confirm,  setConfirm]  = useState(null);

  const startAdd  = () => { setForm(EMPTY_PKG); setEditing(null); setShowForm(true); };
  const startEdit = (p) => { setForm({ ...p, includes: (p.includes || []).join('\n'), highlights: (p.highlights || []).join('\n') }); setEditing(p.id); setShowForm(true); };

  const handleSave = () => {
    if (!form.name || !form.destination || !form.price) return;
    const pkg = {
      ...form,
      duration: Number(form.duration),
      price: Number(form.price),
      includes: form.includes.split('\n').filter(Boolean),
      highlights: form.highlights.split('\n').filter(Boolean),
    };
    if (editing) updatePackage(editing, pkg);
    else addPackage(pkg);
    setShowForm(false); setEditing(null);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end">
        <button onClick={startAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#0A0A0A] text-[11px] font-black uppercase tracking-widest transition-premium hover:bg-white/90">
          <Plus className="w-4 h-4" /> {t('admin.packagesTab.add')}
        </button>
      </div>

      {showForm && (
        <div className="bg-[#111111] border border-white/[0.08] rounded-2xl p-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-white/50 mb-5">{editing ? 'Edit Package' : 'Add New Package'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { k:'name',        l:'Package Name',   ph:'Dubai Luxury Escape',  type:'text' },
              { k:'destination', l:'Destination',    ph:'Dubai, UAE',           type:'text' },
              { k:'duration',    l:'Duration (days)', ph:'7',                   type:'number' },
              { k:'price',       l:'Price per person ($)', ph:'2499',           type:'number' },
              { k:'image',       l:'Image URL',      ph:'https://images.unsplash.com/…', type:'text' },
            ].map(field => (
              <div key={field.k}>
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1.5 block">{field.l}</label>
                <input type={field.type} placeholder={field.ph} value={form[field.k]} onChange={e => setForm(p => ({ ...p, [field.k]: e.target.value }))}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-premium"
                />
              </div>
            ))}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1.5 block">Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none transition-premium">
                {['luxury', 'beach', 'cultural', 'adventure', 'family'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1.5 block">Description</label>
              <textarea rows={3} placeholder="Package description…" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-premium resize-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1.5 block">Includes (one per line)</label>
              <textarea rows={4} placeholder="Round-trip flights&#10;4★ hotel&#10;Tours" value={form.includes} onChange={e => setForm(p => ({ ...p, includes: e.target.value }))}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-premium resize-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-1.5 block">Highlights (one per line)</label>
              <textarea rows={4} placeholder="Burj Khalifa visit&#10;Desert safari&#10;Dhow cruise" value={form.highlights} onChange={e => setForm(p => ({ ...p, highlights: e.target.value }))}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-premium resize-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-5">
            <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#0A0A0A] text-[11px] font-black uppercase tracking-widest transition-premium hover:bg-white/90">
              <Save className="w-4 h-4" /> Save
            </button>
            <button onClick={() => setShowForm(false)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/[0.08] text-white/60 text-[11px] font-black uppercase tracking-widest hover:bg-white/[0.04] transition-premium">
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map(p => (
          <div key={p.id} className="bg-[#111111] border border-white/[0.06] rounded-2xl overflow-hidden">
            {p.image && <img src={p.image} alt={p.name} className="h-36 w-full object-cover" />}
            <div className="p-4">
              <p className="font-black text-white text-sm mb-0.5">{p.name}</p>
              <p className="text-white/40 text-xs mb-3">{p.destination} · {p.duration}d · ${p.price}/pax</p>
              <div className="flex items-center gap-2">
                <button onClick={() => startEdit(p)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-white/[0.1] text-white/60 text-[11px] font-black uppercase tracking-widest hover:bg-white/[0.04] transition-premium">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => setConfirm(p.id)} className="p-2 rounded-xl hover:bg-red-400/10 text-white/30 hover:text-red-400 transition-premium">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {packages.length === 0 && <p className="text-white/25 text-sm text-center py-10 col-span-3">No packages yet.</p>}
      </div>

      {confirm && <ConfirmModal msg={t('admin.packagesTab.deleteConfirm')} onConfirm={() => { deletePackage(confirm); setConfirm(null); }} onCancel={() => setConfirm(null)} />}
    </div>
  );
}


/* ─── Confirm Modal ─── */
function ConfirmModal({ msg, sub, onConfirm, onCancel }) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#111111] border border-white/[0.1] rounded-2xl p-6 max-w-xs w-full mx-4 page-fade text-center">
        <div className="w-12 h-12 rounded-full bg-red-400/10 flex items-center justify-center mx-auto mb-4">
          <CircleAlert className="w-6 h-6 text-red-400" />
        </div>
        <p className="font-black text-white mb-1">{msg}</p>
        {sub && <p className="text-white/35 text-[10px] font-bold uppercase tracking-widest mt-1 mb-5">{sub}</p>}
        {!sub && <div className="mb-5" />}
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-white/[0.1] text-white/60 text-[10px] font-black uppercase tracking-widest hover:bg-white/[0.04] transition-premium">{t('admin.common.cancel')}</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-400 transition-premium">{t('admin.common.delete')}</button>
        </div>
      </div>
    </div>
  );
}
