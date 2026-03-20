import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CHRISTIAN_PRAYER_THEME } from '@/constants/christian-prayer/theme';

const T = CHRISTIAN_PRAYER_THEME;

interface Scene3DPlaceholderProps {
  label?: string;
}

export function Scene3DPlaceholder({ label = 'Prayer Scene' }: Scene3DPlaceholderProps) {
  return (
    <View style={styles.container}>
      {/* Cross illustration */}
      <View style={styles.crossContainer}>
        <View style={styles.crossVertical} />
        <View style={styles.crossHorizontal} />
      </View>
      {/* Table illustration */}
      <View style={styles.tableTop} />
      <View style={styles.tableLegLeft} />
      <View style={styles.tableLegRight} />
      {/* Candles */}
      <View style={[styles.candle, styles.candleLeft]} />
      <View style={[styles.candle, styles.candleRight]} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: T.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  crossContainer: {
    width: 60,
    height: 80,
    position: 'relative',
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crossVertical: {
    position: 'absolute',
    width: 12,
    height: 80,
    backgroundColor: T.colors.primary,
    borderRadius: 4,
  },
  crossHorizontal: {
    position: 'absolute',
    width: 50,
    height: 12,
    backgroundColor: T.colors.primary,
    borderRadius: 4,
    top: 20,
  },
  tableTop: {
    width: 160,
    height: 14,
    backgroundColor: T.colors.textSecondary,
    borderRadius: 4,
    marginBottom: 4,
  },
  tableLegLeft: {
    position: 'absolute',
    width: 10,
    height: 50,
    backgroundColor: T.colors.textSecondary,
    borderRadius: 3,
    bottom: 80,
    left: '30%',
  },
  tableLegRight: {
    position: 'absolute',
    width: 10,
    height: 50,
    backgroundColor: T.colors.textSecondary,
    borderRadius: 3,
    bottom: 80,
    right: '30%',
  },
  candle: {
    position: 'absolute',
    width: 14,
    height: 40,
    backgroundColor: '#F5E6C8',
    borderRadius: 4,
    bottom: 110,
  },
  candleLeft: {
    left: '25%',
  },
  candleRight: {
    right: '25%',
  },
  label: {
    marginTop: 32,
    fontSize: 16,
    color: T.colors.textSecondary,
    fontStyle: 'italic',
  },
});
