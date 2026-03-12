import { useRouter } from 'expo-router';

import { BuddhistAltar3D } from '@/src/features/buddhistPrayer/components/BuddhistAltar3D';
import { GlassCard } from '@/src/features/buddhistPrayer/components/GlassCard';
import { GoldButton } from '@/src/features/buddhistPrayer/components/GoldButton';
import { MeritOptionCard } from '@/src/features/buddhistPrayer/components/MeritOptionCard';
import { ScreenContainer } from '@/src/features/buddhistPrayer/components/ScreenContainer';
import { useBuddhistPrayerStore } from '@/src/features/buddhistPrayer/store/useBuddhistPrayerStore';

export default function ARMeritScreen() {
  const router = useRouter();
  const { meritOption, selectMeritOption } = useBuddhistPrayerStore();

  return (
    <ScreenContainer>
      <BuddhistAltar3D />
      <GlassCard>
        <MeritOptionCard
          option="family"
          label="Dedicate to family"
          selected={meritOption === 'family'}
          onSelect={selectMeritOption}
        />
        <MeritOptionCard
          option="ancestors"
          label="Dedicate to ancestors"
          selected={meritOption === 'ancestors'}
          onSelect={selectMeritOption}
        />
        <MeritOptionCard
          option="all_beings"
          label="Dedicate to all beings"
          selected={meritOption === 'all_beings'}
          onSelect={selectMeritOption}
        />
        <GoldButton
          label="Continue"
          onPress={() => router.push('/buddhist-prayer/ar-completion')}
        />
      </GlassCard>
    </ScreenContainer>
  );
}
