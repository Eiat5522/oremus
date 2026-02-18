import { LinearGradient } from 'expo-linear-gradient';
import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';

type MosqueHeaderProps = {
  nextPrayerName: string;
  nextPrayerTime: string;
  timeRemaining?: string;
  date: string;
  location: string;
  period: 'am' | 'pm';
  headerLeft?: ReactNode;
  headerRight?: ReactNode;
};

export function MosqueHeader({
  nextPrayerName,
  nextPrayerTime,
  timeRemaining,
  date,
  location,
  period,
  headerLeft,
  headerRight,
}: MosqueHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#8cb369', '#5b8e7d', '#2c5f46']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={[styles.navBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.navLeft}>{headerLeft}</View>
        <View style={styles.navRight}>{headerRight}</View>
      </View>

      <View style={styles.content}>
        <View style={styles.textContainer}>
          <ThemedText style={styles.prayerName}>{nextPrayerName}</ThemedText>
          <View style={styles.timeRow}>
            <ThemedText style={styles.time}>{nextPrayerTime}</ThemedText>
            <ThemedText style={styles.period}>{period}</ThemedText>
          </View>

          {timeRemaining && (
            <ThemedText style={styles.countdown}>
              Next Prayer Starting in {timeRemaining}
            </ThemedText>
          )}

          <View style={styles.footer}>
            <ThemedText style={styles.date}>{date}</ThemedText>
            <ThemedText style={styles.location}>{location}</ThemedText>
          </View>
        </View>

        <View style={styles.graphicContainer}>
          <MosqueSilhouette />
        </View>
      </View>
    </LinearGradient>
  );
}

function MosqueSilhouette() {
  return (
    <Svg width={180} height={100} viewBox="0 0 180 100" style={styles.silhouette}>
      <Path
        d="M20,100 L20,60 L24,55 L28,60 L28,100 M24,55 L24,45 M152,100 L152,60 L156,55 L160,60 L160,100 M156,55 L156,45 M40,100 L40,70 L60,50 A30,30 0 0 1 120,50 L140,70 L140,100 M90,20 L90,35 M85,30 A10,10 0 0 1 95,30 M60,100 L120,100"
        fill="rgba(40, 70, 50, 0.4)"
        stroke="none"
      />
      <Path
        d="M0,100 L180,100 L180,85 C150,85 150,65 120,65 C100,65 100,40 90,35 C80,40 80,65 60,65 C30,65 30,85 0,85 Z"
        fill="rgba(30, 60, 40, 0.6)"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 0,
    marginHorizontal: 0,
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
    overflow: 'hidden',
    minHeight: 220,
    width: '100%',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    padding: 20,
  },
  textContainer: {
    flex: 1,
    zIndex: 2,
    justifyContent: 'space-between',
  },
  prayerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: 8,
  },
  time: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    lineHeight: 40,
  },
  period: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  countdown: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginBottom: 16,
  },
  footer: {
    marginTop: 'auto',
  },
  date: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  location: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  graphicContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 180,
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    opacity: 0.9,
  },
  silhouette: {
    transform: [{ translateY: 10 }],
  },
});
