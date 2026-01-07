import React, {useEffect, useState, useCallback} from 'react';
import {
  FlatList,
  View,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Image,
  TouchableOpacity,
} from 'react-native';
import {ThemedView} from '../components/atoms/ThemedView';
import {ThemedText} from '../components/atoms/ThemedText';
import {Button} from '../components/atoms/Button';
import {TrackListItem} from '../components/molecules/TrackListItem';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../core/theme/useTheme';
import {requestMusicPermission} from '../services/PermissionService';
import {getTracks, rescanLibrary, Track} from '../services/MusicService';
import {SafeAreaView} from 'react-native-safe-area-context';
import {check, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {usePlayer} from '../contexts/PlayerContext';
import {setupPlayer} from '../services/PlayerService';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PAGE_SIZE = 20;

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const {toggleTheme, colors} = useTheme();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [totalTracks, setTotalTracks] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isRescanning, setIsRescanning] = useState(false);

  const {
    currentTrack: playingTrack,
    playNewTrack,
    isPlaying: isCurrentlyPlaying,
    togglePlayback,
  } = usePlayer();

  useEffect(() => {
    const initialize = async () => {
      await setupPlayer();
      await handlePermissionRequest(true); // Check permission on initial load
    };
    initialize();
  }, []);

  const loadMusic = async (forceRescan = false) => {
    if (!permissionGranted) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const {tracks: initialTracks, total} = await getTracks({
      limit: PAGE_SIZE,
      offset: 0,
      forceRescan,
    });
    setTracks(initialTracks);
    setTotalTracks(total);
    setPage(1);
    setLoading(false);
  };

  const handleLoadMore = async () => {
    if (loadingMore || tracks.length >= totalTracks) {
      return;
    }
    setLoadingMore(true);
    const {tracks: newTracks} = await getTracks({
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    });
    setTracks(prevTracks => [...prevTracks, ...newTracks]);
    setPage(prevPage => prevPage + 1);
    setLoadingMore(false);
  };

  const handlePermissionRequest = async (isInitialLoad = false) => {
    const hasPermission = await requestMusicPermission();
    setPermissionGranted(hasPermission);

    if (hasPermission) {
      loadMusic();
    } else if (!isInitialLoad) {
      const permission =
        Platform.OS === 'android'
          ? Number(Platform.Version) >= 33
            ? PERMISSIONS.ANDROID.READ_MEDIA_AUDIO
            : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
          : PERMISSIONS.IOS.MEDIA_LIBRARY;
      const status = await check(permission);
      if (status === RESULTS.BLOCKED) {
        Alert.alert(
          'Permission Required',
          'Baka Music needs access to your music library. Please enable it in Settings.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Go to Settings', onPress: () => Linking.openSettings()},
          ],
        );
      }
    }
    if (isInitialLoad && !hasPermission) {
      setLoading(false);
    }
  };

  const handleRescan = async () => {
    setIsRescanning(true);
    await rescanLibrary();
    await loadMusic(true);
    setIsRescanning(false);
  };

  const renderItem = useCallback(
    ({item}: {item: Track}) => (
      <TrackListItem
        track={item}
        onPress={() => {
          playNewTrack(item);
          navigation.navigate('Player');
        }}
      />
    ),
    [playNewTrack, navigation],
  );

  const MiniPlayer = () => {
    if (!playingTrack) return null;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('Player')}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}>
        {playingTrack.artwork ? (
          <Image
            source={{uri: playingTrack.artwork}}
            style={{width: 50, height: 50, borderRadius: 8, marginRight: 12}}
          />
        ) : (
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 8,
              marginRight: 12,
              backgroundColor: colors.surfaceHighlight,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <ThemedText variant="header" color="muted">
              ♪
            </ThemedText>
          </View>
        )}
        <View style={{flex: 1, marginRight: 12}}>
          <ThemedText variant="caption" numberOfLines={1}>
            {playingTrack.title}
          </ThemedText>
          <ThemedText variant="caption" color="muted" numberOfLines={1}>
            {playingTrack.artist}
          </ThemedText>
        </View>
        <Button
          title={
            isCurrentlyPlaying ? (
              <Icon name="pause-circle" size={20} />
            ) : (
              <Icon name="play-circle-outline" size={20} />
            )
          }
          variant="ghost"
          onPress={togglePlayback}
          
        />
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={{flex: 1}}>
      <SafeAreaView style={{flex: 1}} edges={['top']}>
        <View
          style={{
            paddingHorizontal: 24,
            paddingVertical: 24,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View>
              <ThemedText variant="header" style={{marginBottom: 4}}>
                My Library
              </ThemedText>
              <ThemedText variant="caption" color="muted">
                {loading || isRescanning
                  ? 'Scanning...'
                  : `${totalTracks} tracks`}
              </ThemedText>
            </View>
            <View style={{flexDirection: 'row', gap: -10}}>
              {/* <Button
                title={<Icon name={'refresh'} size={20} />}
                variant="ghost"
                onPress={handleRescan}
                disabled={isRescanning}
                style={{padding: 12, borderRadius: 50}}
              /> */}
              <Button
                title={<Icon name={'contrast'} size={20} />}
                variant="ghost"
                onPress={toggleTheme}
                style={{padding: 12, borderRadius: 50}}
              />
            </View>
          </View>
        </View>

        {loading || isRescanning ? (
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <ActivityIndicator color={colors.primary} size="large" />
            <ThemedText style={{marginTop: 16}} color="muted">
              {isRescanning ? 'Rescanning library...' : 'Finding your music...'}
            </ThemedText>
          </View>
        ) : !permissionGranted ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 32,
            }}>
            <ThemedText
              style={{textAlign: 'center', marginBottom: 16}}
              color="muted">
              We need permission to access your audio files to play them.
            </ThemedText>
            <Button
              title="Grant Permission"
              onPress={() => handlePermissionRequest()}
            />
          </View>
        ) : (
          <FlatList
            data={tracks}
            renderItem={renderItem}
            keyExtractor={(item, index) => item.id + index}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            contentContainerStyle={{paddingBottom: 100}}
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator
                  style={{marginVertical: 20}}
                  color={colors.primary}
                />
              ) : null
            }
            ListEmptyComponent={
              <View style={{padding: 40, alignItems: 'center'}}>
                <ThemedText color="muted">
                  No music found on this device.
                </ThemedText>
                <Button
                  title="Scan Again"
                  variant="ghost"
                  onPress={handleRescan}
                  style={{marginTop: 20}}
                />
              </View>
            }
          />
        )}
        <MiniPlayer />
      </SafeAreaView>
    </ThemedView>
  );
};
