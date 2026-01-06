import React from 'react';
import {View, ViewProps} from 'react-native';
import {useTheme} from '../../core/theme/useTheme';

interface ThemedViewProps extends ViewProps {
  variant?: 'background' | 'surface' | 'surfaceHighlight';
}

export const ThemedView: React.FC<ThemedViewProps> = ({
  style,
  variant = 'background',
  ...props
}) => {
  const {colors} = useTheme();

  const backgroundColor = colors[variant];

  return <View style={[{backgroundColor}, style]} {...props} />;
};
