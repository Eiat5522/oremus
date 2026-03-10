import React from 'react';
import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import type { PrayerName } from '@/lib/prayer-times';

export type PrayerRowStatus = 'completed' | 'current' | 'next' | 'upcoming' | 'missed';

export type PrayerRowModel = {
  name: PrayerName;
  label: string;
  formattedTime: string;
  status: PrayerRowStatus;
  secondaryLabel: string;
  isRescheduled: boolean;
  isReminderActive: boolean;
  isLocked: boolean;
};

type PrayerDayRowProps = {
  prayer: PrayerRowModel;
  onActionPress: () => void;
  onStatusPress: () => void;
  onLongPress: () => void;
};

function getPrayerIcon(name: PrayerName) {
  switch (name) {
    case 'fajr':
      return '☀';
    case 'dhuhr':
      return '☀';
    case 'asr':
      return '☼';
    case 'maghrib':
      return '☾';
    case 'isha':
      return '☽';
  }
}

function getStatusStyles(status: PrayerRowStatus) {
  switch (status) {
    case 'completed':
      return {
        borderColor: 'rgba(244, 200, 107, 0.48)',
        backgroundColor: 'rgba(28, 61, 48, 0.34)',
        titleColor: '#FFF4DA',
        secondaryColor: 'rgba(244, 228, 181, 0.84)',
        timeColor: '#FFF6E1',
      };
    case 'current':
      return {
        borderColor: 'rgba(244, 200, 107, 0.66)',
        backgroundColor: 'rgba(58, 84, 56, 0.42)',
        titleColor: '#FFF7E7',
        secondaryColor: '#F4C86B',
        timeColor: '#FFF8ED',
      };
    case 'next':
      return {
        borderColor: 'rgba(244, 200, 107, 0.36)',
        backgroundColor: 'rgba(29, 60, 47, 0.3)',
        titleColor: '#F7EFDB',
        secondaryColor: 'rgba(249, 224, 155, 0.88)',
        timeColor: '#F9F0D8',
      };
    case 'missed':
      return {
        borderColor: 'rgba(220, 160, 160, 0.2)',
        backgroundColor: 'rgba(23, 32, 30, 0.32)',
        titleColor: 'rgba(255,255,255,0.7)',
        secondaryColor: 'rgba(255,255,255,0.44)',
        timeColor: 'rgba(255,255,255,0.6)',
      };
    case 'upcoming':
    default:
      return {
        borderColor: 'rgba(245, 234, 199, 0.12)',
        backgroundColor: 'rgba(15, 36, 30, 0.24)',
        titleColor: '#F3EBD6',
        secondaryColor: 'rgba(239, 231, 208, 0.7)',
        timeColor: '#F5EDD9',
      };
  }
}

export function PrayerDayRow({
  prayer,
  onActionPress,
  onStatusPress,
  onLongPress,
}: PrayerDayRowProps) {
  const palette = getStatusStyles(prayer.status);
  const showCheck = prayer.status === 'completed';

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.94}
      onPress={onActionPress}
      onLongPress={onLongPress}
      style={styles.pressable}
    >
      <View
        style={[
          styles.card,
          {
            borderColor: palette.borderColor,
            backgroundColor: palette.backgroundColor,
          },
        ]}
      >
        <View style={styles.leading}>
          <View style={styles.iconWrap}>
            <ThemedText style={styles.icon}>{getPrayerIcon(prayer.name)}</ThemedText>
          </View>
          <View style={styles.copy}>
            <ThemedText style={[styles.name, { color: palette.titleColor }]}>
              {prayer.label}
            </ThemedText>
            <ThemedText style={[styles.secondary, { color: palette.secondaryColor }]}>
              {prayer.secondaryLabel}
            </ThemedText>
          </View>
        </View>

        <View style={styles.trailing}>
          <ThemedText style={[styles.time, { color: palette.timeColor }]}>
            {prayer.formattedTime}
          </ThemedText>
          <View style={styles.metaRow}>
            {prayer.isReminderActive ? (
              <View style={styles.metaBadge}>
                <IconSymbol name="bell.fill" size={12} color="#F4C86B" />
              </View>
            ) : null}
            {prayer.isRescheduled ? (
              <View style={styles.metaBadge}>
                <IconSymbol name="timer" size={12} color="#F4C86B" />
              </View>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                prayer.status === 'completed'
                  ? `Mark ${prayer.label} incomplete`
                  : `Mark ${prayer.label} complete`
              }
              disabled={prayer.isLocked}
              hitSlop={8}
              onPress={onStatusPress}
              style={[
                styles.statusCircle,
                showCheck ? styles.statusCircleDone : null,
                prayer.status === 'current' || prayer.status === 'next'
                  ? styles.statusCircleActive
                  : null,
                prayer.status === 'missed' ? styles.statusCircleMissed : null,
                prayer.isLocked ? styles.statusCircleDisabled : null,
              ]}
            >
              {showCheck ? <IconSymbol name="checkmark" size={15} color="#FFF8E8" /> : null}
            </Pressable>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  card: {
    minHeight: 88,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrap: {
    width: 34,
    alignItems: 'center',
  },
  icon: {
    color: '#F3CF7A',
    fontSize: 22,
    lineHeight: 22,
  },
  copy: {
    flex: 1,
  },
  name: {
    fontSize: 30,
    lineHeight: 34,
    fontFamily: Fonts.serif,
    fontWeight: '600',
  },
  secondary: {
    fontSize: 15,
    lineHeight: 20,
  },
  trailing: {
    alignItems: 'flex-end',
    gap: 8,
    minWidth: 96,
  },
  time: {
    fontSize: 30,
    lineHeight: 34,
    fontFamily: Fonts.mono,
    fontVariant: ['tabular-nums'],
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaBadge: {
    width: 24,
    height: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 31, 26, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(244, 200, 107, 0.18)',
  },
  statusCircle: {
    width: 28,
    height: 28,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(244, 200, 107, 0.5)',
    backgroundColor: 'transparent',
  },
  statusCircleDone: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 200, 107, 0.18)',
    borderColor: 'rgba(244, 200, 107, 0.9)',
  },
  statusCircleActive: {
    borderColor: 'rgba(244, 200, 107, 0.82)',
  },
  statusCircleMissed: {
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statusCircleDisabled: {
    opacity: 0.45,
  },
});
