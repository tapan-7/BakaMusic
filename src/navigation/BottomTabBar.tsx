import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Home, Search, Library, PlayCircle, User } from 'lucide-react-native';

const icons = {
  Home: Home,
  Search: Search,
  Library: Library,
  Playlists: PlayCircle,
  Profile: User,
};

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  return (
    <View className="absolute bottom-6 left-6 right-6 flex-row bg-black/90 rounded-full px-4 py-3 items-center justify-between shadow-2xl border border-white/10">
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TabItem
            key={route.key}
            isFocused={isFocused}
            onPress={onPress}
            label={route.name}
          />
        );
      })}
    </View>
  );
};

const TabItem = ({
  isFocused,
  onPress,
  label,
}: {
  isFocused: boolean;
  onPress: () => void;
  label: string;
}) => {
  const Icon = icons[label as keyof typeof icons] || Home;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="items-center"
    >
      <Animated.View
        style={{
          backgroundColor: isFocused ? 'rgba(255, 0, 0, 0.2)' : 'transparent',
          borderRadius: 20,
          padding: 8,
          opacity: isFocused ? 1 : 0.5,
        }}
      >
        <Icon size={24} color={isFocused ? '#FF0000' : '#FFFFFF'} />
      </Animated.View>
      {isFocused && (
        <Animated.Text
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="text-[10px] text-primary mt-1 font-medium"
        >
          {label}
        </Animated.Text>
      )}
    </TouchableOpacity>
  );
};
