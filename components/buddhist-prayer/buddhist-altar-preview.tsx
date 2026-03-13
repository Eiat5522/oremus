import React, { Suspense, lazy } from 'react';
import { ActivityIndicator, StyleSheet, View, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BuddhistPrayerColors, BuddhistPrayerRadius } from '@/constants/buddhist-prayer/theme';

import type { BuddhistAltar3DProps } from './buddhist-altar-3d';

const LazyBuddhistAltar3D = lazy(async () => {
  const module = await import('./buddhist-altar-3d');
  return { default: module.BuddhistAltar3D };
});

interface BuddhistAltarPreviewProps extends BuddhistAltar3DProps {
  fallbackStyle?: ViewStyle;
}

class AltarPreviewErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function AltarPreviewFallback({ style, message }: { style?: ViewStyle; message: string }) {
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Buddhist altar preview unavailable"
      style={[styles.fallback, style]}
      testID="altar-loading"
    >
      <ActivityIndicator color={BuddhistPrayerColors.goldPrimary} />
      <ThemedText style={styles.fallbackText}>{message}</ThemedText>
    </View>
  );
}

export function BuddhistAltarPreview({ fallbackStyle, ...props }: BuddhistAltarPreviewProps) {
  return (
    <AltarPreviewErrorBoundary
      fallback={
        <AltarPreviewFallback
          style={fallbackStyle}
          message="Altar preview unavailable. You can continue with the text-only prayer flow."
        />
      }
    >
      <Suspense
        fallback={<AltarPreviewFallback style={fallbackStyle} message="Preparing 3D altar…" />}
      >
        <LazyBuddhistAltar3D {...props} />
      </Suspense>
    </AltarPreviewErrorBoundary>
  );
}

const styles = StyleSheet.create({
  fallback: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: BuddhistPrayerRadius.xl,
    borderWidth: 1,
    borderColor: BuddhistPrayerColors.cardBorder,
    backgroundColor: BuddhistPrayerColors.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
  },
  fallbackText: {
    color: BuddhistPrayerColors.textSecondary,
    textAlign: 'center',
  },
});
