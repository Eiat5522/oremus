import { useCallback, useEffect, useState } from 'react';

import {
  type FocusGateSettings,
  type UnlockWindowMinutes,
  loadFocusGateSettings,
  recordPrayerCompletion,
  saveFocusGateSettings,
} from '@/lib/focus-gate';
import {
  getFocusGateNativeStatus,
  listFocusGateInstalledApps,
  openFocusGateAccessibilitySettings,
  openFocusGateUsageAccessSettings,
} from '@/lib/focus-gate-native';

type FocusGatePermissionStatus = {
  accessibilityEnabled: boolean;
  usageAccessGranted: boolean;
};

type InstalledApp = {
  packageName: string;
  label: string;
};

export function useFocusGate() {
  const [settings, setSettings] = useState<FocusGateSettings | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<FocusGatePermissionStatus | null>(null);
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>([]);
  const [error, setError] = useState<unknown>(null);

  const reload = useCallback(async () => {
    try {
      const [storedSettings, nativeStatus, apps] = await Promise.all([
        loadFocusGateSettings(),
        getFocusGateNativeStatus(),
        listFocusGateInstalledApps(),
      ]);
      setSettings(storedSettings);
      setPermissionStatus(nativeStatus);
      setInstalledApps(apps);
    } catch (err) {
      // Surface error to consumers or log appropriately
      console.error('[useFocusGate] reload failed:', err);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const persist = useCallback(async (next: FocusGateSettings) => {
    try {
      setError(null);
      await saveFocusGateSettings(next);
      setSettings(next);
    } catch (err) {
      setError(err);
      throw err;
    }
  }, []);

  const setEnabled = useCallback(
    async (enabled: boolean) => {
      if (!settings) return;
      await persist({ ...settings, enabled });
    },
    [persist, settings],
  );

  const setUnlockWindowMinutes = useCallback(
    async (unlockWindowMinutes: UnlockWindowMinutes) => {
      if (!settings) return;
      await persist({ ...settings, unlockWindowMinutes });
    },
    [persist, settings],
  );

  const setBlockedPackages = useCallback(
    async (blockedPackages: string[]) => {
      if (!settings) return;
      await persist({ ...settings, blockedPackages });
    },
    [persist, settings],
  );

  const completePrayerAndUnlock = useCallback(async () => {
    const next = await recordPrayerCompletion();
    setSettings(next);
  }, []);

  return {
    settings,
    permissionStatus,
    installedApps,
    error,
    reload,
    setEnabled,
    setUnlockWindowMinutes,
    setBlockedPackages,
    completePrayerAndUnlock,
    openAccessibilitySettings: openFocusGateAccessibilitySettings,
    openUsageAccessSettings: openFocusGateUsageAccessSettings,
  };
}
