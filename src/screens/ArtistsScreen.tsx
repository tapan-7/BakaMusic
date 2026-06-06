import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, User2 } from 'lucide-react-native';
import { useMusicStore } from '../store/useMusicStore';

export const ArtistsScreen = () => {
  const navigation = useNavigation();
  const { scannedTracks } = useMusicStore();

  const artists = useMemo(() => {
    const artistMap = new Map<string, number>();
    scannedTracks.forEach(track => {
      const name = track.artist || 'Unknown Artist';
      artistMap.set(name, (artistMap.get(name) || 0) + 1);
    });
    return Array.from(artistMap.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }, [scannedTracks]);

  const renderArtist = ({ item }: { item: { name: string; count: number } }) => (
    <TouchableOpacity className="flex-row items-center mb-6">
      <View className="w-14 h-14 rounded-full bg-white/10 items-center justify-center mr-4">
        <User2 color="#FFF" size={24} />
      </View>
      <View className="flex-1 justify-center">
        <Text numberOfLines={1} className="text-white font-medium text-base mb-1">
          {item.name}
        </Text>
        <Text className="text-gray-400 text-sm">
          {item.count} {item.count === 1 ? 'song' : 'songs'}
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
          <Text className="text-white text-2xl font-bold">Artists</Text>
          <Text className="text-primary text-sm">{artists.length} artists</Text>
        </View>
      </View>

      <FlatList
        data={artists}
        keyExtractor={(item) => item.name}
        renderItem={renderArtist}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
};
