import React from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { type SavedPrayerLocation, PRAYER_LOCATION_PRESETS } from '@/lib/islam-prayer-location';

type PrayerLocationSettingsCardProps = {
  canAskLocationPermission: boolean;
  isRequestingLocationPermission: boolean;
  isUsingDeviceLocation: boolean;
  locationError: string | null;
  locationPermissionStatus: string | null;
  locationText: string;
  onManagePresetsPress?: () => void;
  requestLocationPermission: () => Promise<void>;
  savedPrayerLocation: SavedPrayerLocation | null;
  selectSavedPrayerLocation: (locationId: string) => Promise<void>;
  clearSavedPrayerLocation: () => Promise<void>;
  showPresets?: boolean;
};

export function PrayerLocationSettingsCard({
  canAskLocationPermission,
  isRequestingLocationPermission,
  isUsingDeviceLocation,
  locationError,
  locationPermissionStatus,
  locationText,
  onManagePresetsPress,
  requestLocationPermission,
  savedPrayerLocation,
  selectSavedPrayerLocation,
  clearSavedPrayerLocation,
  showPresets = false,
}: PrayerLocationSettingsCardProps) {
  const visibleLocationError = savedPrayerLocation && !isUsingDeviceLocation ? null : locationError;
  const locationCopy = isUsingDeviceLocation
    ? `Using device location: ${locationText}`
    : savedPrayerLocation
      ? `Using saved location: ${savedPrayerLocation.label}`
      : showPresets
        ? 'Allow location services for automatic prayer times, or choose a preset city if location access is unavailable.'
        : 'Allow location services to calculate prayer times on this page. Preset fallback locations are managed from your profile settings.';

  return (
    <View style={styles.card}>
      <ThemedText style={styles.title}>Prayer time location</ThemedText>
      <ThemedText style={styles.body}>{locationCopy}</ThemedText>

      {visibleLocationError ? (
        <ThemedText style={styles.error}>{visibleLocationError}</ThemedText>
      ) : null}

      {locationPermissionStatus !== 'granted' && canAskLocationPermission ? (
        <Pressable
          disabled={isRequestingLocationPermission}
          onPress={() => void requestLocationPermission()}
          style={[
            styles.primaryAction,
            isRequestingLocationPermission && styles.primaryActionDisabled,
          ]}
        >
          <ThemedText style={styles.primaryActionText}>
            {isRequestingLocationPermission ? 'Requesting permission...' : 'Enable location'}
          </ThemedText>
        </Pressable>
      ) : null}

      {locationPermissionStatus !== 'granted' && !canAskLocationPermission ? (
        <Pressable onPress={() => void Linking.openSettings()} style={styles.secondaryAction}>
          <ThemedText style={styles.secondaryActionText}>Open location settings</ThemedText>
        </Pressable>
      ) : null}

      {!showPresets && onManagePresetsPress ? (
        <Pressable onPress={onManagePresetsPress} style={styles.secondaryAction}>
          <ThemedText style={styles.secondaryActionText}>
            Manage preset locations in profile
          </ThemedText>
        </Pressable>
      ) : null}

      {showPresets ? (
        <>
          <View style={styles.presetWrap}>
            {PRAYER_LOCATION_PRESETS.map((preset) => (
              <Pressable
                key={preset.id}
                onPress={() => {
                  void selectSavedPrayerLocation(preset.id);
                }}
                style={[
                  styles.presetChip,
                  savedPrayerLocation?.id === preset.id && styles.presetChipActive,
                ]}
              >
                <ThemedText
                  style={[
                    styles.presetChipText,
                    savedPrayerLocation?.id === preset.id && styles.presetChipTextActive,
                  ]}
                >
                  {preset.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          {savedPrayerLocation ? (
            <Pressable
              onPress={() => {
                void clearSavedPrayerLocation();
              }}
              style={styles.secondaryAction}
            >
              <ThemedText style={styles.secondaryActionText}>Clear saved location</ThemedText>
            </Pressable>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 14,
    gap: 10,
    backgroundColor: 'rgba(8, 30, 23, 0.55)',
    borderWidth: 1,
    borderColor: 'rgba(244, 200, 107, 0.22)',
  },
  title: {
    color: '#F8EFD7',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  body: {
    color: 'rgba(243, 234, 208, 0.86)',
    fontSize: 13,
    lineHeight: 18,
  },
  error: {
    color: '#F7B1A8',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  primaryAction: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(244, 200, 107, 0.45)',
    backgroundColor: 'rgba(11, 35, 28, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  primaryActionDisabled: {
    opacity: 0.5,
  },
  primaryActionText: {
    color: '#F6E7BB',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  secondaryAction: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(248, 222, 162, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  secondaryActionText: {
    color: '#F8EFD7',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  presetWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(248, 222, 162, 0.28)',
    backgroundColor: 'rgba(8, 30, 23, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  presetChipActive: {
    borderColor: 'rgba(22,163,74,0.55)',
    backgroundColor: 'rgba(22,163,74,0.18)',
  },
  presetChipText: {
    color: '#F3E6C6',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  presetChipTextActive: {
    color: '#BBF7D0',
  },
});
