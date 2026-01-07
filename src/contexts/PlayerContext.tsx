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
import {playerManager} from '../services/PlayerManager';

interface PlayerContextType {
  currentTrack: Track | null;
  setCurrentTrack: (track: Track | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  position: number;
  duration: number;
  playNewTrack: (track: Track) => Promise<void>;
  togglePlayback: () => Promise<void>;
  seek: (position: number) => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

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
    const status = await getCurrentTrackPosition();
    if (status.isPlaying) {
      await pauseTrack();
    } else {
      await resumeTrack();
    }
  }, []);

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
        setCurrentTrack: playNewTrack,
        isPlaying,
        setIsPlaying,
        position,
        duration,
        playNewTrack,
        togglePlayback,
        seek,
      }}>
      {children}
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