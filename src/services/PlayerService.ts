import { Audio, AVPlaybackStatus } from 'expo-av';
import { Track } from './MusicService';

let currentSound: Audio.Sound | null = null;
let playbackCallback: ((status: AVPlaybackStatus) => void) | null = null;

export const setupPlayer = async () => {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });
    return true;
  } catch (error) {
    console.error('Error setting up audio:', error);
    return false;
  }
};

export const playTrack = async (track: Track) => {
  try {
    // Unload previous sound if exists
    if (currentSound) {
      await currentSound.unloadAsync();
      currentSound = null;
    }

    // Create and load new sound
    const { sound } = await Audio.Sound.createAsync(
      { uri: track.url },
      { shouldPlay: true },
      onPlaybackStatusUpdate
    );

    currentSound = sound;
    await sound.playAsync();
  } catch (error) {
    console.error('Error playing track:', error);
  }
};

export const pauseTrack = async () => {
  try {
    if (currentSound) {
      await currentSound.pauseAsync();
    }
  } catch (error) {
    console.error('Error pausing track:', error);
  }
};

export const resumeTrack = async () => {
  try {
    if (currentSound) {
      await currentSound.playAsync();
    }
  } catch (error) {
    console.error('Error resuming track:', error);
  }
};

export const stopTrack = async () => {
  try {
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
      currentSound = null;
    }
  } catch (error) {
    console.error('Error stopping track:', error);
  }
};

export const getCurrentTrackPosition = async () => {
  try {
    if (currentSound) {
      const status = await currentSound.getStatusAsync();
      if (status.isLoaded) {
        return {
          position: status.positionMillis / 1000,
          duration: status.durationMillis ? status.durationMillis / 1000 : 0,
          isPlaying: status.isPlaying,
        };
      }
    }
    return {
      position: 0,
      duration: 0,
      isPlaying: false,
    };
  } catch (error) {
    console.error('Error getting track position:', error);
    return {
      position: 0,
      duration: 0,
      isPlaying: false,
    };
  }
};

export const seekToPosition = async (positionSec: number) => {
  try {
    if (currentSound) {
      await currentSound.setPositionAsync(positionSec * 1000);
    }
  } catch (error) {
    console.error('Error seeking to position:', error);
  }
};

const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
  if (playbackCallback) {
    playbackCallback(status);
  }

  if (status.isLoaded) {
    if (status.didJustFinish) {
      console.log('Track finished playing');
      // You can implement queue logic here
    }
  } else if (status.error) {
    console.error('Playback error:', status.error);
  }
};

// Set callback for playback updates
export const setPlaybackCallback = (callback: (status: AVPlaybackStatus) => void) => {
  playbackCallback = callback;
};

// Cleanup function
export const cleanupPlayer = async () => {
  if (currentSound) {
    await currentSound.unloadAsync();
    currentSound = null;
  }
  playbackCallback = null;
};
