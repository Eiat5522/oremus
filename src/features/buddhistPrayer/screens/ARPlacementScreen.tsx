import { useRouter } from 'expo-router';
import { useState } from 'react';

import { BuddhistAltar3D } from '@/src/features/buddhistPrayer/components/BuddhistAltar3D';
import { GoldButton } from '@/src/features/buddhistPrayer/components/GoldButton';
import { PlacementControls } from '@/src/features/buddhistPrayer/components/PlacementControls';
import { ScreenContainer } from '@/src/features/buddhistPrayer/components/ScreenContainer';
import { useBuddhistPrayerStore } from '@/src/features/buddhistPrayer/store/useBuddhistPrayerStore';

export default function ARPlacementScreen() {
  const router = useRouter();
  const store = useBuddhistPrayerStore();
  const [scale, setScale] = useState(store.placementScale);
  const [rotation, setRotation] = useState(store.placementRotation);

  return (
    <ScreenContainer>
      <BuddhistAltar3D scale={scale} rotation={rotation} />
      <PlacementControls
        onRotateLeft={() => setRotation((prev) => prev - 0.2)}
        onRotateRight={() => setRotation((prev) => prev + 0.2)}
        onScaleDown={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
        onScaleUp={() => setScale((prev) => Math.min(1.8, prev + 0.1))}
        onReset={() => {
          setScale(1);
          setRotation(0);
          store.resetPlacement();
        }}
      />
      <GoldButton
        label="Confirm Placement"
        onPress={() => {
          store.updatePlacementScale(scale);
          store.updatePlacementRotation(rotation);
          store.placeAltar();
          router.push('/buddhist-prayer/ar-preparation');
        }}
      />
    </ScreenContainer>
  );
}
