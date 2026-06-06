import { create } from 'zustand';
import { scanLocalMusic, ScannedTrack, extractTrackMetadata } from '../services/musicScannerService';

interface MusicStore {
  scannedTracks: ScannedTrack[];
  setScannedTracks: (tracks: ScannedTrack[]) => void;
  updateTrackMetadata: (id: string, metadata: Partial<ScannedTrack>) => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
  loadLocalMusic: () => Promise<void>;
}

export const useMusicStore = create<MusicStore>((set, get) => ({
  scannedTracks: [],
  setScannedTracks: (tracks) => set({ scannedTracks: tracks }),
  updateTrackMetadata: (id, metadata) => 
    set((state) => ({
      scannedTracks: state.scannedTracks.map(t => 
        t.id === id ? { ...t, ...metadata } : t
      )
    })),
  isScanning: false,
  setIsScanning: (scanning) => set({ isScanning: scanning }),
  loadLocalMusic: async () => {
    set({ isScanning: true });
    try {
      const tracks = await scanLocalMusic();
      set({ scannedTracks: tracks });
    } catch (error) {
      console.error('Failed to scan music:', error);
    } finally {
      set({ isScanning: false });
    }
  },
}));

// Helper selectors
export const useMusicStats = () => {
  const tracks = useMusicStore((state) => state.scannedTracks);
  
  const uniqueAlbums = new Set(tracks.map(t => t.album).filter(Boolean));
  const uniqueArtists = new Set(tracks.map(t => t.artist).filter(Boolean));
  
  return {
    songsCount: tracks.length,
    albumsCount: uniqueAlbums.size,
    artistsCount: uniqueArtists.size,
  };
};
