import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

import {
  buildIslamicSessionAnalyticsPayload,
  loadIslamicSessionAnalyticsEvents,
  trackIslamicSessionAnalyticsEvent,
} from '@/lib/islamic-session-analytics';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

describe('islamic session analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.clear();
  });

  it('builds a stable payload schema for funnel reporting', () => {
    const payload = buildIslamicSessionAnalyticsPayload({
      type: 'manual_start_triggered',
      mode: 'session',
      sourceScreen: 'qibla',
      trigger: 'manual',
      alignmentOffsetDegrees: 3.26,
      durationSeconds: 120.9,
      extra: {
        entryPoint: 'guided',
      },
    });

    expect(payload).toEqual({
      flow: 'islamic_prayer_session',
      funnelId: 'islamic_prayer_session',
      funnelStep: 'session_start',
      mode: 'session',
      sourceScreen: 'qibla',
      trigger: 'manual',
      permissionType: null,
      permissionStatus: null,
      canAskAgain: null,
      alignmentOffsetDegrees: 3.3,
      durationSeconds: 120.9,
      exitedEarly: null,
      entryPoint: 'guided',
    });
  });

  it('keeps structured failure metadata for stability and transition errors', () => {
    const payload = buildIslamicSessionAnalyticsPayload({
      type: 'session_start_failed',
      mode: 'session',
      sourceScreen: 'qibla',
      trigger: 'system',
      alignmentOffsetDegrees: 4.98,
      extra: {
        cameraPermissionFlowState: 'granted',
        locationPermissionFlowState: 'blocked',
        errorMessage: 'Navigation exploded',
      },
    });

    expect(payload).toEqual({
      flow: 'islamic_prayer_session',
      funnelId: 'islamic_prayer_session',
      funnelStep: 'session_start',
      mode: 'session',
      sourceScreen: 'qibla',
      trigger: 'system',
      permissionType: null,
      permissionStatus: null,
      canAskAgain: null,
      alignmentOffsetDegrees: 5,
      durationSeconds: null,
      exitedEarly: null,
      cameraPermissionFlowState: 'granted',
      locationPermissionFlowState: 'blocked',
      errorMessage: 'Navigation exploded',
    });
  });

  it('persists tracked events in chronological order', async () => {
    await trackIslamicSessionAnalyticsEvent({
      type: 'qibla_opened',
      sessionId: 'session-1',
      prayerName: 'fajr',
      mode: 'session',
      sourceScreen: 'qibla',
    });
    await trackIslamicSessionAnalyticsEvent({
      type: 'alignment_reached',
      sessionId: 'session-1',
      prayerName: 'fajr',
      mode: 'session',
      sourceScreen: 'qibla',
      alignmentOffsetDegrees: 4.4,
    });

    const events = await loadIslamicSessionAnalyticsEvents();

    expect(events.map((event) => event.type)).toEqual(['qibla_opened', 'alignment_reached']);
    expect(events[1]?.payload.alignmentOffsetDegrees).toBe(4.4);
  });
});
