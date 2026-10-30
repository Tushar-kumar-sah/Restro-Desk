import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserSession } from '@/types/auth';
import { OutletInfo, DateRangeFilter } from '@/types';

interface AppState {
  // Auth state
  user: UserSession | null;
  setUser: (user: UserSession | null) => void;
  clearUser: () => void;

  // Multi-outlet state
  selectedOutletId: string | null;
  selectedOutlet: OutletInfo | null;
  availableOutlets: OutletInfo[];
  setAvailableOutlets: (outlets: OutletInfo[]) => void;
  setSelectedOutlet: (outlet: OutletInfo | string) => void;

  // Sidebar state
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;

  // Date range filter
  dateRange: DateRangeFilter;
  setDateRange: (range: DateRangeFilter) => void;

  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  // Quick Search Dialog
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null, selectedOutletId: null, selectedOutlet: null }),

      selectedOutletId: null,
      selectedOutlet: null,
      availableOutlets: [],
      setAvailableOutlets: (outlets) => {
        set({ availableOutlets: outlets });
        // Auto select first outlet if none selected
        const currentId = get().selectedOutletId;
        if (!currentId && outlets.length > 0) {
          set({
            selectedOutletId: outlets[0].id,
            selectedOutlet: outlets[0],
          });
        }
      },
      setSelectedOutlet: (outletOrId) => {
        if (typeof outletOrId === 'string') {
          const found = get().availableOutlets.find((o) => o.id === outletOrId);
          set({
            selectedOutletId: outletOrId,
            selectedOutlet: found || null,
          });
        } else {
          set({
            selectedOutletId: outletOrId.id,
            selectedOutlet: outletOrId,
          });
        }
      },

      isSidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
      isMobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

      dateRange: {
        label: 'Today',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
      },
      setDateRange: (range) => set({ dateRange: range }),

      theme: 'light',
      setTheme: (theme) => set({ theme }),

      isSearchOpen: false,
      setIsSearchOpen: (open) => set({ isSearchOpen: open }),
    }),
    {
      name: 'restodesk-app-storage',
      partialize: (state) => ({
        selectedOutletId: state.selectedOutletId,
        selectedOutlet: state.selectedOutlet,
        isSidebarCollapsed: state.isSidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);
