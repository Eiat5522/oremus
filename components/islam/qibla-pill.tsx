import { BlurView } from 'expo-blur';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

type QiblaPillProps = {
  onPress: () => void;
};

export function QiblaPill({ onPress }: QiblaPillProps) {
  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      <BlurView intensity={18} tint="dark" style={styles.blur}>
        <View style={styles.inner}>
          <IconSymbol name="location.fill" size={16} color="#F4C86B" />
          <ThemedText style={styles.label}>Qibla</ThemedText>
        </View>
      </BlurView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    alignSelf: 'center',
    borderRadius: 999,
    overflow: 'hidden',
  },
  blur: {
    borderRadius: 999,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(244, 200, 107, 0.34)',
    backgroundColor: 'rgba(8, 30, 23, 0.44)',
  },
  label: {
    color: '#F7E7B6',
    fontSize: 20,
    lineHeight: 24,
    fontFamily: Fonts.serif,
    fontWeight: '600',
  },
});
