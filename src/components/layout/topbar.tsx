'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Store,
  Calendar,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Check,
  Wifi,
  Sparkles,
  Menu,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
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
    } catch (err) {
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
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b bg-card px-2.5 sm:px-4 md:px-6 shadow-sm no-print">
      {/* Left: Outlet Switcher & Quick Navigation */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
          title="Open Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Outlet Switcher Dropdown */}
        <div className="relative min-w-0">
          <button
            onClick={() => {
              setIsOutletMenuOpen(!isOutletMenuOpen);
              setIsDateMenuOpen(false);
              setIsProfileMenuOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl border border-input bg-background/80 hover:bg-muted/60 px-2 sm:px-3 py-1.5 text-sm font-medium transition-all shadow-sm max-w-[180px] sm:max-w-none"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 shrink-0">
              <Store className="h-4 w-4" />
            </div>
            <div className="flex flex-col text-left min-w-0">
              <span className="text-xs font-semibold leading-tight text-foreground truncate max-w-[85px] sm:max-w-[160px] md:max-w-[200px]">
                {selectedOutlet?.name || 'Select Outlet'}
              </span>
              <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">
                {selectedOutlet?.city ? `${selectedOutlet.city} • ${selectedOutlet.code}` : 'All Outlets'}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </button>

          {isOutletMenuOpen && (
            <div className="absolute left-0 mt-2 w-72 rounded-xl border bg-card p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
              <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Switch Outlet ({availableOutlets.length})
              </div>
              <div className="space-y-1">
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
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                        isSelected
                          ? 'bg-orange-50 font-semibold text-orange-900 dark:bg-orange-950 dark:text-orange-200'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm">{outlet.name}</span>
                        <span className="text-xs text-muted-foreground">
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

        {/* Date Filter Dropdown */}
        <div className="relative hidden md:block">
          <button
            onClick={() => {
              setIsDateMenuOpen(!isDateMenuOpen);
              setIsOutletMenuOpen(false);
              setIsProfileMenuOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl border border-input bg-background/80 hover:bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground transition-all shadow-sm"
          >
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{dateRange.label}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {isDateMenuOpen && (
            <div className="absolute left-0 mt-2 w-48 rounded-xl border bg-card p-1.5 shadow-xl z-50 animate-in fade-in zoom-in-95">
              {DATE_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleSelectDatePreset(preset)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
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

      {/* Center / Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 rounded-xl border bg-muted/40 hover:bg-muted px-3 py-1.5 text-xs text-muted-foreground transition-all"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search Menu, Orders, Tables...</span>
          <kbd className="hidden sm:inline-block rounded bg-background px-1.5 py-0.5 text-[10px] font-semibold shadow-xs">
            Ctrl K
          </kbd>
        </button>

        {/* PWA Network & Cloud Sync Status */}
        <PwaConnectivityBar />

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-xl text-muted-foreground hover:text-foreground"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notification Bell */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="rounded-xl text-muted-foreground hover:text-foreground relative"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange-500" />
          </Button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border bg-card p-3 shadow-xl z-50">
              <div className="flex items-center justify-between border-b pb-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Notifications
                </span>
                <span className="text-[11px] text-orange-600 font-semibold cursor-pointer">
                  Mark all read
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/40">
                  <span className="font-semibold text-orange-900 dark:text-orange-200">
                    KOT #104 Delayed
                  </span>
                  <p className="text-muted-foreground mt-0.5">
                    Table T-04 (Butter Chicken) cooking &gt; 20 mins.
                  </p>
                </div>
                <div className="p-2 rounded-lg hover:bg-muted/50 border border-transparent">
                  <span className="font-semibold text-foreground">
                    Online Order #ZOM-482 Received
                  </span>
                  <p className="text-muted-foreground mt-0.5">
                    Accepted automatically for Indiranagar kitchen.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileMenuOpen(!isProfileMenuOpen);
              setIsOutletMenuOpen(false);
              setIsDateMenuOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl p-1 hover:bg-muted/70 transition-all"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-semibold text-xs shadow-sm">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'RD'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold leading-tight text-foreground">
                {user?.name || 'Resto User'}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {user?.roleName || user?.role || 'Staff'}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:inline" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-xl border bg-card p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
              <div className="border-b px-2 pb-2 mb-1">
                <div className="font-semibold text-sm text-foreground">
                  {user?.name || 'Vikramaditya Roy'}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {user?.email || 'owner@restodesk.com'}
                </div>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <Badge variant="brand" className="text-[10px] uppercase font-bold">
                    {user?.role || 'OWNER'}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
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
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Store className="h-4 w-4 text-muted-foreground" />
                  <span>Outlet Settings</span>
                </button>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    router.push('/setup');
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <Sparkles className="h-4 w-4 text-orange-500" />
                  <span>Onboarding Setup</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
