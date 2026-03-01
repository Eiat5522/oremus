import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Fonts } from '@/constants/theme';
import { getTraditionUiTheme } from '@/constants/tradition-ui';
import { useFocusGate } from '@/hooks/use-focus-gate';
import { useTradition } from '@/hooks/use-tradition';
import {
  UNLOCK_WINDOW_OPTIONS,
  type UnlockWindowMinutes,
  getUnlockRemainingMs,
} from '@/lib/focus-gate';

const ISLAM_BLOCKING_BACKGROUND = require('../../assets/images/background/islam-blocking.png');
const BUDDHIST_BLOCKING_BACKGROUND = require('../../assets/images/background/buddhism-waterpaint.png');
const CHRISTIAN_BLOCKING_BACKGROUND = require('../../assets/images/background/christianity-waterpaint.png');

// Gradient overlays for each tradition's blocking screen
const BLOCKING_GRADIENTS = {
  islam: ['rgba(4, 14, 18, 0.58)', 'rgba(4, 14, 18, 0.9)'] as [string, string],
  buddhism: ['rgba(105, 59, 27, 0.3)', 'rgba(105, 59, 27, 0.85)'] as [string, string],
  christianity: ['rgba(52, 30, 18, 0.3)', 'rgba(52, 30, 18, 0.85)'] as [string, string],
} as const;

const HERO_ACCENT_COLORS = {
  buddhism: { one: 'rgba(184, 118, 62, 0.45)', two: 'rgba(255, 212, 160, 0.28)' },
  christianity: { one: 'rgba(122, 83, 59, 0.45)', two: 'rgba(240, 209, 160, 0.28)' },
  islam: { one: 'rgba(22, 163, 74, 0.45)', two: 'rgba(56, 189, 248, 0.28)' },
} as const;

const APP_VISUALS: Record<string, { glyph: string; tint: string; background: string }> = {
  'com.facebook.katana': { glyph: 'f', tint: '#ffffff', background: '#1877f2' },
  'com.instagram.android': { glyph: 'IG', tint: '#ffffff', background: '#d946ef' },
  'com.zhiliaoapp.musically': { glyph: 'TT', tint: '#ffffff', background: '#111827' },
  'com.whatsapp': { glyph: 'W', tint: '#ffffff', background: '#16a34a' },
  'com.snapchat.android': { glyph: 'S', tint: '#111827', background: '#facc15' },
  'com.twitter.android': { glyph: 'X', tint: '#ffffff', background: '#0f172a' },
};

function getFallbackGlyph(label: string): string {
  const words = label.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase();
  }
  return (words[0]?.slice(0, 2) ?? 'AP').toUpperCase();
}

function getAppVisual(packageName: string, label: string) {
  const preset = APP_VISUALS[packageName];
  if (preset) return preset;

  return {
    glyph: getFallbackGlyph(label),
    tint: '#0f172a',
    background: '#dbeafe',
  };
}

export default function AppBlockingSettingsScreen() {
  const { tradition } = useTradition();
  const uiTheme = useMemo(() => getTraditionUiTheme(tradition), [tradition]);
  const isIslam = tradition === 'islam';
  const isBuddhism = tradition === 'buddhism';
  const isChristianity = tradition === 'christianity';
  const hasBlockingBackground = isIslam || isBuddhism || isChristianity;
  const heroAccentColors = isBuddhism
    ? HERO_ACCENT_COLORS.buddhism
    : isChristianity
      ? HERO_ACCENT_COLORS.christianity
      : isIslam
        ? HERO_ACCENT_COLORS.islam
        : undefined;
  const heroAccentOneStyle = heroAccentColors
    ? { backgroundColor: heroAccentColors.one }
    : undefined;
  const heroAccentTwoStyle = heroAccentColors
    ? { backgroundColor: heroAccentColors.two }
    : undefined;

  const {
    settings,
    permissionStatus,
    installedApps,
    setEnabled,
    setUnlockWindowMinutes,
    setBlockedPackages,
    openAccessibilitySettings,
    openUsageAccessSettings,
  } = useFocusGate();

  const visibleApps = useMemo(() => {
    if (!settings) return [];
    if (installedApps.length === 0) {
      return settings.blockedPackages.map((packageName) => ({ packageName, label: packageName }));
    }
    return installedApps;
  }, [installedApps, settings]);
  const selectedPackages = useMemo(
    () => new Set(settings?.blockedPackages ?? []),
    [settings?.blockedPackages],
  );

  if (!settings) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'App Blocking', headerShown: true }} />
        <View style={styles.loadingContainer}>
          <ThemedText>Loading app blocking settings...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const blockingBackground = useMemo(() => {
    if (isIslam) return { image: ISLAM_BLOCKING_BACKGROUND, gradient: BLOCKING_GRADIENTS.islam };
    if (isBuddhism)
      return { image: BUDDHIST_BLOCKING_BACKGROUND, gradient: BLOCKING_GRADIENTS.buddhism };
    if (isChristianity)
      return { image: CHRISTIAN_BLOCKING_BACKGROUND, gradient: BLOCKING_GRADIENTS.christianity };
    return null;
  }, [isIslam, isBuddhism, isChristianity]);

  const remainingMs = getUnlockRemainingMs(settings);
  const remainingMinutes = Math.ceil(remainingMs / 60000);

  return (
    <View style={styles.container}>
      {blockingBackground ? (
        <>
          <Image
            source={blockingBackground.image}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
          />
          <LinearGradient
            colors={blockingBackground.gradient}
            style={StyleSheet.absoluteFillObject}
          />
        </>
      ) : null}
      <ThemedView style={[styles.container, hasBlockingBackground ? styles.transparentBg : null]}>
        <Stack.Screen
          options={{
            title: 'App Blocking',
            headerShown: true,
            headerTransparent: hasBlockingBackground,
            headerTintColor: hasBlockingBackground ? uiTheme.textColor : undefined,
            headerTitleStyle: hasBlockingBackground
              ? {
                  color: uiTheme.textColor,
                  fontFamily: Fonts.serif,
                }
              : undefined,
          }}
        />
        <ScrollView
          contentContainerStyle={[
            styles.content,
            hasBlockingBackground ? styles.contentIslam : null,
          ]}
          contentInsetAdjustmentBehavior="automatic"
        >
          <View
            style={[
              styles.heroCard,
              hasBlockingBackground
                ? {
                    borderColor: uiTheme.actionCardBorderColor,
                    backgroundColor: uiTheme.actionCardColor,
                    alignItems: 'center',
                    paddingVertical: 24,
                    borderRadius: 24,
                  }
                : null,
            ]}
          >
            <View style={[styles.heroAccentOne, heroAccentOneStyle]} />
            <View style={[styles.heroAccentTwo, heroAccentTwoStyle]} />
            <ThemedText
              style={[
                styles.heroTitle,
                hasBlockingBackground ? { color: uiTheme.textColor } : null,
              ]}
            >
              Block distracting apps
            </ThemedText>
            <ThemedText
              style={[
                styles.heroSubtitle,
                hasBlockingBackground
                  ? { color: uiTheme.subtitleColor, textAlign: 'center', paddingRight: 0 }
                  : null,
              ]}
            >
              Start your focus window and keep social apps locked while you pray.
            </ThemedText>
            {hasBlockingBackground ? (
              <Button
                title={settings.enabled ? 'Session Active' : 'Begin Session'}
                onPress={() => void setEnabled(true)}
              />
            ) : null}
            <View style={[styles.heroRow, hasBlockingBackground ? styles.heroRowIslam : null]}>
              <ThemedText
                style={[
                  styles.heroLabel,
                  hasBlockingBackground ? { color: uiTheme.actionTextColor } : null,
                ]}
              >
                Emergency unlock
              </ThemedText>
              <Switch value={settings.enabled} onValueChange={(value) => void setEnabled(value)} />
            </View>
            <View
              style={[
                styles.statusPill,
                hasBlockingBackground ? { backgroundColor: 'rgba(229,255,245,0.9)' } : null,
              ]}
            >
              <ThemedText style={styles.statusPillText}>
                {remainingMs > 0 ? `Unlocked for ${remainingMinutes} min` : 'Locked now'}
              </ThemedText>
            </View>
          </View>

          <View
            style={[
              styles.card,
              hasBlockingBackground
                ? {
                    borderColor: uiTheme.actionCardBorderColor,
                    backgroundColor: uiTheme.actionCardColor,
                  }
                : null,
            ]}
          >
            <ThemedText
              style={[
                styles.sectionTitle,
                hasBlockingBackground ? { color: uiTheme.actionTextColor } : null,
              ]}
            >
              Unlock window
            </ThemedText>
            <View style={styles.windowRow}>
              {UNLOCK_WINDOW_OPTIONS.map((minutes) => {
                const active = settings.unlockWindowMinutes === minutes;
                return (
                  <Pressable
                    key={minutes}
                    onPress={() => void setUnlockWindowMinutes(minutes as UnlockWindowMinutes)}
                    style={[styles.windowChip, active ? styles.windowChipActive : null]}
                  >
                    <ThemedText
                      style={[styles.windowChipText, active ? styles.windowChipTextActive : null]}
                    >
                      {minutes} min
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View
            style={[
              styles.card,
              hasBlockingBackground
                ? {
                    borderColor: uiTheme.actionCardBorderColor,
                    backgroundColor: uiTheme.actionCardColor,
                  }
                : null,
            ]}
          >
            <ThemedText
              style={[
                styles.sectionTitle,
                hasBlockingBackground ? { color: uiTheme.actionTextColor } : null,
              ]}
            >
              Permissions
            </ThemedText>
            <View style={styles.permissionPillRow}>
              <View
                style={[
                  styles.permissionPill,
                  hasBlockingBackground ? styles.permissionPillIslam : null,
                ]}
              >
                <ThemedText
                  style={[
                    styles.permissionPillText,
                    hasBlockingBackground ? styles.permissionPillTextIslam : null,
                  ]}
                >
                  Accessibility: {permissionStatus?.accessibilityEnabled ? 'On' : 'Off'}
                </ThemedText>
              </View>
              <View
                style={[
                  styles.permissionPill,
                  hasBlockingBackground ? styles.permissionPillIslam : null,
                ]}
              >
                <ThemedText
                  style={[
                    styles.permissionPillText,
                    hasBlockingBackground ? styles.permissionPillTextIslam : null,
                  ]}
                >
                  Usage Access: {permissionStatus?.usageAccessGranted ? 'On' : 'Off'}
                </ThemedText>
              </View>
            </View>
            <View style={styles.buttonRow}>
              <Button
                title="Accessibility"
                variant="secondary"
                onPress={openAccessibilitySettings}
              />
              <Button title="Usage Access" variant="secondary" onPress={openUsageAccessSettings} />
            </View>
          </View>

          <View
            style={[
              styles.card,
              hasBlockingBackground
                ? {
                    borderColor: uiTheme.actionCardBorderColor,
                    backgroundColor: uiTheme.actionCardColor,
                  }
                : null,
            ]}
          >
            <ThemedText
              style={[
                styles.sectionTitle,
                hasBlockingBackground ? { color: uiTheme.actionTextColor } : null,
              ]}
            >
              Blocked apps
            </ThemedText>
            <ThemedText
              style={[
                styles.subtitle,
                hasBlockingBackground ? { color: uiTheme.actionTextColor } : null,
              ]}
            >
              Choose apps to lock behind prayer. Tap card or toggle.
            </ThemedText>
            {visibleApps.length === 0 ? (
              <ThemedText
                style={[
                  styles.subtitle,
                  hasBlockingBackground ? { color: uiTheme.actionTextColor } : null,
                ]}
              >
                No launchable blocked apps found on this device.
              </ThemedText>
            ) : (
              visibleApps.map((app) => {
                const isSelected = selectedPackages.has(app.packageName);
                const visual = getAppVisual(app.packageName, app.label);
                return (
                  <Pressable
                    key={app.packageName}
                    onPress={() => {
                      const next = isSelected
                        ? settings.blockedPackages.filter((item) => item !== app.packageName)
                        : [...settings.blockedPackages, app.packageName];
                      void setBlockedPackages(next);
                    }}
                    style={[
                      styles.appRow,
                      isSelected ? styles.appRowSelected : null,
                      hasBlockingBackground ? styles.appRowIslam : null,
                    ]}
                  >
                    <View style={styles.appIdentity}>
                      <View style={[styles.appBadge, { backgroundColor: visual.background }]}>
                        <ThemedText style={[styles.appBadgeText, { color: visual.tint }]}>
                          {visual.glyph}
                        </ThemedText>
                      </View>
                      <View style={styles.appTextWrap}>
                        <ThemedText
                          style={[
                            styles.rowLabel,
                            hasBlockingBackground ? { color: uiTheme.actionTextColor } : null,
                          ]}
                        >
                          {app.label}
                        </ThemedText>
                        <ThemedText
                          style={[
                            styles.appPackage,
                            hasBlockingBackground ? { color: uiTheme.actionIconColor } : null,
                          ]}
                        >
                          {app.packageName}
                        </ThemedText>
                      </View>
                    </View>
                    <Switch
                      value={isSelected}
                      onValueChange={(value) => {
                        const next = value
                          ? [...settings.blockedPackages, app.packageName]
                          : settings.blockedPackages.filter((item) => item !== app.packageName);
                        void setBlockedPackages(Array.from(new Set(next)));
                      }}
                    />
                  </Pressable>
                );
              })
            )}
          </View>
        </ScrollView>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  transparentBg: {
    backgroundColor: 'transparent',
  },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  contentIslam: {
    paddingTop: 72,
    paddingBottom: 120,
  },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0f172a',
    backgroundColor: '#0f172a',
    padding: 16,
    gap: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  heroAccentOne: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: '#1d4ed8',
    top: -40,
    right: -20,
    opacity: 0.55,
  },
  heroAccentTwo: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 999,
    backgroundColor: '#22d3ee',
    bottom: -34,
    left: -20,
    opacity: 0.4,
  },
  heroTitle: { fontSize: 21, fontWeight: '800', color: '#f8fafc' },
  heroSubtitle: { fontSize: 14, lineHeight: 20, color: '#cbd5e1', paddingRight: 26 },
  heroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroRowIslam: { width: '100%' },
  heroLabel: { fontSize: 15, fontWeight: '700', color: '#e2e8f0' },
  statusPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#f8fafc',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  statusPillText: { fontSize: 12, fontWeight: '800', color: '#0f172a' },
  card: { borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', padding: 14, gap: 10 },
  subtitle: { fontSize: 13, lineHeight: 18, color: '#64748b' },
  rowLabel: { fontSize: 15, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  windowRow: { flexDirection: 'row', gap: 8 },
  windowChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  windowChipActive: { borderColor: '#14532d', backgroundColor: '#dcfce7' },
  windowChipText: { fontSize: 13, fontWeight: '700', color: '#334155' },
  windowChipTextActive: { color: '#14532d' },
  permissionPillRow: { gap: 8 },
  permissionPill: {
    borderRadius: 999,
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  permissionPillIslam: {
    backgroundColor: 'rgba(229,255,245,0.22)',
  },
  permissionPillText: { fontSize: 13, fontWeight: '700', color: '#334155' },
  permissionPillTextIslam: {
    color: '#EBFFF7',
  },
  buttonRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  appRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    padding: 10,
    gap: 10,
  },
  appRowIslam: {
    borderColor: 'rgba(179, 242, 223, 0.25)',
    backgroundColor: 'rgba(229,255,245,0.08)',
  },
  appRowSelected: { borderColor: '#0f766e', backgroundColor: '#ecfeff' },
  appIdentity: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  appBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBadgeText: { fontSize: 14, fontWeight: '900', letterSpacing: 0.2 },
  appTextWrap: { flexShrink: 1, gap: 2 },
  appPackage: { fontSize: 12, color: '#64748b' },
});
