'use client';

import React from 'react';
import { Sidebar } from './sidebar';
import { MobileSidebarDrawer } from './mobile-sidebar-drawer';
import { MobileBottomNav } from './mobile-bottom-nav';
import { Topbar } from './topbar';
import { QuickSearch } from './quick-search';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop Left Sidebar (hidden on screens < lg) */}
      <Sidebar />

      {/* Mobile Drawer (visible on demand on screens < lg) */}
      <MobileSidebarDrawer />

      {/* Main App Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-3 sm:p-4 md:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {children}
          </div>
        </main>
        {/* Mobile Quick Action Bottom Navigation (< md) */}
        <MobileBottomNav />
      </div>

      {/* Global Quick Search (Ctrl+K) */}
      <QuickSearch />
    </div>
  );
}
