import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import NotificationDrawer from './NotificationDrawer';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function AppShell({ children }) {
  const { isAuthenticated } = useAuthStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // Quiet fail if not authenticated yet
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 lg:pl-64">
        {/* Sticky Top Header */}
        <Header
          setIsMobileOpen={setIsMobileOpen}
          setIsNotificationOpen={setIsNotificationOpen}
          unreadCount={unreadCount}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>

      {/* Slide-out Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => {
          setIsNotificationOpen(false);
          fetchUnreadCount();
        }}
        onUnreadChange={(count) => setUnreadCount(count)}
      />
    </div>
  );
}
