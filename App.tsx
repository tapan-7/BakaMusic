import React, { useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import "./src/theme/global.css";

import { HomeScreen } from './src/screens/HomeScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { LibraryScreen, PlaylistScreen } from './src/screens/OtherScreens';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { BottomTabBar } from './src/navigation/BottomTabBar';
import { MiniPlayer } from './src/components/player/MiniPlayer';
import { PlayerContainer } from './src/components/player/PlayerContainer';
import { setupPlayer } from './src/services/trackPlayerService';
import { scanLocalMusic } from './src/services/musicScannerService';
import { useMusicStore } from './src/store/useMusicStore';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ArtistsScreen } from './src/screens/ArtistsScreen';
import { AlbumsScreen } from './src/screens/AlbumsScreen';
import { AllMusicScreen } from './src/screens/AllMusicScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <BottomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
      <Tab.Screen name="Playlists" component={PlaylistScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="Artists" component={ArtistsScreen} />
      <Stack.Screen name="Albums" component={AlbumsScreen} />
      <Stack.Screen name="AllMusic" component={AllMusicScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

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
          <RootStack />
          <MiniPlayer />
          <PlayerContainer />
        </View>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
