import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { Settings, ChevronRight, Music2, Album, Heart, ListMusic, Download, LogOut, Clock, Activity, BarChart3, User } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing,
  interpolate,
} from 'react-native-reanimated';

const STATS = [
  { label: 'Songs', value: '324' },
  { label: 'Albums', value: '42' },
  { label: 'Playlists', value: '18' },
];

const MENU_ITEMS = [
  { icon: Music2, label: 'My Songs', count: '324' },
  { icon: Album, label: 'Albums', count: '42' },
  { icon: Heart, label: 'Favorites', count: '28' },
  { icon: ListMusic, label: 'Playlists', count: '12' },
  { icon: Download, label: 'Downloads', count: '156' },
];

export const ProfileScreen = () => {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1 pt-12">
        {/* Header */}
        <View className="flex-row justify-between px-6 items-center mb-8">
          <TouchableOpacity className="p-2 bg-white/5 rounded-full">
            <ChevronRight size={24} color="#FFFFFF" className="rotate-180" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Profile</Text>
          <TouchableOpacity className="p-2 bg-white/5 rounded-full">
            <Settings size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View className="items-center mb-10">
          <View className="relative">
            <Animated.View 
              style={[animatedRingStyle]}
              className="absolute -inset-2 border-2 border-primary border-t-transparent rounded-full"
            />
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' }} 
              className="w-24 h-24 rounded-full border-2 border-black"
            />
            <View className="absolute -bottom-2 -right-2 bg-yellow-500 px-2 py-0.5 rounded-full flex-row items-center">
                <Text className="text-[10px] font-bold text-black">Premium</Text>
            </View>
          </View>
          <Text className="text-white text-2xl font-bold mt-6">John Doe</Text>
          <Text className="text-gray-500">Music Lover</Text>
        </View>

        {/* Stats */}
        <View className="flex-row justify-around mb-10 px-10">
          {STATS.map((stat, i) => (
            <View key={i} className="items-center">
              <Text className="text-white text-xl font-bold">{stat.value}</Text>
              <Text className="text-gray-500 text-xs">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu Section */}
        <View className="bg-white rounded-t-[40px] pt-8 pb-32 px-6">
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity key={i} className="flex-row items-center justify-between py-4 border-b border-gray-100">
              <View className="flex-row items-center gap-4">
                <View className="p-2 bg-gray-50 rounded-xl">
                  <item.icon size={20} color="#000000" />
                </View>
                <Text className="text-black font-semibold text-base">{item.label}</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-gray-400 text-sm">{item.count}</Text>
                <ChevronRight size={20} color="#CCCCCC" />
              </View>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity className="flex-row items-center gap-4 py-4 mt-4">
            <View className="p-2 bg-gray-50 rounded-xl">
                <Settings size={20} color="#000000" />
            </View>
            <Text className="text-black font-semibold text-base">Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Segment Bar (Simulated bottom fixed UI) */}
      <View className="absolute bottom-10 left-10 right-10 flex-row bg-black rounded-full p-2 items-center justify-between shadow-xl">
         <TouchableOpacity className="flex-1 items-center p-3 bg-white/10 rounded-full">
            <Clock size={20} color="#FFFFFF" />
         </TouchableOpacity>
         <TouchableOpacity className="flex-1 items-center p-3">
            <Heart size={20} color="#FFFFFF" />
         </TouchableOpacity>
         <TouchableOpacity className="flex-1 items-center p-3">
            <BarChart3 size={20} color="#FFFFFF" />
         </TouchableOpacity>
         <TouchableOpacity className="flex-1 items-center p-3 bg-primary rounded-full">
            <User size={20} color="#FFFFFF" />
         </TouchableOpacity>
      </View>
    </View>
  );
};
