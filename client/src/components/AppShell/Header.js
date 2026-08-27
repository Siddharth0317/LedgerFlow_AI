import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Menu,
  Bell,
  LogOut,
  User,
  Shield,
  Activity,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Header({ setIsMobileOpen, setIsNotificationOpen, unreadCount = 0 }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getPageTitle = () => {
    const path = router.pathname;
    if (path === '/dashboard') return 'Operations Overview';
    if (path.startsWith('/workflows/builder')) return 'AI Workflow Prompt Studio';
    if (path.startsWith('/workflows')) return 'Workflow Automation Library';
    if (path.startsWith('/executions')) return 'Multi-Agent Execution Timeline';
    if (path.startsWith('/integrations')) return 'Third-Party Connected Accounts';
    if (path.startsWith('/settings')) return 'Platform & Security Settings';
    return 'Agentflow_AI';
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-[#090D16]/80 backdrop-blur-md border-b border-slate-800/80 lg:px-8">
      {/* Left side: Mobile button + Title */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base font-semibold text-white tracking-tight">{getPageTitle()}</h1>
        </div>
      </div>

      {/* Right side: System status badge, Notifications, Profile */}
      <div className="flex items-center space-x-3">
        {/* Live System Indicator */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>Multi-Agent Engine Online</span>
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          onClick={() => setIsNotificationOpen((prev) => !prev)}
          className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          title="Notifications & Escalations"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
          )}
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-slate-700/60 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-bold text-xs text-white shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-medium text-white truncate max-w-[120px]">{user?.name || 'Operator'}</p>
            </div>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 z-40 w-56 mt-2 py-1.5 bg-[#111726] rounded-2xl shadow-xl border border-slate-800/90 text-sm animate-slide-up">
                <div className="px-4 py-2 border-b border-slate-800">
                  <p className="font-medium text-white text-xs truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  <div className="mt-1 flex items-center space-x-1 text-[10px] text-indigo-400 font-mono">
                    <Shield className="w-3 h-3" />
                    <span className="capitalize">{user?.role} Access</span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      router.push('/settings');
                    }}
                    className="w-full flex items-center px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60"
                  >
                    <User className="w-3.5 h-3.5 mr-2.5 text-slate-400" />
                    Account Settings
                  </button>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      router.push('/workflows/builder');
                    }}
                    className="w-full flex items-center px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-2.5 text-indigo-400" />
                    AI Prompt Builder
                  </button>
                </div>

                <div className="pt-1 border-t border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-2.5" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
