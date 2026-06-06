import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Search, Settings, Play } from 'lucide-react-native';
import { usePlayer } from '../hooks/usePlayer';
import { ScannedTrack } from '../services/musicScannerService';
import { useMusicStore } from '../store/useMusicStore';

const FEATURED_PLAYLIST = {
  id: '1',
  title: 'MIDNIGHT VIBES',
  description: 'Chill • Relax • Unwind',
  artwork:
    'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop',
};

const DEFAULT_ARTWORK =
  'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop';

export const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { playTrack } = usePlayer();
  const {
    scannedTracks: tracks,
    isScanning: isLoading,
    loadLocalMusic,
  } = useMusicStore();
  console.log('🚀 ~ HomeScreen ~ tracks:', tracks.length);

  useEffect(() => {
    loadLocalMusic();
  }, []);

  const renderTrack = ({ item }: { item: ScannedTrack }) => (
    <TouchableOpacity
      onPress={() =>
        playTrack({
          id: item.id,
          title: item.title,
          artist: item.artist,
          artwork: item.artwork || DEFAULT_ARTWORK,
          url: item.url,
        })
      }
      className="mr-4 w-32"
    >
      <Image
        source={{ uri: item.artwork || DEFAULT_ARTWORK }}
        className="w-32 h-32 rounded-2xl mb-2 bg-white/10"
      />
      <Text numberOfLines={1} className="text-white font-medium text-sm">
        {item.title}
      </Text>
      <Text numberOfLines={1} className="text-gray-500 text-xs">
        {item.artist}
      </Text>
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
          <TouchableOpacity onPress={() => navigation.navigate('Search')} className="p-2 bg-white/5 rounded-full">
            <Search size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} className="p-2 bg-white/5 rounded-full">
            <Settings size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Featured Playlist */}
      <Text className="text-white text-lg font-bold mb-4">
        Featured Playlist
      </Text>
      <TouchableOpacity className="relative mb-8 rounded-3xl overflow-hidden h-48">
        <Image
          source={{ uri: FEATURED_PLAYLIST.artwork }}
          className="w-full h-full"
        />
        <View className="absolute inset-0 bg-black/40 p-6 justify-end">
          <Text className="text-white text-3xl font-black mb-1">
            {FEATURED_PLAYLIST.title}
          </Text>
          <Text className="text-white/80 text-sm mb-4">
            {FEATURED_PLAYLIST.description}
          </Text>
          <TouchableOpacity className="absolute bottom-6 right-6 w-12 h-12 bg-primary rounded-full items-center justify-center">
            <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Local Tracks */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-white text-lg font-bold">Your Device Tracks</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AllMusic')}>
          <Text className="text-primary text-sm">{tracks.length} tracks</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="h-32 justify-center items-center">
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : tracks.length > 0 ? (
        <FlatList
          data={tracks.slice(0, 20)} // Show only first 20 on home screen
          renderItem={renderTrack}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-8"
        />
      ) : (
        <View className="h-32 justify-center items-center">
          <Text className="text-gray-500 text-sm">No local tracks found</Text>
        </View>
      )}

      {/* Top Albums / Placeholders */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-white text-lg font-bold">Top Albums</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Albums')}>
          <Text className="text-primary text-sm">See All</Text>
        </TouchableOpacity>
      </View>
      <View className="flex-row gap-4 mb-20">
        <View className="flex-1 h-32 bg-surface rounded-2xl overflow-hidden">
          <Image
            source={{ uri: tracks[0]?.artwork || DEFAULT_ARTWORK }}
            className="w-full h-full opacity-50 bg-white/10"
          />
        </View>
        <View className="flex-1 h-32 bg-surface rounded-2xl overflow-hidden">
          <Image
            source={{ uri: tracks[1]?.artwork || DEFAULT_ARTWORK }}
            className="w-full h-full opacity-50 bg-white/10"
          />
        </View>
      </View>
    </ScrollView>
  );
};
