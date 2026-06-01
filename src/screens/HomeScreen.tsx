import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, FlatList } from 'react-native';
import { Search, Settings, Play } from 'lucide-react-native';
import { usePlayer } from '../hooks/usePlayer';

const FEATURED_PLAYLIST = {
  id: '1',
  title: 'MIDNIGHT VIBES',
  description: 'Chill • Relax • Unwind',
  artwork: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop',
};

const RECENTLY_PLAYED = [
  { id: '2', title: 'Night Drive', artist: 'The Weeknd', artwork: 'https://i.scdn.co/image/ab67616d0000b273471d697702478874e44375da' },
  { id: '3', title: 'After Hours', artist: 'The Weeknd', artwork: 'https://i.scdn.co/image/ab67616d0000b273881d3d80392279313ca5e927' },
  { id: '4', title: 'Starboy', artist: 'The Weeknd', artwork: 'https://i.scdn.co/image/ab67616d0000b273471d697702478874e44375da' },
];

export const HomeScreen = () => {
  const { playTrack } = usePlayer();

  const renderRecentlyPlayed = ({ item }: { item: any }) => (
    <TouchableOpacity 
      onPress={() => playTrack({ ...item, url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' })}
      className="mr-4 w-32"
    >
      <Image source={{ uri: item.artwork }} className="w-32 h-32 rounded-2xl mb-2" />
      <Text numberOfLines={1} className="text-white font-medium text-sm">{item.title}</Text>
      <Text numberOfLines={1} className="text-gray-500 text-xs">{item.artist}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView className="flex-1 bg-black pt-12 px-6">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-8">
        <View>
          <Text className="text-white text-2xl font-bold">Good Evening</Text>
          <Text className="text-gray-500">Your offline music library</Text>
        </View>
        <View className="flex-row gap-4">
          <TouchableOpacity className="p-2 bg-white/5 rounded-full">
            <Search size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity className="p-2 bg-white/5 rounded-full">
            <Settings size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Featured Playlist */}
      <Text className="text-white text-lg font-bold mb-4">Featured Playlist</Text>
      <TouchableOpacity className="relative mb-8 rounded-3xl overflow-hidden h-48">
        <Image source={{ uri: FEATURED_PLAYLIST.artwork }} className="w-full h-full" />
        <View className="absolute inset-0 bg-black/40 p-6 justify-end">
          <Text className="text-white text-3xl font-black mb-1">{FEATURED_PLAYLIST.title}</Text>
          <Text className="text-white/80 text-sm mb-4">{FEATURED_PLAYLIST.description}</Text>
          <TouchableOpacity className="absolute bottom-6 right-6 w-12 h-12 bg-primary rounded-full items-center justify-center">
            <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Recently Played */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-white text-lg font-bold">Recently Played</Text>
        <TouchableOpacity><Text className="text-primary text-sm">See All</Text></TouchableOpacity>
      </View>
      <FlatList 
        data={RECENTLY_PLAYED}
        renderItem={renderRecentlyPlayed}
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-8"
      />

      {/* Top Albums */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-white text-lg font-bold">Top Albums</Text>
        <TouchableOpacity><Text className="text-primary text-sm">See All</Text></TouchableOpacity>
      </View>
      <View className="flex-row gap-4 mb-20">
         <View className="flex-1 h-32 bg-surface rounded-2xl overflow-hidden">
            <Image source={{ uri: RECENTLY_PLAYED[0].artwork }} className="w-full h-full opacity-50" />
         </View>
         <View className="flex-1 h-32 bg-surface rounded-2xl overflow-hidden">
            <Image source={{ uri: RECENTLY_PLAYED[1].artwork }} className="w-full h-full opacity-50" />
         </View>
      </View>
    </ScrollView>
  );
};
