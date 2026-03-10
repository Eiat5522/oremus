import React from 'react';
import { Animated, Image as RNImage, StyleSheet, View } from 'react-native';
import { SvgUri } from 'react-native-svg';

type PrayerHaloAnchorProps = {
  haloOpacity?: Animated.Value | Animated.AnimatedInterpolation<number>;
  anchorScale?: Animated.Value | Animated.AnimatedInterpolation<number>;
};

const haloUri = RNImage.resolveAssetSource(
  require('@/assets/islam/session/islam_prayer_session_halo.svg'),
).uri;
const kaabaUri = RNImage.resolveAssetSource(require('@/assets/islam/session/kaaba_mark.svg')).uri;

export function PrayerHaloAnchor({ haloOpacity, anchorScale }: PrayerHaloAnchorProps) {
  return (
    <Animated.View
      style={[
        styles.anchorWrap,
        anchorScale
          ? {
              transform: [{ scale: anchorScale }],
            }
          : null,
      ]}
      pointerEvents="none"
    >
      <Animated.View style={[styles.halo, haloOpacity ? { opacity: haloOpacity } : null]}>
        <SvgUri uri={haloUri} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
      </Animated.View>

      <View style={styles.kaabaBadge}>
        <SvgUri uri={kaabaUri} width="76" height="76" />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  anchorWrap: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    ...StyleSheet.absoluteFillObject,
  },
  kaabaBadge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(12, 24, 20, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(247, 227, 165, 0.4)',
    shadowColor: '#F4D27C',
    shadowOpacity: 0.32,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
});
