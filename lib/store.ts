import { create } from 'zustand'

interface AppState {
  sidebarOpen: boolean
  commandOpen: boolean
  activeWorkspace: string
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setCommandOpen: (open: boolean) => void
  setActiveWorkspace: (workspace: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  commandOpen: false,
  activeWorkspace: 'NexCRM Enterprise',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCommandOpen: (open) => set({ commandOpen: open }),
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
}))
