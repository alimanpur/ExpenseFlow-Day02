import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, X, CheckCheck } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { analyticsService } from '../../services/analyticsService';

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const typeColor = {
  settlement: 'text-green-600',
  expense: 'text-brand-900',
  invite: 'text-blue-600',
  info: 'text-brand-400',
};

export default function Topbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { unreadCount, setUnreadCount, setNotifications, notifications } = useNotificationStore();
  const [showPanel, setShowPanel] = useState(false);
  const [time, setTime] = useState(() => new Date().toISOString().slice(0, 19).replace('T', ' '));
  const panelRef = useRef(null);
  const qc = useQueryClient();

  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toISOString().slice(0, 19).replace('T', ' ')), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setShowPanel(false); };
    if (showPanel) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPanel]);

  useQuery({
    queryKey: ['notifications'],
    queryFn: analyticsService.getNotifications,
    refetchInterval: 30_000,
    onSuccess: (data) => {
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    },
  });

  const markReadMutation = useMutation({
    mutationFn: () => analyticsService.markNotificationsRead([]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      setUnreadCount(0);
    },
  });

  return (
    <header className="h-14 bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-40 select-none">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-wider hidden sm:block">
        </span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-[10px] font-mono text-brand-300 uppercase tracking-wider hidden md:block">
         {time}
        </span>

        {/* Notification Bell */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setShowPanel((v) => !v)}
            className="relative p-1 text-brand-400 hover:text-brand-700 transition-none"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-brand-900 text-white text-[8px] font-bold rounded-full flex items-center justify-center font-mono">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showPanel && (
            <div className="absolute right-0 top-8 w-80 bg-white border border-border shadow-sm z-50">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                <span className="text-[10px] font-mono font-bold text-brand-400 uppercase tracking-widest">Notifications</span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markReadMutation.mutate()}
                      className="text-[9px] font-mono text-brand-400 hover:text-brand-700 flex items-center gap-1"
                    >
                      <CheckCheck size={10} /> Mark all read
                    </button>
                  )}
                  <button onClick={() => setShowPanel(false)} className="text-brand-400 hover:text-brand-700">
                    <X size={15} />
                  </button>
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-border">
                {!notifications?.length ? (
                  <p className="text-[10px] font-mono text-brand-300 text-center py-6">No notifications.</p>
                ) : (
                  notifications.slice(0, 15).map((n) => (
                    <div key={n.id} className={`px-4 py-2.5 ${!n.read ? 'bg-brand-50' : ''}`}>
                      <p className={`text-xs font-semibold ${typeColor[n.type] ?? 'text-brand-900'}`}>{n.title}</p>
                      <p className="text-[10px] font-mono text-brand-500 mt-0.5 leading-relaxed">{n.message}</p>
                      <p className="text-[9px] font-mono text-brand-300 mt-1">{relativeTime(n.createdAt)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {user && (
          <span className="text-[10px] font-mono font-bold text-brand-500 uppercase tracking-wider hidden sm:block">
            {user.name?.split(' ')[0]}
          </span>
        )}

        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-brand-400 border border-border px-2.5 py-1.5 hover:bg-brand-50 hover:text-brand-700 transition-none uppercase tracking-wider"
        >
          <LogOut size={11} />
          <span className="hidden sm:block">Disconnect</span>
        </button>
      </div>
    </header>
  );
}
