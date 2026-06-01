import React, { useEffect } from 'react';
import { View, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { HomeScreen } from './src/screens/HomeScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { LibraryScreen, PlaylistScreen } from './src/screens/OtherScreens';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { BottomTabBar } from './src/navigation/BottomTabBar';
import { MiniPlayer } from './src/components/player/MiniPlayer';
import { PlayerContainer } from './src/components/player/PlayerContainer';
import { setupPlayer } from './src/services/trackPlayerService';

const Tab = createBottomTabNavigator();

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

export default function App() {
  useEffect(() => {
    setupPlayer();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <NavigationContainer>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <TabNavigator />
          <MiniPlayer />
          <PlayerContainer />
        </View>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
