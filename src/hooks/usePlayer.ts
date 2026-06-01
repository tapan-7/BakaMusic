import { useEffect } from 'react';
import TrackPlayer, { 
  useProgress, 
  useTrackPlayerEvents, 
  Event, 
  State 
} from 'react-native-track-player';
import { usePlayerStore, Track } from '../store/playerStore';

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
    await TrackPlayer.reset();
    await TrackPlayer.add([track]);
    await TrackPlayer.play();
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
