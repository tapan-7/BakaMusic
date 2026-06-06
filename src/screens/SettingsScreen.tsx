import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, RefreshCcw, Palette, HardDrive, Info } from 'lucide-react-native';
import { useMusicStore } from '../store/useMusicStore';

export const SettingsScreen = () => {
  const navigation = useNavigation();
  const { loadLocalMusic, isScanning } = useMusicStore();

  const handleRescan = async () => {
    Alert.alert(
      "Re-scan Library",
      "This will fetch all tracks from your device again.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Scan", 
          onPress: () => {
            loadLocalMusic();
          }
        }
      ]
    );
  };

  const SettingRow = ({ icon: Icon, title, description, onPress }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      className="flex-row items-center bg-white/5 p-4 rounded-2xl mb-4"
    >
      <View className="w-12 h-12 rounded-full bg-white/10 items-center justify-center mr-4">
        <Icon color="#FFF" size={24} />
      </View>
      <View className="flex-1">
        <Text className="text-white font-medium text-base mb-1">{title}</Text>
        <Text className="text-gray-400 text-sm">{description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-black pt-12 px-6">
      {/* Header */}
      <View className="flex-row items-center mb-8">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 p-2 bg-white/5 rounded-full">
          <ChevronLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-white text-lg font-bold mb-4">Library</Text>
        <SettingRow 
          icon={RefreshCcw} 
          title={isScanning ? "Scanning..." : "Re-scan Library"} 
          description="Update your library with new device tracks"
          onPress={isScanning ? undefined : handleRescan}
        />
        <SettingRow 
          icon={HardDrive} 
          title="Storage" 
          description="Manage offline downloads and cache"
          onPress={() => Alert.alert("Storage", "Storage management coming soon")}
        />

        <Text className="text-white text-lg font-bold mb-4 mt-4">Appearance</Text>
        <SettingRow 
          icon={Palette} 
          title="Theme" 
          description="Dark mode enabled"
          onPress={() => Alert.alert("Theme", "Theme options coming soon")}
        />

        <Text className="text-white text-lg font-bold mb-4 mt-4">About</Text>
        <SettingRow 
          icon={Info} 
          title="BakaMusic Version" 
          description="1.0.0 (Build 14)"
          onPress={() => {}}
        />
      </ScrollView>
    </View>
  );
};
