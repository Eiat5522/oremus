import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { buddhistPrayerTheme } from '@/src/features/buddhistPrayer/utils/buddhistPrayerTheme';

export const ScreenContainer = ({ children }: PropsWithChildren) => (
  <LinearGradient
    colors={[
      buddhistPrayerTheme.colors.background,
      '#1C130B',
      buddhistPrayerTheme.colors.background,
    ]}
    style={styles.gradient}
  >
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  </LinearGradient>
);

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 16, paddingBottom: 16 },
});
