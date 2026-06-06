import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { Music2, Album as AlbumIcon, User, Radio, Download, ChevronRight, Plus } from 'lucide-react-native';
import { useMusicStore, useMusicStats } from '../store/useMusicStore';
import { usePlayer } from '../hooks/usePlayer';

import { useNavigation } from '@react-navigation/native';
import { TrackListItem } from '../components/TrackListItem';

const DEFAULT_ARTWORK = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop';

export const LibraryScreen = () => {
  const { scannedTracks, isScanning } = useMusicStore();
  const { songsCount, albumsCount, artistsCount } = useMusicStats();
  const { playTrack } = usePlayer();
  const navigation = useNavigation<any>();

  const LIB_ITEMS = [
    { icon: Music2, label: 'Songs', count: songsCount.toString(), screen: 'AllMusic' },
    { icon: AlbumIcon, label: 'Albums', count: albumsCount.toString(), screen: 'Albums' },
    { icon: User, label: 'Artists', count: artistsCount.toString(), screen: 'Artists' },
  ];

  return (
    <ScrollView className="flex-1 bg-black pt-12 px-6">
      <Text className="text-white text-3xl font-black mb-8">Library</Text>
      
      {LIB_ITEMS.map((item, i) => (
        <TouchableOpacity 
          key={i} 
          className="flex-row items-center justify-between mb-6"
          onPress={() => item.screen ? navigation.navigate(item.screen) : null}
        >
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
        <TouchableOpacity onPress={() => navigation.navigate('AllMusic')}>
          <Text className="text-primary text-sm">{isScanning ? 'Scanning...' : 'See All'}</Text>
        </TouchableOpacity>
      </View>

      {scannedTracks.length === 0 && !isScanning ? (
        <Text className="text-gray-500 text-center mt-4">No local music found.</Text>
      ) : (
        scannedTracks.slice(0, 50).map((item, i) => (
          <TrackListItem 
            key={i} 
            track={item} 
            onPress={playTrack} 
          />
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
