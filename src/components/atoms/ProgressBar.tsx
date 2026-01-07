import React, {useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {useTheme} from '../../core/theme/useTheme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  isSeeking?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  isSeeking,
}) => {
  const {colors} = useTheme();
  const width = useSharedValue(0);
  const AnimatedView = Animated.View as any;

  useEffect(() => {
    const clamped = Math.min(Math.max(progress, 0), 1);
    if (isSeeking) {
      width.value = clamped;
    } else {
      width.value = withTiming(clamped, {
        duration: 500,
        easing: Easing.linear,
      });
    }
  }, [progress, isSeeking, width]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${width.value * 100}%`,
    };
  });

  return (
    <View
      style={[styles.container, {backgroundColor: colors.surfaceHighlight}]}>
      <AnimatedView
        style={[styles.fill, {backgroundColor: colors.primary}, animatedStyle]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 6,
    width: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
