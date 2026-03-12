import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView } from 'react-native';

import { GlassCard } from '@/src/features/buddhistPrayer/components/GlassCard';
import { GoldButton } from '@/src/features/buddhistPrayer/components/GoldButton';
import { IconToggleRow } from '@/src/features/buddhistPrayer/components/IconToggleRow';
import { SacredHeader } from '@/src/features/buddhistPrayer/components/SacredHeader';
import { ScreenContainer } from '@/src/features/buddhistPrayer/components/ScreenContainer';
import { buddhistChants } from '@/src/features/buddhistPrayer/data/chants';
import { useBuddhistPrayerStore } from '@/src/features/buddhistPrayer/store/useBuddhistPrayerStore';

export default function ChantPreparationScreen() {
  const router = useRouter();
  const { chantId } = useLocalSearchParams<{ chantId: string }>();
  const store = useBuddhistPrayerStore();
  const chant = buddhistChants.find((item) => item.id === chantId) ?? buddhistChants[0];

  return (
    <ScreenContainer>
      <ScrollView>
        <SacredHeader title={chant.title} subtitle={chant.titleThai} />
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
            label="Start Chant Session"
            onPress={() => {
              store.startPreparation(chant.id, false);
              router.push('/buddhist-prayer/session');
            }}
          />
          <GoldButton
            label="Start AR Altar Session"
            onPress={() => {
              store.startPreparation(chant.id, true);
              router.push('/buddhist-prayer/ar-intro');
            }}
          />
        </GlassCard>
      </ScrollView>
    </ScreenContainer>
  );
}
