import { useState, useEffect, useCallback } from 'react';
import { AVPlaybackStatus } from 'expo-av';
import {
  getCurrentTrackPosition,
  setPlaybackCallback,
  pauseTrack,
  resumeTrack,
} from '../services/PlayerService';
import { usePlayer } from '../contexts/PlayerContext';

export const usePlayback = () => {
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const { setIsPlaying: setContextIsPlaying } = usePlayer();

  useEffect(() => {
    const playbackCallback = (status: AVPlaybackStatus) => {
      if (status.isLoaded) {
        const newPosition = status.positionMillis / 1000;
        const newDuration = status.durationMillis
          ? status.durationMillis / 1000
          : 0;
        const newIsPlaying = status.isPlaying;

        setPosition(newPosition);
        setDuration(newDuration);
        setIsPlaying(newIsPlaying);
        setContextIsPlaying(newIsPlaying);
      } else {
        // Reset state if not loaded
        setPosition(0);
        setDuration(0);
        setIsPlaying(false);
        setContextIsPlaying(false);
        if (status.error) {
          console.error(`Playback Error: ${status.error}`);
        }
      }
    };

    setPlaybackCallback(playbackCallback);

    return () => {
      setPlaybackCallback(() => {});
    };
  }, [setContextIsPlaying]);

  const togglePlayback = useCallback(async () => {
    const status = await getCurrentTrackPosition();
    if (status.isPlaying) {
      await pauseTrack();
    } else {
      await resumeTrack();
    }
  }, []);

  return {
    position,
    duration,
    isPlaying,
    togglePlayback,
  };
};