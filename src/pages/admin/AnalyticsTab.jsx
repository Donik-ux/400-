import React, { useState, useMemo } from 'react';
import { TrendingUp, DollarSign, BarChart3, Calendar, Download } from 'lucide-react';
import useAdminStore from '../../store/useAdminStore';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function buildMonthlyRevenue(bookings) {
  const now = new Date();
  const year = now.getFullYear();
  return MONTHS.map((label, i) => {
    const total = bookings
      .filter(b => b.status === 'confirmed')
      .filter(b => {
        const d = new Date(b.createdAt);
        return d.getFullYear() === year && d.getMonth() === i;
      })
      .reduce((s, b) => s + (b.total || 0), 0);
    return { label, total };
  });
}

function buildByType(bookings) {
  const flights  = bookings.filter(b => b.type === 'flight').length;
  const packages = bookings.filter(b => b.type === 'package').length;
  return [
    { label: 'Flights',  value: flights,  color: 'bg-cyan-400' },
    { label: 'Packages', value: packages, color: 'bg-purple-400' },
  ];
}

export default function AnalyticsTab() {
  const bookings     = useAdminStore(s => s.bookings);
  const adminFlights = useAdminStore(s => s.adminFlights);
  const packages     = useAdminStore(s => s.packages);
  const hotels       = useAdminStore(s => s.hotels);
  const [view, setView] = useState('monthly');

  const monthly    = useMemo(() => buildMonthlyRevenue(bookings), [bookings]);
  const maxRevenue = Math.max(...monthly.map(m => m.total), 1);
  const totalRev   = bookings.filter(b => b.status === 'confirmed').reduce((s,b) => s+(b.total||0), 0);
  const byType     = useMemo(() => buildByType(bookings), [bookings]);
  const totalItems = byType.reduce((s, t) => s + t.value, 0) || 1;

  const avgBooking = bookings.length ? Math.round(totalRev / bookings.length) : 0;
  const convRate   = bookings.length
    ? Math.round((bookings.filter(b=>b.status==='confirmed').length / bookings.length)*100)
    : 0;

  // Export CSV
  const exportCSV = () => {
    const rows = [
      ['Month', 'Revenue ($)'],
      ...monthly.map(m => [m.label, m.total]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a   = document.createElement('a');
    a.href    = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'revenue_report.csv';
    a.click();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: DollarSign,  label: 'Total Revenue',    value: `$${totalRev.toLocaleString()}`, color: 'text-green-400' },
          { icon: TrendingUp,  label: 'Avg Booking Value', value: `$${avgBooking.toLocaleString()}`, color: 'text-blue-400' },
          { icon: BarChart3,   label: 'Conversion Rate',  value: `${convRate}%`,                  color: 'text-purple-400' },
          { icon: Calendar,    label: 'Total Bookings',   value: bookings.length,                color: 'text-cyan-400' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-[#111111] border border-white/[0.06] rounded-2xl p-5">
            <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center mb-3">
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Bar Chart */}
      <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-white/50">Monthly Revenue</h3>
            <p className="text-xs text-white/30 mt-0.5">{new Date().getFullYear()} — confirmed bookings</p>
          </div>
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.1] text-white/60 text-[10px] font-black uppercase tracking-widest hover:bg-white/[0.05] transition-all">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
        <div className="flex items-end gap-2 h-48">
          {monthly.map((m, i) => {
            const pct = maxRevenue > 0 ? (m.total / maxRevenue) * 100 : 0;
            const isCurrentMonth = i === new Date().getMonth();
            return (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="relative w-full flex items-end justify-center" style={{ height: '160px' }}>
                  {m.total > 0 && (
                    <div className="absolute bottom-full mb-1 text-[9px] font-black text-white/50 opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
                      ${m.total.toLocaleString()}
                    </div>
                  )}
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${isCurrentMonth ? 'bg-cyan-400' : 'bg-white/[0.12] group-hover:bg-white/20'}`}
                    style={{ height: `${Math.max(pct, m.total > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-wide ${isCurrentMonth ? 'text-cyan-400' : 'text-white/30'}`}>
                  {m.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking by Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-5">
          <h3 className="text-sm font-black uppercase tracking-widest text-white/50 mb-4">Bookings by Type</h3>
          <div className="flex flex-col gap-4">
            {byType.map(({ label, value, color }) => (
              <div key={label}>
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-white/50 mb-1.5">
                  <span>{label}</span>
                  <span>{value} ({Math.round((value/totalItems)*100)}%)</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/[0.05] overflow-hidden">
                  <div className={`h-full rounded-full ${color} transition-all duration-700`}
                    style={{ width: `${(value / totalItems) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111111] border border-white/[0.06] rounded-2xl p-5">
          <h3 className="text-sm font-black uppercase tracking-widest text-white/50 mb-4">Inventory Summary</h3>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Active Flights',  value: adminFlights.filter(f=>f.available).length, total: adminFlights.length, color: 'text-cyan-400' },
              { label: 'Active Packages', value: packages.filter(p=>p.available).length, total: packages.length, color: 'text-purple-400' },
            ].map(({ label, value, total, color }) => (
              <div key={label} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">{label}</span>
                <span className={`text-sm font-black ${color}`}>{value} <span className="text-white/25 font-normal">/ {total}</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
