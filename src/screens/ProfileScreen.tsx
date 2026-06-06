import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Settings, ChevronRight, Music2, Album as AlbumIcon, Heart, ListMusic, Download, Clock, Activity, BarChart3, User, Edit2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing,
} from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { useProfileStore } from '../store/useProfileStore';
import { useMusicStats } from '../store/useMusicStore';

export const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const rotation = useSharedValue(0);
  const { profile, updateProfile } = useProfileStore();
  const { songsCount, albumsCount, artistsCount } = useMusicStats();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editBio, setEditBio] = useState(profile.bio);

  const STATS = [
    { label: 'Songs', value: songsCount.toString() },
    { label: 'Albums', value: albumsCount.toString() },
    { label: 'Artists', value: artistsCount.toString() },
  ];

  const MENU_ITEMS = [
    { icon: Music2, label: 'My Songs', count: songsCount.toString(), screen: 'AllMusic' },
    { icon: AlbumIcon, label: 'Albums', count: albumsCount.toString(), screen: 'Albums' },
    { icon: Heart, label: 'Favorites', count: '0', screen: 'AllMusic' },
    { icon: ListMusic, label: 'Playlists', count: artistsCount.toString(), screen: 'Playlists' },
    { icon: Download, label: 'Downloads', count: '0', screen: null },
  ];

  const handleSaveProfile = () => {
    updateProfile({ name: editName, bio: editBio });
    setIsEditing(false);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      updateProfile({ profileImageUri: result.assets[0].uri });
    }
  };

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1 pt-12">
        {/* Header */}
        <View className="flex-row justify-between px-6 items-center mb-8">
          <TouchableOpacity className="p-2 bg-white/5 rounded-full">
            <ChevronRight size={24} color="#FFFFFF" className="rotate-180" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Profile</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} className="p-2 bg-white/5 rounded-full">
            <Settings size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View className="items-center mb-10">
          <TouchableOpacity className="relative" onPress={pickImage}>
            <Animated.View 
              style={[animatedRingStyle]}
              className="absolute -inset-2 border-2 border-primary border-t-transparent rounded-full"
            />
            <Image 
              source={{ uri: profile.profileImageUri || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' }} 
              className="w-24 h-24 rounded-full border-2 border-black"
            />
            <View className="absolute -bottom-2 -right-2 bg-yellow-500 px-2 py-0.5 rounded-full flex-row items-center">
                <Text className="text-[10px] font-bold text-black">Premium</Text>
            </View>
            <View className="absolute bottom-0 right-0 bg-black/50 p-1 rounded-full">
                <Edit2 size={12} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          
          {isEditing ? (
            <View className="mt-6 items-center w-full px-10">
              <TextInput 
                className="text-white text-2xl font-bold bg-white/10 w-full text-center rounded-lg py-1 mb-2"
                value={editName}
                onChangeText={setEditName}
                placeholder="Name"
                placeholderTextColor="#999"
              />
              <TextInput 
                className="text-gray-400 bg-white/10 w-full text-center rounded-lg py-1 mb-4"
                value={editBio}
                onChangeText={setEditBio}
                placeholder="Bio"
                placeholderTextColor="#999"
              />
              <TouchableOpacity onPress={handleSaveProfile} className="bg-primary px-6 py-2 rounded-full">
                <Text className="text-white font-bold">Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="items-center mt-6">
              <View className="flex-row items-center gap-2">
                <Text className="text-white text-2xl font-bold">{profile.name}</Text>
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Edit2 size={16} color="#666" />
                </TouchableOpacity>
              </View>
              <Text className="text-gray-500">{profile.bio}</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View className="flex-row justify-around mb-10 px-10">
          {STATS.map((stat, i) => (
            <View key={i} className="items-center">
              <Text className="text-white text-xl font-bold">{stat.value}</Text>
              <Text className="text-gray-500 text-xs">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu Section */}
        <View className="bg-white rounded-t-[40px] pt-8 pb-32 px-6">
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity 
              key={i} 
              className="flex-row items-center justify-between py-4 border-b border-gray-100"
              onPress={() => item.screen ? navigation.navigate(item.screen) : null}
            >
              <View className="flex-row items-center gap-4">
                <View className="p-2 bg-gray-50 rounded-xl">
                  <item.icon size={20} color="#000000" />
                </View>
                <Text className="text-black font-semibold text-base">{item.label}</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-gray-400 text-sm">{item.count}</Text>
                <ChevronRight size={20} color="#CCCCCC" />
              </View>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity 
            className="flex-row items-center gap-4 py-4 mt-4"
            onPress={() => navigation.navigate('Settings')}
          >
            <View className="p-2 bg-gray-50 rounded-xl">
                <Settings size={20} color="#000000" />
            </View>
            <Text className="text-black font-semibold text-base">Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

    </View>
  );
};
