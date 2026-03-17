import { useCallback } from 'react';

import {
  trackIslamicSessionAnalyticsEvent,
  type IslamicSessionAnalyticsMode,
  type IslamicSessionAnalyticsEventType,
  type IslamicSessionAnalyticsPermissionStatus,
  type IslamicSessionAnalyticsPermissionType,
  type IslamicSessionAnalyticsSourceScreen,
  type IslamicSessionAnalyticsTrigger,
  type IslamicSessionAnalyticsPayloadValue,
} from '@/lib/islamic-session-analytics';
import type { PrayerName } from '@/lib/prayer-times';

type TrackIslamicSessionEventOptions = {
  trigger?: IslamicSessionAnalyticsTrigger | null;
  permissionType?: IslamicSessionAnalyticsPermissionType | null;
  permissionStatus?: IslamicSessionAnalyticsPermissionStatus | null;
  canAskAgain?: boolean | null;
  alignmentOffsetDegrees?: number | null;
  durationSeconds?: number | null;
  exitedEarly?: boolean | null;
  extra?: Record<string, IslamicSessionAnalyticsPayloadValue>;
};

type UseIslamicSessionAnalyticsOptions = {
  sessionId: string | null;
  prayerName: PrayerName | null;
  mode?: IslamicSessionAnalyticsMode | null;
  sourceScreen: IslamicSessionAnalyticsSourceScreen;
};

export function useIslamicSessionAnalytics({
  sessionId,
  prayerName,
  mode = null,
  sourceScreen,
}: UseIslamicSessionAnalyticsOptions) {
  return useCallback(
    (
      type: IslamicSessionAnalyticsEventType,
      {
        trigger = null,
        permissionType = null,
        permissionStatus = null,
        canAskAgain = null,
        alignmentOffsetDegrees = null,
        durationSeconds = null,
        exitedEarly = null,
        extra,
      }: TrackIslamicSessionEventOptions = {},
    ) => {
      return trackIslamicSessionAnalyticsEvent({
        type,
        sessionId,
        prayerName,
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
      });
    },
    [mode, prayerName, sessionId, sourceScreen],
  );
}
