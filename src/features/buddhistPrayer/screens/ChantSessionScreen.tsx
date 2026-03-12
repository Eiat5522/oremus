import { useRouter } from 'expo-router';

import { ChantOverlay } from '@/src/features/buddhistPrayer/components/ChantOverlay';
import { GlassCard } from '@/src/features/buddhistPrayer/components/GlassCard';
import { SacredHeader } from '@/src/features/buddhistPrayer/components/SacredHeader';
import { ScreenContainer } from '@/src/features/buddhistPrayer/components/ScreenContainer';
import { SessionControls } from '@/src/features/buddhistPrayer/components/SessionControls';
import { useAudioPrayer } from '@/src/features/buddhistPrayer/hooks/useAudioPrayer';
import { useChantSession } from '@/src/features/buddhistPrayer/hooks/useChantSession';
import { useBuddhistPrayerStore } from '@/src/features/buddhistPrayer/store/useBuddhistPrayerStore';

export default function ChantSessionScreen() {
  const router = useRouter();
  const store = useBuddhistPrayerStore();
  const { chant, currentVerse, progress, totalVerses, isLastVerse } = useChantSession();
  const audio = useAudioPrayer(store.isAudioEnabled);

  return (
    <ScreenContainer>
      <SacredHeader
        title={chant.title}
        subtitle={`Verse ${store.currentVerseIndex + 1} of ${totalVerses}`}
      />
      <GlassCard style={{ flex: 1 }}>
        <ChantOverlay verse={currentVerse} progress={progress} showMeaning={store.showMeaning} />
      </GlassCard>
      <SessionControls
        onPrev={store.previousVerse}
        onPlayPause={() => {
          if (store.isPlaying) {
            store.pauseSession();
            audio.pauseAll();
          } else {
            store.resumeSession();
            void audio.playChant();
          }
        }}
        onNext={() => {
          store.nextVerse(totalVerses);
          if (isLastVerse) {
            router.push('/buddhist-prayer/merit');
          }
        }}
        onReplay={store.replayVerse}
        isPlaying={store.isPlaying}
      />
    </ScreenContainer>
  );
}
