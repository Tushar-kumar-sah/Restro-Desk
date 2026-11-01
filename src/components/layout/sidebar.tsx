'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import {
  Receipt,
  LayoutGrid,
  ChefHat,
  ShoppingBag,
  Bike,
  UtensilsCrossed,
  Layers,
  Sparkles,
  Boxes,
  Scroll,
  Truck,
  Building2,
  Users,
  Target,
  Award,
  Ticket,
  Send,
  Star,
  BarChart3,
  TrendingUp,
  FileText,
  FileSpreadsheet,
  Store,
  ShieldCheck,
  Printer,
  Compass,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: 'brand' | 'success' | 'warning' | 'info' | 'purple';
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'POS & Operations',
    items: [
      { title: 'POS Billing', href: '/pos', icon: Receipt, badge: 'Touch', badgeVariant: 'brand' },
      { title: 'Table Layout', href: '/tables', icon: LayoutGrid },
      { title: 'Kitchen Display (KDS)', href: '/kitchen', icon: ChefHat, badge: 'LIVE', badgeVariant: 'success' },
      { title: 'Online Orders', href: '/online-orders', icon: ShoppingBag },
      { title: 'Delivery Fleet', href: '/delivery', icon: Bike },
    ],
  },
  {
    label: 'Menu & Pricing',
    items: [
      { title: 'Menu Items', href: '/menu', icon: UtensilsCrossed },
      { title: 'Categories & Addons', href: '/menu/modifiers', icon: Layers },
      { title: 'Combos & Deals', href: '/menu/combos', icon: Sparkles },
    ],
  },
  {
    label: 'Inventory & Purchase',
    items: [
      { title: 'Raw Materials & Stock', href: '/inventory', icon: Boxes },
      { title: 'Recipes (BOM)', href: '/inventory/recipes', icon: Scroll },
      { title: 'Purchase Orders & GRN', href: '/inventory/purchase', icon: Truck },
      { title: 'Suppliers Ledger', href: '/inventory/suppliers', icon: Building2 },
    ],
  },
  {
    label: 'CRM & Loyalty',
    items: [
      { title: 'Customer Database', href: '/crm', icon: Users },
      { title: 'Audience Segments', href: '/crm/segments', icon: Target },
      { title: 'Loyalty & Wallet', href: '/loyalty', icon: Award },
      { title: 'Coupons & Offers', href: '/coupons', icon: Ticket },
      { title: 'Campaigns & Flows', href: '/campaigns', icon: Send },
      { title: 'Feedback & Reviews', href: '/feedback', icon: Star },
    ],
  },
  {
    label: 'Reports & Audit',
    items: [
      { title: 'Executive Dashboard', href: '/dashboard', icon: BarChart3 },
      { title: 'Sales & Items', href: '/reports/sales', icon: TrendingUp },
      { title: 'Day-end / Z-Report', href: '/reports/day-end', icon: FileText },
      { title: 'GST & Tax Filings', href: '/reports/tax', icon: FileSpreadsheet },
    ],
  },
  {
    label: 'Settings & Admin',
    items: [
      { title: 'Brand & Outlets', href: '/settings/outlets', icon: Store },
      { title: 'Staff & RBAC', href: '/settings/staff', icon: ShieldCheck },
      { title: 'Printers & Billing', href: '/settings/printers', icon: Printer },
      { title: 'Audit Trail & Logs', href: '/audit-logs', icon: FileText },
      { title: 'Setup Wizard', href: '/setup', icon: Compass },
    ],
  },
];

export const ALL_NAV_HREFS = NAV_GROUPS.flatMap((g) => g.items.map((i) => i.href));

export function isNavItemActive(
  itemHref: string,
  currentPathname: string,
  allHrefs: string[] = ALL_NAV_HREFS
): boolean {
  if (currentPathname === itemHref) return true;
  if (itemHref === '/dashboard') return false;
  if (currentPathname.startsWith(itemHref + '/')) {
    const hasMoreSpecificMatch = allHrefs.some(
      (otherHref) =>
        otherHref !== itemHref &&
        otherHref.startsWith(itemHref) &&
        (currentPathname === otherHref || currentPathname.startsWith(otherHref + '/'))
    );
    return !hasMoreSpecificMatch;
  }
  return false;
}

// Module-level persistent state across SPA page navigations
let globalSidebarScrollTop = 0;
let globalCollapsedGroups: Record<string, boolean> = {};

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useAppStore();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('restodesk_collapsed_groups');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return globalCollapsedGroups;
  });

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const isRestoringScrollRef = React.useRef(false);

  const toggleGroup = (groupLabel: string) => {
    setCollapsedGroups((prev) => {
      const next = {
        ...prev,
        [groupLabel]: !prev[groupLabel],
      };
      globalCollapsedGroups = next;
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('restodesk_collapsed_groups', JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isRestoringScrollRef.current) return;
    const top = e.currentTarget.scrollTop;
    globalSidebarScrollTop = top;
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('restodesk_sidebar_scroll', String(top));
      } catch (e) {}
    }
  };

  // Restore scroll position on mount and on route change
  React.useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    let targetScroll = globalSidebarScrollTop;
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem('restodesk_sidebar_scroll');
        if (stored) {
          targetScroll = parseInt(stored, 10);
        }
      } catch (e) {}
    }

    isRestoringScrollRef.current = true;
    el.scrollTop = targetScroll;

    // After restoring, ensure active link remains visible in viewport without jumping to top
    requestAnimationFrame(() => {
      if (el) {
        el.scrollTop = targetScroll;
        const activeLink = el.querySelector<HTMLElement>('[data-active="true"]');
        if (activeLink) {
          const elRect = el.getBoundingClientRect();
          const linkRect = activeLink.getBoundingClientRect();
          if (linkRect.top < elRect.top) {
            el.scrollTop -= (elRect.top - linkRect.top + 16);
          } else if (linkRect.bottom > elRect.bottom) {
            el.scrollTop += (linkRect.bottom - elRect.bottom + 16);
          }
          globalSidebarScrollTop = el.scrollTop;
          try {
            sessionStorage.setItem('restodesk_sidebar_scroll', String(el.scrollTop));
          } catch (e) {}
        }
      }
      setTimeout(() => {
        isRestoringScrollRef.current = false;
      }, 50);
    });
  }, [pathname]);

  return (
    <aside
      className={cn(
        'hidden lg:flex relative flex-col border-r bg-card h-screen transition-all duration-300 z-30 select-none no-print',
        isSidebarCollapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link href="/dashboard" scroll={false} className="flex items-center gap-3 overflow-hidden">
          <Logo
            size="md"
            showText={!isSidebarCollapsed}
            tag="POS"
            subtitle="Restaurant Operating System"
            priority
          />
        </Link>

        {!isSidebarCollapsed && (
          <button
            type="button"
            onClick={toggleSidebar}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation Groups List */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-4 space-y-6"
      >
        {NAV_GROUPS.map((group) => {
          const isGroupCollapsed = collapsedGroups[group.label];
          return (
            <div key={group.label} className="space-y-1">
              {!isSidebarCollapsed ? (
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
              ) : (
                <div className="h-px bg-border my-2 mx-1" />
              )}

              {(!isGroupCollapsed || isSidebarCollapsed) && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = isNavItemActive(item.href, pathname);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        scroll={false}
                        data-active={isActive ? 'true' : 'false'}
                        onClick={() => {
                          if (scrollContainerRef.current) {
                            const top = scrollContainerRef.current.scrollTop;
                            globalSidebarScrollTop = top;
                            if (typeof window !== 'undefined') {
                              try {
                                sessionStorage.setItem('restodesk_sidebar_scroll', String(top));
                              } catch (e) {}
                            }
                          }
                        }}
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all group relative',
                          isActive
                            ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30 dark:bg-orange-600'
                            : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                        )}
                        title={isSidebarCollapsed ? item.title : undefined}
                      >
                        <Icon className={cn('h-4 w-4 shrink-0 transition-transform group-hover:scale-105', isActive && 'text-white')} />
                        {!isSidebarCollapsed && (
                          <span className="flex-1 truncate">{item.title}</span>
                        )}
                        {!isSidebarCollapsed && item.badge && (
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

      {/* Footer Controls */}
      <div className="border-t p-3 bg-muted/30">
        {isSidebarCollapsed ? (
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex w-full items-center justify-center rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Expand Sidebar"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </button>
        ) : (
          <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
            <span>RestoDesk v1.0.0</span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Cloud Sync
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
