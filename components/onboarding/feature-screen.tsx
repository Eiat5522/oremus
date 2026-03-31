import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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
      {/* Hero — app screenshot in phone-frame style */}
      <View style={styles.hero}>
        {content.screenshot && (
          <Image
            source={content.screenshot}
            style={styles.screenshot}
            contentFit="cover"
            transition={200}
          />
        )}
      </View>

      {/* Content — headline, description, bullet list */}
      <View style={styles.content}>
        <Text style={styles.headline}>{content.headline}</Text>
        <Text style={styles.description}>{content.description}</Text>

        <View style={styles.bullets}>
          {content.bullets.map((bullet, index) => (
            <View key={index} style={styles.bulletRow}>
              <IconSymbol name={bullet.icon as any} size={20} color="rgba(255,255,255,0.85)" />
              <Text style={styles.bulletText}>{bullet.text}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Footer — CTA + skip link */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <Pressable style={styles.ctaButton} onPress={onPrimaryCta}>
          <Text style={styles.ctaLabel}>{content.ctaLabel}</Text>
        </Pressable>

        <Pressable style={styles.skipTapTarget} onPress={onSkip}>
          <Text style={styles.skipLabel}>{content.skipLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const DEEP_SANCTUARY = '#101622';
const SPIRIT_BLUE = '#1152d4';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DEEP_SANCTUARY,
  },

  // ── Hero (top ~55%) ──────────────────────────────────
  hero: {
    flex: 55,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 24,
  },
  screenshot: {
    width: '100%',
    aspectRatio: 9 / 16,
    maxHeight: '90%',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },

  // ── Content (bottom ~45%) ────────────────────────────
  content: {
    flex: 45,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  headline: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 22,
    marginBottom: 20,
  },

  // ── Bullets ──────────────────────────────────────────
  bullets: {
    gap: 14,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bulletText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    flexShrink: 1,
  },

  // ── Footer ───────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  ctaButton: {
    height: 56,
    backgroundColor: SPIRIT_BLUE,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  skipTapTarget: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
  },
});
