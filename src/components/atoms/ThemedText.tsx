import React from 'react';
import {Text, TextProps} from 'react-native';
import {useTheme} from '../../core/theme/useTheme';

interface ThemedTextProps extends TextProps {
  variant?: 'header' | 'subheader' | 'body' | 'caption';
  color?: 'primary' | 'secondary' | 'muted' | 'accent' | 'inverse';
}

export const ThemedText: React.FC<ThemedTextProps> = ({
  style,
  variant = 'body',
  color = 'primary',
  ...props
}) => {
  const {colors, textVariants} = useTheme();

  let textColor = colors.text;
  if (color === 'secondary') textColor = colors.textSecondary;
  if (color === 'muted') textColor = colors.textMuted;
  if (color === 'accent') textColor = colors.primary;
  if (color === 'inverse') textColor = colors.background;

  const variantStyle = textVariants[variant];

  return <Text style={[variantStyle, {color: textColor}, style]} {...props} />;
};
