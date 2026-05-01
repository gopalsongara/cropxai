import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, CheckCheck, CloudRain, Leaf, Sparkles, TrendingUp, Bug, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiUrl } from '../utils/api';

const typeIcon = {
  weather: CloudRain,
  market: TrendingUp,
  crop: Leaf,
  pest: Bug,
  smart: Sparkles,
};

function formatTime(iso, lang) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const now = Date.now();
    const sec = Math.floor((now - d.getTime()) / 1000);
    if (sec < 60) return lang === 'hi' ? 'अभी' : 'Just now';
    if (sec < 3600) {
      const m = Math.floor(sec / 60);
      return lang === 'hi' ? `${m} मि पहले` : `${m}m ago`;
    }
    if (sec < 86400) {
      const h = Math.floor(sec / 3600);
      return lang === 'hi' ? `${h} घंटे पहले` : `${h}h ago`;
    }
    return d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

export const NotificationBell = ({ className = '' }) => {
  const { token, isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const lang = language === 'hi' ? 'hi' : 'en';
  const nt = t.notifications;

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pushPermission, setPushPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  const wrapRef = useRef(null);
  const prevUnreadRef = useRef(-1);

  const pickText = (n) => ({
    title: lang === 'hi' ? n.titleHi : n.titleEn,
    message: lang === 'hi' ? n.messageHi : n.messageEn,
  });

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(apiUrl('/api/notifications?limit=40'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.success === false) throw new Error(data?.error || 'fetch failed');
      setItems(Array.isArray(data.notifications) ? data.notifications : []);
      setUnreadCount(Number(data.unreadCount) || 0);
    } catch (_e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setItems([]);
      setUnreadCount(0);
      return undefined;
    }
    fetchNotifications();
    const id = window.setInterval(fetchNotifications, 75000);
    return () => window.clearInterval(id);
  }, [isAuthenticated, token, fetchNotifications]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (prevUnreadRef.current < 0) {
      prevUnreadRef.current = unreadCount;
      return;
    }
    if (unreadCount > prevUnreadRef.current && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      const latest = items.find((x) => !x.read) || items[0];
      if (latest && document.visibilityState !== 'visible') {
        const { title, message } = pickText(latest);
        try {
          // eslint-disable-next-line no-new
          new Notification(title, {
            body: message.slice(0, 180),
            tag: `cropx-${latest.id}`,
          });
        } catch (_err) {
          /* ignore */
        }
      }
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount, items, isAuthenticated, lang]);

  useEffect(() => {
    const onDocDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, []);

  const markRead = async (id) => {
    if (!token) return;
    try {
      const res = await fetch(apiUrl(`/api/notifications/${id}/read`), {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success) {
        setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        setUnreadCount((prevCount) => {
          const u = Number(data.unreadCount);
          return Number.isFinite(u) ? u : Math.max(0, prevCount - 1);
        });
      }
    } catch (_e) {
      /* ignore */
    }
  };

  const markAllRead = async () => {
    if (!token) return;
    try {
      const res = await fetch(apiUrl('/api/notifications/read-all'), {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success) {
        setItems((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (_e) {
      /* ignore */
    }
  };

  const requestBrowserNotify = async () => {
    if (typeof Notification === 'undefined') return;
    const perm = await Notification.requestPermission();
    setPushPermission(perm);
  };

  const typeLabel = (type) => {
    const key = `type${type.charAt(0).toUpperCase()}${type.slice(1)}`;
    return nt[key] || type;
  };

  if (!isAuthenticated || !token) {
    return null;
  }

  return (
    <div className={`relative ${className}`} ref={wrapRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) fetchNotifications();
        }}
        className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        aria-label={nt.panelTitle}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 ? (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-[10px] font-bold text-white flex items-center justify-center shadow-md tabular-nums">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-[min(100vw-2rem,22rem)] sm:w-[26rem] rounded-2xl border border-white/60 bg-white/90 backdrop-blur-xl shadow-[0_24px_80px_rgba(15,23,42,0.18)] z-50 overflow-hidden animate-[slideIn_0.2s_ease-out]">
          <div className="px-4 py-3 border-b border-slate-100/80 flex items-center justify-between gap-2 bg-gradient-to-r from-emerald-50/90 to-teal-50/60">
            <div>
              <p className="text-sm font-bold text-slate-900">{nt.panelTitle}</p>
              <p className="text-[11px] text-slate-500">{nt.subtitle}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {typeof Notification !== 'undefined' && pushPermission !== 'granted' ? (
                <button
                  type="button"
                  onClick={requestBrowserNotify}
                  className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-50 transition-colors"
                >
                  {nt.enablePush}
                </button>
              ) : null}
              <button
                type="button"
                onClick={markAllRead}
                disabled={unreadCount === 0}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-white/80 disabled:opacity-40 transition-colors"
                title={nt.markAllRead}
              >
                <CheckCheck className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="max-h-[min(70vh,420px)] overflow-y-auto overscroll-contain">
            {loading && items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <span className="text-xs">{nt.loading}</span>
              </div>
            ) : items.length === 0 ? (
              <p className="text-sm text-slate-500 text-center px-6 py-14">{nt.empty}</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {items.map((n) => {
                  const Icon = typeIcon[n.type] || Leaf;
                  const { title, message } = pickText(n);
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => {
                          if (!n.read) markRead(n.id);
                        }}
                        className={`w-full text-left px-4 py-3 flex gap-3 transition-colors hover:bg-emerald-50/50 ${
                          n.read ? 'opacity-75' : 'bg-emerald-50/20'
                        }`}
                      >
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm text-emerald-700">
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                              {typeLabel(n.type)}
                            </span>
                            <span className="text-[10px] text-slate-400">{formatTime(n.createdAt, lang)}</span>
                            {!n.read ? (
                              <span className="ml-auto h-2 w-2 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            ) : null}
                          </span>
                          <span className="font-semibold text-slate-900 text-sm mt-1 block leading-snug">{title}</span>
                          <span className="text-xs text-slate-600 mt-0.5 block leading-relaxed line-clamp-3">{message}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
