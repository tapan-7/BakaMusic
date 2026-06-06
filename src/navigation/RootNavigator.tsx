import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { BottomTabNavigator } from './BottomTabNavigator';
import { ArtistsScreen } from '../screens/ArtistsScreen';
import { AlbumsScreen } from '../screens/AlbumsScreen';
import { AllMusicScreen } from '../screens/AllMusicScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TrackListScreen } from '../screens/TrackListScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="Artists" component={ArtistsScreen} />
      <Stack.Screen name="Albums" component={AlbumsScreen} />
      <Stack.Screen name="AllMusic" component={AllMusicScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="TrackList" component={TrackListScreen} />
    </Stack.Navigator>
  );
}
