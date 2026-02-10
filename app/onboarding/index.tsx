import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { Tradition, TRADITION_OPTIONS } from '@/constants/traditions';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTradition } from '@/hooks/use-tradition';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function OnboardingScreen() {
  const [selectedTradition, setSelectedTradition] = useState<Tradition>('christianity');
  const { setTradition } = useTradition();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const handleContinue = async () => {
    try {
      await setTradition(selectedTradition);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to save tradition preference:', error);
      // Optionally show a toast/alert to the user
      router.replace('/(tabs)'); // Navigate anyway or handle differently
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.surface }]}
          onPress={() => router.back()}
        >
          <IconSymbol name="arrow.left.ios" size={20} color={theme.text} />
        </TouchableOpacity>

        <View style={styles.headerText}>
          <ThemedText type="title" style={styles.headline}>
            Choose your path
          </ThemedText>
          <ThemedText style={styles.subheadline}>
            We will customize your tools and prayer focus based on your selected tradition.
          </ThemedText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.traditionList}>
          {TRADITION_OPTIONS.map((tradition) => (
            <TouchableOpacity
              key={tradition.id}
              onPress={() => setSelectedTradition(tradition.id)}
              activeOpacity={0.7}
              style={[
                styles.traditionCard,
                {
                  backgroundColor: theme.surface,
                  borderColor:
                    selectedTradition === tradition.id
                      ? theme.primary
                      : colorScheme === 'light'
                        ? '#e2e8f0'
                        : '#1e293b',
                },
                selectedTradition === tradition.id && { backgroundColor: `${theme.primary}0D` },
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor:
                      colorScheme === 'light' ? tradition.bgColor.light : tradition.bgColor.dark,
                  },
                ]}
              >
                <IconSymbol name={tradition.icon} size={28} color={tradition.color} />
              </View>

              <View style={styles.cardContent}>
                <ThemedText style={styles.cardTitle}>{tradition.title}</ThemedText>
                <ThemedText style={styles.cardDescription}>{tradition.description}</ThemedText>
              </View>

              <View
                style={[
                  styles.checkCircle,
                  {
                    borderColor:
                      selectedTradition === tradition.id
                        ? theme.primary
                        : colorScheme === 'light'
                          ? '#cbd5e1'
                          : '#334155',
                  },
                  selectedTradition === tradition.id && { backgroundColor: theme.primary },
                ]}
              >
                {selectedTradition === tradition.id && (
                  <IconSymbol name="checkmark" size={14} color={theme.surface} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Continue" size="lg" onPress={handleContinue} />
        <ThemedText style={styles.footerNote}>You can change this later in settings</ThemedText>
      </View>
    </ThemedView>
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
    color: '#94a3b8',
  },
});
