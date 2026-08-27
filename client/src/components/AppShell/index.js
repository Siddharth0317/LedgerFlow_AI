import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import NotificationDrawer from './NotificationDrawer';

export default function AppShell({ children }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

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
          unreadCount={3}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>

      {/* Slide-out Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
}
