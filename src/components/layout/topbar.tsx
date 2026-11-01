'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Store,
  Calendar,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Check,
  Sparkles,
  Menu,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Badge } from '@/components/ui/badge';
import { DateRangeFilter } from '@/types';
import { toast } from 'sonner';
import { PwaConnectivityBar } from '@/components/pwa/pwa-installer';

const DATE_PRESETS: Array<DateRangeFilter['label']> = [
  'Today',
  'Yesterday',
  'Last 7 Days',
  'Last 30 Days',
  'This Month',
];

export function Topbar() {
  const router = useRouter();
  const topbarRef = useRef<HTMLElement>(null);

  const {
    user,
    clearUser,
    selectedOutlet,
    selectedOutletId,
    availableOutlets,
    setAvailableOutlets,
    setSelectedOutlet,
    dateRange,
    setDateRange,
    theme,
    setTheme,
    setIsSearchOpen,
    setMobileMenuOpen,
  } = useAppStore();

  const [isOutletMenuOpen, setIsOutletMenuOpen] = useState(false);
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Click outside listener to automatically close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (topbarRef.current && !topbarRef.current.contains(event.target as Node)) {
        setIsOutletMenuOpen(false);
        setIsDateMenuOpen(false);
        setIsProfileMenuOpen(false);
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch outlets on mount if not loaded
  useEffect(() => {
    async function loadOutlets() {
      try {
        const res = await fetch('/api/outlets');
        const data = await res.json();
        if (data.success && data.outlets) {
          setAvailableOutlets(data.outlets);
        }
      } catch (err) {
        console.error('Failed to load outlets:', err);
      }
    }

    if (availableOutlets.length === 0) {
      loadOutlets();
    }
  }, [availableOutlets.length, setAvailableOutlets]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      clearUser();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  const handleSelectDatePreset = (preset: DateRangeFilter['label']) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    if (preset === 'Yesterday') {
      start.setDate(today.getDate() - 1);
      end.setDate(today.getDate() - 1);
    } else if (preset === 'Last 7 Days') {
      start.setDate(today.getDate() - 7);
    } else if (preset === 'Last 30 Days') {
      start.setDate(today.getDate() - 30);
    } else if (preset === 'This Month') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    setDateRange({
      label: preset,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    });
    setIsDateMenuOpen(false);
    toast.info(`Date filter set to ${preset}`);
  };

  return (
    <header
      ref={topbarRef}
      className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b bg-card/95 backdrop-blur-md px-2.5 sm:px-4 md:px-6 shadow-2xs no-print select-none"
    >
      {/* ============================================================ */}
      {/* 1. LEFT ZONE: Brand/Navigation, Outlet Selector & Date Filter */}
      {/* ============================================================ */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink-0">
        {/* Mobile Hamburger Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0 cursor-pointer"
          title="Open Navigation Menu"
          aria-label="Open Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile Brand Logo */}
        <Link
          href="/dashboard"
          className="lg:hidden flex items-center shrink-0 cursor-pointer"
          title="Go to Dashboard"
        >
          <div className="h-8 w-8 rounded-lg bg-white p-0.5 shadow-2xs border border-orange-200/80 flex items-center justify-center shrink-0 overflow-hidden">
            <Image
              src="/logo.png"
              alt="RestoDesk Logo"
              width={32}
              height={32}
              className="h-full w-full object-contain"
            />
          </div>
        </Link>

        {/* Outlet Switcher Dropdown */}
        <div className="relative min-w-0">
          <button
            onClick={() => {
              setIsOutletMenuOpen(!isOutletMenuOpen);
              setIsDateMenuOpen(false);
              setIsProfileMenuOpen(false);
              setIsNotificationOpen(false);
            }}
            className="flex h-10 items-center gap-2 sm:gap-2.5 rounded-xl border border-input/80 bg-background/90 hover:bg-muted/70 px-2 sm:px-3 text-sm font-medium transition-colors shadow-2xs cursor-pointer max-w-[130px] xs:max-w-[160px] sm:max-w-[230px] md:max-w-[270px]"
            title="Switch Restaurant Outlet"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100/90 text-orange-700 dark:bg-orange-950 dark:text-orange-300 shrink-0">
              <Store className="h-4 w-4" />
            </div>
            <div className="flex flex-col text-left justify-center min-w-0 leading-tight">
              <span className="text-xs font-semibold text-foreground truncate">
                {selectedOutlet?.name || 'Select Outlet'}
              </span>
              <span className="text-[10px] text-muted-foreground truncate hidden sm:block">
                {selectedOutlet?.city ? `${selectedOutlet.city} • ${selectedOutlet.code}` : 'All Outlets'}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-0.5" />
          </button>

          {isOutletMenuOpen && (
            <div className="absolute left-0 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-xl border bg-card p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Switch Outlet ({availableOutlets.length})
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {availableOutlets.map((outlet) => {
                  const isSelected = (selectedOutlet?.id || selectedOutletId) === outlet.id;
                  return (
                    <button
                      key={outlet.id}
                      onClick={() => {
                        setSelectedOutlet(outlet);
                        setIsOutletMenuOpen(false);
                        toast.success(`Switched to ${outlet.name}`);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-orange-50 font-semibold text-orange-900 dark:bg-orange-950 dark:text-orange-200'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="text-xs font-medium truncate">{outlet.name}</span>
                        <span className="text-[10px] text-muted-foreground truncate">
                          {outlet.city} • {outlet.code}
                        </span>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-orange-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Date Filter Dropdown (Tablet & Desktop) */}
        <div className="relative hidden md:block">
          <button
            onClick={() => {
              setIsDateMenuOpen(!isDateMenuOpen);
              setIsOutletMenuOpen(false);
              setIsProfileMenuOpen(false);
              setIsNotificationOpen(false);
            }}
            className="flex h-10 items-center gap-2 rounded-xl border border-input/80 bg-background/90 hover:bg-muted/70 px-3 text-xs font-medium text-foreground transition-colors shadow-2xs cursor-pointer"
            title="Filter by Date Range"
          >
            <Calendar className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
            <span>{dateRange.label}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </button>

          {isDateMenuOpen && (
            <div className="absolute left-0 mt-2 w-48 rounded-xl border bg-card p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95">
              {DATE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleSelectDatePreset(preset)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors cursor-pointer ${
                    dateRange.label === preset
                      ? 'bg-orange-50 font-semibold text-orange-900 dark:bg-orange-950 dark:text-orange-200'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <span>{preset}</span>
                  {dateRange.label === preset && <Check className="h-3.5 w-3.5 text-orange-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. CENTER ZONE: Centered Global Search (Tablet & Desktop)    */}
      {/* ============================================================ */}
      <div className="hidden md:flex flex-1 items-center justify-center px-2 lg:px-6 max-w-md mx-auto">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex h-10 items-center justify-between gap-3 rounded-xl border border-input/80 bg-muted/40 hover:bg-muted/70 px-3.5 text-xs text-muted-foreground transition-all shadow-2xs group cursor-pointer"
          title="Search Menu, Orders, Tables (Ctrl + K)"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Search className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            <span className="truncate group-hover:text-foreground/90">
              Search Menu, Orders, Tables...
            </span>
          </div>
          <kbd className="hidden lg:inline-flex items-center rounded-md border border-border/80 bg-background px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground shadow-2xs shrink-0">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 3. RIGHT ZONE: Search Icon, Sync Status, Theme, Bell & User  */}
      {/* ============================================================ */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Mobile Search Button (< md) */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          title="Search"
          aria-label="Open Search"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* PWA Network & Cloud Sync Status */}
        <PwaConnectivityBar />

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-500" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotificationOpen(!isNotificationOpen);
              setIsOutletMenuOpen(false);
              setIsDateMenuOpen(false);
              setIsProfileMenuOpen(false);
            }}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            title="Notifications"
            aria-label="View Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-card" />
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1.5rem)] rounded-xl border bg-card p-3 shadow-xl z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b pb-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Notifications
                </span>
                <button
                  type="button"
                  onClick={() => {
                    toast.success('All notifications marked as read');
                    setIsNotificationOpen(false);
                  }}
                  className="text-[11px] text-orange-600 hover:text-orange-700 font-semibold cursor-pointer"
                >
                  Mark all read
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/50">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-orange-900 dark:text-orange-200">
                      KOT #104 Delayed
                    </span>
                    <span className="text-[10px] text-muted-foreground">2m ago</span>
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-[11px]">
                    Table T-04 (Butter Chicken) cooking &gt; 20 mins.
                  </p>
                </div>
                <div className="p-2.5 rounded-lg hover:bg-muted/50 border border-transparent">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      Online Order #ZOM-482 Received
                    </span>
                    <span className="text-[10px] text-muted-foreground">5m ago</span>
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-[11px]">
                    Accepted automatically for Indiranagar kitchen.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Subtle Vertical Divider */}
        <div className="hidden sm:block h-6 w-px bg-border/70 mx-0.5 shrink-0" />

        {/* User Profile & Role Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileMenuOpen(!isProfileMenuOpen);
              setIsOutletMenuOpen(false);
              setIsDateMenuOpen(false);
              setIsNotificationOpen(false);
            }}
            className="flex h-10 items-center gap-2 rounded-xl px-1.5 sm:px-2 hover:bg-muted/70 transition-colors border border-transparent hover:border-input/60 cursor-pointer"
            title="User Profile & Settings"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-bold text-xs shadow-2xs shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'RD'}
            </div>
            <div className="hidden xl:flex flex-col text-left justify-center min-w-0 leading-tight">
              <span className="text-xs font-semibold text-foreground truncate max-w-[100px]">
                {user?.name || 'Resto User'}
              </span>
              <span className="text-[10px] text-muted-foreground capitalize">
                {user?.roleName || user?.role || 'Staff'}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block shrink-0" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-1.5rem)] rounded-xl border bg-card p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
              <div className="border-b px-2 pb-2.5 mb-1.5">
                <div className="font-semibold text-sm text-foreground truncate">
                  {user?.name || 'Tibetan Admin'}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {user?.email || 'tibetan@info.in'}
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <Badge variant="brand" className="text-[10px] uppercase font-bold px-1.5 py-0.5">
                    {user?.role || 'OWNER'}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {user?.brandName || 'RestoDesk'}
                  </span>
                </div>
              </div>

              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    router.push('/settings/outlets');
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <Store className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>Outlet Settings</span>
                </button>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    router.push('/setup');
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-orange-500 shrink-0" />
                  <span>Onboarding Setup</span>
                </button>
                <div className="border-t my-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
