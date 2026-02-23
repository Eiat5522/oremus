import * as Location from 'expo-location';
import React, { useEffect, useMemo, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { ThemedText } from '@/components/themed-text';
import { KAABA_COORDINATES } from '@/lib/qibla';

type QiblaMapPageProps = {
  originCoords: { latitude: number; longitude: number } | null;
  originLabel: string | null;
  locationError: string | null;
  locationPermissionStatus: Location.PermissionStatus | null;
  canAskLocationPermission: boolean;
  isRequestingLocationPermission: boolean;
  onRequestLocationPermission: () => void;
  onOpenLocationSettings: () => void;
  distanceKm: number | null;
};

export function QiblaMapPage({
  originCoords,
  originLabel,
  locationError,
  locationPermissionStatus,
  canAskLocationPermission,
  isRequestingLocationPermission,
  onRequestLocationPermission,
  onOpenLocationSettings,
  distanceKm,
}: QiblaMapPageProps) {
  const mapRef = useRef<MapView | null>(null);
  const platformLabel = process.env.EXPO_OS === 'ios' ? 'iOS' : 'device';

  const hasOrigin = Boolean(originCoords);

  const polylineCoordinates = useMemo(() => {
    if (!originCoords) {
      return [];
    }
    return [
      { latitude: originCoords.latitude, longitude: originCoords.longitude },
      KAABA_COORDINATES,
    ];
  }, [originCoords]);

  useEffect(() => {
    if (!mapRef.current || !originCoords) {
      return;
    }

    mapRef.current.fitToCoordinates(
      [{ latitude: originCoords.latitude, longitude: originCoords.longitude }, KAABA_COORDINATES],
      {
        edgePadding: { top: 56, right: 56, bottom: 56, left: 56 },
        animated: true,
      },
    );
  }, [originCoords]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <View style={styles.headerCard}>
        <ThemedText style={styles.title}>Qibla Path to Mecca</ThemedText>
        <ThemedText style={styles.subtitle}>
          {hasOrigin
            ? `From ${originLabel ?? 'Selected location'}`
            : 'Enable location or choose a saved location to place your starting point'}
        </ThemedText>
        <ThemedText style={styles.distance}>
          Distance: {distanceKm === null ? '—' : `${distanceKm.toFixed(0)} km`}
        </ThemedText>

        {locationError ? <ThemedText style={styles.errorText}>{locationError}</ThemedText> : null}
        {locationPermissionStatus !== 'granted' && canAskLocationPermission ? (
          <Pressable
            disabled={isRequestingLocationPermission}
            onPress={onRequestLocationPermission}
            style={[
              styles.permissionButton,
              isRequestingLocationPermission && styles.disabledButton,
            ]}
          >
            <ThemedText style={styles.permissionButtonText}>
              {isRequestingLocationPermission
                ? 'Requesting permission...'
                : 'Allow location access'}
            </ThemedText>
          </Pressable>
        ) : null}
        {locationPermissionStatus !== 'granted' && !canAskLocationPermission ? (
          <Pressable onPress={onOpenLocationSettings} style={styles.settingsButton}>
            <ThemedText style={styles.settingsButtonText}>
              Open {platformLabel} settings for location
            </ThemedText>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.mapCard}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: hasOrigin
              ? (KAABA_COORDINATES.latitude +
                  (originCoords?.latitude ?? KAABA_COORDINATES.latitude)) /
                2
              : KAABA_COORDINATES.latitude,
            longitude: hasOrigin
              ? (KAABA_COORDINATES.longitude +
                  (originCoords?.longitude ?? KAABA_COORDINATES.longitude)) /
                2
              : KAABA_COORDINATES.longitude,
            latitudeDelta: hasOrigin ? 75 : 8,
            longitudeDelta: hasOrigin ? 75 : 8,
          }}
          onMapReady={() => {
            if (!originCoords || !mapRef.current) {
              return;
            }

            mapRef.current.fitToCoordinates(
              [
                { latitude: originCoords.latitude, longitude: originCoords.longitude },
                KAABA_COORDINATES,
              ],
              {
                edgePadding: { top: 56, right: 56, bottom: 56, left: 56 },
                animated: false,
              },
            );
          }}
        >
          <Marker coordinate={KAABA_COORDINATES} title="Mecca" description="Kaaba" />
          {originCoords ? (
            <Marker
              coordinate={{ latitude: originCoords.latitude, longitude: originCoords.longitude }}
              title="Starting location"
              description={originLabel ?? 'Selected location'}
            />
          ) : null}
          {polylineCoordinates.length === 2 ? (
            <Polyline
              coordinates={polylineCoordinates}
              geodesic
              strokeColor="#16a34a"
              strokeWidth={4}
            />
          ) : null}
        </MapView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 108,
    paddingBottom: 120,
    paddingHorizontal: 18,
    gap: 14,
  },
  headerCard: {
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.94)',
    padding: 16,
    gap: 8,
  },
  title: {
    color: '#0f172a',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  distance: {
    color: '#0f5132',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  mapCard: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  map: {
    width: '100%',
    height: 470,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  permissionButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: 'rgba(180, 83, 9, 0.35)',
  },
  disabledButton: {
    opacity: 0.7,
  },
  permissionButtonText: {
    color: '#92400e',
    fontSize: 13,
    fontWeight: '700',
  },
  settingsButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(15,23,42,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.12)',
  },
  settingsButtonText: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '700',
  },
});
