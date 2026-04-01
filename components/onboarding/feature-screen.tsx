import { Image } from 'expo-image';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { FeatureScreenContent } from '@/constants/onboarding';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface FeatureScreenProps {
  content: FeatureScreenContent;
  onPrimaryCta: () => void;
  onSkip: () => void;
}

export function FeatureScreen({ content, onPrimaryCta, onSkip }: FeatureScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(520)} style={styles.heroStack}>
          <View style={styles.badgeRow}>
            <View style={styles.optionalBadge}>
              <Text style={styles.optionalBadgeText}>{content.badgeLabel ?? 'Optional'}</Text>
            </View>
            <Text style={styles.badgeSupport}>You decide when to turn this on.</Text>
          </View>

          <View style={styles.heroFrame}>
            {content.screenshot ? (
              <Image
                source={content.screenshot}
                style={styles.screenshot}
                contentFit="cover"
                transition={260}
              />
            ) : null}
            <View style={styles.heroFrameGlow} />
          </View>

          <View style={styles.frameCaption}>
            <IconSymbol name="shield.lock" size={16} color="rgba(255,255,255,0.72)" />
            <Text style={styles.frameCaptionText}>
              {content.helperText ?? 'You can enable this later from Settings.'}
            </Text>
          </View>
        </Animated.View>

        <View style={styles.copyBlock}>
          <Animated.Text entering={FadeInUp.duration(520).delay(80)} style={styles.headline}>
            {content.headline}
          </Animated.Text>
          <Animated.Text entering={FadeInUp.duration(520).delay(140)} style={styles.description}>
            {content.description}
          </Animated.Text>
        </View>

        <View style={styles.bulletList}>
          {content.bullets.map((bullet, index) => (
            <Animated.View
              key={bullet.text}
              entering={FadeInUp.duration(460).delay(180 + index * 70)}
              style={styles.bulletCard}
            >
              <View style={styles.bulletIconWrap}>
                <IconSymbol name={bullet.icon as any} size={18} color="#dbe8ff" />
              </View>
              <Text style={styles.bulletText}>{bullet.text}</Text>
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      <Animated.View entering={FadeInDown.duration(520).delay(120)} style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          android_ripple={{ color: 'rgba(255,255,255,0.12)' }}
          onPress={onPrimaryCta}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
        >
          <Text style={styles.primaryLabel}>{content.ctaLabel}</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          android_ripple={{ color: 'rgba(255,255,255,0.08)' }}
          onPress={onSkip}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.secondaryButtonPressed,
          ]}
        >
          <Text style={styles.secondaryLabel}>{content.skipLabel}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    gap: 24,
  },
  heroStack: {
    gap: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  optionalBadgeText: {
    color: '#f8fbff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  badgeSupport: {
    color: 'rgba(255,255,255,0.58)',
    fontSize: 13,
    fontWeight: '500',
    flexShrink: 1,
  },
  heroFrame: {
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 14,
  },
  screenshot: {
    width: '100%',
    aspectRatio: 0.82,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  heroFrameGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(79,140,255,0.12)',
  },
  frameCaption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  frameCaptionText: {
    color: 'rgba(255,255,255,0.66)',
    fontSize: 13,
    lineHeight: 18,
    flexShrink: 1,
  },
  copyBlock: {
    gap: 12,
  },
  headline: {
    color: '#f8fbff',
    fontSize: 31,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  description: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 16,
    lineHeight: 24,
  },
  bulletList: {
    gap: 12,
  },
  bulletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  bulletIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(79,140,255,0.14)',
  },
  bulletText: {
    color: '#edf4ff',
    fontSize: 15,
    lineHeight: 21,
    flexShrink: 1,
  },
  footer: {
    paddingTop: 8,
    paddingBottom: 20,
    gap: 12,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f8cff',
    shadowColor: '#4f8cff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 8,
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },
  primaryLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  secondaryButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonPressed: {
    opacity: 0.72,
  },
  secondaryLabel: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 15,
    fontWeight: '600',
  },
});
