import { Stack } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { useFocusGate } from '@/hooks/use-focus-gate';
import {
  UNLOCK_WINDOW_OPTIONS,
  type UnlockWindowMinutes,
  getUnlockRemainingMs,
} from '@/lib/focus-gate';

export default function AppBlockingSettingsScreen() {
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

  if (!settings) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: 'App Blocking', headerShown: true }} />
        <View style={styles.loadingContainer}>
          <ThemedText>Loading app blocking settings…</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const remainingMs = getUnlockRemainingMs(settings);
  const remainingMinutes = Math.ceil(remainingMs / 60000);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'App Blocking', headerShown: true }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <ThemedText style={styles.title}>Require prayer before social apps</ThemedText>
          <ThemedText style={styles.subtitle}>
            Blocks selected social apps on Android until one prayer session is completed.
          </ThemedText>
          <View style={styles.row}>
            <ThemedText style={styles.rowLabel}>Enabled</ThemedText>
            <Switch value={settings.enabled} onValueChange={(value) => void setEnabled(value)} />
          </View>
          <ThemedText style={styles.statusText}>
            {remainingMs > 0 ? `Unlocked for ${remainingMinutes} more min` : 'Currently locked'}
          </ThemedText>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Unlock window</ThemedText>
          <View style={styles.windowRow}>
            {UNLOCK_WINDOW_OPTIONS.map((minutes) => {
              const active = settings.unlockWindowMinutes === minutes;
              return (
                <Pressable
                  key={minutes}
                  onPress={() => void setUnlockWindowMinutes(minutes as UnlockWindowMinutes)}
                  style={[styles.windowChip, active && styles.windowChipActive]}
                >
                  <ThemedText
                    style={[styles.windowChipText, active && styles.windowChipTextActive]}
                  >
                    {minutes} min
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Permissions</ThemedText>
          <ThemedText style={styles.permissionLine}>
            Accessibility: {permissionStatus?.accessibilityEnabled ? 'Enabled' : 'Missing'}
          </ThemedText>
          <ThemedText style={styles.permissionLine}>
            Usage access: {permissionStatus?.usageAccessGranted ? 'Enabled' : 'Missing'}
          </ThemedText>
          <View style={styles.buttonRow}>
            <Button title="Accessibility" variant="secondary" onPress={openAccessibilitySettings} />
            <Button title="Usage Access" variant="secondary" onPress={openUsageAccessSettings} />
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Blocked apps</ThemedText>
          {visibleApps.length === 0 ? (
            <ThemedText style={styles.subtitle}>
              No launchable blocked apps found on this device.
            </ThemedText>
          ) : (
            visibleApps.map((app) => {
              const isSelected = settings.blockedPackages.includes(app.packageName);
              return (
                <Pressable
                  key={app.packageName}
                  onPress={() => {
                    const next = isSelected
                      ? settings.blockedPackages.filter((item) => item !== app.packageName)
                      : [...settings.blockedPackages, app.packageName];
                    void setBlockedPackages(next);
                  }}
                  style={styles.appRow}
                >
                  <ThemedText style={styles.rowLabel}>{app.label}</ThemedText>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  card: { borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', padding: 14, gap: 10 },
  title: { fontSize: 18, fontWeight: '800' },
  subtitle: { fontSize: 13, lineHeight: 18, color: '#64748b' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLabel: { fontSize: 15, fontWeight: '600' },
  statusText: { fontSize: 13, fontWeight: '700', color: '#14532d' },
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
  permissionLine: { fontSize: 14, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', gap: 10 },
  appRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
