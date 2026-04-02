import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { getTraditionUiTheme } from '@/constants/tradition-ui';
import { Tradition, TRADITION_OPTIONS } from '@/constants/traditions';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useTradition } from '@/hooks/use-tradition';
import { OnboardingShell } from '@/components/onboarding/onboarding-shell';

export default function ChoosePathScreen() {
  const { tradition, setTradition } = useTradition();
  const { completeOnboarding } = useOnboarding();
  const [selectedTradition, setSelectedTradition] = useState<Tradition>(tradition || 'general');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const previewTheme = getTraditionUiTheme(selectedTradition);

  useEffect(() => {
    if (tradition) {
      setSelectedTradition(tradition);
    }
  }, [tradition]);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setToastMessage(null);
    }, 3200);

    return () => clearTimeout(timeoutId);
  }, [toastMessage]);

  const handleContinue = async () => {
    try {
      await setTradition(selectedTradition);
      await completeOnboarding();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setToastMessage(
        'We could not finish setup yet. Your tradition was not saved, so please try again.',
      );
    }
  };

  return (
    <OnboardingShell currentStep={4}>
      <View style={styles.root}>
        <Image
          source={previewTheme.backgroundImage}
          style={styles.backgroundImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={['rgba(10, 14, 20, 0.1)', 'rgba(10, 14, 20, 0.52)', 'rgba(10, 14, 20, 0.9)']}
          style={StyleSheet.absoluteFillObject}
        />
        <LinearGradient
          colors={['rgba(10, 14, 20, 0.05)', 'rgba(10, 14, 20, 0.35)', 'rgba(10, 14, 20, 0.7)']}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.inner}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <View style={styles.headerBadge}>
                <Text style={styles.headerBadgeText}>Personalize</Text>
              </View>
              <Text
                style={[
                  styles.headline,
                  {
                    color: previewTheme.textColor,
                    fontFamily: selectedTradition === 'islam' ? Fonts.serif : undefined,
                  },
                ]}
              >
                Choose your path
              </Text>
              <Text style={[styles.subheadline, { color: previewTheme.subtitleColor }]}>
                We will tailor the app to your practice. You can change this later in settings.
              </Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 160 }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.traditionList}>
              {TRADITION_OPTIONS.map((option) => {
                const isSelected = selectedTradition === option.id;

                return (
                  <Pressable
                    key={option.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    android_ripple={{ color: 'rgba(255,255,255,0.1)' }}
                    onPress={() => setSelectedTradition(option.id)}
                    style={({ pressed }) => [
                      styles.traditionCard,
                      {
                        backgroundColor: isSelected
                          ? previewTheme.actionCardColor
                          : 'rgba(255,255,255,0.06)',
                        borderColor: isSelected
                          ? previewTheme.actionIconColor
                          : 'rgba(255,255,255,0.1)',
                      },
                      pressed && styles.traditionCardPressed,
                      isSelected && styles.traditionCardSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.iconContainer,
                        {
                          backgroundColor: isSelected
                            ? 'rgba(255,255,255,0.16)'
                            : 'rgba(255,255,255,0.1)',
                        },
                      ]}
                    >
                      <IconSymbol name={option.icon} size={28} color={option.color} />
                    </View>

                    <View style={styles.cardContent}>
                      <Text style={[styles.cardTitle, { color: previewTheme.actionTextColor }]}>
                        {option.title}
                      </Text>
                      <Text
                        style={[styles.cardDescription, { color: 'rgba(235, 255, 247, 0.78)' }]}
                      >
                        {option.description}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.checkCircle,
                        {
                          borderColor: isSelected
                            ? previewTheme.actionIconColor
                            : 'rgba(255,255,255,0.24)',
                          backgroundColor: isSelected
                            ? previewTheme.actionIconColor
                            : 'transparent',
                        },
                      ]}
                    >
                      {isSelected && <IconSymbol name="checkmark" size={14} color="#06261D" />}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
            {toastMessage ? (
              <View
                style={[
                  styles.toast,
                  {
                    backgroundColor: previewTheme.actionCardColor,
                    borderColor: previewTheme.actionCardBorderColor,
                  },
                ]}
              >
                <Text style={[styles.toastText, { color: previewTheme.actionTextColor }]}>
                  {toastMessage}
                </Text>
              </View>
            ) : null}
            <Pressable
              accessibilityRole="button"
              android_ripple={{ color: 'rgba(255,255,255,0.12)' }}
              onPress={handleContinue}
              style={({ pressed }) => [
                styles.continueButton,
                { backgroundColor: previewTheme.actionIconColor },
                pressed && styles.continueButtonPressed,
              ]}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </Pressable>
            <Text style={[styles.footerNote, { color: previewTheme.subtitleColor }]}>
              You can change this later in settings
            </Text>
          </View>
        </View>
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    top: -28,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerText: {
    gap: 10,
  },
  headerBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  headerBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  headline: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subheadline: {
    fontSize: 16,
    lineHeight: 24,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  traditionList: {
    gap: 16,
  },
  traditionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  traditionCardSelected: {
    shadowOpacity: 0.28,
    elevation: 12,
  },
  traditionCardPressed: {
    transform: [{ scale: 0.992 }],
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
    gap: 16,
    backgroundColor: 'transparent',
  },
  toast: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toastText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  continueButton: {
    minHeight: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  continueButtonText: {
    color: '#06261D',
    fontSize: 16,
    fontWeight: '700',
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 12,
  },
});
