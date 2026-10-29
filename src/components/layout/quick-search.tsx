'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Receipt,
  LayoutGrid,
  ChefHat,
  UtensilsCrossed,
  Boxes,
  Users,
  Award,
  BarChart3,
  Store,
  Compass,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const SEARCH_ITEMS = [
  { title: 'POS Billing & Cashier Counter', path: '/pos', icon: Receipt, category: 'Operations' },
  { title: 'Table Layout & Floor Management', path: '/tables', icon: LayoutGrid, category: 'Operations' },
  { title: 'Live Kitchen Display System (KDS)', path: '/kitchen', icon: ChefHat, category: 'Operations' },
  { title: 'Menu Items & Master Catalog', path: '/menu', icon: UtensilsCrossed, category: 'Menu' },
  { title: 'Categories & Modifier Addon Groups', path: '/menu/modifiers', icon: UtensilsCrossed, category: 'Menu' },
  { title: 'Raw Materials & Stock Audit', path: '/inventory', icon: Boxes, category: 'Inventory' },
  { title: 'Customer Database & CRM', path: '/crm', icon: Users, category: 'CRM' },
  { title: 'Loyalty Program & Customer Wallet', path: '/loyalty', icon: Award, category: 'CRM' },
  { title: 'Executive Sales Dashboard', path: '/dashboard', icon: BarChart3, category: 'Reports' },
  { title: 'Day-end Z-Report & Cash Drawer', path: '/reports/day-end', icon: BarChart3, category: 'Reports' },
  { title: 'Brand & Multi-Outlet Settings', path: '/settings/outlets', icon: Store, category: 'Settings' },
  { title: 'Onboarding Setup Wizard', path: '/setup', icon: Compass, category: 'Settings' },
];

export function QuickSearch() {
  const router = useRouter();
  const { isSearchOpen, setIsSearchOpen } = useAppStore();
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  const filtered = SEARCH_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    setIsSearchOpen(false);
    setQuery('');
    router.push(path);
  };

  return (
    <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
      <DialogContent className="p-0 max-w-xl overflow-hidden rounded-2xl gap-0 border shadow-2xl">
        <div className="flex items-center border-b px-4 py-3 bg-muted/20">
          <Search className="h-5 w-5 text-muted-foreground mr-3" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search screens, workflows, reports, or items..."
            className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground"
            autoFocus
          />
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleSelect(item.path)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm hover:bg-orange-50 hover:text-orange-950 dark:hover:bg-orange-950/40 dark:hover:text-orange-200 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="font-medium text-foreground">{item.title}</span>
                    </div>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground px-2 py-0.5 rounded bg-muted/80">
                      {item.category}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t bg-muted/30 px-4 py-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Navigate with arrows or mouse</span>
          <kbd className="rounded bg-background px-1.5 py-0.5 font-semibold text-[10px] shadow-xs">
            ESC to close
          </kbd>
        </div>
      </DialogContent>
    </Dialog>
  );
}
