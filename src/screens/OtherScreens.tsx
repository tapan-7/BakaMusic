import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { Music2, Album, User, Radio, Download, ChevronRight, Plus } from 'lucide-react-native';

const LIB_ITEMS = [
  { icon: Music2, label: 'Songs', count: '324' },
  { icon: Album, label: 'Albums', count: '42' },
  { icon: User, label: 'Artists', count: '28' },
  { icon: Radio, label: 'Genres', count: '12' },
  { icon: Download, label: 'Downloaded', count: '156' },
];

const RECENTLY_ADDED = [
  { id: '1', title: 'Save Your Tears', artist: 'The Weeknd', artwork: 'https://i.scdn.co/image/ab67616d0000b273881d3d80392279313ca5e927' },
  { id: '2', title: 'One Right Now', artist: 'Post Malone', artwork: 'https://i.scdn.co/image/ab67616d0000b273b18544976722236d6537f7a2' },
];

export const LibraryScreen = () => {
  return (
    <ScrollView className="flex-1 bg-black pt-12 px-6">
      <Text className="text-white text-3xl font-black mb-8">Library</Text>
      
      {LIB_ITEMS.map((item, i) => (
        <TouchableOpacity key={i} className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center gap-4">
            <item.icon size={22} color="#FFFFFF" />
            <Text className="text-white font-semibold text-base">{item.label}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-gray-500 text-sm">{item.count}</Text>
            <ChevronRight size={18} color="#333" />
          </View>
        </TouchableOpacity>
      ))}

      <View className="flex-row justify-between items-center mt-4 mb-6">
        <Text className="text-white text-xl font-bold">Recently Added</Text>
        <TouchableOpacity><Text className="text-primary text-sm">See All</Text></TouchableOpacity>
      </View>

      {RECENTLY_ADDED.map((item, i) => (
        <TouchableOpacity key={i} className="flex-row items-center gap-4 mb-4">
          <Image source={{ uri: item.artwork }} className="w-14 h-14 rounded-xl" />
          <View>
            <Text className="text-white font-bold">{item.title}</Text>
            <Text className="text-gray-500 text-xs">{item.artist}</Text>
          </View>
        </TouchableOpacity>
      ))}
      <View className="h-32" />
    </ScrollView>
  );
};

const PLAYLISTS = [
  { title: 'Chill Vibes', count: '24 songs', artwork: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=200' },
  { title: 'Workout Mix', count: '42 songs', artwork: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=200' },
  { title: 'Night Drive', count: '18 songs', artwork: 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?q=80&w=200' },
];

export const PlaylistScreen = () => {
  return (
    <ScrollView className="flex-1 bg-black pt-12 px-6">
      <View className="flex-row justify-between items-center mb-8">
        <Text className="text-white text-3xl font-black">Playlists</Text>
        <TouchableOpacity className="p-2 bg-white/5 rounded-full">
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View className="flex-row flex-wrap justify-between">
        {PLAYLISTS.map((item, i) => (
          <TouchableOpacity key={i} className="w-[48%] mb-6">
            <Image source={{ uri: item.artwork }} className="w-full aspect-square rounded-3xl mb-3" />
            <Text className="text-white font-bold text-base">{item.title}</Text>
            <Text className="text-gray-500 text-xs">{item.count}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <View className="h-32" />
    </ScrollView>
  );
};
