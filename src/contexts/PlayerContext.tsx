import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import {AVPlaybackStatus} from 'expo-av';
import {Track} from '../services/MusicService';
import {
  setPlaybackCallback,
  pauseTrack,
  resumeTrack,
  playTrack,
  getCurrentTrackPosition,
  seekToPosition,
} from '../services/PlayerService';

// Context for player controls and stable state
interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  playNewTrack: (track: Track) => Promise<void>;
  togglePlayback: () => Promise<void>;
  seek: (position: number) => Promise<void>;
}

// Context for frequently updating progress
interface PlayerProgressContextType {
  position: number;
  duration: number;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);
const PlayerProgressContext = createContext<PlayerProgressContextType | undefined>(
  undefined,
);

export const PlayerProvider = ({children}: {children: ReactNode}) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const playbackCallback = (status: AVPlaybackStatus) => {
      if (status.isLoaded) {
        setIsPlaying(status.isPlaying);
        setPosition(status.positionMillis / 1000);
        setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
      } else {
        if (status.error) {
          console.error('Playback error:', status.error);
        }
        setIsPlaying(false);
        setPosition(0);
        setDuration(0);
      }
    };

    setPlaybackCallback(playbackCallback);

    return () => {
      setPlaybackCallback(() => {});
    };
  }, []);

  const playNewTrack = useCallback(async (track: Track) => {
    setCurrentTrack(track);
    await playTrack(track);
  }, []);

  const togglePlayback = useCallback(async () => {
    // No need to fetch status, as the callback keeps it in sync
    if (isPlaying) {
      await pauseTrack();
    } else {
      await resumeTrack();
    }
  }, [isPlaying]);

  const seek = useCallback(
    async (newPosition: number) => {
      await seekToPosition(newPosition);
    },
    [],
  );

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        playNewTrack,
        togglePlayback,
        seek,
      }}>
      <PlayerProgressContext.Provider value={{position, duration}}>
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