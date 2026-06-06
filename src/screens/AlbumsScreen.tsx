import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Disc3 } from 'lucide-react-native';
import { useMusicStore } from '../store/useMusicStore';

export const AlbumsScreen = () => {
  const navigation = useNavigation();
  const { scannedTracks } = useMusicStore();

  const albums = useMemo(() => {
    const albumMap = new Map<string, { artist: string; count: number }>();
    scannedTracks.forEach(track => {
      const name = track.album || 'Unknown Album';
      if (!albumMap.has(name)) {
        albumMap.set(name, { artist: track.artist || 'Unknown Artist', count: 1 });
      } else {
        albumMap.get(name)!.count++;
      }
    });
    return Array.from(albumMap.entries()).map(([name, data]) => ({
      name,
      ...data,
    }));
  }, [scannedTracks]);

  const renderAlbum = ({ item }: { item: { name: string; artist: string; count: number } }) => (
    <TouchableOpacity className="flex-1 m-2">
      <View className="w-full aspect-square rounded-xl bg-white/10 items-center justify-center mb-2 overflow-hidden">
        <Disc3 color="#FFF" size={48} opacity={0.5} />
      </View>
      <Text numberOfLines={1} className="text-white font-medium text-sm mb-1">
        {item.name}
      </Text>
      <Text numberOfLines={1} className="text-gray-400 text-xs">
        {item.artist}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-black pt-12 px-4">
      {/* Header */}
      <View className="flex-row items-center mb-6 px-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 bg-white/5 rounded-full">
          <ChevronLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <View>
          <Text className="text-white text-2xl font-bold">Albums</Text>
          <Text className="text-primary text-sm">{albums.length} albums</Text>
        </View>
      </View>

      <FlatList
        data={albums}
        keyExtractor={(item) => item.name}
        renderItem={renderAlbum}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
};
