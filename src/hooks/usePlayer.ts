import { useEffect } from 'react';
import TrackPlayer, { 
  useProgress, 
  useTrackPlayerEvents, 
  Event, 
  State 
} from 'react-native-track-player';
import { usePlayerStore, Track } from '../store/playerStore';
import { useMusicStore } from '../store/useMusicStore';

export const usePlayer = () => {
  const { setProgress, setDuration, setPlaying, setTrack, currentTrack } = usePlayerStore();
  const progress = useProgress();

  useEffect(() => {
    if (progress.position > 0) {
      setProgress(progress.position);
    }
    if (progress.duration > 0) {
      setDuration(progress.duration);
    }
  }, [progress.position, progress.duration]);

  useTrackPlayerEvents([Event.PlaybackState, Event.PlaybackActiveTrackChanged], async (event) => {
    if (event.type === Event.PlaybackState) {
      setPlaying(event.state === State.Playing);
    }
    if (event.type === Event.PlaybackActiveTrackChanged) {
        const track = event.track as Track;
        if (track) {
            setTrack(track);
        }
    }
  });

  const playTrack = async (track: Track) => {
    const { scannedTracks } = useMusicStore.getState();
    const startIndex = scannedTracks.findIndex((t: any) => t.id === track.id);
    
    // Instantly reset and play the clicked track
    await TrackPlayer.reset();
    await TrackPlayer.add([track]);
    await TrackPlayer.play();
    
    // If there are more tracks, load them in the background so we don't freeze the UI
    if (startIndex !== -1 && scannedTracks.length > 1) {
      setTimeout(async () => {
        try {
          // Load the next 50 tracks to keep the bridge fast
          const nextTracks = scannedTracks.slice(startIndex + 1, startIndex + 51);
          if (nextTracks.length > 0) {
            await TrackPlayer.add(nextTracks);
          }
        } catch (error) {
          console.error("Error queueing background tracks:", error);
        }
      }, 300);
    }
  };

  const togglePlayback = async () => {
    const state = await TrackPlayer.getPlaybackState();
    if (state.state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  return { playTrack, togglePlayback };
};
