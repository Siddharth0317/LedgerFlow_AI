import React from 'react';
import {
  X,
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldAlert,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function NotificationDrawer({ isOpen, onClose }) {
  if (!isOpen) return null;

  // Initial mock notifications matching Section 3.6 types
  const sampleNotifications = [
    {
      id: '1',
      type: 'info',
      title: 'Agentflow Engine Initialized',
      message: 'Autonomous multi-agent invoice processing pipeline is active.',
      time: 'Just now',
    },
    {
      id: '2',
      type: 'success',
      title: 'Validation Agent Check Passed',
      message: 'Invoice math assertions (subtotal + tax == totalAmount) verified.',
      time: '10m ago',
    },
    {
      id: '3',
      type: 'escalation',
      title: 'Recovery Agent Standing By',
      message: 'Automated retry and classification pipeline ready for incoming exceptions.',
      time: '1h ago',
    },
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'escalation':
      case 'error':
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
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {sampleNotifications.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getIcon(item.type)}
                  <span className="text-xs font-semibold text-white">{item.title}</span>
                </div>
                <span className="flex items-center text-[10px] text-slate-500 font-mono">
                  <Clock className="w-3 h-3 mr-1" />
                  {item.time}
                </span>
              </div>
              <p className="text-xs text-slate-400 pl-6 leading-relaxed">{item.message}</p>
            </div>
          ))}
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
