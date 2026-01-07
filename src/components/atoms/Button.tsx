import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import {ThemedText} from './ThemedText';
import {useTheme} from '../../core/theme/useTheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}) => {
  const {colors, spacing} = useTheme();

  let backgroundColor = 'transparent';
  let textColor: any = 'primary';
  let borderColor = 'transparent';

  if (variant === 'primary') {
    backgroundColor = disabled ? colors.surfaceHighlight : colors.primary;
    textColor = disabled ? 'muted' : 'inverse';
  } else if (variant === 'secondary') {
    backgroundColor = 'transparent';
    borderColor = colors.border;
    textColor = disabled ? 'muted' : 'primary';
  } else if (variant === 'ghost') {
    backgroundColor = 'transparent';
    textColor = disabled ? 'muted' : 'primary';
  } else if (variant === 'outline') {
    backgroundColor = 'transparent';
    borderColor = colors.border;
    textColor = disabled ? 'muted' : 'primary';
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor,
          borderWidth: variant === 'secondary' || variant === 'outline' ? 1 : 0,
          borderRadius: variant === 'outline' ? 50 : 12,
          paddingVertical: variant === 'outline' ? spacing.s : spacing.m,
          paddingHorizontal: spacing.l,
        },
        disabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.7}>
      {loading ? (
        <ActivityIndicator
          color={textColor === 'inverse' ? colors.background : colors.primary}
        />
      ) : (
        <ThemedText
          variant="subheader"
          color={textColor}
          style={{fontWeight: '600', fontSize: 16}}>
          {title}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.8,
  },
});
