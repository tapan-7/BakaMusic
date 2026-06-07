import React, { useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TrackPlayer, { RepeatMode as RNRepeatMode } from 'react-native-track-player';

import "./src/theme/global.css";

import { PlayerSheet } from './src/components/player/PlayerSheet';
import { setupPlayer } from './src/services/trackPlayerService';
import { useMusicStore } from './src/store/useMusicStore';
import { usePlayerStore } from './src/store/playerStore';

import { RootNavigator } from './src/navigation/RootNavigator';

export const navigationRef = createNavigationContainerRef();

export default function App() {
  const { loadLocalMusic } = useMusicStore();

  useEffect(() => {
    const initApp = async () => {
      await setupPlayer();
      await loadLocalMusic();
      
      // Hydrate TrackPlayer from store
      const state = usePlayerStore.getState();
      if (state.currentTrack) {
        try {
          const queue = await TrackPlayer.getQueue();
          if (queue.length === 0) {
            // Restore repeat mode
            let nativeRepeatMode = RNRepeatMode.Off;
            if (state.repeatMode === 'queue') nativeRepeatMode = RNRepeatMode.Queue;
            else if (state.repeatMode === 'track') nativeRepeatMode = RNRepeatMode.Track;
            await TrackPlayer.setRepeatMode(nativeRepeatMode);

            // If we have a queue saved, load it, otherwise just the track
            const tracksToAdd = state.queue.length > 0 ? state.queue : [state.currentTrack];
            await TrackPlayer.add(tracksToAdd);
            
            // If the track is in the queue, skip to it
            const trackIndex = tracksToAdd.findIndex(t => t.id === state.currentTrack?.id);
            if (trackIndex > 0) {
              await TrackPlayer.skip(trackIndex);
            }
            
            if (state.progress > 0) {
              await TrackPlayer.seekTo(state.progress);
            }
          }
        } catch (e) {
          console.error("Failed to hydrate TrackPlayer", e);
        }
      }
    };

    initApp();
  }, []);

  const handleStateChange = () => {
    const currentRoute = navigationRef.getCurrentRoute();
    if (currentRoute) {
      const tabRoutes = ['Home', 'Search', 'Library', 'Playlists', 'Profile'];
      usePlayerStore.getState().setIsTabBarVisible(tabRoutes.includes(currentRoute.name));
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <NavigationContainer ref={navigationRef} onStateChange={handleStateChange}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <RootNavigator />
          <PlayerSheet />
        </View>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
