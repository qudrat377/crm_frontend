import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  setSidebarOpen: (v: boolean) => void;
  toggleSidebar: () => void;
  toggleCollapsed: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: false,
  sidebarCollapsed: false,
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));



// import { create } from "zustand";
// interface UIState {
//   sidebarOpen: boolean;
//   sidebarCollapsed: boolean;
//   setSidebarOpen: (v: boolean) => void;
//   toggleSidebar: () => void;
//   toggleCollapsed: () => void;
// }
// export const useUIStore = create<UIState>()((set) => ({
//   sidebarOpen: false,
//   sidebarCollapsed: false,
//   setSidebarOpen: (v) => set({ sidebarOpen: v }),
//   toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
//   toggleCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
// }));
