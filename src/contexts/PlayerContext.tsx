import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { AudioStatus } from 'expo-audio';
import { Track } from '../services/MusicService';
import {
  setPlaybackCallback,
  pauseTrack,
  resumeTrack,
  playTrack,
  getCurrentTrackPosition,
  seekToPosition,
} from '../services/PlayerService';

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
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    const playbackCallback = (status: AudioStatus) => {
      if (status.isLoaded) {
        setIsPlaying(status.playing);
        if (!isSeeking) {
          setPosition(status.currentTime);
        }
        setDuration(status.duration || 0);
      } else {
        setIsPlaying(false);
        setPosition(0);
        setDuration(0);
      }
    };

    setPlaybackCallback(playbackCallback);

    return () => {
      setPlaybackCallback(() => {});
    };
  }, [isSeeking]);

  const playNewTrack = useCallback(async (track: Track) => {
    setCurrentTrack(track);
    await playTrack(track);
  }, []);

  const togglePlayback = useCallback(async () => {
    if (isPlaying) {
      await pauseTrack();
    } else {
      await resumeTrack();
    }
  }, [isPlaying]);

  const startSeeking = useCallback(() => {
    setIsSeeking(true);
  }, []);

  const stopSeeking = useCallback(async (newPosition: number) => {
    await seekToPosition(newPosition);
    setIsSeeking(false);
    const status = await getCurrentTrackPosition();
    setPosition(status.position);
  }, []);

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
