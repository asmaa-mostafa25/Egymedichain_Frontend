import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUIStore = create(
  persist(
    (set, get) => ({
      // Sidebar state
      sidebarCollapsed: false,
      sidebarMobileOpen: false,

      // Theme
      theme: 'dark',

      // Loading states
      globalLoading: false,
      pageLoading: false,

      // Modal state
      activeModal: null,
      modalData: null,

      // Drawer state
      activeDrawer: null,
      drawerData: null,

      // Command palette
      commandPaletteOpen: false,

      // Breadcrumbs
      breadcrumbs: [],

      // Page title
      pageTitle: '',

      // Actions
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleMobileSidebar: () => set((state) => ({ sidebarMobileOpen: !state.sidebarMobileOpen })),
      closeMobileSidebar: () => set({ sidebarMobileOpen: false }),

      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      setGlobalLoading: (loading) => set({ globalLoading: loading }),
      setPageLoading: (loading) => set({ pageLoading: loading }),

      openModal: (modalName, data = null) => set({ activeModal: modalName, modalData: data }),
      closeModal: () => set({ activeModal: null, modalData: null }),

      openDrawer: (drawerName, data = null) => set({ activeDrawer: drawerName, drawerData: data }),
      closeDrawer: () => set({ activeDrawer: null, drawerData: null }),

      toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),

      setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
      setPageTitle: (title) => set({ pageTitle: title }),

      reset: () =>
        set({
          sidebarCollapsed: false,
          sidebarMobileOpen: false,
          globalLoading: false,
          pageLoading: false,
          activeModal: null,
          modalData: null,
          activeDrawer: null,
          drawerData: null,
          commandPaletteOpen: false,
          breadcrumbs: [],
          pageTitle: '',
        }),
    }),
    {
      name: 'egy-medichain-ui',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
);

export default useUIStore;
