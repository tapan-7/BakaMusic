import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { Music2, Album as AlbumIcon, User, Radio, Download, ChevronRight, Plus } from 'lucide-react-native';
import { useMusicStore, useMusicStats } from '../store/useMusicStore';
import { usePlayer } from '../hooks/usePlayer';

const DEFAULT_ARTWORK = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop';

export const LibraryScreen = () => {
  const { scannedTracks, isScanning } = useMusicStore();
  const { songsCount, albumsCount, artistsCount } = useMusicStats();
  const { playTrack } = usePlayer();

  const LIB_ITEMS = [
    { icon: Music2, label: 'Songs', count: songsCount.toString() },
    { icon: AlbumIcon, label: 'Albums', count: albumsCount.toString() },
    { icon: User, label: 'Artists', count: artistsCount.toString() },
  ];

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
            <Text className="text-gray-500 text-sm">
              {item.count}
            </Text>
            <ChevronRight size={18} color="#333" />
          </View>
        </TouchableOpacity>
      ))}

      <View className="flex-row justify-between items-center mt-4 mb-6">
        <Text className="text-white text-xl font-bold">Local Music</Text>
        <TouchableOpacity><Text className="text-primary text-sm">{isScanning ? 'Scanning...' : 'See All'}</Text></TouchableOpacity>
      </View>

      {scannedTracks.length === 0 && !isScanning ? (
        <Text className="text-gray-500 text-center mt-4">No local music found.</Text>
      ) : (
        scannedTracks.slice(0, 50).map((item, i) => (
          <TouchableOpacity 
            key={i} 
            className="flex-row items-center gap-4 mb-4"
            onPress={() => playTrack({
              id: item.id,
              title: item.title,
              artist: item.artist,
              artwork: item.artwork || DEFAULT_ARTWORK,
              url: item.url
            })}
          >
            {item.artwork ? (
              <Image source={{ uri: item.artwork }} className="w-14 h-14 rounded-xl" />
            ) : (
              <View className="w-14 h-14 bg-white/10 rounded-xl items-center justify-center">
                <Music2 size={24} color="#666" />
              </View>
            )}
            <View className="flex-1">
              <Text className="text-white font-bold" numberOfLines={1}>{item.title}</Text>
              <Text className="text-gray-500 text-xs">{item.artist}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
      <View className="h-32" />
    </ScrollView>
  );
};


export const PlaylistScreen = () => {
  const { scannedTracks } = useMusicStore();

  // Group tracks by artist to create "Auto-Playlists"
  const artistPlaylists = React.useMemo(() => {
    const map = new Map<string, { count: number, artwork: string }>();
    scannedTracks.forEach(track => {
      if (!track.artist) return;
      if (!map.has(track.artist)) {
        map.set(track.artist, { count: 1, artwork: track.artwork || DEFAULT_ARTWORK });
      } else {
        const entry = map.get(track.artist)!;
        entry.count += 1;
        if (!entry.artwork || entry.artwork === DEFAULT_ARTWORK) {
            entry.artwork = track.artwork || DEFAULT_ARTWORK;
        }
      }
    });
    return Array.from(map.entries()).map(([artist, data]) => ({
      title: `${artist} Mix`,
      count: `${data.count} songs`,
      artwork: data.artwork
    }));
  }, [scannedTracks]);

  return (
    <ScrollView className="flex-1 bg-black pt-12 px-6">
      <View className="flex-row justify-between items-center mb-8">
        <Text className="text-white text-3xl font-black">Playlists</Text>
        <TouchableOpacity className="p-2 bg-white/5 rounded-full">
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {artistPlaylists.length === 0 ? (
         <View className="items-center mt-10">
            <Text className="text-gray-500">No playlists available.</Text>
         </View>
      ) : (
        <View className="flex-row flex-wrap justify-between">
            {artistPlaylists.map((item, i) => (
            <TouchableOpacity key={i} className="w-[48%] mb-6">
                <Image source={{ uri: item.artwork }} className="w-full aspect-square rounded-3xl mb-3 bg-white/10" />
                <Text className="text-white font-bold text-base" numberOfLines={1}>{item.title}</Text>
                <Text className="text-gray-500 text-xs">{item.count}</Text>
            </TouchableOpacity>
            ))}
        </View>
      )}
      
      <View className="h-32" />
    </ScrollView>
  );
};
