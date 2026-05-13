import { create } from 'zustand';
import type { AlbumProject, ProviderStatus } from '@/src/types';

interface AppState {
  currentAlbumId: string | null;
  setCurrentAlbumId: (id: string | null) => void;

  minimaxStatus: ProviderStatus;
  setMinimaxStatus: (s: ProviderStatus) => void;

  recentAlbums: AlbumProject[];
  setRecentAlbums: (albums: AlbumProject[]) => void;

  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentAlbumId: null,
  setCurrentAlbumId: (id) => set({ currentAlbumId: id }),

  minimaxStatus: 'not_configured',
  setMinimaxStatus: (s) => set({ minimaxStatus: s }),

  recentAlbums: [],
  setRecentAlbums: (albums) => set({ recentAlbums: albums }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
