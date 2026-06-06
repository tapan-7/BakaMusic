import React, { useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import "./src/theme/global.css";

import { PlayerSheet } from './src/components/player/PlayerSheet';
import { setupPlayer } from './src/services/trackPlayerService';
import { scanLocalMusic } from './src/services/musicScannerService';
import { useMusicStore } from './src/store/useMusicStore';

import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  const { setScannedTracks, setIsScanning } = useMusicStore();

  useEffect(() => {
    const initApp = async () => {
      await setupPlayer();
      setIsScanning(true);
      const tracks = await scanLocalMusic();
      setScannedTracks(tracks);
      setIsScanning(false);
    };

    initApp();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <NavigationContainer>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <RootNavigator />
          <PlayerSheet />
        </View>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
