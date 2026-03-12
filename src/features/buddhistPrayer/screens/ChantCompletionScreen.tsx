import { useRouter } from 'expo-router';
import { Text } from 'react-native';

import { GlassCard } from '@/src/features/buddhistPrayer/components/GlassCard';
import { GoldButton } from '@/src/features/buddhistPrayer/components/GoldButton';
import { SacredHeader } from '@/src/features/buddhistPrayer/components/SacredHeader';
import { ScreenContainer } from '@/src/features/buddhistPrayer/components/ScreenContainer';
import { useBuddhistPrayerStore } from '@/src/features/buddhistPrayer/store/useBuddhistPrayerStore';

export default function ChantCompletionScreen() {
  const router = useRouter();
  const { sessionStartedAt, sessionCompletedAt, currentVerseIndex, resetSession } =
    useBuddhistPrayerStore();
  const durationSecs =
    sessionStartedAt && sessionCompletedAt
      ? Math.round((sessionCompletedAt - sessionStartedAt) / 1000)
      : 0;

  return (
    <ScreenContainer>
      <SacredHeader title="Session Complete" subtitle="Sadhu · Sadhu · Sadhu" />
      <GlassCard>
        <Text style={{ color: '#F5EBD7' }}>Duration: {durationSecs}s</Text>
        <Text style={{ color: '#F5EBD7' }}>Verses completed: {currentVerseIndex + 1}</Text>
        <Text style={{ color: 'rgba(245,235,215,0.75)' }}>Streak: Coming soon</Text>
        <GoldButton
          label="Return Home"
          onPress={() => {
            resetSession();
            router.push('/buddhist-prayer');
          }}
        />
        <GoldButton
          label="Repeat Session"
          onPress={() => router.push('/buddhist-prayer/session')}
        />
        <GoldButton label="Meditate" onPress={() => router.push('/(tabs)')} />
      </GlassCard>
    </ScreenContainer>
  );
}
