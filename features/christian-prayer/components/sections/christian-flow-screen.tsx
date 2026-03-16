import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { ChristianPrayerPalette, ChristianPrayerSpacing } from '@/features/christian-prayer/constants';

const CHRISTIAN_BACKGROUND = require('@/assets/images/background/christianity-waterpaint.png');

interface ChristianFlowScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
}

export function ChristianFlowScreen({
  children,
  scrollable = true,
}: ChristianFlowScreenProps) {
  return (
    <View style={styles.container}>
      <Image source={CHRISTIAN_BACKGROUND} style={StyleSheet.absoluteFillObject} contentFit="cover" />
      <LinearGradient
        colors={[
          ChristianPrayerPalette.overlayTop,
          ChristianPrayerPalette.overlayMid,
          ChristianPrayerPalette.overlayBottom,
        ]}
        style={StyleSheet.absoluteFillObject}
      />

      {scrollable ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={styles.content}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ChristianPrayerPalette.background,
  },
  content: {
    flex: 1,
    paddingTop: 72,
    paddingHorizontal: ChristianPrayerSpacing.md,
    paddingBottom: ChristianPrayerSpacing.xl,
  },
  scrollContent: {
    paddingTop: 72,
    paddingHorizontal: ChristianPrayerSpacing.md,
    paddingBottom: 56,
    gap: ChristianPrayerSpacing.md,
  },
});
