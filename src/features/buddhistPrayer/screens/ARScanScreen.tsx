import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { GoldButton } from '@/src/features/buddhistPrayer/components/GoldButton';
import { ScanOverlay } from '@/src/features/buddhistPrayer/components/ScanOverlay';
import { ScreenContainer } from '@/src/features/buddhistPrayer/components/ScreenContainer';
import { useBuddhistPrayerStore } from '@/src/features/buddhistPrayer/store/useBuddhistPrayerStore';

export default function ARScanScreen() {
  const router = useRouter();
  const { scanStatus, startScan, surfaceDetected } = useBuddhistPrayerStore();

  useEffect(() => {
    startScan();
    const timer = setTimeout(surfaceDetected, 2200);
    return () => clearTimeout(timer);
  }, [startScan, surfaceDetected]);

  return (
    <ScreenContainer>
      <ScanOverlay detected={scanStatus === 'surface_detected'} />
      <GoldButton
        label="Continue to Placement"
        onPress={() => router.push('/buddhist-prayer/ar-placement')}
        disabled={scanStatus !== 'surface_detected'}
      />
    </ScreenContainer>
  );
}
