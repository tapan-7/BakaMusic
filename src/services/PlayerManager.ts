import { Audio, AVPlaybackStatus } from 'expo-av';
import { Track } from '../services/MusicService';

class PlayerManager {
  private currentSound: Audio.Sound | null = null;
  private currentTrackId: string | null = null;
  private playbackCallback: ((status: AVPlaybackStatus) => void) | null = null;
  private onTrackFinishCallback: (() => void) | null = null;
  private isInitialized = false;
  private isPlayingTrack = false; // Flag to prevent race conditions

  async initialize() {
    if (!this.isInitialized) {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
        this.isInitialized = true;
        return true;
      } catch (error) {
        console.error('Error setting up audio:', error);
        return false;
      }
    }
    return true;
  }

  async playTrack(track: Track) {
    // Prevent multiple simultaneous playTrack calls
    if (this.isPlayingTrack) {
      console.log('PlayTrack called while another track is being played, skipping...');
      return;
    }

    this.isPlayingTrack = true;

    try {
      // If this is the same track that's currently playing, just resume
      if (this.currentTrackId === track.id && this.currentSound) {
        const status = await this.currentSound.getStatusAsync();
        if (status.isLoaded) {
          if (!status.isPlaying) {
            // Track is loaded but paused, so play it
            await this.currentSound.playAsync();
          }
          // If it's already playing, do nothing
          return;
        }
      }

      // If a different track is currently playing, unload it first
      if (this.currentSound && this.currentTrackId !== track.id) {
        try {
          await this.currentSound.stopAsync();
          await this.currentSound.unloadAsync();
        } catch (unloadError) {
          console.error('Error unloading previous track:', unloadError);
        }
        this.currentSound = null;
        this.currentTrackId = null;
      }

      // Create and load new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: track.url },
        { shouldPlay: true },
        this.onPlaybackStatusUpdate.bind(this)
      );

      this.currentSound = sound;
      this.currentTrackId = track.id;
      // Don't call playAsync again since shouldPlay: true is already set above
    } catch (error) {
      console.error('Error playing track:', error);
    } finally {
      this.isPlayingTrack = false;
    }
  }

  async pauseTrack() {
    try {
      if (this.currentSound) {
        await this.currentSound.pauseAsync();
      }
    } catch (error) {
      console.error('Error pausing track:', error);
    }
  }

  async resumeTrack() {
    try {
      if (this.currentSound) {
        await this.currentSound.playAsync();
      }
    } catch (error) {
      console.error('Error resuming track:', error);
    }
  }

  async stopTrack() {
    try {
      if (this.currentSound) {
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
        this.currentSound = null;
        this.currentTrackId = null;
      }
    } catch (error) {
      console.error('Error stopping track:', error);
      // Even if there's an error, clear the references
      this.currentSound = null;
      this.currentTrackId = null;
    } finally {
      this.isPlayingTrack = false; // Ensure the flag is reset
    }
  }

  async getCurrentTrackPosition() {
    try {
      if (this.currentSound) {
        const status = await this.currentSound.getStatusAsync();
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
      // Reset current sound if there's an error
      if (this.currentSound) {
        try {
          await this.currentSound.unloadAsync();
        } catch (unloadError) {
          console.error('Error unloading sound after error:', unloadError);
        }
        this.currentSound = null;
        this.currentTrackId = null;
      }
      return {
        position: 0,
        duration: 0,
        isPlaying: false,
      };
    }
  }

  async seekToPosition(positionSec: number) {
    try {
      if (this.currentSound) {
        await this.currentSound.setPositionAsync(positionSec * 1000);
      }
    } catch (error) {
      console.error('Error seeking to position:', error);
    }
  }

  setOnTrackFinishCallback(callback: () => void) {
    this.onTrackFinishCallback = callback;
  }

  private onPlaybackStatusUpdate(status: AVPlaybackStatus) {
    if (this.playbackCallback) {
      this.playbackCallback(status);
    }

    if (status.isLoaded) {
      if (status.didJustFinish) {
        console.log('Track finished playing');
        // Clear the current sound reference when track finishes
        this.currentSound = null;
        this.currentTrackId = null;
        // Call the callback when track finishes
        if (this.onTrackFinishCallback) {
          this.onTrackFinishCallback();
        }
      }
    } else if (status.error) {
      console.error('Playback error:', status.error);
      // Clear the current sound reference on error
      this.currentSound = null;
      this.currentTrackId = null;
    }
  }

  setPlaybackCallback(callback: (status: AVPlaybackStatus) => void) {
    this.playbackCallback = callback;
  }

  async cleanup() {
    if (this.currentSound) {
      try {
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
      this.currentSound = null;
    }
    this.currentTrackId = null;
    this.playbackCallback = null;
    this.onTrackFinishCallback = null;
    this.isPlayingTrack = false; // Reset the flag during cleanup
  }

  getCurrentTrackId() {
    return this.currentTrackId;
  }

  async isPlaying() {
    if (!this.currentSound) {
      return false;
    }

    try {
      const status = await this.currentSound.getStatusAsync();
      return status.isLoaded && status.isPlaying;
    } catch (error) {
      console.error('Error checking if track is playing:', error);
      return false;
    }
  }
}

export const playerManager = new PlayerManager();