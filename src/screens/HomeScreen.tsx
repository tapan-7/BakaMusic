import React, {useEffect, useState} from 'react';
import {FlatList, View, ActivityIndicator} from 'react-native';
import {ThemedView} from '../components/atoms/ThemedView';
import {ThemedText} from '../components/atoms/ThemedText';
import {Button} from '../components/atoms/Button';
import {TrackListItem} from '../components/molecules/TrackListItem';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../core/theme/useTheme';
import {requestMusicPermission} from '../services/PermissionService';
import {getAllTracks, Track} from '../services/MusicService';
import {SafeAreaView} from 'react-native-safe-area-context';

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
    setPermissionGranted(hasPermission);

    if (hasPermission) {
      const allTracks = await getAllTracks();
      setTracks(allTracks);
    }
    setLoading(false);
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
            <Button title="Grant Permission" onPress={loadMusic} />
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
                  onPress={loadMusic}
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
