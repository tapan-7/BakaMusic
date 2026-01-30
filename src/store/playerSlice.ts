import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Track } from '../services/MusicService';

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  isSeeking: boolean;
  lastSeekTime: number; // Timestamp of the last seek operation
}

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  isSeeking: false,
  lastSeekTime: 0,
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setTrack: (state, action: PayloadAction<Track | null>) => {
      state.currentTrack = action.payload;
    },
    setPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
    },
    updateProgress: (
      state,
      action: PayloadAction<{ position: number; duration: number }>,
    ) => {
      // Only update position if not seeking and not recently finished seeking (within 500ms)
      // This prevents the progress bar from jumping back during/after seeking
      const now = Date.now();
      if (!state.isSeeking && now - state.lastSeekTime > 500) {
        state.position = action.payload.position;
      }
      // Only update duration if it's a valid value (> 0) and not during seeking
      // This prevents the duration display from flickering to 0 during seeking
      // Allow duration updates when not seeking to handle track changes
      if (action.payload.duration > 0 && !state.isSeeking && now - state.lastSeekTime > 500) {
        state.duration = action.payload.duration;
      }
    },
    startSeeking: state => {
      state.isSeeking = true;
    },
    finishSeeking: (state, action: PayloadAction<number>) => {
      state.isSeeking = false;
      state.position = action.payload;
      state.lastSeekTime = Date.now();
    },
    resetPlayer: state => {
      return initialState;
    },
  },
});

export const {
  setTrack,
  setPlaying,
  updateProgress,
  startSeeking,
  finishSeeking,
  resetPlayer,
} = playerSlice.actions;

export default playerSlice.reducer;
