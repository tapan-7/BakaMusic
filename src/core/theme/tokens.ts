export interface ThemeColors {
  primary: string;
  background: string;
  foreground: string;
  surface: string;
  surfaceHighlight: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  error: string;
}

export type ThemeMode = 'light' | 'dark';

export const palette = {
  white: '#FFFFFF',
  black: '#09090B', // Slightly softer black
  gray50: '#FAFAFA',
  gray100: '#F4F4F5',
  gray200: '#E4E4E7',
  gray300: '#D4D4D8',
  gray400: '#A1A1AA',
  gray500: '#71717A',
  gray600: '#52525B',
  gray700: '#3F3F46',
  gray800: '#27272A',
  gray900: '#18181B',

  // Accents
  blue: '#3B82F6',
  purple: '#8B5CF6',
  pink: '#EC4899',
  orange: '#F97316',
  teal: '#14B8A6',
};

export const lightTheme: Omit<ThemeColors, 'primary'> = {
  background: palette.white,
  foreground: palette.black,
  surface: palette.gray50,
  surfaceHighlight: palette.gray100,
  text: palette.gray900,
  textSecondary: palette.gray500,
  textMuted: palette.gray400,
  border: palette.gray200,
  error: '#EF4444',
};

export const darkTheme: Omit<ThemeColors, 'primary'> = {
  background: palette.black,
  foreground: palette.white,
  surface: palette.gray900,
  surfaceHighlight: palette.gray800,
  text: palette.white,
  textSecondary: palette.gray400,
  textMuted: palette.gray600,
  border: palette.gray800,
  error: '#F87171',
};

export const initialPrimaryColor = palette.blue;
