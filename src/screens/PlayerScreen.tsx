import React, {useEffect} from 'react';
import {View, Image, StyleSheet} from 'react-native';
import {ThemedView} from '../components/atoms/ThemedView';
import {ThemedText} from '../components/atoms/ThemedText';
import {ProgressBar} from '../components/atoms/ProgressBar';
import {Button} from '../components/atoms/Button';
import {useNavigation, useRoute} from '@react-navigation/native';
import {playTrack, setupPlayer} from '../services/PlayerService';
import {useTheme} from '../core/theme/useTheme';
import {usePlayback} from '../hooks/usePlayback';

export const PlayerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const {track} = route.params || {};
  const {position, duration, isPlaying, togglePlayback} = usePlayback();
  const {colors} = useTheme();

  useEffect(() => {
    const init = async () => {
      const isSetup = await setupPlayer();
      if (isSetup && track) {
        await playTrack(track);
      }
    };
    init();
  }, [track]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!track) return null;

  return (
    <ThemedView variant="surface" style={styles.container}>
      <View
        style={[
          styles.artworkContainer,
          {backgroundColor: colors.surfaceHighlight},
        ]}>
        {track.artwork ? (
          <Image source={{uri: track.artwork}} style={styles.artwork} />
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
        <ProgressBar
          progress={
            duration > 0 ? position / duration : 0
          }
        />
        <View style={styles.timeContainer}>
          <ThemedText variant="caption">
            {formatTime(position)}
          </ThemedText>
          <ThemedText variant="caption">
            {formatTime(duration)}
          </ThemedText>
        </View>
      </View>

      <View style={styles.controls}>
        <Button title="Prev" variant="ghost" onPress={() => {}} />
        <Button
          title={isPlaying ? '||' : '▶'}
          variant="primary"
          style={styles.playButton}
          onPress={togglePlayback}
        />
        <Button title="Next" variant="ghost" onPress={() => {}} />
      </View>

      <Button
        title="Back"
        variant="ghost"
        onPress={() => navigation.goBack()}
        style={{marginTop: 40}}
      />
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
    shadowOffset: {width: 0, height: 10},
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
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    paddingHorizontal: 0,
  },
});
