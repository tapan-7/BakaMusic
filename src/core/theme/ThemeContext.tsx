import React, {createContext, useContext, useState, useMemo} from 'react';
import {Appearance} from 'react-native';
import {
  lightTheme,
  darkTheme,
  initialPrimaryColor,
  ThemeColors,
  ThemeMode,
} from './tokens';

interface ThemeContextType {
  theme: ThemeColors;
  mode: ThemeMode;
  isDark: boolean;
  primaryColor: string;
  setMode: (mode: ThemeMode) => void;
  setPrimaryColor: (color: string) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const systemScheme = Appearance.getColorScheme();
  const [mode, setMode] = useState<ThemeMode>(
    systemScheme === 'dark' ? 'dark' : 'light',
  );
  const [primaryColor, setPrimaryColor] = useState<string>(initialPrimaryColor);

  const theme = useMemo(() => {
    const base = mode === 'dark' ? darkTheme : lightTheme;
    return {...base, primary: primaryColor};
  }, [mode, primaryColor]);

  const toggleTheme = () => {
    setMode(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const value = {
    theme,
    mode,
    isDark: mode === 'dark',
    primaryColor,
    setMode,
    setPrimaryColor,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};
