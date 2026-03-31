import { ProgressDots } from '@/components/onboarding/progress-dots';
import { Image } from 'expo-image';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { getTraditionUiTheme } from '@/constants/tradition-ui';
import { Tradition, TRADITION_OPTIONS } from '@/constants/traditions';
import { useTradition } from '@/hooks/use-tradition';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TraditionOnboardingScreen() {
  const { tradition, setTradition } = useTradition();
  const [selectedTradition, setSelectedTradition] = useState<Tradition>(tradition || 'general');
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const previewTheme = getTraditionUiTheme(selectedTradition);

  useEffect(() => {
    if (tradition) {
      setSelectedTradition(tradition);
    }
  }, [tradition]);

  const handleContinue = async () => {
    try {
      await setTradition(selectedTradition);
      router.push('/onboarding/completion' as any);
    } catch (error) {
      console.error('Failed to save tradition preference:', error);
      router.push('/onboarding/completion' as any);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={previewTheme.backgroundImage}
        style={styles.backgroundImage}
        contentFit="cover"
      />
      <LinearGradient colors={previewTheme.overlayGradient} style={StyleSheet.absoluteFillObject} />
      <LinearGradient
        colors={['rgba(6, 12, 18, 0.18)', 'rgba(6, 12, 18, 0.5)', 'rgba(6, 12, 18, 0.82)']}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={[styles.dotsContainer, { paddingTop: insets.top + 12 }]}>
        <ProgressDots currentStep={4} />
      </View>

      <View style={styles.header}>
        <View style={styles.headerText}>
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
            We will customize your tools and prayer focus based on your selected tradition.
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.traditionList}>
          {TRADITION_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => setSelectedTradition(option.id)}
              activeOpacity={0.7}
              style={[
                styles.traditionCard,
                {
                  backgroundColor: previewTheme.actionCardColor,
                  borderColor:
                    selectedTradition === option.id
                      ? previewTheme.actionIconColor
                      : previewTheme.actionCardBorderColor,
                },
                selectedTradition === option.id ? styles.traditionCardSelected : null,
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor:
                      selectedTradition === option.id
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
                <Text style={[styles.cardDescription, { color: 'rgba(235, 255, 247, 0.78)' }]}>
                  {option.description}
                </Text>
              </View>

              <View
                style={[
                  styles.checkCircle,
                  {
                    borderColor:
                      selectedTradition === option.id
                        ? previewTheme.actionIconColor
                        : 'rgba(255,255,255,0.3)',
                  },
                  selectedTradition === option.id
                    ? { backgroundColor: previewTheme.actionIconColor }
                    : null,
                ]}
              >
                {selectedTradition === option.id && (
                  <IconSymbol name="checkmark" size={14} color="#06261D" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <TouchableOpacity
          onPress={handleContinue}
          activeOpacity={0.8}
          style={[styles.continueButton, { backgroundColor: previewTheme.actionIconColor }]}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
        <Text style={[styles.footerNote, { color: previewTheme.subtitleColor }]}>
          You can change this later in settings
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    top: -28,
  },
  dotsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerText: {
    gap: 8,
  },
  headline: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subheadline: {
    fontSize: 16,
    lineHeight: 24,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  traditionList: {
    gap: 16,
  },
  traditionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
  },
  traditionCardSelected: {
    transform: [{ scale: 1.01 }],
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 14,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: 'transparent',
    gap: 16,
  },
  continueButton: {
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
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
