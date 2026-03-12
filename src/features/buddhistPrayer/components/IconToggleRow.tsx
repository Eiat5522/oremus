import { Pressable, StyleSheet, Text, View } from 'react-native';

import { buddhistPrayerTheme } from '@/src/features/buddhistPrayer/utils/buddhistPrayerTheme';

export interface ToggleItem {
  key: string;
  label: string;
  value: boolean;
  onToggle: () => void;
}

export const IconToggleRow = ({ items }: { items: ToggleItem[] }) => (
  <View style={styles.grid}>
    {items.map((item) => (
      <Pressable
        key={item.key}
        onPress={item.onToggle}
        style={[styles.item, item.value && styles.itemActive]}
      >
        <Text style={styles.label}>{item.label}</Text>
      </Pressable>
    ))}
  </View>
);

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  item: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  itemActive: {
    borderColor: buddhistPrayerTheme.colors.primaryGold,
    backgroundColor: 'rgba(224,185,110,0.14)',
  },
  label: { color: buddhistPrayerTheme.colors.textPrimary, fontSize: 12 },
});
