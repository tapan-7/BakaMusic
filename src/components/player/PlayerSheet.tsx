import React, { useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { ChevronDown, Heart, Shuffle, Repeat, SkipBack, SkipForward, Play, Pause, MoreHorizontal } from 'lucide-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  interpolate,
  runOnJS,
  withTiming,
  Extrapolate,
  useAnimatedProps
} from 'react-native-reanimated';
import Slider from '@react-native-community/slider';
import { usePlayerStore } from '../../store/playerStore';
import { usePlayer } from '../../hooks/usePlayer';
import TrackPlayer, { RepeatMode as RNRepeatMode } from 'react-native-track-player';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const DEFAULT_ARTWORK = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const MiniProgressBar = () => {
  const progress = usePlayerStore(state => state.progress);
  const duration = usePlayerStore(state => state.duration);
  const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0;
  
  return (
    <View className="absolute bottom-0 left-2 right-2 h-1 bg-white/10 rounded-full overflow-hidden">
      <View style={{ width: `${progressPercentage}%` }} className="h-full bg-primary" />
    </View>
  );
};

const FullProgressBar = () => {
  const progress = usePlayerStore(state => state.progress);
  const duration = usePlayerStore(state => state.duration);

  return (
    <View className="mb-8">
      <Slider
        style={{ width: '100%', height: 40 }}
        minimumValue={0}
        maximumValue={duration > 0 ? duration : 1}
        value={progress}
        minimumTrackTintColor="#fa95ed" // primary color
        maximumTrackTintColor="rgba(255, 255, 255, 0.1)"
        thumbTintColor="#fa95ed"
        onSlidingComplete={async (value) => {
          await TrackPlayer.seekTo(value);
        }}
      />
      <View className="flex-row justify-between px-2">
        <Text className="text-gray-500 text-xs font-medium">{formatTime(progress)}</Text>
        <Text className="text-gray-500 text-xs font-medium">{formatTime(duration)}</Text>
      </View>
    </View>
  );
};

export const PlayerSheet = () => {
  const currentTrack = usePlayerStore(state => state.currentTrack);
  const isPlaying = usePlayerStore(state => state.isPlaying);
  const isExpanded = usePlayerStore(state => state.isExpanded);
  const setIsExpanded = usePlayerStore(state => state.setIsExpanded);
  
  const isShuffle = usePlayerStore(state => state.isShuffle);
  const setIsShuffle = usePlayerStore(state => state.setIsShuffle);
  
  const repeatMode = usePlayerStore(state => state.repeatMode);
  const setRepeatMode = usePlayerStore(state => state.setRepeatMode);
  
  const favorites = usePlayerStore(state => state.favorites);
  const toggleFavorite = usePlayerStore(state => state.toggleFavorite);
  const isTabBarVisible = usePlayerStore(state => state.isTabBarVisible);
  
  const isFavorite = currentTrack ? favorites.includes(currentTrack.id) : false;
  
  const { togglePlayback } = usePlayer();
  
  const MINIMIZED_HEIGHT = isTabBarVisible ? 160 : 70;
  const MAX_TRANSLATE = SCREEN_HEIGHT - MINIMIZED_HEIGHT;
  
  // translateY goes from 0 (fully expanded) to MAX_TRANSLATE (minimized)
  const translateY = useSharedValue(isExpanded ? 0 : MAX_TRANSLATE);

  useEffect(() => {
    // Only animate if the shared value is significantly different from the target
    // This prevents the useEffect from overriding the onEnd UI thread animation
    const target = isExpanded ? 0 : MAX_TRANSLATE;
    if (Math.abs(translateY.value - target) > 1) {
      translateY.value = withTiming(target, { duration: 300 });
    }
  }, [isExpanded, MAX_TRANSLATE]);

  const gesture = useMemo(() => Gesture.Pan()
    .activeOffsetY([-10, 10]) // Only activate on vertical drag, allowing taps to pass through
    .onUpdate((event) => {
      let nextTranslate = (isExpanded ? 0 : MAX_TRANSLATE) + event.translationY;
      if (nextTranslate < 0) nextTranslate = 0;
      if (nextTranslate > MAX_TRANSLATE) nextTranslate = MAX_TRANSLATE;
      translateY.value = nextTranslate;
    })
    .onEnd((event) => {
      'worklet';
      let expand = false;
      let target = MAX_TRANSLATE;

      if (event.translationY > 100 || event.velocityY > 500) {
        expand = false;
        target = MAX_TRANSLATE;
      } else if (event.translationY < -100 || event.velocityY < -500) {
        expand = true;
        target = 0;
      } else {
        // Snap back to nearest state
        if (translateY.value > MAX_TRANSLATE / 2) {
          expand = false;
          target = MAX_TRANSLATE;
        } else {
          expand = true;
          target = 0;
        }
      }

      // Animate immediately on the UI thread to prevent the "pause" delay
      translateY.value = withTiming(target, { duration: 300 }, () => {
         // Update React state in the background
         runOnJS(setIsExpanded)(expand);
      });
    }), [isExpanded, setIsExpanded, translateY, MAX_TRANSLATE]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderTopLeftRadius: interpolate(translateY.value, [0, MAX_TRANSLATE], [0, 24], Extrapolate.CLAMP),
    borderTopRightRadius: interpolate(translateY.value, [0, MAX_TRANSLATE], [0, 24], Extrapolate.CLAMP),
  }));

  const miniPlayerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [MAX_TRANSLATE - 100, MAX_TRANSLATE], [0, 1], Extrapolate.CLAMP),
  }));

  const miniPlayerProps = useAnimatedProps(() => ({
    pointerEvents: translateY.value > MAX_TRANSLATE - 50 ? 'auto' : 'none',
  }) as any);

  const fullPlayerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, MAX_TRANSLATE - 150], [1, 0], Extrapolate.CLAMP),
  }));

  const fullPlayerProps = useAnimatedProps(() => ({
    pointerEvents: translateY.value < 50 ? 'box-none' : 'none',
  }) as any);

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

  const fullPlayerBgProps = useAnimatedProps(() => ({
    pointerEvents: translateY.value < MAX_TRANSLATE - 50 ? 'auto' : 'none',
  }) as any);

  if (!currentTrack) return null;

  const toggleShuffle = async () => {
    const newState = !isShuffle;
    setIsShuffle(newState);
    // Note: TrackPlayer doesn't have a native shuffle mode, it's usually handled in queue generation
  };

  const toggleRepeat = async () => {
    let newMode: 'off' | 'track' | 'queue' = 'off';
    let nativeMode = RNRepeatMode.Off;
    
    if (repeatMode === 'off') {
      newMode = 'queue';
      nativeMode = RNRepeatMode.Queue;
    } else if (repeatMode === 'queue') {
      newMode = 'track';
      nativeMode = RNRepeatMode.Track;
    } else {
      newMode = 'off';
      nativeMode = RNRepeatMode.Off;
    }
    
    setRepeatMode(newMode);
    await TrackPlayer.setRepeatMode(nativeMode);
  };

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, sheetStyle]} pointerEvents="box-none">
        
        {/* SHARED ANIMATED IMAGE */}
        <Animated.Image 
          source={{ uri: currentTrack.artwork || DEFAULT_ARTWORK }} 
          style={animatedImageStyle}
        />

        {/* FULL PLAYER BACKGROUND */}
        <Animated.View style={[styles.absoluteFill, fullPlayerBgStyle]} animatedProps={fullPlayerBgProps} />

        {/* MINI PLAYER (Visible when down) */}
        <Animated.View animatedProps={miniPlayerProps} style={[{ position: 'absolute', top: 0, left: 16, right: 16, height: 64, zIndex: 10 }, miniPlayerStyle]} className="bg-surface rounded-2xl p-2 flex-row items-center border border-white/5 shadow-lg">
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
          <MiniProgressBar />
        </Animated.View>

        {/* FULL PLAYER (Visible when up) */}
        <Animated.View animatedProps={fullPlayerProps} style={[styles.absoluteFill, fullPlayerStyle, { zIndex: 5 }]} className="px-6 pt-12 pb-10">
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
            <TouchableOpacity onPress={() => toggleFavorite(currentTrack.id)}>
              <Heart size={28} color={isFavorite ? "#fa95ed" : "#FFFFFF"} fill={isFavorite ? "#fa95ed" : "transparent"} />
            </TouchableOpacity>
          </View>

          {/* Progress Bar Full */}
          <FullProgressBar />

          {/* Controls */}
          <View className="flex-row justify-between items-center mb-10">
            <TouchableOpacity onPress={toggleShuffle}>
              <Shuffle size={24} color={isShuffle ? "#fa95ed" : "#FFFFFF"} />
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
            <TouchableOpacity onPress={toggleRepeat}>
              <Repeat size={24} color={repeatMode !== 'off' ? "#fa95ed" : "#FFFFFF"} />
              {repeatMode === 'track' && (
                <View className="absolute -top-1 -right-1 bg-primary rounded-full w-3 h-3 items-center justify-center">
                  <Text className="text-[8px] text-white font-bold">1</Text>
                </View>
              )}
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
