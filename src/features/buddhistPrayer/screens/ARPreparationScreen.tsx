import { useRouter } from 'expo-router';

import { BuddhistAltar3D } from '@/src/features/buddhistPrayer/components/BuddhistAltar3D';
import { GlassCard } from '@/src/features/buddhistPrayer/components/GlassCard';
import { GoldButton } from '@/src/features/buddhistPrayer/components/GoldButton';
import { IconToggleRow } from '@/src/features/buddhistPrayer/components/IconToggleRow';
import { ScreenContainer } from '@/src/features/buddhistPrayer/components/ScreenContainer';
import { useBuddhistPrayerStore } from '@/src/features/buddhistPrayer/store/useBuddhistPrayerStore';

export default function ARPreparationScreen() {
  const router = useRouter();
  const store = useBuddhistPrayerStore();

  return (
    <ScreenContainer>
      <BuddhistAltar3D scale={store.placementScale} rotation={store.placementRotation} />
      <GlassCard>
        <IconToggleRow
          items={[
            {
              key: 'meaning',
              label: 'Show Meaning',
              value: store.showMeaning,
              onToggle: store.toggleMeaning,
            },
            {
              key: 'scroll',
              label: 'Auto Scroll',
              value: store.autoScroll,
              onToggle: store.toggleAutoScroll,
            },
            {
              key: 'audio',
              label: 'Monk Chant',
              value: store.isAudioEnabled,
              onToggle: store.toggleAudio,
            },
            {
              key: 'bell',
              label: 'Temple Bell',
              value: store.templeBellEnabled,
              onToggle: store.toggleTempleBell,
            },
          ]}
        />
        <GoldButton
          label="Start Chanting"
          onPress={() => router.push('/buddhist-prayer/ar-chant')}
        />
      </GlassCard>
    </ScreenContainer>
  );
}
