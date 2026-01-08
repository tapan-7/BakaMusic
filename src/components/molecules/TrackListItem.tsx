import React from 'react';
import {View, Image, TouchableHighlight, StyleSheet} from 'react-native';
import {ThemedText} from '../atoms/ThemedText';
import {useTheme} from '../../core/theme/useTheme';
import {Track} from '../../services/MusicService';

interface TrackListItemProps {
  track: Track;
  onPress: () => void;
}

export const TrackListItem: React.FC<TrackListItemProps> = ({
  track,
  onPress,
}) => {
  const {colors, spacing} = useTheme();

  return (
    <TouchableHighlight
      style={[
        styles.container,
        {paddingVertical: spacing.s, paddingHorizontal: spacing.l},
      ]}
      onPress={onPress}
      underlayColor={colors.surfaceHighlight}>
      <View style={styles.touchableContent}>
        <View
          style={[styles.artwork, {backgroundColor: colors.surfaceHighlight}]}>
          {track.artwork ? (
            <Image
              source={{uri: track.url}}
              style={StyleSheet.absoluteFillObject}
            />
          ) : (
            <View
              style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
              <ThemedText variant="caption" color="muted">
                ♪
              </ThemedText>
            </View>
          )}
        </View>
        <View style={styles.info}>
          <ThemedText variant="body" style={styles.title} numberOfLines={1}>
            {track.title}
          </ThemedText>
          <ThemedText variant="caption" color="muted" numberOfLines={1}>
            {track.artist}
          </ThemedText>
        </View>
      </View>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 72,
  },
  touchableContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 16,
    overflow: 'hidden',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '500',
    marginBottom: 4,
  },
});
