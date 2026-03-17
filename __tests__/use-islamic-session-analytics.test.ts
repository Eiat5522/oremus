import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';
import { act, renderHook } from '@testing-library/react-native';

import { loadIslamicSessionAnalyticsEvents } from '@/lib/islamic-session-analytics';
import { useIslamicSessionAnalytics } from '@/hooks/use-islamic-session-analytics';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

describe('useIslamicSessionAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.clear();
  });

  it('emits events with the shared prayer context', async () => {
    const { result } = renderHook(() =>
      useIslamicSessionAnalytics({
        sessionId: 'session-123',
        prayerName: 'maghrib',
        mode: 'session',
        sourceScreen: 'qibla',
      }),
    );

    await act(async () => {
      await result.current('manual_start_triggered', {
        trigger: 'manual',
        alignmentOffsetDegrees: 2.5,
      });
    });

    const events = await loadIslamicSessionAnalyticsEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      type: 'manual_start_triggered',
      sessionId: 'session-123',
      prayerName: 'maghrib',
      payload: expect.objectContaining({
        sourceScreen: 'qibla',
        mode: 'session',
        trigger: 'manual',
        alignmentOffsetDegrees: 2.5,
      }),
    });
  });
});
