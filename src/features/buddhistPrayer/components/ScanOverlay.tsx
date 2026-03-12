import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { StyleSheet, View } from 'react-native';

import { buddhistPrayerTheme } from '@/src/features/buddhistPrayer/utils/buddhistPrayerTheme';

export const ScanOverlay = ({ detected }: { detected: boolean }) => (
  <View style={styles.wrap}>
    <View style={[styles.reticle, detected && styles.reticleDetected]} />
    <Animated.Text entering={FadeIn} exiting={FadeOut} style={styles.text}>
      {detected
        ? 'Surface detected. You may place the altar.'
        : 'Move your phone slowly to find a flat surface.'}
    </Animated.Text>
  </View>
);

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  reticle: {
    width: 220,
    height: 220,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(224,185,110,0.7)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  reticleDetected: { borderColor: buddhistPrayerTheme.colors.success },
  text: {
    marginTop: 20,
    color: buddhistPrayerTheme.colors.textPrimary,
    textAlign: 'center',
    fontSize: 14,
    paddingHorizontal: 20,
  },
});
