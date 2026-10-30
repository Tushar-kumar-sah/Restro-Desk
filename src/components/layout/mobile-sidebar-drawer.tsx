'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, ChevronDown, ChevronRight, Store } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { NAV_GROUPS, isNavItemActive } from './sidebar';

export function MobileSidebarDrawer() {
  const pathname = usePathname();
  const { isMobileMenuOpen, setMobileMenuOpen, selectedOutlet } = useAppStore();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Close drawer on pathname change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen, setMobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  if (!isMobileMenuOpen) return null;

  const toggleGroup = (groupLabel: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupLabel]: !prev[groupLabel],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-card border-r shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-300">
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b px-4 shrink-0">
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 overflow-hidden"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-md shadow-orange-500/20">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 10h18M3 14h18" />
                <path d="M12 4v16" />
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-lg text-foreground flex items-center gap-1.5">
                RestoDesk
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400">
                  POS
                </span>
              </span>
              <span className="text-[11px] text-muted-foreground truncate">
                {selectedOutlet?.name || 'Restaurant Operating System'}
              </span>
            </div>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Close Menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {NAV_GROUPS.map((group) => {
            const isGroupCollapsed = collapsedGroups[group.label];
            return (
              <div key={group.label} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.label)}
                  className="flex w-full items-center justify-between px-2 py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground/80 hover:text-foreground transition-colors"
                >
                  <span>{group.label}</span>
                  {isGroupCollapsed ? (
                    <ChevronRight className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>

                {!isGroupCollapsed && (
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const isActive = isNavItemActive(item.href, pathname);
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all group relative',
                            isActive
                              ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30 dark:bg-orange-600'
                              : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                          )}
                        >
                          <Icon
                            className={cn(
                              'h-4 w-4 shrink-0 transition-transform group-hover:scale-105',
                              isActive && 'text-white'
                            )}
                          />
                          <span className="flex-1 truncate">{item.title}</span>
                          {item.badge && (
                            <Badge
                              variant={item.badgeVariant || 'secondary'}
                              className={cn(
                                'text-[10px] px-1.5 py-0 h-4 uppercase font-semibold tracking-wider',
                                isActive && 'bg-white/20 text-white border-transparent'
                              )}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t p-3 bg-muted/30 shrink-0">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
            <span>RestoDesk v1.0.0</span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Cloud Sync Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
