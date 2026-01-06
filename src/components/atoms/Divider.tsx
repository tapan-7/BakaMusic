import React from 'react';
import {View, ViewProps} from 'react-native';
import {useTheme} from '../../core/theme/useTheme';

export const Divider: React.FC<ViewProps> = ({style, ...props}) => {
  const {colors} = useTheme();

  return (
    <View
      style={[
        {height: 1, backgroundColor: colors.border, width: '100%'},
        style,
      ]}
      {...props}
    />
  );
};
