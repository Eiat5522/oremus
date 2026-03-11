import { useCallback, useEffect, useState } from 'react';

import {
  type FocusGateSettings,
  type UnlockWindowMinutes,
  lockFocusGateNow,
  loadFocusGateSettings,
  recordPrayerCompletion,
  updateFocusGateSettings,
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
  iconUri?: string;
};

export function useFocusGate() {
  const [settings, setSettings] = useState<FocusGateSettings | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<FocusGatePermissionStatus | null>(null);
  const [installedApps, setInstalledApps] = useState<InstalledApp[]>([]);
  const [error, setError] = useState<unknown>(null);

  const reload = useCallback(async () => {
    try {
      const storedSettings = await loadFocusGateSettings();
      const [nativeStatus, apps] = await Promise.all([
        getFocusGateNativeStatus(),
        listFocusGateInstalledApps(storedSettings.blockedPackages),
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

  const persist = useCallback(
    async (updater: (previous: FocusGateSettings) => FocusGateSettings) => {
      try {
        setError(null);
        const next = await updateFocusGateSettings(updater);
        setSettings(next);
      } catch (err) {
        setError(err);
        throw err;
      }
    },
    [],
  );

  const setEnabled = useCallback(
    async (enabled: boolean) => {
      if (!settings) return;
      await persist((previous) => ({ ...previous, enabled }));
    },
    [persist, settings],
  );

  const setUnlockWindowMinutes = useCallback(
    async (unlockWindowMinutes: UnlockWindowMinutes) => {
      if (!settings) return;
      await persist((previous) => ({ ...previous, unlockWindowMinutes }));
    },
    [persist, settings],
  );

  const setBlockedPackages = useCallback(
    async (blockedPackages: string[]) => {
      if (!settings) return;
      await persist((previous) => ({ ...previous, blockedPackages }));
    },
    [persist, settings],
  );

  const completePrayerAndUnlock = useCallback(async () => {
    const next = await recordPrayerCompletion();
    setSettings(next);
  }, []);

  const lockNow = useCallback(
    async (blockedPackage?: string | null, blockedAppLabel?: string | null) => {
      const next = await lockFocusGateNow(blockedPackage, blockedAppLabel);
      setSettings(next);
    },
    [],
  );

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
    lockNow,
    openAccessibilitySettings: openFocusGateAccessibilitySettings,
    openUsageAccessSettings: openFocusGateUsageAccessSettings,
  };
}
