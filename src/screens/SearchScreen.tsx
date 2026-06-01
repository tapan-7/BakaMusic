import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { Search, X, Clock, TrendingUp } from 'lucide-react-native';

const TRENDING = ['Drake', 'Eminem', 'Travis Scott', 'Billie Eilish', 'Imagine Dragons'];
const RECENT = ['Blinding Lights', 'After Hours', 'The Weeknd', 'Starboy'];

export const SearchScreen = () => {
  return (
    <View className="flex-1 bg-black pt-12 px-6">
      {/* Search Bar */}
      <View className="flex-row items-center bg-surface rounded-2xl px-4 py-3 mb-8 border border-white/5">
        <Search size={20} color="#666" />
        <TextInput 
          placeholder="Search songs, albums, artists..."
          placeholderTextColor="#666"
          className="flex-1 ml-3 text-white font-medium"
        />
        <TouchableOpacity>
          <X size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="mb-20">
        {/* Recent Searches */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-lg font-bold">Recent Searches</Text>
          <TouchableOpacity><Text className="text-primary text-sm">See All</Text></TouchableOpacity>
        </View>
        {RECENT.map((item, i) => (
          <TouchableOpacity key={i} className="flex-row items-center gap-3 mb-4">
            <Clock size={18} color="#666" />
            <Text className="text-gray-300 text-base">{item}</Text>
          </TouchableOpacity>
        ))}

        {/* Trending Searches */}
        <Text className="text-white text-lg font-bold mt-6 mb-4">Trending Searches</Text>
        <View className="flex-row flex-wrap gap-2">
          {TRENDING.map((item, i) => (
            <TouchableOpacity key={i} className="bg-surface px-4 py-2 rounded-full border border-white/5">
              <Text className="text-gray-300 text-sm font-medium">{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
