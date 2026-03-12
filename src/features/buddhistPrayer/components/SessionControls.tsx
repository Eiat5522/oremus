import { Pressable, StyleSheet, Text, View } from 'react-native';

import { buddhistPrayerTheme } from '@/src/features/buddhistPrayer/utils/buddhistPrayerTheme';

export const SessionControls = ({
  onPrev,
  onPlayPause,
  onNext,
  onReplay,
  isPlaying,
}: {
  onPrev: () => void;
  onPlayPause: () => void;
  onNext: () => void;
  onReplay: () => void;
  isPlaying: boolean;
}) => (
  <View style={styles.row}>
    <Control label="Prev" onPress={onPrev} />
    <Control label={isPlaying ? 'Pause' : 'Play'} onPress={onPlayPause} prominent />
    <Control label="Next" onPress={onNext} />
    <Control label="Replay" onPress={onReplay} />
  </View>
);

const Control = ({
  label,
  onPress,
  prominent,
}: {
  label: string;
  onPress: () => void;
  prominent?: boolean;
}) => (
  <Pressable style={[styles.control, prominent && styles.prominent]} onPress={onPress}>
    <Text style={[styles.controlText, prominent && styles.prominentText]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 8 },
  control: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  prominent: {
    backgroundColor: 'rgba(224,185,110,0.2)',
    borderColor: buddhistPrayerTheme.colors.primaryGold,
  },
  controlText: { color: buddhistPrayerTheme.colors.textPrimary, fontSize: 12, fontWeight: '600' },
  prominentText: { color: buddhistPrayerTheme.colors.primaryGold },
});
