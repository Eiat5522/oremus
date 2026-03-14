import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { PrayerAtmosphere } from '@/components/visual/prayer-atmosphere';
import { Fonts } from '@/constants/theme';
import { useIslamPrayerData } from '@/hooks/use-islam-prayer-data';
import type { PrayerName } from '@/lib/prayer-times';
import { formatTime } from '@/lib/prayer-times';

function toTitleCase(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

function isPrayerName(value: string | undefined): value is PrayerName {
  return (
    value === 'fajr' ||
    value === 'dhuhr' ||
    value === 'asr' ||
    value === 'maghrib' ||
    value === 'isha'
  );
}

export default function IslamPreparationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ prayerName?: string | string[] }>();
  const prayerNameParam = Array.isArray(params.prayerName)
    ? params.prayerName[0]
    : params.prayerName;
  const { defaultSessionPrayer } = useIslamPrayerData();

  const resolvedPrayerName = useMemo<PrayerName>(() => {
    if (isPrayerName(prayerNameParam)) {
      return prayerNameParam;
    }

    return defaultSessionPrayer?.name ?? 'fajr';
  }, [defaultSessionPrayer?.name, prayerNameParam]);

  const resolvedPrayerLabel = useMemo(() => {
    if (isPrayerName(prayerNameParam)) {
      return `${toTitleCase(prayerNameParam)} Prayer`;
    }

    return defaultSessionPrayer ? `${defaultSessionPrayer.label} Prayer` : 'Fajr Prayer';
  }, [defaultSessionPrayer, prayerNameParam]);

  const timingLabel = useMemo(() => {
    if (!defaultSessionPrayer || isPrayerName(prayerNameParam)) {
      return null;
    }

    return `Next guided session: ${defaultSessionPrayer.label} at ${formatTime(defaultSessionPrayer.time)}`;
  }, [defaultSessionPrayer, prayerNameParam]);

  return (
    <PrayerAtmosphere>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 32,
          },
        ]}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Close preparation"
            accessibilityRole="button"
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
                return;
              }

              router.replace('/');
            }}
            style={styles.iconButton}
          >
            <IconSymbol name="chevron.left" size={18} color="#FFF6E1" />
          </Pressable>

          <View style={styles.headerCopy}>
            <ThemedText style={styles.eyebrow}>Preparation</ThemedText>
            <ThemedText style={styles.title}>Ready to begin prayer</ThemedText>
          </View>
        </View>

        <View style={styles.heroCard}>
          <ThemedText style={styles.heroLabel}>Selected prayer</ThemedText>
          <ThemedText style={styles.heroPrayer}>{resolvedPrayerLabel}</ThemedText>
          <ThemedText style={styles.heroBody}>
            Use Qibla Finder first. Once you align with the Qibla, the prayer session will start
            automatically.
          </ThemedText>
          {timingLabel ? <ThemedText style={styles.heroMeta}>{timingLabel}</ThemedText> : null}
        </View>

        <View style={styles.guidanceCard}>
          <View style={styles.guidanceRow}>
            <View style={styles.guidanceIconWrap}>
              <IconSymbol name="location.fill" size={18} color="#F4C86B" />
            </View>
            <View style={styles.guidanceCopy}>
              <ThemedText style={styles.guidanceTitle}>Step into Qibla Finder</ThemedText>
              <ThemedText style={styles.guidanceText}>
                Center yourself and align your device with the Qibla direction.
              </ThemedText>
            </View>
          </View>

          <View style={styles.guidanceRow}>
            <View style={styles.guidanceIconWrap}>
              <IconSymbol name="sparkles" size={18} color="#F4C86B" />
            </View>
            <View style={styles.guidanceCopy}>
              <ThemedText style={styles.guidanceTitle}>Auto-starts on alignment</ThemedText>
              <ThemedText style={styles.guidanceText}>
                Hold steady when aligned and the prayer session will open for you.
              </ThemedText>
            </View>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() =>
            router.push({
              pathname: '/qibla',
              params: { mode: 'session', prayerName: resolvedPrayerName },
            })
          }
          style={styles.ctaWrap}
        >
          <LinearGradient colors={['#1F7E65', '#0E4F3E']} style={styles.ctaButton}>
            <ThemedText style={styles.ctaLabel}>Open Qibla Finder</ThemedText>
            <IconSymbol name="chevron.right" size={18} color="#FFF8E8" />
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </PrayerAtmosphere>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 23, 18, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(244, 200, 107, 0.22)',
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  eyebrow: {
    color: 'rgba(244, 200, 107, 0.86)',
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFF7E1',
    fontSize: 28,
    lineHeight: 34,
    fontFamily: Fonts.serif,
    fontWeight: '600',
  },
  heroCard: {
    gap: 12,
    padding: 22,
    borderRadius: 28,
    backgroundColor: 'rgba(8, 31, 24, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(244, 200, 107, 0.22)',
  },
  heroLabel: {
    color: 'rgba(247, 233, 192, 0.72)',
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  heroPrayer: {
    color: '#FFF6DF',
    fontSize: 38,
    lineHeight: 42,
    fontFamily: Fonts.serif,
    fontWeight: '700',
  },
  heroBody: {
    color: 'rgba(247, 233, 192, 0.9)',
    fontSize: 17,
    lineHeight: 25,
  },
  heroMeta: {
    color: '#F4C86B',
    fontSize: 15,
    lineHeight: 20,
  },
  guidanceCard: {
    gap: 16,
    padding: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(7, 24, 18, 0.66)',
    borderWidth: 1,
    borderColor: 'rgba(244, 200, 107, 0.16)',
  },
  guidanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  guidanceIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 200, 107, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(244, 200, 107, 0.2)',
  },
  guidanceCopy: {
    flex: 1,
    gap: 4,
  },
  guidanceTitle: {
    color: '#FFF6E0',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
  },
  guidanceText: {
    color: 'rgba(247, 233, 192, 0.78)',
    fontSize: 15,
    lineHeight: 22,
  },
  ctaWrap: {
    marginTop: 'auto',
    borderRadius: 22,
    overflow: 'hidden',
  },
  ctaButton: {
    minHeight: 64,
    paddingHorizontal: 22,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaLabel: {
    color: '#FFF8E8',
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '700',
  },
});
