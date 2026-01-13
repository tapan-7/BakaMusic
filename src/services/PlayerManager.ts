import { createAudioPlayer, AudioPlayer, AudioStatus, setAudioModeAsync } from 'expo-audio';
import { Track } from '../services/MusicService';

class PlayerManager {
  private currentSound: AudioPlayer | null = null;
  private currentTrackId: string | null = null;
  private playbackCallback: ((status: AudioStatus) => void) | null = null;
  private onTrackFinishCallback: (() => void) | null = null;
  private isInitialized = false;
  private isPlayingTrack = false; // Flag to prevent race conditions

  async initialize() {
    if (!this.isInitialized) {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'duckOthers',
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
        if (this.currentSound.currentStatus.isLoaded) {
          if (!this.currentSound.playing) {
            // Track is loaded but paused, so play it
            this.currentSound.play();
          }
          // If it's already playing, do nothing
          return;
        }
      }

      // If a different track is currently playing, remove it first
      if (this.currentSound && this.currentTrackId !== track.id) {
        try {
          this.currentSound.pause();
          this.currentSound.remove();
        } catch (unloadError) {
          console.error('Error unloading previous track:', unloadError);
        }
        this.currentSound = null;
        this.currentTrackId = null;
      }

      // Create and load new sound
      const player = createAudioPlayer(track.url);
      
      player.addListener('playbackStatusUpdate', (status: AudioStatus) => {
        this.onPlaybackStatusUpdate(status);
      });

      player.play();

      this.currentSound = player;
      this.currentTrackId = track.id;
    } catch (error) {
      console.error('Error playing track:', error);
    } finally {
      this.isPlayingTrack = false;
    }
  }

  async pauseTrack() {
    try {
      if (this.currentSound) {
        this.currentSound.pause();
      }
    } catch (error) {
      console.error('Error pausing track:', error);
    }
  }

  async resumeTrack() {
    try {
      if (this.currentSound) {
        this.currentSound.play();
      }
    } catch (error) {
      console.error('Error resuming track:', error);
    }
  }

  async stopTrack() {
    try {
      if (this.currentSound) {
        this.currentSound.pause();
        this.currentSound.remove();
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
        const { currentTime, duration, playing, isLoaded } = this.currentSound.currentStatus;
        if (isLoaded) {
          return {
            position: currentTime,
            duration: duration || 0,
            isPlaying: playing,
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
          this.currentSound.remove();
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
        await this.currentSound.seekTo(positionSec);
      }
    } catch (error) {
      console.error('Error seeking to position:', error);
    }
  }

  setOnTrackFinishCallback(callback: () => void) {
    this.onTrackFinishCallback = callback;
  }

  private onPlaybackStatusUpdate(status: AudioStatus) {
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
    }
  }

  setPlaybackCallback(callback: (status: AudioStatus) => void) {
    this.playbackCallback = callback;
  }

  async cleanup() {
    if (this.currentSound) {
      try {
        this.currentSound.pause();
        this.currentSound.remove();
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
      return this.currentSound.playing;
    } catch (error) {
      console.error('Error checking if track is playing:', error);
      return false;
    }
  }
}

export const playerManager = new PlayerManager();