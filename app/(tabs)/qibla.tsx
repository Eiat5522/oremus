import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Stack } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Linking, Pressable, StyleSheet, View } from 'react-native';

import { QiblaCompassPage } from '@/components/qibla/qibla-compass-page';
import { QiblaMapPage } from '@/components/qibla/qibla-map-page';
import { ThemedText } from '@/components/themed-text';
import { getDistanceToKaabaKm, getQiblaBearing } from '@/lib/qibla';

const PRAYER_LOCATION_STORAGE_KEY = '@oremus/islam-prayer-location-v1';

type QiblaSubtab = 'compass' | 'map';
type SavedPrayerLocation = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
};

const PRAYER_LOCATION_PRESETS: SavedPrayerLocation[] = [
  { id: 'new-york-us', label: 'New York, US', latitude: 40.7128, longitude: -74.006 },
  { id: 'los-angeles-us', label: 'Los Angeles, US', latitude: 34.0522, longitude: -118.2437 },
  { id: 'chicago-us', label: 'Chicago, US', latitude: 41.8781, longitude: -87.6298 },
  { id: 'london-uk', label: 'London, UK', latitude: 51.5072, longitude: -0.1276 },
  { id: 'cairo-eg', label: 'Cairo, Egypt', latitude: 30.0444, longitude: 31.2357 },
  { id: 'bangkok-th', label: 'Bangkok, Thailand', latitude: 13.7563, longitude: 100.5018 },
  { id: 'mecca-sa', label: 'Mecca, Saudi Arabia', latitude: 21.4225, longitude: 39.8262 },
  { id: 'jakarta-id', label: 'Jakarta, Indonesia', latitude: -6.2088, longitude: 106.8456 },
];

export default function QiblaScreen() {
  const needleRotation = useRef(new Animated.Value(0)).current;
  const cumulativeRotation = useRef(0);

  const [activeSubtab, setActiveSubtab] = useState<QiblaSubtab>('compass');
  const [locationText, setLocationText] = useState('Location access required');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationPermissionStatus, setLocationPermissionStatus] =
    useState<Location.PermissionStatus | null>(null);
  const [canAskLocationPermission, setCanAskLocationPermission] = useState(true);
  const [locationPermissionRequestCount, setLocationPermissionRequestCount] = useState(0);
  const [isRequestingLocationPermission, setIsRequestingLocationPermission] = useState(false);
  const [coords, setCoords] = useState<Location.LocationObjectCoords | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [savedPrayerLocation, setSavedPrayerLocation] = useState<SavedPrayerLocation | null>(null);

  const prayerCoords = useMemo(() => {
    if (coords) {
      return coords;
    }
    if (savedPrayerLocation) {
      return {
        latitude: savedPrayerLocation.latitude,
        longitude: savedPrayerLocation.longitude,
      };
    }
    return null;
  }, [coords, savedPrayerLocation]);

  const prayerLocationLabel = useMemo(() => {
    if (coords) {
      return locationText;
    }
    if (savedPrayerLocation) {
      return savedPrayerLocation.label;
    }
    return null;
  }, [coords, locationText, savedPrayerLocation]);

  const qiblaBearing = useMemo(() => {
    if (!prayerCoords) {
      return null;
    }
    return getQiblaBearing(prayerCoords.latitude, prayerCoords.longitude);
  }, [prayerCoords]);

  const distanceKm = useMemo(() => {
    if (!prayerCoords) {
      return null;
    }
    return getDistanceToKaabaKm(prayerCoords.latitude, prayerCoords.longitude);
  }, [prayerCoords]);

  const relativeNeedleHeading = useMemo(() => {
    if (qiblaBearing === null) {
      return 0;
    }
    return (qiblaBearing - heading + 360) % 360;
  }, [heading, qiblaBearing]);

  const alignmentDelta = useMemo(() => {
    if (qiblaBearing === null) {
      return null;
    }
    return Math.abs(((((qiblaBearing - heading) % 360) + 540) % 360) - 180);
  }, [heading, qiblaBearing]);

  const isAligned = alignmentDelta !== null && alignmentDelta <= 10;

  const accuracyText = useMemo(() => {
    if (!coords?.accuracy) {
      return 'Locating accuracy';
    }
    if (coords.accuracy <= 20) {
      return 'GPS verified';
    }
    if (coords.accuracy <= 80) {
      return 'Moderate accuracy';
    }
    return 'Low accuracy';
  }, [coords?.accuracy]);

  const loadSavedPrayerLocation = React.useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(PRAYER_LOCATION_STORAGE_KEY);
      if (!stored) {
        setSavedPrayerLocation(null);
        return;
      }

      const parsed = JSON.parse(stored) as Partial<SavedPrayerLocation>;
      if (
        typeof parsed.id !== 'string' ||
        typeof parsed.label !== 'string' ||
        typeof parsed.latitude !== 'number' ||
        typeof parsed.longitude !== 'number'
      ) {
        setSavedPrayerLocation(null);
        return;
      }

      setSavedPrayerLocation({
        id: parsed.id,
        label: parsed.label,
        latitude: parsed.latitude,
        longitude: parsed.longitude,
      });
    } catch {
      setSavedPrayerLocation(null);
    }
  }, []);

  useEffect(() => {
    void loadSavedPrayerLocation();
  }, [loadSavedPrayerLocation]);

  useEffect(() => {
    let mounted = true;
    let headingSubscription: Location.LocationSubscription | null = null;

    const loadLocation = async () => {
      try {
        let permission = await Location.getForegroundPermissionsAsync();
        if (
          permission.status !== 'granted' &&
          locationPermissionRequestCount > 0 &&
          permission.canAskAgain
        ) {
          setIsRequestingLocationPermission(true);
          permission = await Location.requestForegroundPermissionsAsync();
        }
        if (!mounted) {
          return;
        }

        setIsRequestingLocationPermission(false);
        setLocationPermissionStatus(permission.status);
        setCanAskLocationPermission(permission.canAskAgain);

        if (permission.status !== 'granted') {
          setCoords(null);
          setLocationError(
            permission.canAskAgain
              ? 'Location permission is required to calculate Qibla from your position.'
              : 'Location permission is blocked. Enable location access in iOS Settings.',
          );
          setLocationText('Permission required');
          return;
        }

        setLocationError(null);
        setLocationText('Locating...');

        let current;
        try {
          current = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
        } catch (positionError) {
          if (!mounted) {
            return;
          }
          const errorMessage =
            positionError instanceof Error ? positionError.message : String(positionError);
          if (errorMessage.includes('unsatisfied device settings')) {
            setLocationError('Location services are disabled. Enable location in device settings.');
            setLocationText('Location services off');
          } else {
            setLocationError('Unable to determine your location. Check device settings.');
            setLocationText('Location unavailable');
          }
          return;
        }

        if (!mounted) {
          return;
        }

        setCoords(current.coords);

        try {
          const reverse = await Location.reverseGeocodeAsync({
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
          });
          if (!mounted) {
            return;
          }
          if (reverse.length > 0) {
            const place = reverse[0];
            setLocationText(
              [place.city, place.region, place.country]
                .filter((value): value is string => Boolean(value))
                .join(', ') || 'Current location',
            );
          } else {
            setLocationText(
              `${current.coords.latitude.toFixed(3)}, ${current.coords.longitude.toFixed(3)}`,
            );
          }
        } catch {
          if (mounted) {
            setLocationText(
              `${current.coords.latitude.toFixed(3)}, ${current.coords.longitude.toFixed(3)}`,
            );
          }
        }

        const initialHeading = await Location.getHeadingAsync();
        const bestHeading =
          initialHeading.trueHeading >= 0 ? initialHeading.trueHeading : initialHeading.magHeading;

        if (mounted) {
          setHeading(bestHeading);
        }

        headingSubscription = await Location.watchHeadingAsync((headingUpdate) => {
          if (!mounted) {
            return;
          }
          const liveHeading =
            headingUpdate.trueHeading >= 0 ? headingUpdate.trueHeading : headingUpdate.magHeading;
          setHeading(liveHeading);
        });
      } catch (error) {
        console.error('Failed to load Qibla data:', error);
        if (mounted) {
          setIsRequestingLocationPermission(false);
          setLocationError('Unable to read location and compass data on this device.');
          setLocationText('Unavailable');
        }
      }
    };

    void loadLocation();

    return () => {
      mounted = false;
      headingSubscription?.remove();
    };
  }, [locationPermissionRequestCount]);

  useEffect(() => {
    let delta = relativeNeedleHeading - (cumulativeRotation.current % 360);
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    cumulativeRotation.current += delta;

    const animation = Animated.timing(needleRotation, {
      toValue: cumulativeRotation.current,
      duration: 350,
      useNativeDriver: true,
    });

    animation.start();
    return () => animation.stop();
  }, [needleRotation, relativeNeedleHeading]);

  const selectSavedPrayerLocation = async (locationId: string) => {
    const location = PRAYER_LOCATION_PRESETS.find((item) => item.id === locationId);
    if (!location) {
      return;
    }

    const nextLocation: SavedPrayerLocation = {
      id: location.id,
      label: location.label,
      latitude: location.latitude,
      longitude: location.longitude,
    };

    setSavedPrayerLocation(nextLocation);
    await AsyncStorage.setItem(PRAYER_LOCATION_STORAGE_KEY, JSON.stringify(nextLocation));
  };

  const clearSavedPrayerLocation = async () => {
    setSavedPrayerLocation(null);
    await AsyncStorage.removeItem(PRAYER_LOCATION_STORAGE_KEY);
  };

  const needleTransform = {
    transform: [
      {
        rotate: needleRotation.interpolate({
          inputRange: [0, 360],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: 'Qibla',
          headerShown: true,
          headerTransparent: false,
          gestureEnabled: true,
        }}
      />

      <View style={styles.backgroundBase} />
      <View style={styles.backgroundOrbTop} />
      <View style={styles.backgroundOrbBottom} />

      {activeSubtab === 'compass' ? (
        <QiblaCompassPage
          accuracyText={accuracyText}
          locationText={locationText}
          locationError={locationError}
          locationPermissionStatus={locationPermissionStatus}
          canAskLocationPermission={canAskLocationPermission}
          isRequestingLocationPermission={isRequestingLocationPermission}
          onRequestLocationPermission={() =>
            setLocationPermissionRequestCount((count) => count + 1)
          }
          onOpenLocationSettings={() => {
            void Linking.openSettings();
          }}
          qiblaBearing={qiblaBearing}
          distanceKm={distanceKm}
          alignmentDelta={alignmentDelta}
          isAligned={isAligned}
          needleTransform={needleTransform}
          prayerLocationLabel={prayerLocationLabel}
          usingDeviceLocationForPrayers={Boolean(coords)}
          prayerLocationPresets={PRAYER_LOCATION_PRESETS}
          selectedPrayerLocationId={savedPrayerLocation?.id ?? null}
          onSelectPrayerLocation={(locationId) => {
            void selectSavedPrayerLocation(locationId);
          }}
          onClearSavedPrayerLocation={() => {
            void clearSavedPrayerLocation();
          }}
        />
      ) : (
        <QiblaMapPage
          originCoords={prayerCoords}
          originLabel={prayerLocationLabel}
          locationError={locationError}
          locationPermissionStatus={locationPermissionStatus}
          canAskLocationPermission={canAskLocationPermission}
          isRequestingLocationPermission={isRequestingLocationPermission}
          onRequestLocationPermission={() =>
            setLocationPermissionRequestCount((count) => count + 1)
          }
          onOpenLocationSettings={() => {
            void Linking.openSettings();
          }}
          distanceKm={distanceKm}
        />
      )}

      <View style={styles.subtabWrap}>
        <View style={styles.subtabContainer}>
          <Pressable
            onPress={() => setActiveSubtab('compass')}
            style={[styles.subtabButton, activeSubtab === 'compass' && styles.subtabButtonActive]}
          >
            <ThemedText
              style={[styles.subtabLabel, activeSubtab === 'compass' && styles.subtabLabelActive]}
            >
              Compass
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setActiveSubtab('map')}
            style={[styles.subtabButton, activeSubtab === 'map' && styles.subtabButtonActive]}
          >
            <ThemedText
              style={[styles.subtabLabel, activeSubtab === 'map' && styles.subtabLabelActive]}
            >
              Map
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#005a3e',
  },
  backgroundBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#005a3e',
  },
  backgroundOrbTop: {
    position: 'absolute',
    top: -140,
    right: -110,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(134, 239, 172, 0.18)',
  },
  backgroundOrbBottom: {
    position: 'absolute',
    left: -130,
    bottom: -180,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: 'rgba(187, 247, 208, 0.15)',
  },
  subtabWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 8,
  },
  subtabContainer: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(2, 6, 23, 0.45)',
    borderRadius: 999,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  subtabButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtabButtonActive: {
    backgroundColor: '#dcfce7',
  },
  subtabLabel: {
    color: '#e2e8f0',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  subtabLabelActive: {
    color: '#14532d',
  },
});
