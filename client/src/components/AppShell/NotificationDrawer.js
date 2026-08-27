import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  Clock,
  Sparkles,
  Check,
  Loader2,
} from 'lucide-react';

export default function NotificationDrawer({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'EXECUTION_SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'VALIDATION_ERROR':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'EXECUTION_FAILED':
      case 'AUTH_EXPIRED':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      default:
        return <Info className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className="fixed top-0 bottom-0 right-0 z-50 w-full max-w-md bg-[#0F1423] border-l border-slate-800/90 shadow-2xl flex flex-col animate-slide-up">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className="font-semibold text-white text-sm">System & Agent Activity</h3>
          </div>
          <div className="flex items-center space-x-2">
            {notifications.some((n) => !n.read) && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors flex items-center space-x-1"
              >
                <Check className="w-3 h-3" />
                <span>Mark Read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
              <p className="text-xs font-mono">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-slate-600" />
              <p className="text-xs font-medium text-slate-300">No active alerts</p>
              <p className="text-[11px] text-slate-500">Autonomous multi-agent events will appear here.</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item._id}
                className={`p-3.5 rounded-xl border transition-all space-y-1.5 ${
                  item.read
                    ? 'bg-slate-900/40 border-slate-800/60 opacity-70'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getIcon(item.type)}
                    <span className="text-xs font-semibold text-white">{item.title}</span>
                  </div>
                  <span className="flex items-center text-[10px] text-slate-500 font-mono">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-slate-400 pl-6 leading-relaxed">{item.message}</p>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Dismiss Panel
          </button>
        </div>
      </div>
    </>
  );
}
