import type {
  ChristianAnalyticsEvent,
  ChristianAnalyticsEventType,
  ChristianPrayerPhase,
  ChristianSessionMode,
} from '@/features/christian-prayer/constants';
import { appendChristianAnalyticsEvent } from '@/features/christian-prayer/services/christianPersistence.service';

interface TrackChristianAnalyticsInput {
  type: ChristianAnalyticsEventType;
  sessionId: string | null;
  mode: ChristianSessionMode | null;
  phase?: ChristianPrayerPhase | null;
  payload?: Record<string, string | number | boolean | null>;
}

export async function trackChristianAnalyticsEvent({
  type,
  sessionId,
  mode,
  phase = null,
  payload,
}: TrackChristianAnalyticsInput): Promise<ChristianAnalyticsEvent[]> {
  const event: ChristianAnalyticsEvent = {
    id: `${type}:${sessionId ?? 'no-session'}:${Date.now()}`,
    type,
    timestampMs: Date.now(),
    sessionId,
    mode,
    phase,
    payload,
  };

  return appendChristianAnalyticsEvent(event);
}
