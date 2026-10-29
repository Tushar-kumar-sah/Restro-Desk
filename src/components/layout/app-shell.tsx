'use client';

import React from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { QuickSearch } from './quick-search';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main App Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Global Quick Search (Ctrl+K) */}
      <QuickSearch />
    </div>
  );
}
