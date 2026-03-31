import { ProgressDots } from '@/components/onboarding/progress-dots';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { TRADITION_OPTIONS } from '@/constants/traditions';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useTradition } from '@/hooks/use-tradition';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SPIRIT_BLUE = '#1152d4';
const BG_COLOR = '#101622';

export default function CompletionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { completeOnboarding } = useOnboarding();
  const { tradition } = useTradition();

  const traditionOption = TRADITION_OPTIONS.find((t) => t.id === tradition);

  const handleEnter = async () => {
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.dotsContainer}>
        <ProgressDots currentStep={5} />
      </View>

      <View style={styles.center}>
        <Animated.View entering={ZoomIn.springify().damping(12)} style={styles.checkCircle}>
          <IconSymbol name="checkmark" size={40} color="#fff" />
        </Animated.View>

        <Animated.Text entering={FadeInUp.delay(200).duration(500)} style={styles.heading}>
          You&apos;re All Set!
        </Animated.Text>

        <Animated.Text entering={FadeInUp.delay(350).duration(500)} style={styles.subtitle}>
          Your prayer companion is ready
        </Animated.Text>

        {traditionOption && (
          <Animated.View entering={FadeInUp.delay(500).duration(500)} style={styles.traditionPill}>
            <IconSymbol
              name={traditionOption.icon as IconSymbolName}
              size={18}
              color={traditionOption.color}
            />
            <Text style={styles.traditionText}>{traditionOption.title}</Text>
          </Animated.View>
        )}
      </View>

      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Pressable style={styles.button} onPress={handleEnter}>
          <Text style={styles.buttonText}>Enter Oremus</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  dotsContainer: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: SPIRIT_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 24,
  },
  traditionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  traditionText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
  bottom: {
    paddingHorizontal: 24,
  },
  button: {
    height: 56,
    borderRadius: 28,
    backgroundColor: SPIRIT_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#fff',
  },
});
