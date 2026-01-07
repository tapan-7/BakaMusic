import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Image,
  StyleSheet,
  PanResponder,
  Dimensions,
  StatusBar,
} from 'react-native';
import { ThemedView } from '../components/atoms/ThemedView';
import { ThemedText } from '../components/atoms/ThemedText';
import { ProgressBar } from '../components/atoms/ProgressBar';
import { Button } from '../components/atoms/Button';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  playTrack,
  setupPlayer,
  setOnTrackFinishCallback,
} from '../services/PlayerService';
import { useTheme } from '../core/theme/useTheme';
import { getAllTracks, Track } from '../services/MusicService';
import { usePlayer, usePlayerProgress } from '../contexts/PlayerContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

export const PlayerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { track: trackFromParams } = route.params || {};
  const {
    currentTrack: track,
    playNewTrack,
    isPlaying,
    togglePlayback,
    seek,
  } = usePlayer();
  const { position, duration } = usePlayerProgress();
  const { colors } = useTheme();
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');

  useEffect(() => {
    const init = async () => {
      await setupPlayer();
      const tracks = await getAllTracks();
      setAllTracks(tracks);
    };
    init();
  }, []);

  useEffect(() => {
    if (track) {
      const index = allTracks.findIndex(t => t.id === track.id);
      setCurrentTrackIndex(index !== -1 ? index : 0);
    }
  }, [track, allTracks]);

  useEffect(() => {
    if (trackFromParams && trackFromParams.id !== track?.id) {
      playNewTrack(trackFromParams);
    }
  }, [trackFromParams, track, playNewTrack]);

  const handleNext = useCallback(async () => {
    if (allTracks.length > 0) {
      const nextIndex =
        currentTrackIndex < allTracks.length - 1 ? currentTrackIndex + 1 : 0;
      const nextTrack = allTracks[nextIndex];
      playNewTrack(nextTrack);
    }
  }, [allTracks, currentTrackIndex, playNewTrack]);

  // Effect for track finish callback
  useEffect(() => {
    setOnTrackFinishCallback(() => {
      if (repeatMode === 'one') {
        if (track) {
          playTrack(track);
        }
      } else {
        handleNext();
      }
    });
  }, [repeatMode, track, handleNext]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt, gestureState) => {
      setIsSeeking(true);
      updateSeekPosition(gestureState.x0);
    },
    onPanResponderMove: (evt, gestureState) => {
      updateSeekPosition(gestureState.moveX);
    },
    onPanResponderRelease: () => {
      if (duration > 0) {
        const newPosition = seekPosition * duration;
        seek(newPosition);
      }
      setIsSeeking(false);
    },
  });

  const updateSeekPosition = (x: number) => {
    const progress = Math.max(0, Math.min(1, x / width));
    setSeekPosition(progress);
  };

  const handlePrev = useCallback(async () => {
    if (allTracks.length > 0) {
      const prevIndex =
        currentTrackIndex > 0 ? currentTrackIndex - 1 : allTracks.length - 1;
      const prevTrack = allTracks[prevIndex];
      playNewTrack(prevTrack);
    }
  }, [allTracks, currentTrackIndex, playNewTrack]);

  if (!track) return null;

  const displayPosition = isSeeking ? seekPosition * duration : position;
  const displayProgress = duration > 0 ? displayPosition / duration : 0;

  return (
    <ThemedView variant="surface" style={styles.container}>
      <Button
        title={<Icon name="arrow-back" size={20} />}
        variant="ghost"
        onPress={() => navigation.goBack()}
        style={{
          alignSelf: 'flex-start',
          padding: 8,
          position: 'absolute',
          top: StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 50,
          left: 24,
          zIndex: 10,
        }}
      />
      <View
        style={[
          styles.artworkContainer,
          { backgroundColor: colors.surfaceHighlight },
        ]}
      >
        {track.artwork ? (
          <Image source={{ uri: track.artwork }} style={styles.artwork} />
        ) : (
          <View style={styles.placeholder}>
            <ThemedText variant="header" color="muted">
              ♪
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <ThemedText variant="header" style={styles.title} numberOfLines={1}>
          {track.title}
        </ThemedText>
        <ThemedText variant="subheader" color="muted" numberOfLines={1}>
          {track.artist}
        </ThemedText>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarContainer} {...panResponder.panHandlers}>
          <ProgressBar progress={displayProgress} isSeeking={isSeeking} />
        </View>
        <View style={styles.timeContainer}>
          <ThemedText variant="caption">
            {formatTime(displayPosition)}
          </ThemedText>
          <ThemedText variant="caption">{formatTime(duration)}</ThemedText>
        </View>
      </View>

      <View style={styles.controls}>
        <Button
          title={
            repeatMode === 'off' ? (
              <Icon name="repeat" size={20} />
            ) : repeatMode === 'one' ? (
              <Icon name="repeat-one" size={20} />
            ) : (
              <Icon name="repeat" size={20} />
            )
          }
          variant="ghost"
          onPress={() => {
            if (repeatMode === 'off') {
              setRepeatMode('one');
            } else if (repeatMode === 'one') {
              setRepeatMode('all');
            } else {
              setRepeatMode('off');
            }
          }}
        />
        <Button
          title={<Icon name="skip-previous" size={20} />}
          variant="ghost"
          onPress={handlePrev}
        />
        <Button
          title={
            isPlaying ? (
              <Icon name="pause" size={20} color={'#fff'} />
            ) : (
              <Icon name="play-arrow" size={20} color={'#fff'} />
            )
          }
          variant="primary"
          style={styles.playButton}
          onPress={togglePlayback}
        />
        <Button
          title={<Icon name="skip-next" size={20} />}
          variant="ghost"
          onPress={handleNext}
        />
        <Button
          title={<Icon name="shuffle" size={20} />}
          variant="ghost"
          onPress={() => {}}
        />
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  artworkContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
    marginBottom: 32,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    overflow: 'hidden',
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
    marginBottom: 8,
  },
  progressContainer: {
    marginBottom: 48,
  },
  progressBarContainer: {
    width: '100%',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    paddingHorizontal: 0,
  },
});
