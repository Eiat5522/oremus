import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Switch, Dimensions } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

export default function GeneralScreen() {
  const [ambientSounds, setAmbientSounds] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View style={[styles.container, { backgroundColor: '#101622' }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          gestureEnabled: false,
          headerTitle: 'General Reflection',
          headerTitleStyle: {
            color: 'rgba(255,255,255,0.6)',
            fontSize: 12,
            fontWeight: 'bold',
            letterSpacing: 1.5,
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
              <IconSymbol name="arrow.left" size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity style={styles.headerIcon}>
              <IconSymbol name="settings" size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={styles.zenOverlay}>
        <View style={styles.glow} />
      </View>

      <View style={styles.content}>
        <View style={styles.centerSection}>
          <View style={styles.spaIconContainer}>
            <IconSymbol name="spa" size={48} color="rgba(255,255,255,0.4)" />
          </View>

          <ThemedText style={styles.promptText}>
            What are you grateful for in this moment?
          </ThemedText>

          <Button
            title="Start Quiet Reflection"
            size="lg"
            onPress={() => router.push('/active-session')}
            style={styles.startButton}
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.soundPanel}>
            <View style={styles.soundInfo}>
              <View style={styles.soundIconContainer}>
                <IconSymbol name="waves" size={20} color="#fff" />
              </View>
              <View>
                <ThemedText style={styles.soundTitle}>Ambient Sounds</ThemedText>
                <ThemedText style={styles.soundSubtitle}>Nature & White Noise</ThemedText>
              </View>
            </View>
            <Switch
              value={ambientSounds}
              onValueChange={setAmbientSounds}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: theme.primary }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.metaInfo}>
            <View style={styles.privacyRow}>
              <IconSymbol name="lock.fill" size={12} color="rgba(255,255,255,0.4)" />
              <ThemedText style={styles.privacyText}>LOCAL STORAGE ONLY</ThemedText>
            </View>
            <ThemedText style={styles.footerSubtext}>
              Your reflections never leave this device
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerIcon: {
    padding: 8,
    marginHorizontal: 8,
  },
  zenOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: 'rgba(17, 82, 212, 0.15)',
    filter: 'blur(100px)',
  },
  content: {
    flex: 1,
    paddingTop: 100,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 60,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  spaIconContainer: {
    opacity: 0.4,
  },
  promptText: {
    fontSize: 32,
    fontWeight: '300',
    textAlign: 'center',
    color: '#fff',
    lineHeight: 42,
  },
  startButton: {
    width: '100%',
    maxWidth: 280,
  },
  footer: {
    gap: 32,
    alignItems: 'center',
  },
  soundPanel: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  soundInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  soundIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  soundSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  metaInfo: {
    alignItems: 'center',
    gap: 4,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  privacyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
  },
  footerSubtext: {
    fontSize: 10,
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.3)',
  },
});
