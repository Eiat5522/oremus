import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
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

const ISLAM_BLOCKING_BACKGROUND = require('../../assets/images/background/islam-blocking.jpg');
const BUDDHIST_BLOCKING_BACKGROUND = require('../../assets/images/background/Buddhist.jpg');
const CHRISTIAN_BLOCKING_BACKGROUND = require('../../assets/images/background/Christianity.jpg');

const BLOCKING_VARIANTS = {
  islam: {
    image: ISLAM_BLOCKING_BACKGROUND,
    gradient: ['rgba(4, 14, 18, 0.18)', 'rgba(4, 14, 18, 0.9)'] as [string, string],
    buttonLabel: 'Begin Session',
    titleColor: '#FFFFFF',
    bodyColor: 'rgba(234, 248, 241, 0.9)',
    buttonBackground: 'rgba(93, 130, 111, 0.78)',
    buttonBorder: 'rgba(173, 205, 191, 0.92)',
    buttonText: '#F4F5EF',
    footerColor: 'rgba(222, 233, 226, 0.88)',
    cardSurface: 'rgba(9, 63, 48, 0.52)',
    cardBorder: 'rgba(179, 242, 223, 0.25)',
    cardText: '#EBFFF7',
    cardIcon: '#A8EED6',
  },
  buddhism: {
    image: BUDDHIST_BLOCKING_BACKGROUND,
    gradient: ['rgba(80, 34, 16, 0.05)', 'rgba(80, 34, 16, 0.84)'] as [string, string],
    buttonLabel: 'Begin Meditation',
    titleColor: '#FBE2C0',
    bodyColor: 'rgba(245, 224, 198, 0.9)',
    buttonBackground: 'rgba(190, 122, 56, 0.8)',
    buttonBorder: 'rgba(242, 185, 117, 0.98)',
    buttonText: '#FFF2E0',
    footerColor: 'rgba(239, 214, 179, 0.9)',
    cardSurface: 'rgba(99, 50, 28, 0.46)',
    cardBorder: 'rgba(255, 224, 181, 0.24)',
    cardText: '#FFF2E0',
    cardIcon: '#FFD4A0',
  },
  christianity: {
    image: CHRISTIAN_BLOCKING_BACKGROUND,
    gradient: ['rgba(71, 37, 24, 0.05)', 'rgba(71, 37, 24, 0.84)'] as [string, string],
    buttonLabel: 'Begin Prayer',
    titleColor: '#FCE5C9',
    bodyColor: 'rgba(245, 223, 200, 0.9)',
    buttonBackground: 'rgba(185, 111, 62, 0.8)',
    buttonBorder: 'rgba(240, 180, 118, 0.98)',
    buttonText: '#FFF3E4',
    footerColor: 'rgba(245, 217, 182, 0.9)',
    cardSurface: 'rgba(87, 47, 28, 0.44)',
    cardBorder: 'rgba(255, 226, 187, 0.24)',
    cardText: '#FFF1DD',
    cardIcon: '#F0D1A0',
  },
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

function TraditionLoadingState({
  backgroundImage,
  gradientColors,
  title,
  subtitle,
  titleColor,
  subtitleColor,
  cardBackgroundColor,
  cardBorderColor,
  baseBackgroundColor,
  titleFontFamily,
}: {
  backgroundImage: any;
  gradientColors: readonly [string, string] | readonly [string, string, string];
  title: string;
  subtitle: string;
  titleColor: string;
  subtitleColor: string;
  cardBackgroundColor: string;
  cardBorderColor: string;
  baseBackgroundColor: string;
  titleFontFamily?: string;
}) {
  return (
    <View style={[styles.container, { backgroundColor: baseBackgroundColor }]}>
      <Stack.Screen options={{ title: 'App Blocking', headerShown: false }} />
      <Image source={backgroundImage} style={StyleSheet.absoluteFillObject} contentFit="cover" />
      <LinearGradient colors={[...gradientColors]} style={StyleSheet.absoluteFillObject} />
      <View style={styles.loadingShell}>
        <View
          style={[
            styles.loadingCard,
            { backgroundColor: cardBackgroundColor, borderColor: cardBorderColor },
          ]}
        >
          <ActivityIndicator size="small" color={titleColor} />
          <ThemedText
            style={[styles.loadingTitle, { color: titleColor, fontFamily: titleFontFamily }]}
          >
            {title}
          </ThemedText>
          <ThemedText style={[styles.loadingSubtitle, { color: subtitleColor }]}>
            {subtitle}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

export default function AppBlockingSettingsScreen() {
  const router = useRouter();
  const { tradition } = useTradition();
  const uiTheme = useMemo(() => getTraditionUiTheme(tradition), [tradition]);
  const isIslam = tradition === 'islam';
  const isBuddhism = tradition === 'buddhism';
  const isChristianity = tradition === 'christianity';
  const hasBlockingBackground = isIslam || isBuddhism || isChristianity;

  const {
    settings,
    permissionStatus,
    installedApps,
    setEnabled,
    setUnlockWindowMinutes,
    setBlockedPackages,
    lockNow,
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
  const blockingBackground = useMemo(() => {
    if (isIslam) return BLOCKING_VARIANTS.islam;
    if (isBuddhism) return BLOCKING_VARIANTS.buddhism;
    if (isChristianity) return BLOCKING_VARIANTS.christianity;
    return null;
  }, [isIslam, isBuddhism, isChristianity]);
  const immediateLockTarget = useMemo(() => {
    const packageName = settings?.blockedPackages[0] ?? null;
    if (!packageName) return null;
    const match = visibleApps.find((app) => app.packageName === packageName);
    return {
      packageName,
      label: match?.label ?? packageName,
    };
  }, [settings?.blockedPackages, visibleApps]);
  const blockerPreview = blockingBackground ?? BLOCKING_VARIANTS.islam;
  const loadingBackgroundImage = blockingBackground?.image ?? uiTheme.backgroundImage;
  const loadingGradient = blockingBackground?.gradient ?? uiTheme.overlayGradient;
  const loadingCopy = useMemo(() => {
    if (isIslam) {
      return {
        title: 'Preparing Prayer Shield',
        subtitle: 'Loading your Islamic app blocking settings.',
      };
    }
    if (isBuddhism) {
      return {
        title: 'Preparing Mindful Shield',
        subtitle: 'Loading your Buddhist app blocking settings.',
      };
    }
    if (isChristianity) {
      return {
        title: 'Preparing Prayer Shield',
        subtitle: 'Loading your Christian app blocking settings.',
      };
    }
    return {
      title: 'Preparing Focus Shield',
      subtitle: 'Loading your app blocking settings.',
    };
  }, [isBuddhism, isChristianity, isIslam]);
  const loadingCardBackground = blockingBackground?.cardSurface ?? uiTheme.actionCardColor;
  const loadingCardBorder = blockingBackground?.cardBorder ?? uiTheme.actionCardBorderColor;
  const loadingBaseBackground = isIslam
    ? '#07271E'
    : isBuddhism
      ? '#5A341D'
      : isChristianity
        ? '#4A2B1C'
        : '#1B264A';

  if (!settings) {
    return (
      <TraditionLoadingState
        backgroundImage={loadingBackgroundImage}
        gradientColors={loadingGradient}
        title={loadingCopy.title}
        subtitle={loadingCopy.subtitle}
        titleColor={uiTheme.textColor}
        subtitleColor={uiTheme.subtitleColor}
        cardBackgroundColor={loadingCardBackground}
        cardBorderColor={loadingCardBorder}
        baseBackgroundColor={loadingBaseBackground}
        titleFontFamily={isIslam ? Fonts.serif : undefined}
      />
    );
  }

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
            headerShown: !hasBlockingBackground,
          }}
        />
        {hasBlockingBackground ? (
          <View style={styles.header}>
            <TouchableOpacity
              style={[
                styles.backButton,
                {
                  backgroundColor: uiTheme.actionCardColor,
                  borderColor: uiTheme.actionCardBorderColor,
                },
              ]}
              onPress={() => router.back()}
            >
              <IconSymbol name="arrow.left.ios" size={20} color={uiTheme.actionTextColor} />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <ThemedText
                type="title"
                style={[
                  styles.headerTitle,
                  { color: uiTheme.textColor, fontFamily: isIslam ? Fonts.serif : undefined },
                ]}
              >
                App Blocking
              </ThemedText>
              <ThemedText style={[styles.headerSubtitle, { color: uiTheme.subtitleColor }]}>
                Lock distracting apps behind your prayer focus window.
              </ThemedText>
            </View>
          </View>
        ) : null}
        <ScrollView
          contentContainerStyle={[
            styles.content,
            hasBlockingBackground ? styles.contentIslam : null,
          ]}
          contentInsetAdjustmentBehavior="automatic"
        >
          <View
            style={[
              styles.previewCard,
              hasBlockingBackground
                ? {
                    borderColor: blockerPreview.cardBorder,
                    backgroundColor: blockerPreview.cardSurface,
                  }
                : null,
            ]}
          >
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
            <View style={styles.previewSpacer} />
            <View style={styles.previewContent}>
              <ThemedText
                style={[
                  styles.previewTitle,
                  hasBlockingBackground
                    ? {
                        color: blockerPreview.titleColor,
                        fontFamily: isIslam ? Fonts.serif : undefined,
                      }
                    : null,
                ]}
              >
                Pause. Realign.
              </ThemedText>
              <ThemedText
                style={[
                  styles.previewBody,
                  hasBlockingBackground ? { color: blockerPreview.bodyColor } : null,
                ]}
              >
                {"You've chosen to protect your focus.\nComplete a session in Oremus to continue."}
              </ThemedText>
              {hasBlockingBackground ? (
                <Button
                  title="Lock now"
                  onPress={() =>
                    void lockNow(immediateLockTarget?.packageName, immediateLockTarget?.label)
                  }
                  style={[
                    styles.previewButton,
                    {
                      backgroundColor: blockerPreview.buttonBackground,
                      borderWidth: 1,
                      borderColor: blockerPreview.buttonBorder,
                    },
                  ]}
                  textStyle={[styles.previewButtonText, { color: blockerPreview.buttonText }]}
                />
              ) : null}
              {hasBlockingBackground ? (
                <ThemedText style={[styles.previewFooter, { color: blockerPreview.footerColor }]}>
                  Open Oremus to continue
                </ThemedText>
              ) : null}
            </View>
            <View style={[styles.heroRow, hasBlockingBackground ? styles.heroRowIslam : null]}>
              <ThemedText
                style={[
                  styles.heroLabel,
                  hasBlockingBackground ? { color: blockerPreview.cardText } : null,
                ]}
              >
                Blocking enabled
              </ThemedText>
              <Switch value={settings.enabled} onValueChange={(value) => void setEnabled(value)} />
            </View>
            <View
              style={[styles.statusPill, hasBlockingBackground ? styles.statusPillBlocking : null]}
            >
              <ThemedText
                style={[
                  styles.statusPillText,
                  hasBlockingBackground ? { color: blockerPreview.cardText } : null,
                ]}
              >
                {remainingMs > 0 ? `Unlocked for ${remainingMinutes} min` : 'Locked now'}
              </ThemedText>
            </View>
          </View>

          <View
            style={[
              styles.card,
              hasBlockingBackground
                ? {
                    borderColor: blockerPreview.cardBorder,
                    backgroundColor: blockerPreview.cardSurface,
                    borderRadius: 20,
                  }
                : null,
            ]}
          >
            <ThemedText
              style={[
                styles.sectionTitle,
                hasBlockingBackground ? { color: blockerPreview.cardText } : null,
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
                    style={[
                      styles.windowChip,
                      hasBlockingBackground ? styles.windowChipBlocking : null,
                      active ? styles.windowChipActive : null,
                      hasBlockingBackground && active ? styles.windowChipActiveBlocking : null,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.windowChipText,
                        hasBlockingBackground ? styles.windowChipTextBlocking : null,
                        active ? styles.windowChipTextActive : null,
                        hasBlockingBackground && active
                          ? styles.windowChipTextActiveBlocking
                          : null,
                      ]}
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
                    borderColor: blockerPreview.cardBorder,
                    backgroundColor: blockerPreview.cardSurface,
                    borderRadius: 20,
                  }
                : null,
            ]}
          >
            <ThemedText
              style={[
                styles.sectionTitle,
                hasBlockingBackground ? { color: blockerPreview.cardText } : null,
              ]}
            >
              Permissions
            </ThemedText>
            <View style={styles.permissionPillRow}>
              <View
                style={[
                  styles.permissionPill,
                  hasBlockingBackground ? styles.permissionPillBlocking : null,
                ]}
              >
                <ThemedText
                  style={[
                    styles.permissionPillText,
                    hasBlockingBackground ? styles.permissionPillTextBlocking : null,
                  ]}
                >
                  Accessibility: {permissionStatus?.accessibilityEnabled ? 'On' : 'Off'}
                </ThemedText>
              </View>
              <View
                style={[
                  styles.permissionPill,
                  hasBlockingBackground ? styles.permissionPillBlocking : null,
                ]}
              >
                <ThemedText
                  style={[
                    styles.permissionPillText,
                    hasBlockingBackground ? styles.permissionPillTextBlocking : null,
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
                style={hasBlockingBackground ? styles.secondaryButtonBlocking : undefined}
                textStyle={hasBlockingBackground ? styles.secondaryButtonTextBlocking : undefined}
              />
              <Button
                title="Usage Access"
                variant="secondary"
                onPress={openUsageAccessSettings}
                style={hasBlockingBackground ? styles.secondaryButtonBlocking : undefined}
                textStyle={hasBlockingBackground ? styles.secondaryButtonTextBlocking : undefined}
              />
            </View>
          </View>

          <View
            style={[
              styles.card,
              hasBlockingBackground
                ? {
                    borderColor: blockerPreview.cardBorder,
                    backgroundColor: blockerPreview.cardSurface,
                    borderRadius: 20,
                  }
                : null,
            ]}
          >
            <ThemedText
              style={[
                styles.sectionTitle,
                hasBlockingBackground ? { color: blockerPreview.cardText } : null,
              ]}
            >
              Blocked apps
            </ThemedText>
            <ThemedText
              style={[
                styles.subtitle,
                hasBlockingBackground ? { color: blockerPreview.cardText } : null,
              ]}
            >
              Choose apps to lock behind prayer. Tap card or toggle.
            </ThemedText>
            {visibleApps.length === 0 ? (
              <ThemedText
                style={[
                  styles.subtitle,
                  hasBlockingBackground ? { color: blockerPreview.cardText } : null,
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
                      hasBlockingBackground ? styles.appRowBlocking : null,
                    ]}
                  >
                    <View style={styles.appIdentity}>
                      {app.iconUri ? (
                        <Image
                          source={{ uri: app.iconUri }}
                          style={styles.appIcon}
                          contentFit="cover"
                        />
                      ) : (
                        <View style={[styles.appBadge, { backgroundColor: visual.background }]}>
                          <ThemedText style={[styles.appBadgeText, { color: visual.tint }]}>
                            {visual.glyph}
                          </ThemedText>
                        </View>
                      )}
                      <View style={styles.appTextWrap}>
                        <ThemedText
                          style={[
                            styles.rowLabel,
                            hasBlockingBackground ? { color: blockerPreview.cardText } : null,
                          ]}
                        >
                          {app.label}
                        </ThemedText>
                        <ThemedText
                          style={[
                            styles.appPackage,
                            hasBlockingBackground ? { color: blockerPreview.cardIcon } : null,
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
  loadingShell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingCard: {
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  loadingTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  contentIslam: {
    paddingTop: 12,
    paddingBottom: 120,
    paddingHorizontal: 16,
    gap: 16,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
  },
  headerText: {
    gap: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  previewCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0f172a',
    backgroundColor: '#0f172a',
    padding: 16,
    minHeight: 520,
    overflow: 'hidden',
    position: 'relative',
  },
  previewSpacer: {
    flex: 1,
    minHeight: 210,
  },
  previewContent: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  previewTitle: {
    fontSize: 31,
    lineHeight: 36,
    fontWeight: '700',
    textAlign: 'center',
  },
  previewBody: {
    fontSize: 16,
    lineHeight: 26,
    textAlign: 'center',
  },
  previewButton: {
    alignSelf: 'stretch',
    minHeight: 56,
    borderRadius: 14,
  },
  previewButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  previewFooter: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
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
  statusPillBlocking: {
    backgroundColor: 'rgba(255,255,255,0.12)',
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
  windowChipBlocking: {
    borderColor: 'rgba(229,255,245,0.42)',
    backgroundColor: 'rgba(229,255,245,0.18)',
  },
  windowChipActiveBlocking: {
    borderColor: '#d8fff0',
    backgroundColor: '#ecfff7',
  },
  windowChipTextBlocking: {
    color: '#F5FFF9',
  },
  windowChipTextActiveBlocking: {
    color: '#0f5134',
  },
  permissionPillRow: { gap: 8 },
  permissionPill: {
    borderRadius: 999,
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  permissionPillBlocking: {
    backgroundColor: 'rgba(229,255,245,0.22)',
  },
  permissionPillText: { fontSize: 13, fontWeight: '700', color: '#334155' },
  permissionPillTextBlocking: {
    color: '#EBFFF7',
  },
  buttonRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  secondaryButtonBlocking: {
    backgroundColor: 'rgba(236,255,247,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(216,255,240,0.9)',
  },
  secondaryButtonTextBlocking: {
    color: '#0C4B3A',
    fontWeight: '700',
  },
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
  appRowBlocking: {
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
  appIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  appTextWrap: { flexShrink: 1, gap: 2 },
  appPackage: { fontSize: 12, color: '#64748b' },
});
