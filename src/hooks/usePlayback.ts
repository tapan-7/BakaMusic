import { useState, useEffect } from 'react';
import { AVPlaybackStatus } from 'expo-av';
import { 
  getCurrentTrackPosition, 
  setPlaybackCallback, 
  cleanupPlayer,
  pauseTrack,
  resumeTrack
} from '../services/PlayerService';

export const usePlayback = () => {
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Set up the playback callback to update state
    const playbackCallback = (status: AVPlaybackStatus) => {
      if (status.isLoaded) {
        setPosition(status.positionMillis / 1000);
        setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
        setIsPlaying(status.isPlaying);
      } else if (status.error) {
        console.error('Playback error:', status.error);
      }
    };

    setPlaybackCallback(playbackCallback);

    // Update position periodically when not playing
    const interval = setInterval(async () => {
      const pos = await getCurrentTrackPosition();
      setPosition(pos.position);
      setDuration(pos.duration);
      setIsPlaying(pos.isPlaying);
    }, 1000);

    return () => {
      clearInterval(interval);
      setPlaybackCallback(() => {});
    };
  }, []);

  const togglePlayback = async () => {
    if (isPlaying) {
      await pauseTrack();
    } else {
      await resumeTrack();
    }
  };

  return {
    position,
    duration,
    isPlaying,
    togglePlayback,
  };
};