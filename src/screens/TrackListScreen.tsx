import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { useMusicStore } from '../store/useMusicStore';
import { usePlayer } from '../hooks/usePlayer';
import { TrackListItem } from '../components/TrackListItem';

export const TrackListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { title, type, value } = route.params || {};
  
  const { scannedTracks } = useMusicStore();
  const { playTrack } = usePlayer();

  const filteredTracks = useMemo(() => {
    return scannedTracks.filter(track => {
      if (type === 'artist') {
        const artistName = track.artist || 'Unknown Artist';
        return artistName === value;
      }
      if (type === 'album') {
        const albumName = track.album || 'Unknown Album';
        return albumName === value;
      }
      return true;
    });
  }, [scannedTracks, type, value]);

  return (
    <View className="flex-1 bg-black pt-12 px-6">
      <View className="flex-row items-center mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 bg-white/5 rounded-full">
          <ChevronLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text numberOfLines={1} className="text-white text-2xl font-bold">{title}</Text>
          <Text className="text-primary text-sm">{filteredTracks.length} songs</Text>
        </View>
      </View>

      <FlatList
        data={filteredTracks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TrackListItem track={item} onPress={playTrack} />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
        ListEmptyComponent={
          <View className="items-center mt-10">
            <Text className="text-gray-500">No tracks found.</Text>
          </View>
        }
      />
    </View>
  );
};
