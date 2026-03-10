import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { getTraditionUiTheme } from '@/constants/tradition-ui';
import { Tradition, TRADITION_OPTIONS } from '@/constants/traditions';
import { useSafeCameraPermissions } from '@/hooks/use-safe-camera-permissions';
import { useTradition } from '@/hooks/use-tradition';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function OnboardingScreen() {
  const { tradition, setTradition } = useTradition();
  const [selectedTradition, setSelectedTradition] = useState<Tradition>(
    tradition || 'christianity',
  );
  const [cameraPermission, requestCameraPermission] = useSafeCameraPermissions();
  const router = useRouter();
  const previewTheme = getTraditionUiTheme(selectedTradition);

  useEffect(() => {
    if (tradition) {
      setSelectedTradition(tradition);
    }
  }, [tradition]);

  const handleContinue = async () => {
    try {
      await setTradition(selectedTradition);

      if (
        selectedTradition === 'islam' &&
        (cameraPermission?.status === 'undetermined' || cameraPermission == null)
      ) {
        await requestCameraPermission();
      }

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to save tradition preference:', error);
      // Consider showing user feedback, e.g.:
      // Toast.show({ type: 'error', text1: 'Could not save preference' });
      router.replace('/(tabs)'); // Navigate anyway or handle differently
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

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

      <View style={styles.header}>
        <TouchableOpacity
          style={[
            styles.backButton,
            {
              backgroundColor: previewTheme.actionCardColor,
              borderColor: previewTheme.actionCardBorderColor,
            },
          ]}
          onPress={() => router.back()}
        >
          <IconSymbol name="arrow.left.ios" size={20} color={previewTheme.actionTextColor} />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <ThemedText
            type="title"
            style={[
              styles.headline,
              {
                color: previewTheme.textColor,
                fontFamily: selectedTradition === 'islam' ? Fonts.serif : undefined,
              },
            ]}
          >
            Choose your path
          </ThemedText>
          <ThemedText style={[styles.subheadline, { color: previewTheme.subtitleColor }]}>
            We will customize your tools and prayer focus based on your selected tradition.
          </ThemedText>
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
                <ThemedText style={[styles.cardTitle, { color: previewTheme.actionTextColor }]}>
                  {option.title}
                </ThemedText>
                <ThemedText
                  style={[styles.cardDescription, { color: 'rgba(235, 255, 247, 0.78)' }]}
                >
                  {option.description}
                </ThemedText>
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

      <View style={styles.footer}>
        <Button
          title="Continue"
          size="lg"
          onPress={handleContinue}
          style={[styles.continueButton, { backgroundColor: previewTheme.actionIconColor }]}
          textStyle={styles.continueButtonText}
        />
        <ThemedText style={[styles.footerNote, { color: previewTheme.subtitleColor }]}>
          You can change this later in settings
        </ThemedText>
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
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
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
  headline: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subheadline: {
    fontSize: 16,
    lineHeight: 24,
    color: '#64748b',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120, // Space for fixed footer
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
    color: '#64748b',
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
    paddingBottom: 40,
    backgroundColor: 'transparent',
    gap: 16,
  },
  continueButton: {
    borderRadius: 18,
  },
  continueButtonText: {
    color: '#06261D',
    fontWeight: '700',
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 12,
  },
});
