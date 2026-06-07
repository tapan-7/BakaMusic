import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Track = {
  id: string;
  url: string;
  title: string;
  artist: string;
  artwork: string;
  duration?: number;
};

export type RepeatMode = 'off' | 'track' | 'queue';

type PlayerState = {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  queue: Track[];
  isExpanded: boolean;
  
  // Playback control states
  isShuffle: boolean;
  repeatMode: RepeatMode;
  favorites: string[]; // array of track IDs
  
  // UI states
  isTabBarVisible: boolean;
  
  setTrack: (track: Track) => void;
  setPlaying: (val: boolean) => void;
  setProgress: (val: number) => void;
  setDuration: (val: number) => void;
  setQueue: (tracks: Track[]) => void;
  setIsExpanded: (val: boolean) => void;
  
  setIsShuffle: (val: boolean) => void;
  setRepeatMode: (val: RepeatMode) => void;
  toggleFavorite: (trackId: string) => void;
  setIsTabBarVisible: (val: boolean) => void;
  
  reset: () => void;
};

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      isPlaying: false,
      progress: 0,
      duration: 0,
      queue: [],
      isExpanded: false,
      
      isShuffle: false,
      repeatMode: 'off',
      favorites: [],
      
      isTabBarVisible: true,

      setTrack: (track) => set({ currentTrack: track }),
      setPlaying: (val) => set({ isPlaying: val }),
      setProgress: (val) => set({ progress: val }),
      setDuration: (val) => set({ duration: val }),
      setQueue: (tracks) => set({ queue: tracks }),
      setIsExpanded: (val) => set({ isExpanded: val }),
      
      setIsShuffle: (val) => set({ isShuffle: val }),
      setRepeatMode: (val) => set({ repeatMode: val }),
      toggleFavorite: (trackId) => {
        const { favorites } = get();
        if (favorites.includes(trackId)) {
          set({ favorites: favorites.filter(id => id !== trackId) });
        } else {
          set({ favorites: [...favorites, trackId] });
        }
      },
      setIsTabBarVisible: (val) => set({ isTabBarVisible: val }),
      
      reset: () => set({ currentTrack: null, isPlaying: false, progress: 0 }),
    }),
    {
      name: 'player-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentTrack: state.currentTrack,
        progress: state.progress,
        queue: state.queue,
        isShuffle: state.isShuffle,
        repeatMode: state.repeatMode,
        favorites: state.favorites,
      }),
    }
  )
);
