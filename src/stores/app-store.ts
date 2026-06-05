import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  // Theme
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;

  // Currency preference
  currency: string;
  setCurrency: (currency: string) => void;

  // Notifications
  notifications: {
    budgetAlerts: boolean;
    monthlyReports: boolean;
    largeTransactions: boolean;
  };
  toggleNotification: (key: keyof AppState["notifications"]) => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Theme
      theme: "light",
      setTheme: (theme) => set({ theme }),

      // Currency
      currency: "TRY",
      setCurrency: (currency) => set({ currency }),

      // Notifications
      notifications: {
        budgetAlerts: true,
        monthlyReports: false,
        largeTransactions: true,
      },
      toggleNotification: (key) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            [key]: !state.notifications[key],
          },
        })),

      // Sidebar
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: "moneyshop-store",
      partialize: (state) => ({
        theme: state.theme,
        currency: state.currency,
        notifications: state.notifications,
      }),
    }
  )
);
