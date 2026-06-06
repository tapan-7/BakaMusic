import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming,
  interpolate,
  FadeIn,
} from 'react-native-reanimated';
import { Home, Search, Library, PlayCircle, User } from 'lucide-react-native';

const icons = {
  Home: Home,
  Search: Search,
  Library: Library,
  Playlists: PlayCircle,
  Profile: User,
};

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
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

const TabItem = ({ isFocused, onPress, label }: { isFocused: boolean; onPress: () => void; label: string }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(isFocused ? 1 : 0.5);
  const Icon = icons[label as keyof typeof icons] || Home;

  React.useEffect(() => {
    opacity.value = withTiming(isFocused ? 1 : 0.5, { duration: 200 });
  }, [isFocused]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedBackgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: isFocused ? 'rgba(255, 0, 0, 0.2)' : 'transparent',
    borderRadius: 20,
    padding: 8,
  }));

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={() => (scale.value = withSpring(0.9))}
      onPressOut={() => (scale.value = withSpring(1))}
      className="items-center"
    >
      <Animated.View style={[animatedBackgroundStyle, animatedIconStyle]}>
        <Icon size={24} color={isFocused ? '#FF0000' : '#FFFFFF'} />
      </Animated.View>
      {isFocused && (
          <Animated.Text 
            entering={FadeIn.duration(200)}
            className="text-[10px] text-primary mt-1 font-medium"
          >
            {label}
          </Animated.Text>
      )}
    </TouchableOpacity>
  );
};
