import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ChristianPrayerColors, getChristianPrayerTemplate } from '@/constants/christian-prayer';
import { getTraditionUiTheme } from '@/constants/tradition-ui';
import { useChristianPrayerStore } from '@/hooks/use-christian-prayer-store';
import { formatDuration } from '@/lib/chant-helpers';

export default function ChristianPreparationScreen() {
  const router = useRouter();
  const { templateId } = useLocalSearchParams<{ templateId?: string }>();
  const uiTheme = useMemo(() => getTraditionUiTheme('christianity'), []);
  const {
    autoAdvance,
    ambientAudioEnabled,
    showScriptureFirst,
    setAutoAdvance,
    setAmbientAudioEnabled,
    setShowScriptureFirst,
    startPreparation,
    startSession,
  } = useChristianPrayerStore();
  const template = useMemo(() => getChristianPrayerTemplate(templateId) ?? null, [templateId]);

  useEffect(() => {
    if (!template) {
      router.replace('/tradition/christian' as never);
    }
  }, [router, template]);

  if (!template) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <Image
        source={uiTheme.backgroundImage}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />
      <LinearGradient
        colors={[
          ChristianPrayerColors.overlayTop,
          ChristianPrayerColors.overlayMid,
          ChristianPrayerColors.overlayBottom,
        ]}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.headerButton}>
            <IconSymbol name="arrow.left" size={20} color={ChristianPrayerColors.textPrimary} />
          </Pressable>
          <View style={styles.headerText}>
            <ThemedText style={styles.eyebrow}>Preparation</ThemedText>
            <ThemedText style={styles.title}>Settle into {template.title}</ThemedText>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroMeta}>
            <View style={styles.iconWrap}>
              <IconSymbol name={template.icon} size={22} color={ChristianPrayerColors.gold} />
            </View>
            <View style={styles.heroMetaText}>
              <ThemedText style={styles.heroTitle}>{template.title}</ThemedText>
              <ThemedText style={styles.heroSubtitle}>{template.subtitle}</ThemedText>
            </View>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <ThemedText style={styles.metricValue}>{template.stages.length}</ThemedText>
              <ThemedText style={styles.metricLabel}>Stages</ThemedText>
            </View>
            <View style={styles.metricCard}>
              <ThemedText style={styles.metricValue}>
                {formatDuration(template.estimatedMinutes * 60)}
              </ThemedText>
              <ThemedText style={styles.metricLabel}>Estimated</ThemedText>
            </View>
          </View>

          <ThemedText style={styles.promptLabel}>Intention</ThemedText>
          <ThemedText style={styles.promptText}>{template.intentionPrompt}</ThemedText>
        </View>

        <View style={styles.scriptureCard}>
          <ThemedText style={styles.sectionLabel}>Opening Scripture</ThemedText>
          <ThemedText style={styles.scriptureText}>
            &quot;{template.heroScripture.text}&quot;
          </ThemedText>
          <ThemedText style={styles.scriptureReference}>
            {template.heroScripture.reference}
          </ThemedText>
        </View>

        <View style={styles.preferencesCard}>
          <ThemedText style={styles.sectionLabel}>Session Preferences</ThemedText>
          <PreferenceRow
            icon="forward.end.fill"
            label="Auto advance stages"
            description="Move through each stage after its guided timing."
            value={autoAdvance}
            onValueChange={setAutoAdvance}
          />
          <PreferenceRow
            icon="music.note"
            label="Ambient prayer audio"
            description="Play a subtle audio loop during the session when available."
            value={ambientAudioEnabled}
            onValueChange={setAmbientAudioEnabled}
          />
          <PreferenceRow
            icon="book.fill"
            label="Show scripture first"
            description="Place scripture above the stage prayer or reflection text."
            value={showScriptureFirst}
            onValueChange={setShowScriptureFirst}
          />
        </View>

        <View style={styles.stageListCard}>
          <ThemedText style={styles.sectionLabel}>Journey Outline</ThemedText>
          {template.stages.map((stage, index) => (
            <View key={stage.id} style={styles.stageRow}>
              <View style={styles.stageIndex}>
                <ThemedText style={styles.stageIndexText}>{index + 1}</ThemedText>
              </View>
              <View style={styles.stageText}>
                <ThemedText style={styles.stageTitle}>{stage.title}</ThemedText>
                <ThemedText style={styles.stageBody} numberOfLines={2}>
                  {stage.body}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>

        <Pressable
          onPress={() => {
            startPreparation(template.id);
            startSession();
            router.replace({
              pathname: '/tradition/christian-session',
              params: { templateId: template.id },
            } as never);
          }}
          style={styles.ctaWrap}
        >
          <LinearGradient colors={uiTheme.ctaGradient} style={styles.ctaButton}>
            <IconSymbol name="play.fill" size={18} color="#FFF4E8" />
            <ThemedText style={styles.ctaText}>Begin Prayer</ThemedText>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function PreferenceRow({
  icon,
  label,
  description,
  value,
  onValueChange,
}: {
  icon: 'forward.end.fill' | 'music.note' | 'book.fill';
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.preferenceRow}>
      <View style={styles.preferenceIcon}>
        <IconSymbol name={icon} size={18} color={ChristianPrayerColors.gold} />
      </View>
      <View style={styles.preferenceText}>
        <ThemedText style={styles.preferenceTitle}>{label}</ThemedText>
        <ThemedText style={styles.preferenceDescription}>{description}</ThemedText>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: 'rgba(255,255,255,0.16)', true: 'rgba(242,196,124,0.46)' }}
        thumbColor={value ? ChristianPrayerColors.gold : '#F9E3C2'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ChristianPrayerColors.background,
  },
  content: {
    paddingTop: 72,
    paddingHorizontal: 18,
    paddingBottom: 40,
    gap: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: ChristianPrayerColors.border,
  },
  headerText: {
    flex: 1,
    gap: 6,
  },
  eyebrow: {
    color: ChristianPrayerColors.gold,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    color: ChristianPrayerColors.textPrimary,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: ChristianPrayerColors.cardStrong,
    borderWidth: 1,
    borderColor: ChristianPrayerColors.borderStrong,
    padding: 18,
    gap: 14,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  heroMetaText: {
    flex: 1,
    gap: 4,
  },
  heroTitle: {
    color: ChristianPrayerColors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
  },
  heroSubtitle: {
    color: ChristianPrayerColors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: ChristianPrayerColors.border,
    padding: 14,
    gap: 4,
  },
  metricValue: {
    color: ChristianPrayerColors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  metricLabel: {
    color: ChristianPrayerColors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  promptLabel: {
    color: ChristianPrayerColors.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  promptText: {
    color: ChristianPrayerColors.textSecondary,
    fontSize: 15,
    lineHeight: 24,
  },
  scriptureCard: {
    borderRadius: 22,
    backgroundColor: ChristianPrayerColors.card,
    borderWidth: 1,
    borderColor: ChristianPrayerColors.border,
    padding: 18,
    gap: 10,
  },
  sectionLabel: {
    color: ChristianPrayerColors.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  scriptureText: {
    color: ChristianPrayerColors.textPrimary,
    fontSize: 18,
    lineHeight: 28,
    fontStyle: 'italic',
  },
  scriptureReference: {
    color: ChristianPrayerColors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  preferencesCard: {
    borderRadius: 22,
    backgroundColor: ChristianPrayerColors.card,
    borderWidth: 1,
    borderColor: ChristianPrayerColors.border,
    padding: 18,
    gap: 16,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  preferenceIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  preferenceText: {
    flex: 1,
    gap: 3,
  },
  preferenceTitle: {
    color: ChristianPrayerColors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  preferenceDescription: {
    color: ChristianPrayerColors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  stageListCard: {
    borderRadius: 22,
    backgroundColor: ChristianPrayerColors.card,
    borderWidth: 1,
    borderColor: ChristianPrayerColors.border,
    padding: 18,
    gap: 14,
  },
  stageRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stageIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(242,196,124,0.12)',
    borderWidth: 1,
    borderColor: ChristianPrayerColors.borderStrong,
  },
  stageIndexText: {
    color: ChristianPrayerColors.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  stageText: {
    flex: 1,
    gap: 3,
  },
  stageTitle: {
    color: ChristianPrayerColors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  stageBody: {
    color: ChristianPrayerColors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  ctaWrap: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  ctaButton: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: {
    color: '#FFF4E8',
    fontSize: 16,
    fontWeight: '800',
  },
});
