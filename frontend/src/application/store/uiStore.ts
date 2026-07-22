import { create } from 'zustand';

interface UiStore {
  sidebarCollapsed: boolean;
  darkMode: boolean;
  toggleSidebar: () => void;
  toggleDark: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
  sidebarCollapsed: false,
  darkMode: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleDark: () => set((s) => {
    const next = !s.darkMode;
    if (typeof document !== 'undefined') document.documentElement.classList.toggle('dark', next);
    return { darkMode: next };
  }),
}));
