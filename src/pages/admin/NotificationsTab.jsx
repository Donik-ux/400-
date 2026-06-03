import React from 'react';
import { Bell, CheckCheck, Trash2, BookOpen, Hotel, Plane, X } from 'lucide-react';
import useAdminStore from '../../store/useAdminStore';

const TYPE_ICON = {
  booking: BookOpen,
  hotel:   Hotel,
  flight:  Plane,
};

const SEVERITY_STYLE = {
  info:    'border-blue-400/20 bg-blue-400/[0.05]',
  warning: 'border-yellow-400/20 bg-yellow-400/[0.05]',
  error:   'border-red-400/20 bg-red-400/[0.05]',
};

const SEVERITY_DOT = {
  info:    'bg-blue-400',
  warning: 'bg-yellow-400',
  error:   'bg-red-400',
};

export default function NotificationsTab() {
  const notifications       = useAdminStore(s => s.notifications);
  const markNotificationRead = useAdminStore(s => s.markNotificationRead);
  const deleteNotification   = useAdminStore(s => s.deleteNotification);
  const markAllRead          = useAdminStore(s => s.markAllRead);
  const clearAllNotifications= useAdminStore(s => s.clearAllNotifications);

  const unread = notifications.filter(n => !n.read).length;

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center">
          <Bell className="w-7 h-7 text-white/20" />
        </div>
        <p className="text-white/25 text-sm font-bold uppercase tracking-widest">No notifications</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-white/40" />
          <span className="text-sm font-black text-white/60">{notifications.length} total</span>
          {unread > 0 && (
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-400 uppercase tracking-widest">
              {unread} unread
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.08] text-white/50 text-[10px] font-black uppercase tracking-widest hover:bg-white/[0.04] transition-all">
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
          <button onClick={clearAllNotifications}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-400/20 text-red-400/70 text-[10px] font-black uppercase tracking-widest hover:bg-red-400/[0.06] transition-all">
            <Trash2 className="w-3.5 h-3.5" /> Clear all
          </button>
        </div>
      </div>

      {/* Notification list */}
      <div className="flex flex-col gap-2">
        {notifications.map(n => {
          const Icon = TYPE_ICON[n.type] || Bell;
          const severity = n.severity || 'info';
          return (
            <div
              key={n.id}
              className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${n.read ? 'border-white/[0.04] bg-transparent' : `${SEVERITY_STYLE[severity]}`}`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center">
                  <Icon className="w-4 h-4 text-white/40" />
                </div>
                {!n.read && (
                  <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${SEVERITY_DOT[severity]} border-2 border-[#0A0A0A]`} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${n.read ? 'text-white/50' : 'text-white'}`}>{n.title}</p>
                <p className="text-[11px] text-white/35 mt-0.5 leading-relaxed">{n.message}</p>
                <p className="text-[10px] text-white/20 mt-1.5 font-bold uppercase tracking-widest">
                  {new Date(n.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!n.read && (
                  <button onClick={() => markNotificationRead(n.id)}
                    className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/30 hover:text-white transition-all">
                    <CheckCheck className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => deleteNotification(n.id)}
                  className="p-1.5 rounded-lg hover:bg-red-400/10 text-white/30 hover:text-red-400 transition-all">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
