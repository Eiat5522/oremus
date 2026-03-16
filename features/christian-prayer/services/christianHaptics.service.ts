import * as Haptics from 'expo-haptics';

export async function triggerChristianSurfaceDetectedHaptic(enabled: boolean): Promise<void> {
  if (!enabled) {
    return;
  }
  await Haptics.selectionAsync();
}

export async function triggerChristianPhaseChangeHaptic(enabled: boolean): Promise<void> {
  if (!enabled) {
    return;
  }
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export async function triggerChristianCompletionHaptic(enabled: boolean): Promise<void> {
  if (!enabled) {
    return;
  }
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
