import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { GlassCard } from '@/src/features/buddhistPrayer/components/GlassCard';
import { GoldButton } from '@/src/features/buddhistPrayer/components/GoldButton';
import { SacredHeader } from '@/src/features/buddhistPrayer/components/SacredHeader';
import { ScreenContainer } from '@/src/features/buddhistPrayer/components/ScreenContainer';
import { buddhistChants } from '@/src/features/buddhistPrayer/data/chants';
import { buddhistPrayerTheme } from '@/src/features/buddhistPrayer/utils/buddhistPrayerTheme';

export default function BuddhistHomeScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <SacredHeader title="Buddhist Prayer" subtitle="Daily chanting and AR altar devotion" />
        <GlassCard>
          <Text style={styles.heroTitle}>Start Buddhist Prayer</Text>
          <Text style={styles.heroBody}>
            Calm your breath, bow inwardly, and begin with mindful devotion.
          </Text>
          <GoldButton
            label="Begin Daily Session"
            onPress={() => router.push('/buddhist-prayer/library')}
          />
        </GlassCard>

        <View style={styles.actions}>
          {[
            ['AR Prayer', '/buddhist-prayer/ar-intro'],
            ['Daily Chant', '/buddhist-prayer/library'],
            ['Merit', '/buddhist-prayer/merit'],
            ['Learn', '/buddhist-prayer/library'],
          ].map(([label, href]) => (
            <Pressable key={label} style={styles.action} onPress={() => router.push(href as never)}>
              <Text style={styles.actionText}>{label}</Text>
            </Pressable>
          ))}
        </View>

        <SacredHeader title="Featured Chants" />
        {buddhistChants.slice(0, 3).map((chant) => (
          <GlassCard key={chant.id}>
            <Text style={styles.cardTitle}>{chant.title}</Text>
            <Text style={styles.cardSubtitle}>{chant.subtitle}</Text>
            <Text style={styles.cardMeta}>
              {chant.durationSeconds}s · {chant.purpose}
            </Text>
          </GlassCard>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroTitle: { color: buddhistPrayerTheme.colors.textPrimary, fontSize: 20, fontWeight: '700' },
  heroBody: { color: buddhistPrayerTheme.colors.textSecondary, marginTop: 6, marginBottom: 6 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  action: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(224,185,110,0.2)',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionText: { color: buddhistPrayerTheme.colors.textPrimary, fontWeight: '600' },
  cardTitle: { color: buddhistPrayerTheme.colors.textPrimary, fontWeight: '700', fontSize: 17 },
  cardSubtitle: { color: buddhistPrayerTheme.colors.textSecondary, marginTop: 4 },
  cardMeta: { color: buddhistPrayerTheme.colors.primaryGold, marginTop: 10, fontSize: 12 },
});
