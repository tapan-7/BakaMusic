import { useThemeContext } from './ThemeContext';

export const useTheme = () => {
  const { theme, mode, isDark, toggleTheme, setPrimaryColor } = useThemeContext();
  return {
    colors: theme,
    mode,
    isDark,
    toggleTheme,
    setPrimaryColor,
    spacing: {
      xs: 4,
      s: 8,
      m: 16,
      l: 24,
      xl: 32,
      xxl: 48,
    },
    textVariants: {
      header: {
        fontSize: 24,
        fontWeight: '700' as const,
        color: theme.text,
      },
      subheader: {
        fontSize: 18,
        fontWeight: '600' as const,
        color: theme.text,
      },
      body: {
        fontSize: 16,
        color: theme.text,
      },
      caption: {
        fontSize: 14,
        color: theme.textSecondary,
      },
    },
  };
};
