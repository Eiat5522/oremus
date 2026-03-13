import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  CHRISTIAN_PRAYER_TEMPLATES,
  ChristianPrayerColors,
  getChristianPrayerTemplate,
  getDailyChristianScripture,
  getDefaultChristianPrayerTemplate,
  type ChristianPrayerTemplate,
} from '@/constants/christian-prayer';
import { getTraditionUiTheme } from '@/constants/tradition-ui';
import { useChristianPrayerStore } from '@/hooks/use-christian-prayer-store';
import { formatDuration } from '@/lib/chant-helpers';
import { getChristianHomeSessionCardState } from '@/lib/christian-prayer-home';

export default function ChristianScreen() {
  const router = useRouter();
  const uiTheme = useMemo(() => getTraditionUiTheme('christianity'), []);
  const {
    selectedTemplateId,
    currentStageIndex,
    sessionStartedAt,
    sessionCompletedAt,
    resetSession,
  } = useChristianPrayerStore();
  const [activeTemplateId, setActiveTemplateId] = useState(
    selectedTemplateId ?? getDefaultChristianPrayerTemplate().id,
  );

  const dailyScripture = useMemo(() => getDailyChristianScripture(), []);
  const activeTemplate = useMemo(
    () => getChristianPrayerTemplate(activeTemplateId) ?? getDefaultChristianPrayerTemplate(),
    [activeTemplateId],
  );
  const sessionCard = useMemo(
    () =>
      getChristianHomeSessionCardState({
        template: getChristianPrayerTemplate(selectedTemplateId),
        currentStageIndex,
        sessionStartedAt,
        sessionCompletedAt,
      }),
    [currentStageIndex, selectedTemplateId, sessionCompletedAt, sessionStartedAt],
  );

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
            <ThemedText style={styles.eyebrow}>Christian Prayer</ThemedText>
            <ThemedText style={styles.headerTitle}>
              Quiet the heart. Begin with intention.
            </ThemedText>
          </View>
        </View>

        <View style={styles.heroCard}>
          <ThemedText style={styles.heroEyebrow}>Daily Scripture</ThemedText>
          <ThemedText style={styles.heroTitle}>{dailyScripture.title}</ThemedText>
          <ThemedText style={styles.heroVerse}>&quot;{dailyScripture.text}&quot;</ThemedText>
          <View style={styles.heroMetaRow}>
            <ThemedText style={styles.heroReference}>{dailyScripture.reference}</ThemedText>
            <View style={styles.heroChip}>
              <ThemedText style={styles.heroChipText}>{dailyScripture.category}</ThemedText>
            </View>
          </View>
        </View>

        {sessionCard ? (
          <View style={styles.sessionCard}>
            <View style={styles.sessionCardHeader}>
              <ThemedText style={styles.sessionEyebrow}>{sessionCard.eyebrow}</ThemedText>
              <ThemedText style={styles.sessionProgress}>{sessionCard.progressLabel}</ThemedText>
            </View>
            <ThemedText style={styles.sessionTitle}>{sessionCard.title}</ThemedText>
            <ThemedText style={styles.sessionDescription}>{sessionCard.description}</ThemedText>
            <View style={styles.sessionActions}>
              <Pressable
                onPress={() => router.push(sessionCard.primaryRoute)}
                style={styles.sessionPrimaryButton}
              >
                <ThemedText style={styles.sessionPrimaryText}>
                  {sessionCard.primaryLabel}
                </ThemedText>
              </Pressable>
              <Pressable onPress={resetSession} style={styles.sessionSecondaryButton}>
                <ThemedText style={styles.sessionSecondaryText}>
                  {sessionCard.secondaryLabel}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Prayer Journeys</ThemedText>
          <ThemedText style={styles.sectionCopy}>
            Choose a guided path shaped by scripture, reflection, prayer, and stillness.
          </ThemedText>
        </View>

        <View style={styles.templateList}>
          {CHRISTIAN_PRAYER_TEMPLATES.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              active={template.id === activeTemplate.id}
              onPress={() => setActiveTemplateId(template.id)}
            />
          ))}
        </View>

        <View style={styles.selectedTemplateCard}>
          <View style={styles.selectedTemplateHeader}>
            <ThemedText style={styles.selectedLabel}>Selected Journey</ThemedText>
            <ThemedText style={styles.selectedDuration}>
              {formatDuration(activeTemplate.estimatedMinutes * 60)}
            </ThemedText>
          </View>
          <ThemedText style={styles.selectedTitle}>{activeTemplate.title}</ThemedText>
          <ThemedText style={styles.selectedSubtitle}>{activeTemplate.subtitle}</ThemedText>
          <ThemedText style={styles.selectedPrompt}>{activeTemplate.intentionPrompt}</ThemedText>

          <Pressable
            onPress={() =>
              router.push({
                pathname: '/tradition/christian-preparation',
                params: { templateId: activeTemplate.id },
              } as never)
            }
            style={styles.primaryCtaWrap}
          >
            <LinearGradient colors={uiTheme.ctaGradient} style={styles.primaryCta}>
              <IconSymbol name="play.fill" size={18} color="#FFF4E8" />
              <ThemedText style={styles.primaryCtaText}>Begin Prayer</ThemedText>
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function TemplateCard({
  template,
  active,
  onPress,
}: {
  template: ChristianPrayerTemplate;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.templateCard, active && styles.templateCardActive]}>
      <View style={styles.templateIconWrap}>
        <IconSymbol name={template.icon} size={22} color={ChristianPrayerColors.gold} />
      </View>
      <View style={styles.templateTextWrap}>
        <ThemedText style={styles.templateTitle}>{template.title}</ThemedText>
        <ThemedText style={styles.templateMeta}>
          {template.category} • {template.estimatedMinutes} min
        </ThemedText>
        <ThemedText style={styles.templateSubtitle} numberOfLines={2}>
          {template.subtitle}
        </ThemedText>
      </View>
      <IconSymbol
        name={active ? 'checkmark.circle.fill' : 'chevron.right'}
        size={20}
        color={active ? ChristianPrayerColors.gold : ChristianPrayerColors.textMuted}
      />
    </Pressable>
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
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  headerTitle: {
    color: ChristianPrayerColors.textPrimary,
    fontSize: 30,
    lineHeight: 38,
    fontWeight: '700',
  },
  heroCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: ChristianPrayerColors.borderStrong,
    backgroundColor: 'rgba(89, 56, 38, 0.78)',
    padding: 22,
    gap: 10,
  },
  heroEyebrow: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    color: ChristianPrayerColors.gold,
    fontWeight: '800',
  },
  heroTitle: {
    color: ChristianPrayerColors.textPrimary,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
  },
  heroVerse: {
    color: ChristianPrayerColors.textSecondary,
    fontSize: 18,
    lineHeight: 30,
    fontStyle: 'italic',
  },
  heroMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  heroReference: {
    color: ChristianPrayerColors.gold,
    fontSize: 15,
    fontWeight: '700',
  },
  heroChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: ChristianPrayerColors.border,
  },
  heroChipText: {
    color: ChristianPrayerColors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  sessionCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: ChristianPrayerColors.borderStrong,
    backgroundColor: ChristianPrayerColors.card,
    padding: 18,
    gap: 10,
  },
  sessionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  sessionEyebrow: {
    color: ChristianPrayerColors.gold,
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  sessionProgress: {
    color: ChristianPrayerColors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  sessionTitle: {
    color: ChristianPrayerColors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  sessionDescription: {
    color: ChristianPrayerColors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  sessionActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  sessionPrimaryButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(242, 196, 124, 0.14)',
    borderWidth: 1,
    borderColor: ChristianPrayerColors.borderStrong,
  },
  sessionPrimaryText: {
    color: ChristianPrayerColors.textPrimary,
    fontWeight: '700',
  },
  sessionSecondaryButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: ChristianPrayerColors.border,
  },
  sessionSecondaryText: {
    color: ChristianPrayerColors.textSecondary,
    fontWeight: '700',
  },
  sectionHeader: {
    gap: 6,
  },
  sectionTitle: {
    color: ChristianPrayerColors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  sectionCopy: {
    color: ChristianPrayerColors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  templateList: {
    gap: 12,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: ChristianPrayerColors.border,
    backgroundColor: ChristianPrayerColors.card,
    borderRadius: 18,
    padding: 16,
  },
  templateCardActive: {
    backgroundColor: ChristianPrayerColors.cardStrong,
    borderColor: ChristianPrayerColors.borderStrong,
  },
  templateIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  templateTextWrap: {
    flex: 1,
    gap: 4,
  },
  templateTitle: {
    color: ChristianPrayerColors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  templateMeta: {
    color: ChristianPrayerColors.gold,
    fontSize: 12,
    fontWeight: '700',
  },
  templateSubtitle: {
    color: ChristianPrayerColors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
  selectedTemplateCard: {
    borderRadius: 24,
    backgroundColor: ChristianPrayerColors.cardStrong,
    borderWidth: 1,
    borderColor: ChristianPrayerColors.borderStrong,
    padding: 18,
    gap: 10,
  },
  selectedTemplateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  selectedLabel: {
    color: ChristianPrayerColors.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  selectedDuration: {
    color: ChristianPrayerColors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  selectedTitle: {
    color: ChristianPrayerColors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  selectedSubtitle: {
    color: ChristianPrayerColors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  selectedPrompt: {
    color: ChristianPrayerColors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  primaryCtaWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  primaryCta: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryCtaText: {
    color: '#FFF4E8',
    fontSize: 16,
    fontWeight: '800',
  },
});
