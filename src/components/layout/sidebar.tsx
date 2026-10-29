'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: 'brand' | 'success' | 'warning' | 'info' | 'purple';
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
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

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useAppStore();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupLabel: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupLabel]: !prev[groupLabel],
    }));
  };

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r bg-card h-screen transition-all duration-300 z-30 select-none no-print',
        isSidebarCollapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          {/* Original RestoDesk SVG Logo */}
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
          {!isSidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-lg text-foreground flex items-center gap-1.5">
                RestoDesk
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400">
                  POS
                </span>
              </span>
              <span className="text-[11px] text-muted-foreground truncate">
                Restaurant Operating System
              </span>
            </div>
          )}
        </Link>

        {!isSidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation Groups List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
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
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
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
