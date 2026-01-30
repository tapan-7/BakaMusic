import React, {
  createContext,
  useContext,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { AudioStatus } from 'expo-audio';
import { Track } from '../services/MusicService';
import {
  setPlaybackCallback,
  pauseTrack,
  resumeTrack,
  playTrack,
  seekToPosition,
} from '../services/PlayerService';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  setTrack,
  setPlaying,
  updateProgress,
  startSeeking as startSeekingAction,
  finishSeeking as finishSeekingAction,
} from '../store/playerSlice';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  playNewTrack: (track: Track) => Promise<void>;
  togglePlayback: () => Promise<void>;
  startSeeking: () => void;
  stopSeeking: (position: number) => Promise<void>;
  isSeeking: boolean;
}

interface PlayerProgressContextType {
  position: number;
  duration: number;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);
const PlayerProgressContext = createContext<
  PlayerProgressContextType | undefined
>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch();
  const { currentTrack, isPlaying, position, duration, isSeeking } =
    useSelector((state: RootState) => state.player);

  useEffect(() => {
    const playbackCallback = (status: AudioStatus) => {
      if (status.isLoaded) {
        // Update progress with current time and duration
        dispatch(
          updateProgress({
            position: status.currentTime,
            duration: status.duration || 0,
          }),
        );
        dispatch(setPlaying(status.playing));
      } else {
        dispatch(setPlaying(false));
        dispatch(updateProgress({ position: 0, duration: 0 }));
      }
    };

    setPlaybackCallback(playbackCallback);

    return () => {
      setPlaybackCallback(() => {});
    };
  }, [dispatch]);

  const playNewTrack = useCallback(
    async (track: Track) => {
      dispatch(setTrack(track));
      await playTrack(track);
    },
    [dispatch],
  );

  const togglePlayback = useCallback(async () => {
    if (isPlaying) {
      await pauseTrack();
    } else {
      await resumeTrack();
    }
  }, [isPlaying]);

  const startSeeking = useCallback(() => {
    dispatch(startSeekingAction());
  }, [dispatch]);

  const stopSeeking = useCallback(
    async (newPosition: number) => {
      // Update the position in the store immediately to prevent UI flickering
      // We'll use the current duration from the state
      dispatch(updateProgress({ position: newPosition, duration }));
      await seekToPosition(newPosition);
      // Finish seeking after the seek operation completes
      dispatch(finishSeekingAction(newPosition));
    },
    [dispatch, duration],
  );

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        playNewTrack,
        togglePlayback,
        startSeeking,
        stopSeeking,
        isSeeking,
      }}
    >
      <PlayerProgressContext.Provider value={{ position, duration }}>
        {children}
      </PlayerProgressContext.Provider>
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

export const usePlayerProgress = () => {
  const context = useContext(PlayerProgressContext);
  if (!context) {
    throw new Error('usePlayerProgress must be used within a PlayerProvider');
  }
  return context;
};
