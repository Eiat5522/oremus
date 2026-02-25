import { NativeModules, Platform } from 'react-native';

type FocusGateNativeStatus = {
  accessibilityEnabled: boolean;
  usageAccessGranted: boolean;
};

type InstalledApp = {
  packageName: string;
  label: string;
};

type FocusGateNativeModule = {
  syncSettings: (settingsJson: string) => Promise<boolean>;
  getServiceStatus: () => Promise<FocusGateNativeStatus>;
  openAccessibilitySettings: () => void;
  openUsageAccessSettings: () => void;
  listInstalledApps: () => Promise<InstalledApp[]>;
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

export async function listFocusGateInstalledApps(): Promise<InstalledApp[]> {
  const module = getNativeModule();
  if (!module) {
    return [];
  }
  return module.listInstalledApps();
}
