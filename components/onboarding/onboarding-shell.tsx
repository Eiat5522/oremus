import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProgressDots } from '@/components/onboarding/progress-dots';

interface OnboardingShellProps {
  children: React.ReactNode;
  currentStep?: number;
  totalSteps?: number;
  style?: ViewStyle;
}

export function OnboardingShell({
  children,
  currentStep,
  totalSteps,
  style,
}: OnboardingShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, style]}>
      <LinearGradient
        colors={['#0d1624', '#111b2c', '#0f1621']}
        locations={[0, 0.56, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />
      <View style={styles.noise} />

      {typeof currentStep === 'number' ? (
        <View style={[styles.progress, { paddingTop: insets.top + 12 }]}>
          <ProgressDots currentStep={currentStep} totalSteps={totalSteps} />
        </View>
      ) : (
        <View style={{ paddingTop: insets.top }} />
      )}

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0d1624',
  },
  glowTop: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: 'rgba(37, 99, 235, 0.14)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: 40,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: 'rgba(249, 115, 22, 0.07)',
  },
  noise: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  progress: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  content: {
    flex: 1,
  },
});
