import { useRouter } from 'expo-router';
import { Text } from 'react-native';

import { BuddhistAltar3D } from '@/src/features/buddhistPrayer/components/BuddhistAltar3D';
import { GlassCard } from '@/src/features/buddhistPrayer/components/GlassCard';
import { GoldButton } from '@/src/features/buddhistPrayer/components/GoldButton';
import { ScreenContainer } from '@/src/features/buddhistPrayer/components/ScreenContainer';
import { useBuddhistPrayerStore } from '@/src/features/buddhistPrayer/store/useBuddhistPrayerStore';

export default function ARCompletionScreen() {
  const router = useRouter();
  const store = useBuddhistPrayerStore();

  return (
    <ScreenContainer>
      <BuddhistAltar3D />
      <GlassCard>
        <Text style={{ color: '#F5EBD7', fontSize: 20, fontWeight: '700' }}>Prayer Complete</Text>
        <Text style={{ color: 'rgba(245,235,215,0.75)', marginTop: 6 }}>
          Your chanting session has been dedicated with merit.
        </Text>
        <GoldButton
          label="Return Home"
          onPress={() => {
            store.resetSession();
            router.push('/buddhist-prayer');
          }}
        />
        <GoldButton
          label="Repeat AR Session"
          onPress={() => router.push('/buddhist-prayer/ar-intro')}
        />
        <GoldButton label="Meditate" onPress={() => router.push('/(tabs)')} />
      </GlassCard>
    </ScreenContainer>
  );
}
