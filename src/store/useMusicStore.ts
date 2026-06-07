import { create } from 'zustand';
import { syncLocalMusicInBackground, ScannedTrack } from '../services/musicScannerService';
import { getSongsFromDB, initDatabase } from '../database/database';

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
      // 1. Initialize DB and load cached songs instantly
      initDatabase();
      const cachedTracks = getSongsFromDB();
      if (cachedTracks.length > 0) {
        set({ scannedTracks: cachedTracks });
      }

      // 2. Start background sync
      await syncLocalMusicInBackground((newTrack) => {
        // As new tracks are processed or updated, we add/replace them in state
        set((state) => {
          const exists = state.scannedTracks.some(t => t.id === newTrack.id);
          if (exists) {
            return {
              scannedTracks: state.scannedTracks.map(t => t.id === newTrack.id ? newTrack : t)
            };
          }
          return {
            scannedTracks: [...state.scannedTracks, newTrack]
          };
        });
      });
      
      // 3. Final sync check (optional, but ensures state matches db exactly)
      const finalTracks = getSongsFromDB();
      set({ scannedTracks: finalTracks });
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
