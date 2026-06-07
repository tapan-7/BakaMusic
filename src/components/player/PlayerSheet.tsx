import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { ChevronDown, Heart, Shuffle, Repeat, SkipBack, SkipForward, Play, Pause, MoreHorizontal } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  interpolate,
  runOnJS,
  withTiming,
  Extrapolate
} from 'react-native-reanimated';
import { usePlayerStore } from '../../store/playerStore';
import { usePlayer } from '../../hooks/usePlayer';
import TrackPlayer from 'react-native-track-player';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const MINIMIZED_HEIGHT = 160;
const MAX_TRANSLATE = SCREEN_HEIGHT - MINIMIZED_HEIGHT;
const DEFAULT_ARTWORK = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop';

export const PlayerSheet = () => {
  const { currentTrack, isPlaying, progress, duration, isExpanded, setIsExpanded } = usePlayerStore();
  const { togglePlayback } = usePlayer();
  
  // translateY goes from 0 (fully expanded) to MAX_TRANSLATE (minimized)
  const translateY = useSharedValue(isExpanded ? 0 : MAX_TRANSLATE);

  React.useEffect(() => {
    if (isExpanded) {
      translateY.value = withTiming(0, { duration: 300 });
    } else {
      translateY.value = withTiming(MAX_TRANSLATE, { duration: 300 });
    }
  }, [isExpanded]);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      let nextTranslate = (isExpanded ? 0 : MAX_TRANSLATE) + event.translationY;
      if (nextTranslate < 0) nextTranslate = 0;
      if (nextTranslate > MAX_TRANSLATE) nextTranslate = MAX_TRANSLATE;
      translateY.value = nextTranslate;
    })
    .onEnd((event) => {
      if (event.translationY > 100 || event.velocityY > 500) {
        runOnJS(setIsExpanded)(false);
      } else if (event.translationY < -100 || event.velocityY < -500) {
        runOnJS(setIsExpanded)(true);
      } else {
        // Snap back to nearest state
        if (translateY.value > MAX_TRANSLATE / 2) {
            runOnJS(setIsExpanded)(false);
        } else {
            runOnJS(setIsExpanded)(true);
        }
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderTopLeftRadius: interpolate(translateY.value, [0, MAX_TRANSLATE], [0, 24], Extrapolate.CLAMP),
    borderTopRightRadius: interpolate(translateY.value, [0, MAX_TRANSLATE], [0, 24], Extrapolate.CLAMP),
  }));

  const miniPlayerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [MAX_TRANSLATE - 100, MAX_TRANSLATE], [0, 1], Extrapolate.CLAMP),
    pointerEvents: translateY.value > MAX_TRANSLATE - 50 ? 'auto' : 'none',
  }));

  const fullPlayerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, MAX_TRANSLATE - 150], [1, 0], Extrapolate.CLAMP),
    pointerEvents: translateY.value < 50 ? 'auto' : 'none',
  }));

  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      // Mini player image left is 24 (16 container + 8 padding). Full player image left is 24 (px-6).
      left: 24,
      // Full player image top is around 120. Mini player image top is 8.
      top: interpolate(translateY.value, [0, MAX_TRANSLATE], [120, 8], Extrapolate.CLAMP),
      width: interpolate(translateY.value, [0, MAX_TRANSLATE], [SCREEN_WIDTH - 48, 48], Extrapolate.CLAMP),
      height: interpolate(translateY.value, [0, MAX_TRANSLATE], [SCREEN_WIDTH - 48, 48], Extrapolate.CLAMP),
      borderRadius: interpolate(translateY.value, [0, MAX_TRANSLATE], [24, 8], Extrapolate.CLAMP),
      zIndex: 100,
    };
  });

  const fullPlayerBgStyle = useAnimatedStyle(() => ({
    backgroundColor: 'black',
    opacity: interpolate(translateY.value, [0, MAX_TRANSLATE], [1, 0], Extrapolate.CLAMP),
  }));

  if (!currentTrack) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, sheetStyle]} pointerEvents="box-none">
        
        {/* SHARED ANIMATED IMAGE */}
        <Animated.Image 
          source={{ uri: currentTrack.artwork || DEFAULT_ARTWORK }} 
          style={animatedImageStyle}
        />

        {/* FULL PLAYER BACKGROUND */}
        <Animated.View style={[styles.absoluteFill, fullPlayerBgStyle]} pointerEvents="none" />

        {/* MINI PLAYER (Visible when down) */}
        <Animated.View style={[{ position: 'absolute', top: 0, left: 16, right: 16, height: 64, zIndex: 10 }, miniPlayerStyle]} className="bg-surface rounded-2xl p-2 flex-row items-center border border-white/5 shadow-lg">
          <TouchableOpacity 
            onPress={() => setIsExpanded(true)}
            className="flex-row items-center flex-1 h-full"
          >
            {/* Placeholder view to keep the layout spacing since the real image is absolute */}
            <View className="w-12 h-12" />
            <View className="ml-3 flex-1">
              <Text numberOfLines={1} className="text-white font-semibold text-sm">
                {currentTrack.title}
              </Text>
              <Text numberOfLines={1} className="text-gray-400 text-xs">
                {currentTrack.artist}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={togglePlayback}
            className="w-10 h-10 items-center justify-center bg-white/10 rounded-full mx-2"
          >
            {isPlaying ? (
              <Pause size={20} color="#FFFFFF" fill="#FFFFFF" />
            ) : (
              <Play size={20} color="#FFFFFF" fill="#FFFFFF" />
            )}
          </TouchableOpacity>

          {/* Progress Bar Mini */}
          <View className="absolute bottom-0 left-2 right-2 h-1 bg-white/10 rounded-full overflow-hidden">
            <View style={{ width: `${progressPercentage}%` }} className="h-full bg-primary" />
          </View>
        </Animated.View>

        {/* FULL PLAYER (Visible when up) */}
        <Animated.View style={[styles.absoluteFill, fullPlayerStyle, { zIndex: 5 }]} className="px-6 pt-12 pb-10">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-8">
            <TouchableOpacity onPress={() => setIsExpanded(false)}>
              <ChevronDown size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Text className="text-white font-bold text-lg">Now Playing</Text>
            <TouchableOpacity>
              <MoreHorizontal size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Placeholder for Album Art Layout spacing */}
          <View className="items-center justify-center mb-10" style={{ height: SCREEN_WIDTH - 48 }} />

          {/* Song Info */}
          <View className="flex-row justify-between items-center mb-8">
            <View className="flex-1 mr-4">
              <Text numberOfLines={1} className="text-white text-3xl font-bold mb-1">{currentTrack.title}</Text>
              <Text numberOfLines={1} className="text-gray-400 text-lg">{currentTrack.artist}</Text>
            </View>
            <TouchableOpacity>
              <Heart size={28} color="#FF0000" fill="#FF0000" />
            </TouchableOpacity>
          </View>

          {/* Progress Bar Full */}
          <View className="mb-8">
            <View className="h-[6px] bg-white/10 rounded-full mb-3 overflow-hidden">
              <View style={{ width: `${progressPercentage}%` }} className="h-full bg-primary" />
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-500 text-xs font-medium">{formatTime(progress)}</Text>
              <Text className="text-gray-500 text-xs font-medium">{formatTime(duration)}</Text>
            </View>
          </View>

          {/* Controls */}
          <View className="flex-row justify-between items-center mb-10">
            <TouchableOpacity>
              <Shuffle size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View className="flex-row items-center gap-10">
              <TouchableOpacity onPress={() => TrackPlayer.skipToPrevious()}>
                <SkipBack size={36} color="#FFFFFF" fill="#FFFFFF" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={togglePlayback}
                className="w-20 h-20 bg-primary rounded-full items-center justify-center shadow-lg"
              >
                {isPlaying ? (
                  <Pause size={40} color="#FFFFFF" fill="#FFFFFF" />
                ) : (
                  <Play size={40} color="#FFFFFF" fill="#FFFFFF" />
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => TrackPlayer.skipToNext()}>
                <SkipForward size={36} color="#FFFFFF" fill="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity>
              <Repeat size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>

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
    height: SCREEN_HEIGHT,
    zIndex: 1000,
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  }
});
