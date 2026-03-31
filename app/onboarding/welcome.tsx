import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { ProgressDots } from '@/components/onboarding/progress-dots';
import { WELCOME_PILLARS } from '@/constants/onboarding';

const SPIRIT_BLUE = '#1152d4';
const BG = '#101622';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.dotsContainer, { paddingTop: insets.top + 12 }]}>
        <ProgressDots currentStep={0} />
      </View>
      <View style={styles.top}>
        <Animated.View entering={FadeInUp.duration(600)}>
          <Image
            source={require('@/assets/images/app-logo-mark.png')}
            style={styles.logo}
            contentFit="contain"
          />
        </Animated.View>

        <Animated.Text entering={FadeInUp.duration(600).delay(200)} style={styles.heading}>
          Welcome to Oremus
        </Animated.Text>

        <Animated.Text entering={FadeInUp.duration(600).delay(300)} style={styles.subtitle}>
          Your personal, distraction-free prayer companion
        </Animated.Text>
      </View>

      <View style={styles.pillars}>
        {WELCOME_PILLARS.map((pillar, index) => (
          <Animated.View
            key={pillar.text}
            entering={FadeInUp.duration(600).delay(400 + index * 100)}
            style={styles.pillarRow}
          >
            <IconSymbol name={pillar.icon as IconSymbolName} size={24} color={SPIRIT_BLUE} />
            <Text style={styles.pillarText}>{pillar.text}</Text>
          </Animated.View>
        ))}
      </View>

      <Animated.View
        entering={FadeInUp.duration(600).delay(600)}
        style={[styles.bottomSection, { paddingBottom: insets.bottom + 24 }]}
      >
        <Pressable
          onPress={() => router.push('/onboarding/feature-location' as any)}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  dotsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  top: {
    flex: 0.6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 24,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
  pillars: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  pillarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  pillarText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
  },
  bottomSection: {
    marginTop: 'auto',
    paddingHorizontal: 24,
  },
  button: {
    backgroundColor: SPIRIT_BLUE,
    height: 56,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
