import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PrayerName } from '@/lib/prayer-times';

export const ISLAMIC_SESSION_ANALYTICS_STORAGE_KEY = '@oremus/islamic-session-analytics-v1';
export const ISLAMIC_SESSION_ANALYTICS_FUNNEL_ID = 'islamic_prayer_session';

export type IslamicSessionAnalyticsEventType =
  | 'qibla_opened'
  | 'camera_permission_prompted'
  | 'camera_permission_granted'
  | 'camera_permission_denied'
  | 'camera_permission_blocked'
  | 'location_permission_prompted'
  | 'location_permission_granted'
  | 'location_permission_denied'
  | 'location_permission_blocked'
  | 'alignment_reached'
  | 'auto_start_triggered'
  | 'manual_start_triggered'
  | 'session_completed'
  | 'session_exited_early';

export type IslamicSessionAnalyticsFunnelStep =
  | 'qibla'
  | 'camera_permission'
  | 'location_permission'
  | 'alignment'
  | 'session_start'
  | 'session_end';

export type IslamicSessionAnalyticsMode = 'session' | 'finder';
export type IslamicSessionAnalyticsTrigger = 'auto' | 'manual' | 'system';
export type IslamicSessionAnalyticsPermissionType = 'camera' | 'location';
export type IslamicSessionAnalyticsPermissionStatus =
  | 'prompted'
  | 'granted'
  | 'denied'
  | 'blocked';
export type IslamicSessionAnalyticsSourceScreen =
  | 'islam-preparation'
  | 'qibla'
  | 'islam-session'
  | 'islam-completion';
export type IslamicSessionAnalyticsPayloadValue = string | number | boolean | null;

/**
 * Shared payload contract for every Islamic prayer analytics event.
 * Stable keys make funnel analysis and test assertions consistent across the flow,
 * even when some values are not relevant for a specific event type.
 */
export type IslamicSessionAnalyticsPayload = {
  flow: typeof ISLAMIC_SESSION_ANALYTICS_FUNNEL_ID;
  funnelId: typeof ISLAMIC_SESSION_ANALYTICS_FUNNEL_ID;
  funnelStep: IslamicSessionAnalyticsFunnelStep;
  mode: IslamicSessionAnalyticsMode | null;
  sourceScreen: IslamicSessionAnalyticsSourceScreen | null;
  trigger: IslamicSessionAnalyticsTrigger | null;
  permissionType: IslamicSessionAnalyticsPermissionType | null;
  permissionStatus: IslamicSessionAnalyticsPermissionStatus | null;
  canAskAgain: boolean | null;
  alignmentOffsetDegrees: number | null;
  durationSeconds: number | null;
  exitedEarly: boolean | null;
} & Record<string, IslamicSessionAnalyticsPayloadValue>;

export interface IslamicSessionAnalyticsEvent {
  id: string;
  type: IslamicSessionAnalyticsEventType;
  timestampMs: number;
  sessionId: string | null;
  prayerName: PrayerName | null;
  payload: IslamicSessionAnalyticsPayload;
}

export interface BuildIslamicSessionAnalyticsPayloadInput {
  type: IslamicSessionAnalyticsEventType;
  mode?: IslamicSessionAnalyticsMode | null;
  sourceScreen?: IslamicSessionAnalyticsSourceScreen | null;
  trigger?: IslamicSessionAnalyticsTrigger | null;
  permissionType?: IslamicSessionAnalyticsPermissionType | null;
  permissionStatus?: IslamicSessionAnalyticsPermissionStatus | null;
  canAskAgain?: boolean | null;
  alignmentOffsetDegrees?: number | null;
  durationSeconds?: number | null;
  exitedEarly?: boolean | null;
  extra?: Record<string, IslamicSessionAnalyticsPayloadValue>;
}

export interface TrackIslamicSessionAnalyticsInput
  extends Omit<BuildIslamicSessionAnalyticsPayloadInput, 'extra'> {
  sessionId: string | null;
  prayerName: PrayerName | null;
  extra?: Record<string, IslamicSessionAnalyticsPayloadValue>;
}

function inferFunnelStep(type: IslamicSessionAnalyticsEventType): IslamicSessionAnalyticsFunnelStep {
  switch (type) {
    case 'qibla_opened':
      return 'qibla';
    case 'camera_permission_prompted':
    case 'camera_permission_granted':
    case 'camera_permission_denied':
    case 'camera_permission_blocked':
      return 'camera_permission';
    case 'location_permission_prompted':
    case 'location_permission_granted':
    case 'location_permission_denied':
    case 'location_permission_blocked':
      return 'location_permission';
    case 'alignment_reached':
      return 'alignment';
    case 'auto_start_triggered':
    case 'manual_start_triggered':
      return 'session_start';
    case 'session_completed':
    case 'session_exited_early':
      return 'session_end';
  }
}

function normalizeMetricValue(value: number | null | undefined) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }

  return Math.round(value * 10) / 10;
}

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

let islamicAnalyticsQueue: Promise<unknown> = Promise.resolve();

export function createIslamicPrayerSessionId(prayerName: PrayerName | null): string {
  return `islam:${prayerName ?? 'general'}:${Date.now()}`;
}

export function buildIslamicSessionAnalyticsPayload({
  type,
  mode = null,
  sourceScreen = null,
  trigger = null,
  permissionType = null,
  permissionStatus = null,
  canAskAgain = null,
  alignmentOffsetDegrees = null,
  durationSeconds = null,
  exitedEarly = null,
  extra,
}: BuildIslamicSessionAnalyticsPayloadInput): IslamicSessionAnalyticsPayload {
  return {
    flow: ISLAMIC_SESSION_ANALYTICS_FUNNEL_ID,
    funnelId: ISLAMIC_SESSION_ANALYTICS_FUNNEL_ID,
    funnelStep: inferFunnelStep(type),
    mode,
    sourceScreen,
    trigger,
    permissionType,
    permissionStatus,
    canAskAgain,
    alignmentOffsetDegrees: normalizeMetricValue(alignmentOffsetDegrees),
    durationSeconds: normalizeMetricValue(durationSeconds),
    exitedEarly,
    ...extra,
  };
}

export async function loadIslamicSessionAnalyticsEvents(): Promise<IslamicSessionAnalyticsEvent[]> {
  const raw = await AsyncStorage.getItem(ISLAMIC_SESSION_ANALYTICS_STORAGE_KEY);
  return parseJson(raw, [] as IslamicSessionAnalyticsEvent[]);
}

export async function appendIslamicSessionAnalyticsEvent(
  event: IslamicSessionAnalyticsEvent,
): Promise<IslamicSessionAnalyticsEvent[]> {
  const operation = islamicAnalyticsQueue.then(async () => {
    const previous = await loadIslamicSessionAnalyticsEvents();
    const next = [...previous, event].slice(-300);
    await AsyncStorage.setItem(ISLAMIC_SESSION_ANALYTICS_STORAGE_KEY, JSON.stringify(next));
    return next;
  });

  islamicAnalyticsQueue = operation.then(
    () => undefined,
    () => undefined,
  );

  return operation;
}

export async function trackIslamicSessionAnalyticsEvent({
  type,
  sessionId,
  prayerName,
  mode = null,
  sourceScreen = null,
  trigger = null,
  permissionType = null,
  permissionStatus = null,
  canAskAgain = null,
  alignmentOffsetDegrees = null,
  durationSeconds = null,
  exitedEarly = null,
  extra,
}: TrackIslamicSessionAnalyticsInput): Promise<IslamicSessionAnalyticsEvent[]> {
  const timestampMs = Date.now();
  const event: IslamicSessionAnalyticsEvent = {
    id: `${type}:${sessionId ?? 'no-session'}:${timestampMs}`,
    type,
    timestampMs,
    sessionId,
    prayerName,
    payload: buildIslamicSessionAnalyticsPayload({
      type,
      mode,
      sourceScreen,
      trigger,
      permissionType,
      permissionStatus,
      canAskAgain,
      alignmentOffsetDegrees,
      durationSeconds,
      exitedEarly,
      extra,
    }),
  };

  return appendIslamicSessionAnalyticsEvent(event);
}
