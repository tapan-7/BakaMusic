import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { useMusicStore } from '../store/useMusicStore';
import { usePlayer } from '../hooks/usePlayer';
import { ScannedTrack } from '../services/musicScannerService';

const DEFAULT_ARTWORK = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop';

export const AllMusicScreen = () => {
  const navigation = useNavigation();
  const { scannedTracks } = useMusicStore();
  const { playTrack } = usePlayer();

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
      className="flex-row items-center mb-4"
    >
      <Image
        source={{ uri: item.artwork || DEFAULT_ARTWORK }}
        className="w-14 h-14 rounded-lg mr-4 bg-white/10"
      />
      <View className="flex-1 justify-center">
        <Text numberOfLines={1} className="text-white font-medium text-base mb-1">
          {item.title}
        </Text>
        <Text numberOfLines={1} className="text-gray-400 text-sm">
          {item.artist}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-black pt-12 px-6">
      {/* Header */}
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 bg-white/5 rounded-full">
          <ChevronLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <View>
          <Text className="text-white text-2xl font-bold">All Music</Text>
          <Text className="text-primary text-sm">{scannedTracks.length} tracks</Text>
        </View>
      </View>

      <FlatList
        data={scannedTracks}
        keyExtractor={(item) => item.id}
        renderItem={renderTrack}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
};
