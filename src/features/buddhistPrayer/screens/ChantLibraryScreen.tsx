import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/src/features/buddhistPrayer/components/GlassCard';
import { GoldButton } from '@/src/features/buddhistPrayer/components/GoldButton';
import { SacredHeader } from '@/src/features/buddhistPrayer/components/SacredHeader';
import { ScreenContainer } from '@/src/features/buddhistPrayer/components/ScreenContainer';
import { buddhistChants } from '@/src/features/buddhistPrayer/data/chants';

export default function ChantLibraryScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <ScrollView>
        <SacredHeader
          title="Chant Library"
          subtitle="Daily, merit making, ceremonial, and learning chants"
        />
        {['daily', 'merit', 'ceremonial', 'learning'].map((category) => (
          <View key={category}>
            <Text style={styles.category}>{category.toUpperCase()}</Text>
            {buddhistChants
              .filter((chant) => chant.category === category)
              .map((chant) => (
                <GlassCard key={chant.id}>
                  <Text style={styles.title}>{chant.title}</Text>
                  <Text style={styles.meta}>
                    {chant.durationSeconds}s · {chant.purpose}
                  </Text>
                  <GoldButton
                    label="Prepare"
                    onPress={() =>
                      router.push({
                        pathname: '/buddhist-prayer/preparation',
                        params: { chantId: chant.id },
                      })
                    }
                  />
                </GlassCard>
              ))}
          </View>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  category: { color: '#E0B96E', marginBottom: 8, marginTop: 8, fontWeight: '700' },
  title: { color: '#F5EBD7', fontSize: 16, fontWeight: '600' },
  meta: { color: 'rgba(245,235,215,0.75)', marginTop: 4 },
});
