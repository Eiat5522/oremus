import * as Location from 'expo-location';
import React from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';

type PrayerLocationPreset = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
};

type QiblaCompassPageProps = {
  accuracyText: string;
  locationText: string;
  locationError: string | null;
  locationPermissionStatus: Location.PermissionStatus | null;
  canAskLocationPermission: boolean;
  isRequestingLocationPermission: boolean;
  onRequestLocationPermission: () => void;
  onOpenLocationSettings: () => void;
  qiblaBearing: number | null;
  distanceKm: number | null;
  alignmentDelta: number | null;
  isAligned: boolean;
  needleTransform: {
    transform: {
      rotate: Animated.AnimatedInterpolation<string | number>;
    }[];
  };
  prayerLocationLabel: string | null;
  usingDeviceLocationForPrayers: boolean;
  prayerLocationPresets: PrayerLocationPreset[];
  selectedPrayerLocationId: string | null;
  onSelectPrayerLocation: (locationId: string) => void;
  onClearSavedPrayerLocation: () => void;
};

const CARDINAL_LABELS = [
  { label: 'N', position: 'north' },
  { label: 'E', position: 'east' },
  { label: 'S', position: 'south' },
  { label: 'W', position: 'west' },
] as const;

const DIAL_TICKS = Array.from({ length: 24 }, (_, index) => index * 15);

export function QiblaCompassPage({
  accuracyText,
  locationText,
  locationError,
  locationPermissionStatus,
  canAskLocationPermission,
  isRequestingLocationPermission,
  onRequestLocationPermission,
  onOpenLocationSettings,
  qiblaBearing,
  distanceKm,
  alignmentDelta,
  isAligned,
  needleTransform,
  prayerLocationLabel,
  usingDeviceLocationForPrayers,
  prayerLocationPresets,
  selectedPrayerLocationId,
  onSelectPrayerLocation,
  onClearSavedPrayerLocation,
}: QiblaCompassPageProps) {
  const platformLabel = process.env.EXPO_OS === 'ios' ? 'iOS' : 'device';

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <View style={styles.heroTextBlock}>
        <ThemedText style={styles.heroTitle}>Accurate Kaaba Direction</ThemedText>
        <ThemedText style={styles.heroSubtitle}>GPS-verified for peace of mind</ThemedText>
        <View style={styles.heroChips}>
          <View style={styles.heroChip}>
            <IconSymbol name="location.fill" size={12} color="#0f5132" />
            <ThemedText style={styles.heroChipText}>{accuracyText}</ThemedText>
          </View>
          <View style={styles.heroChipSecondary}>
            <ThemedText style={styles.heroChipSecondaryText}>{locationText}</ThemedText>
          </View>
        </View>
        {locationError ? <ThemedText style={styles.errorText}>{locationError}</ThemedText> : null}
        {locationPermissionStatus !== 'granted' && canAskLocationPermission ? (
          <Pressable
            disabled={isRequestingLocationPermission}
            onPress={onRequestLocationPermission}
            style={[
              styles.locationPermissionButton,
              isRequestingLocationPermission && styles.locationPermissionButtonDisabled,
            ]}
          >
            <ThemedText style={styles.locationPermissionButtonText}>
              {isRequestingLocationPermission
                ? 'Requesting permission...'
                : 'Allow location access'}
            </ThemedText>
          </Pressable>
        ) : null}
        {locationPermissionStatus !== 'granted' && !canAskLocationPermission ? (
          <Pressable onPress={onOpenLocationSettings} style={styles.locationSettingsButton}>
            <ThemedText style={styles.locationSettingsButtonText}>
              Open {platformLabel} settings for location
            </ThemedText>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.compassCard}>
        <View style={styles.compassDial}>
          {DIAL_TICKS.map((rotation) => (
            <View
              key={rotation}
              style={[styles.tickMark, { transform: [{ rotate: `${rotation}deg` }] }]}
            />
          ))}

          {CARDINAL_LABELS.map(({ label, position }) => (
            <View key={label} style={[styles.cardinalBase, getCardinalPositionStyle(position)]}>
              <ThemedText style={styles.cardinalText}>{label}</ThemedText>
            </View>
          ))}

          <Animated.View style={[styles.needleLayer, needleTransform]}>
            <View style={styles.needleTip} />
            <View style={styles.needleStem} />
          </Animated.View>

          <View style={styles.centerDot} />
          <View style={styles.kaabaBadge}>
            <IconSymbol name="kaaba" size={20} color="#192445" />
          </View>
        </View>

        <View style={styles.compassMetaRow}>
          <View style={styles.metaPill}>
            <ThemedText style={styles.metaPillLabel}>Qibla</ThemedText>
            <ThemedText style={styles.metaPillValue}>
              {qiblaBearing === null ? '—' : `${Math.round(qiblaBearing)}°`}
            </ThemedText>
          </View>
          <View style={styles.metaPill}>
            <ThemedText style={styles.metaPillLabel}>Distance</ThemedText>
            <ThemedText style={styles.metaPillValue}>
              {distanceKm === null ? '—' : `${distanceKm.toFixed(0)} km`}
            </ThemedText>
          </View>
        </View>

        <ThemedText style={styles.alignmentText}>
          {alignmentDelta === null
            ? 'Align your phone to begin'
            : isAligned
              ? 'Facing Qibla'
              : `Turn ${Math.round(alignmentDelta)}° to align with Qibla`}
        </ThemedText>
      </View>

      <View style={styles.prayerLocationCard}>
        <ThemedText style={styles.prayerLocationTitle}>Prayer Time Location</ThemedText>
        <ThemedText style={styles.prayerLocationSubtitle}>
          {usingDeviceLocationForPrayers
            ? `Using device location: ${prayerLocationLabel ?? 'Current location'}`
            : prayerLocationLabel
              ? `Using saved location: ${prayerLocationLabel}`
              : 'Select a city below to calculate prayer times without location permission.'}
        </ThemedText>
        <View style={styles.prayerLocationPresetWrap}>
          {prayerLocationPresets.map((preset) => (
            <Pressable
              key={preset.id}
              onPress={() => onSelectPrayerLocation(preset.id)}
              style={[
                styles.prayerLocationPreset,
                selectedPrayerLocationId === preset.id && styles.prayerLocationPresetActive,
              ]}
            >
              <ThemedText
                style={[
                  styles.prayerLocationPresetText,
                  selectedPrayerLocationId === preset.id && styles.prayerLocationPresetTextActive,
                ]}
              >
                {preset.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
        {selectedPrayerLocationId ? (
          <Pressable onPress={onClearSavedPrayerLocation} style={styles.clearPrayerLocationButton}>
            <ThemedText style={styles.clearPrayerLocationButtonText}>
              Clear saved location
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
  );
}

function getCardinalPositionStyle(position: 'north' | 'east' | 'south' | 'west') {
  switch (position) {
    case 'north':
      return styles.cardinalNorth;
    case 'east':
      return styles.cardinalEast;
    case 'south':
      return styles.cardinalSouth;
    case 'west':
      return styles.cardinalWest;
  }
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 108,
    paddingBottom: 120,
    paddingHorizontal: 18,
    gap: 14,
  },
  heroTextBlock: {
    gap: 8,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 35,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 19,
    fontWeight: '600',
    lineHeight: 24,
  },
  heroChips: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#bdfcc9',
  },
  heroChipText: {
    color: '#0f5132',
    fontSize: 12,
    fontWeight: '700',
  },
  heroChipSecondary: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.22)',
    maxWidth: '100%',
  },
  heroChipSecondaryText: {
    color: '#f8f7ff',
    fontSize: 12,
    fontWeight: '600',
  },
  locationPermissionButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: 'rgba(180, 83, 9, 0.35)',
  },
  locationPermissionButtonDisabled: {
    opacity: 0.7,
  },
  locationPermissionButtonText: {
    color: '#92400e',
    fontSize: 13,
    fontWeight: '700',
  },
  locationSettingsButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(248, 247, 255, 0.4)',
  },
  locationSettingsButtonText: {
    color: '#f8f7ff',
    fontSize: 13,
    fontWeight: '700',
  },
  compassCard: {
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.93)',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 14,
    gap: 12,
  },
  compassDial: {
    alignSelf: 'center',
    width: 290,
    height: 290,
    borderRadius: 145,
    backgroundColor: '#f1f8ff',
    borderWidth: 2,
    borderColor: 'rgba(24, 40, 82, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tickMark: {
    position: 'absolute',
    width: 2,
    height: 18,
    backgroundColor: 'rgba(23, 37, 84, 0.35)',
    top: 10,
  },
  cardinalBase: {
    position: 'absolute',
  },
  cardinalNorth: {
    top: 18,
  },
  cardinalEast: {
    right: 22,
  },
  cardinalSouth: {
    bottom: 18,
  },
  cardinalWest: {
    left: 22,
  },
  cardinalText: {
    fontSize: 19,
    color: '#1f2a44',
    fontWeight: '700',
  },
  needleLayer: {
    position: 'absolute',
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  needleTip: {
    marginTop: 10,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 28,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#16a34a',
  },
  needleStem: {
    width: 6,
    height: 95,
    marginTop: 10,
    borderRadius: 3,
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
  },
  centerDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#16a34a',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.95)',
  },
  kaabaBadge: {
    position: 'absolute',
    top: 36,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff4b2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(25, 36, 69, 0.2)',
  },
  compassMetaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metaPill: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 3,
  },
  metaPillLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  metaPillValue: {
    fontSize: 20,
    lineHeight: 24,
    color: '#0f172a',
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  alignmentText: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  prayerLocationCard: {
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.1)',
    padding: 12,
    gap: 8,
  },
  prayerLocationTitle: {
    color: '#0f172a',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
  },
  prayerLocationSubtitle: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  prayerLocationPresetWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  prayerLocationPreset: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.14)',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  prayerLocationPresetActive: {
    backgroundColor: '#dcfce7',
    borderColor: 'rgba(22, 163, 74, 0.45)',
  },
  prayerLocationPresetText: {
    color: '#1e293b',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  prayerLocationPresetTextActive: {
    color: '#166534',
  },
  clearPrayerLocationButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.16)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  clearPrayerLocationButtonText: {
    color: '#0f172a',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#fee2e2',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
});
