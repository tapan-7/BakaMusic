import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { useMusicStore } from '../store/useMusicStore';
import { usePlayer } from '../hooks/usePlayer';
import { ScannedTrack } from '../services/musicScannerService';

const DEFAULT_ARTWORK = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop';

import { TrackListItem } from '../components/TrackListItem';

export const AllMusicScreen = () => {
  const navigation = useNavigation();
  const { scannedTracks } = useMusicStore();
  const { playTrack } = usePlayer();

  const renderTrack = ({ item }: { item: ScannedTrack }) => (
    <TrackListItem 
      track={item} 
      onPress={playTrack} 
    />
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
