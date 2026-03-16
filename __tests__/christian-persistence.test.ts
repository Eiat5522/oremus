import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

import {
  appendChristianAnalyticsEvent,
  CHRISTIAN_ANALYTICS_STORAGE_KEY,
  CHRISTIAN_COMPLETED_SESSIONS_STORAGE_KEY,
  CHRISTIAN_FAVORITE_VERSES_STORAGE_KEY,
  CHRISTIAN_REFLECTION_DRAFTS_STORAGE_KEY,
  loadChristianAnalyticsEvents,
  loadChristianReflectionDrafts,
  saveChristianReflectionDraft,
  saveCompletedChristianSession,
  saveFavoriteChristianVerse,
} from '@/features/christian-prayer/services/christianPersistence.service';
import { getChristianModeContent } from '@/features/christian-prayer/services/christianContent.service';
import { buildChristianSessionSummary } from '@/features/christian-prayer/services/christianSession.service';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);
jest.mock('@/lib/session-log', () => ({
  addSessionLogEntry: jest.fn().mockResolvedValue([]),
}));

describe('christian persistence service', () => {
  beforeEach(async () => {
    await mockAsyncStorage.clear();
  });

  it('saves completed sessions and favorite verses', async () => {
    const content = getChristianModeContent('gratitude');
    const summary = buildChristianSessionSummary({
      sessionId: 'session-1',
      mode: 'gratitude',
      title: content.title,
      verse: content.heroVerse,
      durationMinutes: 5,
      startedAtMs: 10,
      completedAtMs: 100,
      reflectionPreview: 'Thankful for grace.',
    });

    await saveCompletedChristianSession(summary);
    await saveFavoriteChristianVerse({
      verse: content.heroVerse,
      savedAtMs: 111,
    });

    const storedSessions = JSON.parse(
      (await mockAsyncStorage.getItem(CHRISTIAN_COMPLETED_SESSIONS_STORAGE_KEY)) ?? '[]',
    );
    const storedFavorites = JSON.parse(
      (await mockAsyncStorage.getItem(CHRISTIAN_FAVORITE_VERSES_STORAGE_KEY)) ?? '[]',
    );

    expect(storedSessions[0].id).toBe('session-1');
    expect(storedFavorites[0].verse.id).toBe(content.heroVerse.id);
  });

  it('queues reflection drafts and analytics events', async () => {
    await Promise.all([
      saveChristianReflectionDraft('session-a', 'peace', {
        text: 'Peace over worry.',
        tags: ['peace'],
        voiceUri: null,
        silentTimerMinutes: 1,
        updatedAtMs: 50,
      }),
      appendChristianAnalyticsEvent({
        id: 'event-1',
        type: 'session_started',
        timestampMs: 75,
        sessionId: 'session-a',
        mode: 'peace',
        phase: 'openingStillness',
      }),
    ]);

    const drafts = await loadChristianReflectionDrafts();
    const analytics = await loadChristianAnalyticsEvents();

    expect(drafts['session-a'].text).toBe('Peace over worry.');
    expect(analytics[0].id).toBe('event-1');
    expect(await mockAsyncStorage.getItem(CHRISTIAN_REFLECTION_DRAFTS_STORAGE_KEY)).not.toBeNull();
    expect(await mockAsyncStorage.getItem(CHRISTIAN_ANALYTICS_STORAGE_KEY)).not.toBeNull();
  });
});
