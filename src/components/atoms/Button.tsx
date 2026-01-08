import React from 'react';
import {
  TouchableHighlight,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import {ThemedText} from './ThemedText';
import {useTheme} from '../../core/theme/useTheme';

interface ButtonProps {
  title: string | React.ReactNode;
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
  const {colors} = useTheme();

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
    <TouchableHighlight
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor,
          borderWidth: variant === 'secondary' || variant === 'outline' ? 1 : 0,
          borderRadius: 50,
          padding: 12,
        },
        disabled && styles.disabled,
        style,
      ]}
      underlayColor={colors.surfaceHighlight}>
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
    </TouchableHighlight>
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

