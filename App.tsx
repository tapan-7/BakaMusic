import React, {useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {ThemeProvider} from './src/core/theme/ThemeContext';
import {PlayerProvider} from './src/contexts/PlayerContext';
import {RootNavigator} from './src/navigation/RootNavigator';
import {cleanupPlayer} from './src/services/PlayerService';

const App = () => {
  useEffect(() => {
    return () => {
      cleanupPlayer();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <PlayerProvider>
        <ThemeProvider>
          <RootNavigator />
        </ThemeProvider>
      </PlayerProvider>
    </SafeAreaProvider>
  );
};

export default App;