import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Linking, Pressable, StyleSheet, View } from 'react-native';

import { QiblaCompassPage } from '@/components/qibla/qibla-compass-page';
import { QiblaMapPage } from '@/components/qibla/qibla-map-page';
import { ThemedText } from '@/components/themed-text';
import { useSafeCameraPermissions } from '@/hooks/use-safe-camera-permissions';
import { getDistanceToKaabaKm, getQiblaBearing } from '@/lib/qibla';

const PRAYER_LOCATION_STORAGE_KEY = '@oremus/islam-prayer-location-v1';
const CALIBRATION_STEP_DEGREES = 2;

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
  const router = useRouter();
  const needleRotation = useRef(new Animated.Value(0)).current;
  const cumulativeRotation = useRef(0);
  const hasAutoRequestedCamera = useRef(false);

  const [cameraPermission, requestCameraPermission] = useSafeCameraPermissions();
  const [isRequestingCameraPermission, setIsRequestingCameraPermission] = useState(false);

  const [activeSubtab, setActiveSubtab] = useState<QiblaSubtab>('compass');
  const activeSubtabRef = useRef<QiblaSubtab>('compass');
  const [locationText, setLocationText] = useState('Location access required');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationPermissionStatus, setLocationPermissionStatus] =
    useState<Location.PermissionStatus | null>(null);
  const [canAskLocationPermission, setCanAskLocationPermission] = useState(true);
  const [locationPermissionRequestCount, setLocationPermissionRequestCount] = useState(0);
  const [isRequestingLocationPermission, setIsRequestingLocationPermission] = useState(false);
  const [coords, setCoords] = useState<Location.LocationObjectCoords | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [manualHeadingOffset, setManualHeadingOffset] = useState(0);
  const [savedPrayerLocation, setSavedPrayerLocation] = useState<SavedPrayerLocation | null>(null);

  useEffect(() => {
    activeSubtabRef.current = activeSubtab;
  }, [activeSubtab]);

  const cameraPermissionStatus = cameraPermission?.status ?? null;
  const canAskCameraPermission = cameraPermission?.canAskAgain ?? true;
  const showLiveCamera = activeSubtab === 'compass' && cameraPermissionStatus === 'granted';

  useEffect(() => {
    if (activeSubtab !== 'compass') {
      return;
    }

    if (hasAutoRequestedCamera.current) {
      return;
    }

    if (cameraPermissionStatus === null || cameraPermissionStatus === 'undetermined') {
      hasAutoRequestedCamera.current = true;
      setIsRequestingCameraPermission(true);
      requestCameraPermission().finally(() => {
        setIsRequestingCameraPermission(false);
      });
    }
  }, [activeSubtab, cameraPermissionStatus, requestCameraPermission]);

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

  const effectiveHeading = useMemo(
    () => normalizeDegrees(heading + manualHeadingOffset),
    [heading, manualHeadingOffset],
  );

  const relativeNeedleHeading = useMemo(() => {
    if (qiblaBearing === null) {
      return 0;
    }
    return normalizeDegrees(qiblaBearing - effectiveHeading);
  }, [effectiveHeading, qiblaBearing]);

  const alignmentDelta = useMemo(() => {
    if (qiblaBearing === null) {
      return null;
    }
    return Math.abs(((((qiblaBearing - effectiveHeading) % 360) + 540) % 360) - 180);
  }, [effectiveHeading, qiblaBearing]);

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
              : 'Location permission is blocked. Enable location access in settings.',
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

        if (mounted && activeSubtabRef.current === 'compass') {
          setHeading(bestHeading);
        }

        headingSubscription = await Location.watchHeadingAsync((headingUpdate) => {
          if (!mounted || activeSubtabRef.current !== 'compass') {
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

  const handleCameraPermissionRequest = async () => {
    setIsRequestingCameraPermission(true);
    try {
      await requestCameraPermission();
    } finally {
      setIsRequestingCameraPermission(false);
    }
  };

  const triggerHaptic = () => {
    if (process.env.EXPO_OS === 'ios') {
      void Haptics.selectionAsync();
    }
  };

  const handleRecenterCalibration = async () => {
    setManualHeadingOffset(0);
    triggerHaptic();

    if (locationPermissionStatus !== 'granted') {
      return;
    }

    try {
      const initialHeading = await Location.getHeadingAsync();
      const bestHeading =
        initialHeading.trueHeading >= 0 ? initialHeading.trueHeading : initialHeading.magHeading;
      setHeading(bestHeading);
    } catch {
      // Ignore heading recenter failures; live heading updates continue.
    }
  };

  const handleNudgeCalibration = (delta: number) => {
    setManualHeadingOffset((current) => normalizeOffset(current + delta));
    triggerHaptic();
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

  const snapPoints = useMemo(() => ['18%', '55%'], []);

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: 'Qibla',
          headerShown: false,
          gestureEnabled: true,
        }}
      />

      {activeSubtab === 'compass' ? (
        <QiblaCompassPage
          showLiveCamera={showLiveCamera}
          cameraPermissionStatus={cameraPermissionStatus}
          canAskCameraPermission={canAskCameraPermission}
          isRequestingCameraPermission={isRequestingCameraPermission}
          onRequestCameraPermission={() => {
            void handleCameraPermissionRequest();
          }}
          onOpenCameraSettings={() => {
            void Linking.openSettings();
          }}
          onClose={() => {
            if (router.canGoBack()) {
              router.back();
            }
          }}
          onRecenterCalibration={() => {
            void handleRecenterCalibration();
          }}
          onNudgeCalibrationLeft={() => handleNudgeCalibration(-CALIBRATION_STEP_DEGREES)}
          onNudgeCalibrationRight={() => handleNudgeCalibration(CALIBRATION_STEP_DEGREES)}
          calibrationOffset={manualHeadingOffset}
          alignmentDelta={alignmentDelta}
          isAligned={isAligned}
          needleTransform={needleTransform}
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

      <BottomSheet
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetIndicator}
      >
        <BottomSheetScrollView contentContainerStyle={styles.sheetScrollContent}>
          <View style={styles.segmentWrap}>
            <Pressable
              onPress={() => setActiveSubtab('compass')}
              style={[
                styles.segmentButton,
                activeSubtab === 'compass' && styles.segmentButtonActive,
              ]}
            >
              <ThemedText
                style={[
                  styles.segmentLabel,
                  activeSubtab === 'compass' && styles.segmentLabelActive,
                ]}
              >
                Compass
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => setActiveSubtab('map')}
              style={[styles.segmentButton, activeSubtab === 'map' && styles.segmentButtonActive]}
            >
              <ThemedText
                style={[styles.segmentLabel, activeSubtab === 'map' && styles.segmentLabelActive]}
              >
                Map
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <ThemedText style={styles.statLabel}>Qibla</ThemedText>
              <ThemedText style={styles.statValue}>
                {qiblaBearing === null ? '—' : `${Math.round(qiblaBearing)}°`}
              </ThemedText>
            </View>
            <View style={styles.statCard}>
              <ThemedText style={styles.statLabel}>Distance</ThemedText>
              <ThemedText style={styles.statValue}>
                {distanceKm === null ? '—' : `${distanceKm.toFixed(0)} km`}
              </ThemedText>
            </View>
            <View style={styles.statCard}>
              <ThemedText style={styles.statLabel}>Accuracy</ThemedText>
              <ThemedText style={styles.statValueSmall}>{accuracyText}</ThemedText>
            </View>
          </View>

          <View style={styles.infoCard}>
            <ThemedText style={styles.infoTitle}>Alignment</ThemedText>
            <ThemedText style={styles.infoBody}>
              {alignmentDelta === null
                ? 'Align your phone to begin'
                : isAligned
                  ? 'Facing Qibla'
                  : `Turn ${Math.round(alignmentDelta)}° to align with Qibla`}
            </ThemedText>
            <ThemedText style={styles.infoSubtle}>
              {`Manual calibration offset: ${Math.round(manualHeadingOffset)}°`}
            </ThemedText>
          </View>

          <View style={styles.infoCard}>
            <ThemedText style={styles.infoTitle}>Camera</ThemedText>
            <ThemedText style={styles.infoBody}>
              {cameraPermissionStatus === 'granted'
                ? 'Live preview enabled'
                : 'Camera permission is required for AR-style live background.'}
            </ThemedText>
            {cameraPermissionStatus !== 'granted' && canAskCameraPermission ? (
              <Pressable
                disabled={isRequestingCameraPermission}
                onPress={() => {
                  void handleCameraPermissionRequest();
                }}
                style={styles.ctaButton}
              >
                <ThemedText style={styles.ctaButtonText}>
                  {isRequestingCameraPermission ? 'Requesting permission...' : 'Enable camera'}
                </ThemedText>
              </Pressable>
            ) : null}
            {cameraPermissionStatus !== 'granted' && !canAskCameraPermission ? (
              <Pressable
                onPress={() => {
                  void Linking.openSettings();
                }}
                style={styles.secondaryButton}
              >
                <ThemedText style={styles.secondaryButtonText}>Open settings</ThemedText>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.infoCard}>
            <ThemedText style={styles.infoTitle}>Location for Prayer Times</ThemedText>
            <ThemedText style={styles.infoBody}>
              {coords
                ? `Using device location: ${prayerLocationLabel ?? 'Current location'}`
                : prayerLocationLabel
                  ? `Using saved location: ${prayerLocationLabel}`
                  : 'Select a city below to calculate prayer times without location permission.'}
            </ThemedText>

            {locationError ? (
              <ThemedText style={styles.errorText}>{locationError}</ThemedText>
            ) : null}

            {locationPermissionStatus !== 'granted' && canAskLocationPermission ? (
              <Pressable
                disabled={isRequestingLocationPermission}
                onPress={() => setLocationPermissionRequestCount((count) => count + 1)}
                style={styles.ctaButton}
              >
                <ThemedText style={styles.ctaButtonText}>
                  {isRequestingLocationPermission ? 'Requesting permission...' : 'Enable location'}
                </ThemedText>
              </Pressable>
            ) : null}

            {locationPermissionStatus !== 'granted' && !canAskLocationPermission ? (
              <Pressable
                onPress={() => {
                  void Linking.openSettings();
                }}
                style={styles.secondaryButton}
              >
                <ThemedText style={styles.secondaryButtonText}>Open location settings</ThemedText>
              </Pressable>
            ) : null}

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
                style={styles.secondaryButton}
              >
                <ThemedText style={styles.secondaryButtonText}>Clear saved location</ThemedText>
              </Pressable>
            ) : null}
          </View>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}

function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360;
}

function normalizeOffset(value: number) {
  const normalized = ((((value + 180) % 360) + 360) % 360) - 180;
  return Math.round(normalized * 10) / 10;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0b1220',
  },
  sheetBackground: {
    backgroundColor: '#f8fafc',
    borderRadius: 26,
  },
  sheetIndicator: {
    backgroundColor: '#94a3b8',
    width: 50,
  },
  sheetScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 48,
    gap: 12,
  },
  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    padding: 4,
    gap: 6,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  segmentButtonActive: {
    backgroundColor: '#ffffff',
  },
  segmentLabel: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  segmentLabelActive: {
    color: '#0f172a',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
    gap: 3,
  },
  statLabel: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  statValue: {
    color: '#0f172a',
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  statValueSmall: {
    color: '#0f172a',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  infoCard: {
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    gap: 8,
  },
  infoTitle: {
    color: '#0f172a',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },
  infoBody: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  infoSubtle: {
    color: '#64748b',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  ctaButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  ctaButtonText: {
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  secondaryButtonText: {
    color: '#0f172a',
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
    borderColor: '#cbd5e1',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  presetChipActive: {
    borderColor: 'rgba(22,163,74,0.5)',
    backgroundColor: '#dcfce7',
  },
  presetChipText: {
    color: '#1e293b',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },
  presetChipTextActive: {
    color: '#166534',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
});
