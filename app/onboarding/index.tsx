import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { getTraditionUiTheme } from '@/constants/tradition-ui';
import { Tradition, TRADITION_OPTIONS } from '@/constants/traditions';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeCameraPermissions } from '@/hooks/use-safe-camera-permissions';
import { useTradition } from '@/hooks/use-tradition';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function OnboardingScreen() {
  const { tradition, setTradition } = useTradition();
  const [selectedTradition, setSelectedTradition] = useState<Tradition>(
    tradition || 'christianity',
  );
  const [cameraPermission, requestCameraPermission] = useSafeCameraPermissions();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const uiTheme = useMemo(() => getTraditionUiTheme(selectedTradition), [selectedTradition]);

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
      <Image
        testID="tradition-preview-background"
        source={uiTheme.backgroundImage}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />
      <LinearGradient colors={uiTheme.overlayGradient} style={StyleSheet.absoluteFillObject} />

      <ThemedView lightColor="transparent" darkColor="transparent" style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />

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
              style={[styles.headline, { color: uiTheme.textColor, fontFamily: Fonts.serif }]}
            >
              Choose your path
            </ThemedText>
            <ThemedText style={[styles.subheadline, { color: uiTheme.subtitleColor }]}>
              We will customize your tools and prayer focus based on your selected tradition.
            </ThemedText>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.traditionList}>
            {TRADITION_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                testID={`tradition-option-${option.id}`}
                onPress={() => setSelectedTradition(option.id)}
                activeOpacity={0.7}
                style={[
                  styles.traditionCard,
                  {
                    backgroundColor:
                      selectedTradition === option.id
                        ? uiTheme.actionCardColor
                        : colorScheme === 'light'
                          ? 'rgba(255, 255, 255, 0.16)'
                          : 'rgba(15, 23, 42, 0.42)',
                    borderColor:
                      selectedTradition === option.id
                        ? uiTheme.tabActiveTint
                        : uiTheme.actionCardBorderColor,
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor:
                        colorScheme === 'light' ? option.bgColor.light : option.bgColor.dark,
                    },
                  ]}
                >
                  <IconSymbol name={option.icon} size={28} color={option.color} />
                </View>

                <View style={styles.cardContent}>
                  <ThemedText style={[styles.cardTitle, { color: uiTheme.actionTextColor }]}>
                    {option.title}
                  </ThemedText>
                  <ThemedText style={[styles.cardDescription, { color: uiTheme.subtitleColor }]}>
                    {option.description}
                  </ThemedText>
                </View>

                <View
                  style={[
                    styles.checkCircle,
                    {
                      borderColor:
                        selectedTradition === option.id
                          ? uiTheme.tabActiveTint
                          : uiTheme.actionCardBorderColor,
                    },
                    selectedTradition === option.id && { backgroundColor: uiTheme.tabActiveTint },
                  ]}
                >
                  {selectedTradition === option.id ? (
                    <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
                  ) : null}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable onPress={handleContinue} style={styles.ctaButtonWrap}>
            <LinearGradient
              testID="tradition-preview-cta"
              colors={uiTheme.ctaGradient}
              style={styles.ctaButton}
            >
              <ThemedText style={styles.ctaLabel}>Continue</ThemedText>
            </LinearGradient>
          </Pressable>
          <ThemedText style={[styles.footerNote, { color: uiTheme.subtitleColor }]}>
            You can change this later in settings
          </ThemedText>
        </View>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderWidth: 2,
    gap: 16,
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
  ctaButtonWrap: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  ctaButton: {
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  ctaLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
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
  footerNote: {
    textAlign: 'center',
    fontSize: 12,
  },
});
