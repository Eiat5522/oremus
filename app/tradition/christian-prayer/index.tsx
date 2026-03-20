import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CHRISTIAN_PRAYER_THEME as T } from '@/constants/christian-prayer/theme';

const PRAYERS = [
  {
    id: 'lords_prayer',
    title: "The Lord's Prayer",
    latin: 'Pater Noster',
    text: `Our Father, who art in heaven,
hallowed be thy name;
thy kingdom come;
thy will be done on earth as it is in heaven.
Give us this day our daily bread;
and forgive us our trespasses
as we forgive those who trespass against us;
and lead us not into temptation,
but deliver us from evil.
Amen.`,
  },
  {
    id: 'hail_mary',
    title: 'Hail Mary',
    latin: 'Ave Maria',
    text: `Hail Mary, full of grace,
the Lord is with thee.
Blessed art thou amongst women,
and blessed is the fruit of thy womb, Jesus.
Holy Mary, Mother of God,
pray for us sinners,
now and at the hour of our death.
Amen.`,
  },
  {
    id: 'glory_be',
    title: 'Glory Be',
    latin: 'Gloria Patri',
    text: `Glory be to the Father,
and to the Son,
and to the Holy Spirit.
As it was in the beginning,
is now, and ever shall be,
world without end.
Amen.`,
  },
];

export default function ChristianPrayerScreen() {
  const router = useRouter();
  const [activePrayer, setActivePrayer] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Christian Prayer</Text>
            <Text style={styles.subtitle}>Sacred Prayers & Devotions</Text>
          </View>
        </View>

        {/* AR Scene entry */}
        <TouchableOpacity
          style={styles.arCard}
          onPress={() => router.push('/tradition/christian-prayer/ar-scan')}
        >
          <Text style={styles.arCardIcon}>✝️</Text>
          <View>
            <Text style={styles.arCardTitle}>Open AR Prayer Scene</Text>
            <Text style={styles.arCardSubtitle}>
              Place a sacred altar in your space
            </Text>
          </View>
          <Text style={styles.arCardArrow}>›</Text>
        </TouchableOpacity>

        {/* Prayers */}
        <Text style={styles.sectionTitle}>Traditional Prayers</Text>
        {PRAYERS.map((prayer) => (
          <TouchableOpacity
            key={prayer.id}
            style={styles.prayerCard}
            onPress={() =>
              setActivePrayer(activePrayer === prayer.id ? null : prayer.id)
            }
          >
            <View style={styles.prayerHeader}>
              <View>
                <Text style={styles.prayerTitle}>{prayer.title}</Text>
                <Text style={styles.prayerLatin}>{prayer.latin}</Text>
              </View>
              <Text style={styles.prayerChevron}>
                {activePrayer === prayer.id ? '▲' : '▼'}
              </Text>
            </View>
            {activePrayer === prayer.id && (
              <Text style={styles.prayerText}>{prayer.text}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: T.colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: T.spacing.lg,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: T.spacing.xl,
    gap: T.spacing.md,
  },
  backButton: {
    padding: T.spacing.sm,
  },
  backText: {
    fontSize: 28,
    color: T.colors.primary,
    lineHeight: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: T.colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: T.colors.textSecondary,
    marginTop: 2,
  },
  arCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.colors.primary,
    borderRadius: T.borderRadius.lg,
    padding: T.spacing.lg,
    marginBottom: T.spacing.xl,
    gap: T.spacing.md,
  },
  arCardIcon: {
    fontSize: 32,
  },
  arCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  arCardSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  arCardArrow: {
    fontSize: 22,
    color: '#FFFFFF',
    marginLeft: 'auto',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: T.colors.text,
    marginBottom: T.spacing.md,
  },
  prayerCard: {
    backgroundColor: T.colors.surface,
    borderRadius: T.borderRadius.md,
    padding: T.spacing.lg,
    marginBottom: T.spacing.md,
    borderWidth: 1,
    borderColor: '#E8DDD0',
  },
  prayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prayerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: T.colors.text,
  },
  prayerLatin: {
    fontSize: 12,
    color: T.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
  prayerChevron: {
    fontSize: 12,
    color: T.colors.textSecondary,
  },
  prayerText: {
    marginTop: T.spacing.md,
    fontSize: 15,
    color: T.colors.text,
    lineHeight: 26,
    fontStyle: 'italic',
  },
});
