import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/core/theme/ThemeContext';
import { PlayerProvider } from './src/contexts/PlayerContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { cleanupPlayer } from './src/services/PlayerService';

import { Provider } from 'react-redux';
import { store } from './src/store';

const App = () => {
  useEffect(() => {
    return () => {
      cleanupPlayer();
    };
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <PlayerProvider>
          <ThemeProvider>
            <RootNavigator />
          </ThemeProvider>
        </PlayerProvider>
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
