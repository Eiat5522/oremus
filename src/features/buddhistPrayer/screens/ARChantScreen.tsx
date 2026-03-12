import { useRouter } from 'expo-router';

import { BuddhistAltar3D } from '@/src/features/buddhistPrayer/components/BuddhistAltar3D';
import { ChantOverlay } from '@/src/features/buddhistPrayer/components/ChantOverlay';
import { ScreenContainer } from '@/src/features/buddhistPrayer/components/ScreenContainer';
import { SessionControls } from '@/src/features/buddhistPrayer/components/SessionControls';
import { useChantSession } from '@/src/features/buddhistPrayer/hooks/useChantSession';
import { useBuddhistPrayerStore } from '@/src/features/buddhistPrayer/store/useBuddhistPrayerStore';

export default function ARChantScreen() {
  const router = useRouter();
  const store = useBuddhistPrayerStore();
  const { currentVerse, progress, totalVerses, isLastVerse } = useChantSession();

  return (
    <ScreenContainer>
      <BuddhistAltar3D
        scale={store.placementScale}
        rotation={store.placementRotation}
        glowIntensity={1.2}
        showHalo
        showIncenseSmoke
      />
      <ChantOverlay verse={currentVerse} progress={progress} showMeaning={store.showMeaning} />
      <SessionControls
        onPrev={store.previousVerse}
        onPlayPause={store.isPlaying ? store.pauseSession : store.resumeSession}
        onNext={() => {
          store.nextVerse(totalVerses);
          if (isLastVerse) {
            router.push('/buddhist-prayer/ar-merit');
          }
        }}
        onReplay={store.replayVerse}
        isPlaying={store.isPlaying}
      />
    </ScreenContainer>
  );
}
