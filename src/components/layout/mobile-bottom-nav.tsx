'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Receipt,
  LayoutGrid,
  ChefHat,
  ShoppingBag,
  Menu,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { setMobileMenuOpen } = useAppStore();

  // Don't show bottom nav inside POS page because POS has its own specialized bottom cart & action bar
  if (pathname === '/pos') return null;

  const navItems = [
    { title: 'POS', href: '/pos', icon: Receipt },
    { title: 'Tables', href: '/tables', icon: LayoutGrid },
    { title: 'KDS', href: '/kitchen', icon: ChefHat },
    { title: 'Online', href: '/online-orders', icon: ShoppingBag },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 h-16 border-t bg-card/95 backdrop-blur-md px-2 flex items-center justify-around md:hidden shadow-lg select-none no-print">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-semibold transition-all relative',
              isActive
                ? 'text-orange-600 dark:text-orange-400 font-bold'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <div className={cn(
              'flex items-center justify-center h-8 w-12 rounded-xl mb-0.5 transition-all',
              isActive ? 'bg-orange-100 dark:bg-orange-950/60' : ''
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <span>{item.title}</span>
            {isActive && (
              <span className="absolute top-1 right-1/4 h-1.5 w-1.5 rounded-full bg-orange-600" />
            )}
          </Link>
        );
      })}

      {/* More / Menu button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-all"
        title="Open Full Navigation Menu"
      >
        <div className="flex items-center justify-center h-8 w-12 rounded-xl mb-0.5">
          <Menu className="h-5 w-5" />
        </div>
        <span>Menu</span>
      </button>
    </nav>
  );
}
