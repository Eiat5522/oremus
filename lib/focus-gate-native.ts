import { NativeModules, Platform } from 'react-native';

type FocusGateNativeStatus = {
  accessibilityEnabled: boolean;
  usageAccessGranted: boolean;
};

type InstalledApp = {
  packageName: string;
  label: string;
  iconUri?: string;
};

type FocusGateNativeModule = {
  syncSettings: (settingsJson: string) => Promise<boolean>;
  getServiceStatus: () => Promise<FocusGateNativeStatus>;
  openAccessibilitySettings: () => void;
  openUsageAccessSettings: () => void;
  listInstalledApps?: (blockedPackages?: string[]) => Promise<InstalledApp[]>;
  triggerBlockNow?: (
    blockedPackage?: string | null,
    blockedAppLabel?: string | null,
  ) => Promise<boolean>;
};

function getNativeModule(): FocusGateNativeModule | null {
  if (Platform.OS !== 'android') {
    return null;
  }
  return NativeModules.FocusGateModule ?? null;
}

export async function syncFocusGateNative(settingsJson: string): Promise<boolean> {
  const module = getNativeModule();
  if (!module) return false;
  return module.syncSettings(settingsJson);
}

export async function getFocusGateNativeStatus(): Promise<FocusGateNativeStatus | null> {
  const module = getNativeModule();
  if (!module) return null;
  return module.getServiceStatus();
}

export function openFocusGateAccessibilitySettings(): void {
  const module = getNativeModule();
  if (!module) return;
  module.openAccessibilitySettings();
}

export function openFocusGateUsageAccessSettings(): void {
  const module = getNativeModule();
  if (!module) return;
  module.openUsageAccessSettings();
}

export async function listFocusGateInstalledApps(
  blockedPackages: string[] = [],
): Promise<InstalledApp[]> {
  const module = getNativeModule();
  if (!module?.listInstalledApps) {
    return [];
  }
  return module.listInstalledApps(blockedPackages);
}

export async function triggerFocusGateBlockNow(
  blockedPackage?: string | null,
  blockedAppLabel?: string | null,
): Promise<boolean> {
  const module = getNativeModule();
  if (!module?.triggerBlockNow) {
    if (module) {
      console.warn(
        '[focus-gate] Native module is missing triggerBlockNow. Rebuild the Android dev client.',
      );
    }
    return false;
  }
  return module.triggerBlockNow(blockedPackage, blockedAppLabel);
}
