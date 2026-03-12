import { Pressable, StyleSheet, Text } from 'react-native';

import type { MeritOption } from '@/src/features/buddhistPrayer/types/buddhistPrayer';
import { buddhistPrayerTheme } from '@/src/features/buddhistPrayer/utils/buddhistPrayerTheme';

export const MeritOptionCard = ({
  option,
  label,
  selected,
  onSelect,
}: {
  option: MeritOption;
  label: string;
  selected: boolean;
  onSelect: (option: MeritOption) => void;
}) => (
  <Pressable style={[styles.card, selected && styles.selected]} onPress={() => onSelect(option)}>
    <Text style={styles.label}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    padding: 14,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  selected: {
    borderColor: buddhistPrayerTheme.colors.primaryGold,
    backgroundColor: 'rgba(224,185,110,0.14)',
  },
  label: { color: buddhistPrayerTheme.colors.textPrimary, fontSize: 14 },
});
