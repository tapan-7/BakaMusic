import React, {useEffect, useState} from 'react';
import {FlatList, View, ActivityIndicator, Alert, Linking, Platform} from 'react-native';
import {ThemedView} from '../components/atoms/ThemedView';
import {ThemedText} from '../components/atoms/ThemedText';
import {Button} from '../components/atoms/Button';
import {TrackListItem} from '../components/molecules/TrackListItem';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../core/theme/useTheme';
import {requestMusicPermission} from '../services/PermissionService';
import {getAllTracks, Track} from '../services/MusicService';
import {SafeAreaView} from 'react-native-safe-area-context';
import {check, PERMISSIONS, RESULTS} from 'react-native-permissions';

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const {toggleTheme, colors, isDark} = useTheme();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    loadMusic();
  }, []);

  const loadMusic = async () => {
    setLoading(true);
    const hasPermission = await requestMusicPermission();
    console.log("🚀 ~ loadMusic ~ hasPermission:", hasPermission)
    setPermissionGranted(hasPermission);

    if (hasPermission) {
      const allTracks = await getAllTracks();
      console.log("🚀 ~ loadMusic ~ allTracks:", allTracks[0])
      setTracks(allTracks);
    }
    setLoading(false);
  };

  const handlePermissionRequest = async () => {
    const hasPermission = await requestMusicPermission();

    // Check if permission was permanently denied
    let currentPermissionStatus;
    if (Platform.OS === 'android') {
      currentPermissionStatus = await check(
        Number(Platform.Version) >= 33
          ? PERMISSIONS.ANDROID.READ_MEDIA_AUDIO
          : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
      );
    } else {
      currentPermissionStatus = await check(PERMISSIONS.IOS.MEDIA_LIBRARY);
    }

    if (currentPermissionStatus === RESULTS.DENIED || currentPermissionStatus === RESULTS.BLOCKED) {
      Alert.alert(
        'Permission Required',
        'Baka Music needs access to your music library to play your songs. Please enable the permission in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Settings', onPress: () => Linking.openSettings() }
        ]
      );
    } else if (hasPermission) {
      const allTracks = await getAllTracks();
      setTracks(allTracks);
      setPermissionGranted(true);
    }
  };

  const renderItem = ({item}: {item: Track}) => (
    <TrackListItem
      track={item}
      onPress={() => navigation.navigate('Player', {track: item})}
    />
  );

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
                {loading ? 'Scanning...' : `${tracks.length} tracks`}
              </ThemedText>
            </View>
            <Button
              title={isDark ? 'Light' : 'Dark'}
              variant="ghost"
              onPress={toggleTheme}
              style={{minWidth: 60}}
            />
          </View>
        </View>

        {loading ? (
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <ActivityIndicator color={colors.primary} size="large" />
            <ThemedText style={{marginTop: 16}} color="muted">
              Finding your music...
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
            <Button title="Grant Permission" onPress={handlePermissionRequest} />
          </View>
        ) : (
          <FlatList
            data={tracks}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={{paddingBottom: 100}}
            ListEmptyComponent={
              <View style={{padding: 40, alignItems: 'center'}}>
                <ThemedText color="muted">
                  No music found on this device.
                </ThemedText>
                <Button
                  title="Scan Again"
                  variant="ghost"
                  onPress={handlePermissionRequest}
                  style={{marginTop: 20}}
                />
              </View>
            }
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
};
