import React from 'react';
import {View, ScrollView, Dimensions, StyleSheet} from 'react-native';
import {ThemedView} from '../components/atoms/ThemedView';
import {ThemedText} from '../components/atoms/ThemedText';
import {Button} from '../components/atoms/Button';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTheme} from '../core/theme/useTheme';

const {width} = Dimensions.get('window');

const slides = [
  {
    title: 'Pure Music',
    description:
      'A distraction-free player focused on what matters: your music.',
  },
  {
    title: 'Offline Playback',
    description: 'Access your local library instantly. No cloud, no buffering.',
  },
  {
    title: 'Your Style',
    description: 'Switch themes and accents to make it yours.',
    isLast: true,
  },
];

export const OnboardingScreen = () => {
  const navigation = useNavigation<any>();
  const {colors} = useTheme();

  const finishOnboarding = async () => {
    await AsyncStorage.setItem('hasLaunched', 'true');
    navigation.replace('Home');
  };

  return (
    <ThemedView style={{flex: 1}}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{flexGrow: 1}}>
        {slides.map((slide, index) => (
          <View
            key={index}
            style={{
              width,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 40,
            }}>
            <View
              style={{
                marginBottom: 40,
                width: 200,
                height: 200,
                borderRadius: 100,
                backgroundColor: colors.surfaceHighlight,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <ThemedText variant="header" style={{fontSize: 60, opacity: 0.5}}>
                {index + 1}
              </ThemedText>
            </View>

            <ThemedText
              variant="header"
              style={{marginBottom: 16, textAlign: 'center'}}>
              {slide.title}
            </ThemedText>
            <ThemedText
              variant="body"
              color="muted"
              style={{textAlign: 'center', marginBottom: 40, lineHeight: 24}}>
              {slide.description}
            </ThemedText>

            {slide.isLast ? (
              <Button
                title="Get Started"
                onPress={finishOnboarding}
                style={{minWidth: 200}}
              />
            ) : (
              <ThemedText variant="caption" color="muted">
                Swipe to continue
              </ThemedText>
            )}
          </View>
        ))}
      </ScrollView>
    </ThemedView>
  );
};
