import { useRouter } from 'expo-router';
import { Text } from 'react-native';

import { GlassCard } from '@/src/features/buddhistPrayer/components/GlassCard';
import { GoldButton } from '@/src/features/buddhistPrayer/components/GoldButton';
import { SacredHeader } from '@/src/features/buddhistPrayer/components/SacredHeader';
import { ScreenContainer } from '@/src/features/buddhistPrayer/components/ScreenContainer';

export default function ARIntroScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <SacredHeader
        title="AR Buddha Altar"
        subtitle="Place an altar in your space for guided chanting"
      />
      <GlassCard>
        <Text style={{ color: '#F5EBD7', marginBottom: 8 }}>
          Scan your room, place the altar mindfully, prepare with intention, then chant in a calm
          immersive flow.
        </Text>
        <GoldButton label="Begin" onPress={() => router.push('/buddhist-prayer/ar-scan')} />
      </GlassCard>
    </ScreenContainer>
  );
}
