import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, FlatList, Image } from 'react-native';
import { Search, X, Clock, TrendingUp, Music2 } from 'lucide-react-native';
import { useMusicStore } from '../store/useMusicStore';
import { usePlayer } from '../hooks/usePlayer';

const DEFAULT_ARTWORK = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1000&auto=format&fit=crop';

export const SearchScreen = () => {
  const { scannedTracks } = useMusicStore();
  const { playTrack } = usePlayer();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTracks = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lowerQuery = searchQuery.toLowerCase();
    return scannedTracks.filter(track => 
      track.title.toLowerCase().includes(lowerQuery) || 
      track.artist.toLowerCase().includes(lowerQuery)
    );
  }, [searchQuery, scannedTracks]);

  return (
    <View className="flex-1 bg-black pt-12 px-6">
      {/* Search Bar */}
      <View className="flex-row items-center bg-surface rounded-2xl px-4 py-3 mb-8 border border-white/5">
        <Search size={20} color="#666" />
        <TextInput 
          placeholder="Search songs, artists..."
          placeholderTextColor="#666"
          className="flex-1 ml-3 text-white font-medium"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {searchQuery.trim() === '' ? (
        <ScrollView showsVerticalScrollIndicator={false} className="mb-20">
          <View className="items-center mt-20">
            <Search size={48} color="#333" className="mb-4" />
            <Text className="text-gray-500 text-center">Type a song or artist name to search your local music library.</Text>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={filteredTracks}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          className="mb-20"
          ListEmptyComponent={
            <Text className="text-gray-500 text-center mt-10">No tracks found for "{searchQuery}"</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
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
          )}
        />
      )}
    </View>
  );
};
