import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { SlideToggle } from '@/components/onboarding/slide-toggle';

const REVEAL_DELAY = 360;
const REVEAL_DURATION = 520;

export default function SplashGateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(16);
  const cardScale = useSharedValue(0.96);

  useEffect(() => {
    contentOpacity.value = withDelay(REVEAL_DELAY, withTiming(1, { duration: REVEAL_DURATION }));
    contentTranslateY.value = withDelay(REVEAL_DELAY, withTiming(0, { duration: REVEAL_DURATION }));
    cardScale.value = withDelay(REVEAL_DELAY, withSpring(1, { damping: 16, stiffness: 140 }));
  }, [cardScale, contentOpacity, contentTranslateY]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  return (
    <OnboardingShell>
      <View style={styles.screen}>
        <View style={styles.center}>
          <Animated.View style={[styles.logoCard, cardStyle]}>
            <Image
              source={require('@/assets/images/app-logo-mark.png')}
              style={styles.logo}
              contentFit="contain"
            />
          </Animated.View>

          <Animated.View style={[styles.copyBlock, contentStyle]}>
            <Text style={styles.heading}>Oremus</Text>
            <Text style={styles.subtitle}>A calm prayer companion designed for daily rhythm.</Text>
          </Animated.View>

          <Animated.View style={[styles.pillRow, contentStyle]}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>Prayer times</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>AR guidance</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>Gentle reminders</Text>
            </View>
          </Animated.View>
        </View>

        <Animated.View style={[styles.bottom, { paddingBottom: insets.bottom + 24 }, contentStyle]}>
          <SlideToggle
            label="Swipe to begin"
            onActivate={() => router.push('/onboarding/welcome')}
          />
          <Text style={styles.footerNote}>A quick swipe keeps the start intentional.</Text>
        </Animated.View>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 22,
  },
  logoCard: {
    width: 148,
    height: 148,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 28,
    elevation: 16,
  },
  logo: {
    width: 102,
    height: 102,
  },
  copyBlock: {
    alignItems: 'center',
    gap: 10,
  },
  heading: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
    maxWidth: 280,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pillText: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
    fontWeight: '600',
  },
  bottom: {
    alignItems: 'center',
    gap: 14,
  },
  footerNote: {
    color: 'rgba(255,255,255,0.52)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
