import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Play, Pause } from 'lucide-react-native';
import { usePlayerStore } from '../../store/playerStore';
import { usePlayer } from '../../hooks/usePlayer';

export const MiniPlayer = () => {
  const { currentTrack, isPlaying, progress, duration, setIsExpanded } = usePlayerStore();
  const { togglePlayback } = usePlayer();

  if (!currentTrack) return null;

  const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <View 
      className="absolute bottom-24 left-4 right-4 bg-surface rounded-2xl p-2 flex-row items-center border border-white/5 shadow-lg"
    >
      <TouchableOpacity 
        onPress={() => setIsExpanded(true)}
        className="flex-row items-center flex-1"
      >
        <Image 
          source={{ uri: currentTrack.artwork }} 
          className="w-12 h-12 rounded-lg"
        />
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

      {/* Progress Bar */}
      <View className="absolute bottom-0 left-2 right-2 h-1 bg-white/10 rounded-full overflow-hidden">
        <Animated.View 
          style={{ width: `${progressPercentage}%` }}
          className="h-full bg-primary"
        />
      </View>
    </View>
  );
};
