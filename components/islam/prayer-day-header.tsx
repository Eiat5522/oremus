import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

type PrayerDayHeaderProps = {
  title: string;
  location: string;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onPickDate: () => void;
  onRequestLocation?: () => void;
  showLocationAction?: boolean;
};

function HeaderIconButton({
  icon,
  onPress,
}: {
  icon: 'chevron.left' | 'chevron.right' | 'calendar';
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.iconButton}>
      <IconSymbol name={icon} size={18} color="#F5E8C3" />
    </Pressable>
  );
}

export function PrayerDayHeader({
  title,
  location,
  onPreviousDay,
  onNextDay,
  onPickDate,
  onRequestLocation,
  showLocationAction = false,
}: PrayerDayHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <HeaderIconButton icon="chevron.left" onPress={onPreviousDay} />
        <View style={styles.titleWrap}>
          <ThemedText style={styles.title}>{title}</ThemedText>
        </View>
        <View style={styles.actions}>
          <HeaderIconButton icon="calendar" onPress={onPickDate} />
          <HeaderIconButton icon="chevron.right" onPress={onNextDay} />
        </View>
      </View>

      <View style={styles.locationRow}>
        <IconSymbol name="location.fill" size={16} color="rgba(246, 216, 138, 0.95)" />
        <ThemedText style={styles.location}>{location}</ThemedText>
      </View>

      {showLocationAction && onRequestLocation ? (
        <Pressable onPress={onRequestLocation} style={styles.permissionPill}>
          <ThemedText style={styles.permissionText}>Enable location</ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 10,
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWrap: {
    flex: 1,
    paddingHorizontal: 10,
  },
  title: {
    color: '#F8EFD7',
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 30,
    fontFamily: Fonts.serif,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11, 35, 28, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(248, 222, 162, 0.18)',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  location: {
    color: 'rgba(243, 234, 208, 0.84)',
    fontSize: 15,
    lineHeight: 20,
  },
  permissionPill: {
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(244, 200, 107, 0.4)',
    backgroundColor: 'rgba(8, 30, 23, 0.44)',
  },
  permissionText: {
    color: '#F5E8C3',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
});
