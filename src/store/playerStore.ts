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

type PlayerState = {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  queue: Track[];
  isExpanded: boolean;
  
  setTrack: (track: Track) => void;
  setPlaying: (val: boolean) => void;
  setProgress: (val: number) => void;
  setDuration: (val: number) => void;
  setQueue: (tracks: Track[]) => void;
  setIsExpanded: (val: boolean) => void;
  reset: () => void;
};

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      currentTrack: null,
      isPlaying: false,
      progress: 0,
      duration: 0,
      queue: [],
      isExpanded: false,

      setTrack: (track) => set({ currentTrack: track }),
      setPlaying: (val) => set({ isPlaying: val }),
      setProgress: (val) => set({ progress: val }),
      setDuration: (val) => set({ duration: val }),
      setQueue: (tracks) => set({ queue: tracks }),
      setIsExpanded: (val) => set({ isExpanded: val }),
      reset: () => set({ currentTrack: null, isPlaying: false, progress: 0 }),
    }),
    {
      name: 'player-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentTrack: state.currentTrack,
        progress: state.progress,
        queue: state.queue,
      }),
    }
  )
);
