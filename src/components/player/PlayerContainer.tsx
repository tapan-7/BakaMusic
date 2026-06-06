import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { usePlayerStore } from '../../store/playerStore';
import { FullPlayer } from './FullPlayer';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const PlayerContainer = () => {
  const { isExpanded, setIsExpanded, currentTrack } = usePlayerStore();
  const translateY = useSharedValue(SCREEN_HEIGHT);

  React.useEffect(() => {
    if (isExpanded) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 100 });
    } else {
      translateY.value = withSpring(SCREEN_HEIGHT, { damping: 20, stiffness: 100 });
    }
  }, [isExpanded]);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 500) {
        runOnJS(setIsExpanded)(false);
      } else {
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      borderRadius: interpolate(
        translateY.value,
        [0, SCREEN_HEIGHT],
        [0, 30],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      ),
    };
  });

  if (!currentTrack) return null;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View 
        style={[styles.container, animatedStyle]}
        className="bg-black"
      >
        <FullPlayer />
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    overflow: 'hidden',
  },
});
