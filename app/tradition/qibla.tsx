import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Animated,
  Dimensions,
  Easing
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

export default function QiblaScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const rotateAnim = useRef(new Animated.Value(145)).current;

  // In a real app, this would use DeviceMotion/Compass sensors
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 148,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 142,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: 'Qibla Compass',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <IconSymbol name="arrow.left.ios" size={20} color={theme.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity style={styles.iconButton}>
              <IconSymbol name="info.circle" size={24} color={theme.text} />
            </TouchableOpacity>
          ),
        }} 
      />

      <View style={styles.content}>
        {/* Calibration Status */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: '#0bda731A', borderColor: '#0bda7333' }]}>
            <View style={styles.pingContainer}>
              <View style={[styles.ping, { backgroundColor: '#0bda73' }]} />
              <View style={[styles.dot, { backgroundColor: '#0bda73' }]} />
            </View>
            <ThemedText style={styles.statusText}>COMPASS READY</ThemedText>
          </View>
        </View>

        {/* Degree Display */}
        <View style={styles.degreeSection}>
          <ThemedText style={styles.degreeValue}>145° SE</ThemedText>
          <ThemedText style={styles.locationText}>London, United Kingdom</ThemedText>
        </View>

        {/* Digital Compass Visual */}
        <View style={styles.compassContainer}>
          <View style={[styles.outerRing, { borderColor: colorScheme === 'light' ? '#0bda730D' : '#ffffff0D' }]}>
            <View style={[styles.tickRing, { borderColor: '#0bda7333' }]} />
            
            <Animated.View style={[
              styles.needleContainer, 
              { transform: [{ rotate: rotateAnim.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg']
              }) }] }
            ]}>
              <View style={styles.needle}>
                <IconSymbol name="kaaba" size={48} color="#0bda73" style={styles.kaabaIcon} />
                <View style={styles.needleStem} />
              </View>
            </Animated.View>

            <View style={[styles.centerPoint, { backgroundColor: '#0bda73', borderColor: theme.background }]} />
          </View>
        </View>

        {/* Distance & Info */}
        <View style={styles.statsSection}>
          <View style={[styles.distanceCard, { backgroundColor: '#0bda730D', borderColor: '#0bda731A' }]}>
            <ThemedText style={styles.distanceLabel}>DISTANCE TO MAKKAH</ThemedText>
            <ThemedText style={styles.distanceValue}>4,785 km</ThemedText>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
              <ThemedText style={styles.statLabel}>NEXT PRAYER</ThemedText>
              <ThemedText style={styles.statValue}>Asr</ThemedText>
              <ThemedText style={[styles.statSub, { color: '#0bda73' }]}>In 1h 24m</ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
              <ThemedText style={styles.statLabel}>ACCURACY</ThemedText>
              <ThemedText style={styles.statValue}>High</ThemedText>
              <ThemedText style={[styles.statSub, { color: '#d4af37' }]}>GPS Active</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.privacyNote}>
          <IconSymbol name="lock.fill" size={12} color={theme.muted} />
          <ThemedText style={styles.privacyText}>Local-only data storage</ThemedText>
        </View>
      </View>

      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity style={[styles.floatingButton, { backgroundColor: '#0bda73' }]}>
          <IconSymbol name="calendar" size={20} color="#102219" />
          <ThemedText style={styles.floatingButtonText}>View Prayer Times</ThemedText>
          <IconSymbol name="chevron.right" size={18} color="#102219" />
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

import { useRef } from 'react';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    marginLeft: 16,
  },
  iconButton: {
    marginRight: 16,
  },
  content: {
    flex: 1,
    paddingTop: 100,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statusContainer: {
    marginVertical: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  pingContainer: {
    width: 8,
    height: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ping: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.5,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    color: '#0bda73',
  },
  degreeSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  degreeValue: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  locationText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  compassContainer: {
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  outerRing: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tickRing: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  needleContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  needle: {
    alignItems: 'center',
    paddingTop: 10,
  },
  kaabaIcon: {
    shadowColor: '#0bda73',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  needleStem: {
    width: 6,
    height: 120,
    backgroundColor: '#0bda73',
    borderRadius: 3,
    marginTop: -8,
    opacity: 0.3,
  },
  centerPoint: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  statsSection: {
    width: '100%',
    gap: 16,
  },
  distanceCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
  },
  distanceLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#64748b',
    marginBottom: 8,
  },
  distanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748b',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statSub: {
    fontSize: 12,
    fontWeight: '600',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
    opacity: 0.5,
  },
  privacyText: {
    fontSize: 12,
    color: '#64748b',
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  floatingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 56,
    paddingHorizontal: 32,
    borderRadius: 28,
    shadowColor: '#0bda73',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  floatingButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#102219',
  },
});
