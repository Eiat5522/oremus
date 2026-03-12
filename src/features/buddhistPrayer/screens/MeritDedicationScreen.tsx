import { useRouter } from 'expo-router';
import { TextInput } from 'react-native';

import { GlassCard } from '@/src/features/buddhistPrayer/components/GlassCard';
import { GoldButton } from '@/src/features/buddhistPrayer/components/GoldButton';
import { MeritOptionCard } from '@/src/features/buddhistPrayer/components/MeritOptionCard';
import { SacredHeader } from '@/src/features/buddhistPrayer/components/SacredHeader';
import { ScreenContainer } from '@/src/features/buddhistPrayer/components/ScreenContainer';
import { useBuddhistPrayerStore } from '@/src/features/buddhistPrayer/store/useBuddhistPrayerStore';

export default function MeritDedicationScreen() {
  const router = useRouter();
  const { meritOption, selectMeritOption, completeSession } = useBuddhistPrayerStore();

  return (
    <ScreenContainer>
      <SacredHeader title="Merit Dedication" subtitle="May this practice benefit all beings." />
      <GlassCard>
        <MeritOptionCard
          option="family"
          label="For family"
          selected={meritOption === 'family'}
          onSelect={selectMeritOption}
        />
        <MeritOptionCard
          option="ancestors"
          label="For ancestors"
          selected={meritOption === 'ancestors'}
          onSelect={selectMeritOption}
        />
        <MeritOptionCard
          option="all_beings"
          label="For all beings"
          selected={meritOption === 'all_beings'}
          onSelect={selectMeritOption}
        />
        <TextInput
          placeholder="Optional dedication note"
          placeholderTextColor="rgba(245,235,215,0.5)"
          style={{ color: '#F5EBD7' }}
        />
        <GoldButton
          label="Complete Session"
          onPress={() => {
            completeSession();
            router.push('/buddhist-prayer/completion');
          }}
        />
      </GlassCard>
    </ScreenContainer>
  );
}
