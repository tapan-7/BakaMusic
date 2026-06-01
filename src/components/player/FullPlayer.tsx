import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { ChevronDown, Heart, Shuffle, Repeat, SkipBack, SkipForward, Play, Pause, ListMusic, MoreHorizontal } from 'lucide-react-native';
import Animated, { 
  FadeInDown, 
  FadeInUp,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { usePlayerStore } from '../../store/playerStore';
import { usePlayer } from '../../hooks/usePlayer';
import TrackPlayer from 'react-native-track-player';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const FullPlayer = () => {
  const { currentTrack, isPlaying, progress, duration, setIsExpanded } = usePlayerStore();
  const { togglePlayback } = usePlayer();
  const playScale = useSharedValue(1);

  if (!currentTrack) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0;

  const animatedPlayStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playScale.value }],
  }));

  const onPlayPress = () => {
    playScale.value = withSpring(1.2, {}, () => {
      playScale.value = withSpring(1);
    });
    togglePlayback();
  };

  return (
    <View className="flex-1 bg-black px-6 pt-12 pb-10">
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

      {/* Album Art */}
      <Animated.View 
        entering={FadeInDown.delay(200).duration(600)}
        className="items-center justify-center mb-10"
      >
        <Image 
          source={{ uri: currentTrack.artwork }} 
          className="rounded-3xl"
          style={{ width: SCREEN_WIDTH - 48, height: SCREEN_WIDTH - 48 }}
        />
      </Animated.View>

      {/* Song Info */}
      <View className="flex-row justify-between items-center mb-8">
        <Animated.View entering={FadeInUp.delay(300)}>
          <Text className="text-white text-3xl font-bold mb-1">{currentTrack.title}</Text>
          <Text className="text-gray-400 text-lg">{currentTrack.artist}</Text>
        </Animated.View>
        <TouchableOpacity>
          <Heart size={28} color="#FF0000" fill="#FF0000" />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View className="mb-8">
        <View className="h-[6px] bg-white/10 rounded-full mb-3 overflow-hidden">
          <View 
            style={{ width: `${progressPercentage}%` }} 
            className="h-full bg-primary" 
          />
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
            onPress={onPlayPress}
            className="w-20 h-20 bg-primary rounded-full items-center justify-center shadow-lg"
          >
            <Animated.View style={animatedPlayStyle}>
              {isPlaying ? (
                <Pause size={40} color="#FFFFFF" fill="#FFFFFF" />
              ) : (
                <Play size={40} color="#FFFFFF" fill="#FFFFFF" />
              )}
            </Animated.View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => TrackPlayer.skipToNext()}>
            <SkipForward size={36} color="#FFFFFF" fill="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Repeat size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Footer Actions */}
      <View className="flex-row justify-between items-center">
        <TouchableOpacity className="flex-row items-center gap-2">
            <Shuffle size={20} color="#666" />
            <Repeat size={20} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity>
          <ListMusic size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
