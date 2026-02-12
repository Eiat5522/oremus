import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  formatTime,
  getNextPrayer,
  getPrayerTimesForDate,
  type PrayerName,
  type PrayerTimeEntry,
} from '@/lib/prayer-times';
import { getDistanceToKaabaKm, getQiblaBearing } from '@/lib/qibla';

const REMINDER_HASH_STORAGE_KEY = '@oremus/islam-reminder-hash';
const PRAYER_COMPLETION_STORAGE_KEY = '@oremus/islam-prayer-completion-v1';

const PRAYER_LABEL_TEXT =
  'Five daily prayers: Fajr (dawn), Dhuhr (midday), Asr (late afternoon), Maghrib (sunset), and Isha (night).';

type NotificationStatus = 'idle' | 'ready' | 'blocked';
type DailyPrayerCompletion = Record<PrayerName, boolean>;
type PrayerCompletionStore = Record<string, DailyPrayerCompletion>;

const CARDINAL_LABELS = [
  { label: 'N', position: 'north' },
  { label: 'E', position: 'east' },
  { label: 'S', position: 'south' },
  { label: 'W', position: 'west' },
] as const;

const DIAL_TICKS = Array.from({ length: 24 }, (_, index) => index * 15);

export default function QiblaScreen() {
  const router = useRouter();
  const needleRotation = useRef(new Animated.Value(0)).current;
  const cumulativeRotation = useRef(0);

  const [now, setNow] = useState(() => new Date());
  const [locationText, setLocationText] = useState('Locating...');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [coords, setCoords] = useState<Location.LocationObjectCoords | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [notificationStatus, setNotificationStatus] = useState<NotificationStatus>('idle');
  const [isScheduling, setIsScheduling] = useState(false);
  const [prayerCompletions, setPrayerCompletions] = useState<PrayerCompletionStore>({});

  const todayKey = useMemo(() => getLocalDateKey(now), [now]);

  const todayPrayers = useMemo(() => {
    if (!coords) {
      return [];
    }
    return getPrayerTimesForDate(coords.latitude, coords.longitude, now);
  }, [coords, now]);

  const nextPrayer = useMemo(() => getNextPrayer(todayPrayers, now), [todayPrayers, now]);

  const currentPrayerName = useMemo(
    () => getCurrentPrayerName(todayPrayers, now),
    [todayPrayers, now],
  );

  const qiblaBearing = useMemo(() => {
    if (!coords) {
      return null;
    }
    return getQiblaBearing(coords.latitude, coords.longitude);
  }, [coords]);

  const distanceKm = useMemo(() => {
    if (!coords) {
      return null;
    }
    return getDistanceToKaabaKm(coords.latitude, coords.longitude);
  }, [coords]);

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

  const todayCompletion = useMemo(
    () => prayerCompletions[todayKey] ?? getDefaultCompletionState(),
    [prayerCompletions, todayKey],
  );

  const completedCount = useMemo(
    () => Object.values(todayCompletion).filter(Boolean).length,
    [todayCompletion],
  );

  const countdownText = nextPrayer
    ? formatCountdown(nextPrayer.time, now)
    : 'All prayers completed today';

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

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadPrayerCompletions = async () => {
      try {
        const stored = await AsyncStorage.getItem(PRAYER_COMPLETION_STORAGE_KEY);
        if (!stored || !mounted) {
          return;
        }
        const parsed = JSON.parse(stored) as PrayerCompletionStore;
        setPrayerCompletions(parsed);
      } catch {
        if (mounted) {
          setPrayerCompletions({});
        }
      }
    };

    void loadPrayerCompletions();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    let headingSubscription: Location.LocationSubscription | null = null;

    const loadLocation = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!mounted) {
          return;
        }
        if (permission.status !== 'granted') {
          setLocationError(
            'Location permission is required to calculate Qibla from your position.',
          );
          setLocationText('Permission required');
          return;
        }

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
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
  }, []);

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

  const togglePrayerCompletion = (name: PrayerName) => {
    setPrayerCompletions((previous) => {
      const dayState = previous[todayKey] ?? getDefaultCompletionState();
      const nextDayState: DailyPrayerCompletion = {
        ...dayState,
        [name]: !dayState[name],
      };
      const nextState: PrayerCompletionStore = {
        ...previous,
        [todayKey]: nextDayState,
      };
      void AsyncStorage.setItem(PRAYER_COMPLETION_STORAGE_KEY, JSON.stringify(nextState));
      return nextState;
    });
  };

  const ensureNotificationPermission = async () => {
    await Notifications.setNotificationChannelAsync('prayer-reminders', {
      name: 'Prayer reminders',
      importance: Notifications.AndroidImportance.HIGH,
    });

    const existingPermission = await Notifications.getPermissionsAsync();
    let finalStatus = existingPermission.status;
    if (finalStatus !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      finalStatus = requested.status;
    }

    if (finalStatus !== 'granted') {
      setNotificationStatus('blocked');
      return false;
    }

    setNotificationStatus('ready');
    return true;
  };

  const schedulePrayerNotifications = async () => {
    if (!coords) {
      return;
    }

    setIsScheduling(true);
    try {
      const granted = await ensureNotificationPermission();
      if (!granted) {
        return;
      }

      const referenceDate = new Date();
      const reminderHash = `${coords.latitude.toFixed(3)}:${coords.longitude.toFixed(3)}:${referenceDate.toDateString()}`;
      const existingHash = await AsyncStorage.getItem(REMINDER_HASH_STORAGE_KEY);

      if (existingHash === reminderHash) {
        setNotificationStatus('ready');
        return;
      }

      const pending = await Notifications.getAllScheduledNotificationsAsync();
      const prayerNotifications = pending.filter(
        (notification) => notification.content.data?.feature === 'islam-prayer',
      );

      await Promise.all(
        prayerNotifications.map((notification) =>
          Notifications.cancelScheduledNotificationAsync(notification.identifier),
        ),
      );

      for (let offset = 0; offset <= 1; offset += 1) {
        const targetDate = new Date(referenceDate);
        targetDate.setDate(referenceDate.getDate() + offset);
        const prayers = getPrayerTimesForDate(coords.latitude, coords.longitude, targetDate);

        for (const prayer of prayers) {
          if (prayer.time.getTime() <= referenceDate.getTime()) {
            continue;
          }

          await Notifications.scheduleNotificationAsync({
            content: {
              title: `${prayer.label} prayer reminder`,
              body: `It is time for ${prayer.label}.`,
              sound: 'default',
              data: {
                feature: 'islam-prayer',
                prayer: prayer.name,
              },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: prayer.time,
            },
          });
        }
      }

      await AsyncStorage.setItem(REMINDER_HASH_STORAGE_KEY, reminderHash);
      setNotificationStatus('ready');
    } catch (error) {
      console.error('Failed to schedule reminders:', error);
      setNotificationStatus('blocked');
    } finally {
      setIsScheduling(false);
    }
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
          title: 'Qibla Compass',
          headerShown: true,
          headerTransparent: true,
          gestureEnabled: false,
          headerTitleStyle: {
            color: '#f8f7ff',
            fontWeight: '700',
          },
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.headerIcon}>
              <IconSymbol name="arrow.left" size={20} color="#f8f7ff" />
            </Pressable>
          ),
        }}
      />

      <View style={styles.backgroundBase} />
      <View style={styles.backgroundOrbTop} />
      <View style={styles.backgroundOrbBottom} />

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

        <View style={styles.prayerCard}>
          <View style={styles.prayerCardHeaderRow}>
            <View>
              <ThemedText style={styles.prayerCardDate}>
                Today, {formatReadableDate(now)}
              </ThemedText>
              <ThemedText style={styles.prayerCardLabel}>
                {nextPrayer ? `${nextPrayer.label} in` : 'Today complete'}
              </ThemedText>
              <ThemedText style={styles.prayerCardTime}>
                {nextPrayer ? formatTime(nextPrayer.time) : 'Done'}
              </ThemedText>
              <ThemedText style={styles.prayerCardCountdown}>{countdownText}</ThemedText>
            </View>
            <ProgressRing progress={completedCount / 5} label={`${completedCount}/5`} />
          </View>

          <View style={styles.prayerList}>
            {todayPrayers.length === 0 ? (
              <ThemedText style={styles.prayerHint}>
                Waiting for location to load prayer times.
              </ThemedText>
            ) : (
              todayPrayers.map((prayer) => {
                const isComplete = todayCompletion[prayer.name];
                const isCurrent = currentPrayerName === prayer.name;
                const isNext = nextPrayer?.name === prayer.name;

                return (
                  <Pressable
                    key={prayer.name}
                    onPress={() => togglePrayerCompletion(prayer.name)}
                    style={[styles.prayerRow, isComplete && styles.prayerRowComplete]}
                  >
                    <View style={[styles.checkCircle, isComplete && styles.checkCircleActive]}>
                      {isComplete ? (
                        <IconSymbol name="checkmark" size={14} color="#ffffff" />
                      ) : null}
                    </View>

                    <View style={styles.prayerRowInfo}>
                      <View style={styles.prayerRowTopLine}>
                        <ThemedText style={styles.prayerRowLabel}>{prayer.label}</ThemedText>
                        {isCurrent ? <ThemedText style={styles.nowBadge}>Now</ThemedText> : null}
                        {!isCurrent && isNext ? (
                          <ThemedText style={styles.nextBadge}>Next</ThemedText>
                        ) : null}
                      </View>
                      <ThemedText style={styles.prayerRowTime}>
                        {formatTime(prayer.time)}
                      </ThemedText>
                    </View>

                    <IconSymbol name="bell.fill" size={15} color="rgba(17,24,39,0.45)" />
                  </Pressable>
                );
              })
            )}
          </View>
        </View>

        <Pressable
          disabled={!coords || isScheduling}
          onPress={schedulePrayerNotifications}
          style={[
            styles.reminderButton,
            (!coords || isScheduling) && styles.reminderButtonDisabled,
          ]}
        >
          <IconSymbol name="bell.fill" size={18} color="#0f5132" />
          <ThemedText style={styles.reminderButtonText}>
            {isScheduling ? 'Scheduling reminders...' : 'Enable prayer reminders'}
          </ThemedText>
        </Pressable>

        <ThemedText style={styles.footnote}>{PRAYER_LABEL_TEXT}</ThemedText>

        {notificationStatus === 'ready' ? (
          <ThemedText style={styles.readyText}>
            Reminders scheduled for Fajr, Dhuhr, Asr, Maghrib, and Isha.
          </ThemedText>
        ) : null}

        {notificationStatus === 'blocked' ? (
          <ThemedText style={styles.errorText}>
            Notifications are blocked. Please enable notifications in device settings.
          </ThemedText>
        ) : null}
      </ScrollView>
    </View>
  );
}

function ProgressRing({ progress, label }: { progress: number; label: string }) {
  const size = 86;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, progress));
  const dashOffset = circumference - circumference * clamped;

  return (
    <View style={styles.progressRingWrap}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(15, 23, 42, 0.13)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#16a34a"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.progressRingLabelContainer}>
        <ThemedText style={styles.progressRingValue}>{label}</ThemedText>
        <ThemedText style={styles.progressRingCaption}>prayed</ThemedText>
      </View>
    </View>
  );
}

function getCurrentPrayerName(prayers: PrayerTimeEntry[], now: Date): PrayerName | null {
  if (prayers.length === 0) {
    return null;
  }

  for (let index = 0; index < prayers.length; index += 1) {
    const current = prayers[index];
    const next = prayers[index + 1];

    if (!next) {
      if (now.getTime() >= current.time.getTime()) {
        return current.name;
      }
      break;
    }

    if (now.getTime() >= current.time.getTime() && now.getTime() < next.time.getTime()) {
      return current.name;
    }
  }

  return null;
}

function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDefaultCompletionState(): DailyPrayerCompletion {
  return {
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false,
  };
}

function formatCountdown(target: Date, now: Date): string {
  const remainingMs = target.getTime() - now.getTime();
  if (remainingMs <= 0) {
    return 'Now';
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours <= 0) {
    return `${minutes}m remaining`;
  }

  return `${hours}h ${minutes}m remaining`;
}

function formatReadableDate(date: Date): string {
  return date.toLocaleDateString([], {
    day: 'numeric',
    month: 'long',
  });
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
  content: {
    paddingTop: 108,
    paddingBottom: 40,
    paddingHorizontal: 18,
    gap: 14,
  },
  headerIcon: {
    paddingHorizontal: 14,
    paddingVertical: 8,
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
  prayerCard: {
    borderRadius: 28,
    backgroundColor: '#ffffff',
    padding: 16,
    gap: 14,
  },
  prayerCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  prayerCardDate: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  prayerCardLabel: {
    color: '#0f172a',
    fontSize: 14,
    marginTop: 2,
    fontWeight: '700',
  },
  prayerCardTime: {
    color: '#020617',
    fontSize: 44,
    lineHeight: 48,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  prayerCardCountdown: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  progressRingWrap: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingLabelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingValue: {
    color: '#020617',
    fontSize: 18,
    lineHeight: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  progressRingCaption: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
  },
  prayerList: {
    gap: 8,
  },
  prayerHint: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 18,
  },
  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  prayerRowComplete: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#94a3b8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkCircleActive: {
    borderColor: '#16a34a',
    backgroundColor: '#16a34a',
  },
  prayerRowInfo: {
    flex: 1,
    gap: 2,
  },
  prayerRowTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  prayerRowLabel: {
    fontSize: 16,
    lineHeight: 20,
    color: '#0f172a',
    fontWeight: '700',
  },
  prayerRowTime: {
    fontSize: 13,
    lineHeight: 16,
    color: '#475569',
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  nowBadge: {
    fontSize: 11,
    color: '#0f5132',
    backgroundColor: '#bbf7d0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    fontWeight: '700',
  },
  nextBadge: {
    fontSize: 11,
    color: '#1d4ed8',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    fontWeight: '700',
  },
  reminderButton: {
    borderRadius: 999,
    backgroundColor: '#d1fae5',
    borderWidth: 1,
    borderColor: '#6ee7b7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  reminderButtonDisabled: {
    opacity: 0.5,
  },
  reminderButtonText: {
    color: '#0f5132',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },
  footnote: {
    color: 'rgba(255,255,255,0.86)',
    fontSize: 12,
    lineHeight: 17,
  },
  readyText: {
    color: '#dcfce7',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  errorText: {
    color: '#fee2e2',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
});
