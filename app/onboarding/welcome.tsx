import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';
import { WELCOME_PILLARS } from '@/constants/onboarding';

const SPIRIT_BLUE = '#4f8cff';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <OnboardingShell currentStep={0}>
      <View style={styles.screen}>
        <View style={styles.top}>
          <Animated.View entering={FadeInUp.duration(540)}>
            <View style={styles.logoFrame}>
              <Image
                source={require('@/assets/images/app-logo-mark.png')}
                style={styles.logo}
                contentFit="contain"
              />
            </View>
          </Animated.View>

          <Animated.Text entering={FadeInUp.duration(540).delay(120)} style={styles.heading}>
            Welcome to Oremus
          </Animated.Text>

          <Animated.Text entering={FadeInUp.duration(540).delay(180)} style={styles.subtitle}>
            Your personal, distraction-free prayer companion with a calmer Android-first feel.
          </Animated.Text>
        </View>

        <View style={styles.pillars}>
          {WELCOME_PILLARS.map((pillar, index) => (
            <Animated.View
              key={pillar.text}
              entering={FadeInUp.duration(520).delay(220 + index * 80)}
              style={styles.pillarRow}
            >
              <View style={styles.pillarIcon}>
                <IconSymbol name={pillar.icon as IconSymbolName} size={20} color={SPIRIT_BLUE} />
              </View>
              <Text style={styles.pillarText}>{pillar.text}</Text>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInUp.duration(540).delay(420)} style={styles.bottomSection}>
          <Pressable
            accessibilityRole="button"
            android_ripple={{ color: 'rgba(255,255,255,0.12)' }}
            onPress={() => router.push('/onboarding/feature-location' as any)}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>

          <Text style={styles.footerNote}>
            We will only ask for permissions when they add value.
          </Text>
        </Animated.View>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  top: {
    flex: 0.56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  logoFrame: {
    width: 116,
    height: 116,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 12,
  },
  logo: {
    width: 84,
    height: 84,
  },
  heading: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.68)',
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 23,
  },
  pillars: {
    gap: 14,
    paddingHorizontal: 4,
  },
  pillarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pillarIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(79,140,255,0.14)',
  },
  pillarText: {
    fontSize: 16,
    color: '#eef4ff',
    fontWeight: '500',
  },
  bottomSection: {
    marginTop: 'auto',
    gap: 14,
  },
  button: {
    backgroundColor: SPIRIT_BLUE,
    minHeight: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: SPIRIT_BLUE,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 8,
  },
  buttonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footerNote: {
    color: 'rgba(255,255,255,0.54)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
