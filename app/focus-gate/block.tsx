import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Fonts } from '@/constants/theme';
import { getTraditionUiTheme } from '@/constants/tradition-ui';
import { useTradition } from '@/hooks/use-tradition';

const ISLAM_BLOCKING_BACKGROUND = require('@/assets/images/background/islam-blocking.jpg');
const BUDDHIST_BLOCKING_BACKGROUND = require('@/assets/images/background/Buddhist.jpg');
const CHRISTIAN_BLOCKING_BACKGROUND = require('@/assets/images/background/Christianity.jpg');

const BLOCKING_VARIANTS = {
  islam: {
    image: ISLAM_BLOCKING_BACKGROUND,
    gradient: ['rgba(4, 14, 18, 0.18)', 'rgba(4, 14, 18, 0.9)'] as [string, string],
    buttonLabel: 'Begin Session',
    titleColor: '#FFFFFF',
    bodyColor: 'rgba(234, 248, 241, 0.9)',
    buttonBackground: 'rgba(93, 130, 111, 0.78)',
    buttonBorder: 'rgba(173, 205, 191, 0.92)',
    buttonText: '#F4F5EF',
    footerColor: 'rgba(222, 233, 226, 0.88)',
  },
  buddhism: {
    image: BUDDHIST_BLOCKING_BACKGROUND,
    gradient: ['rgba(80, 34, 16, 0.05)', 'rgba(80, 34, 16, 0.84)'] as [string, string],
    buttonLabel: 'Begin Meditation',
    titleColor: '#FBE2C0',
    bodyColor: 'rgba(245, 224, 198, 0.9)',
    buttonBackground: 'rgba(190, 122, 56, 0.8)',
    buttonBorder: 'rgba(242, 185, 117, 0.98)',
    buttonText: '#FFF2E0',
    footerColor: 'rgba(239, 214, 179, 0.9)',
  },
  christianity: {
    image: CHRISTIAN_BLOCKING_BACKGROUND,
    gradient: ['rgba(71, 37, 24, 0.05)', 'rgba(71, 37, 24, 0.84)'] as [string, string],
    buttonLabel: 'Begin Prayer',
    titleColor: '#FCE5C9',
    bodyColor: 'rgba(245, 223, 200, 0.9)',
    buttonBackground: 'rgba(185, 111, 62, 0.8)',
    buttonBorder: 'rgba(240, 180, 118, 0.98)',
    buttonText: '#FFF3E4',
    footerColor: 'rgba(245, 217, 182, 0.9)',
  },
  general: {
    image: require('@/assets/images/background/general-waterpaint.jpg'),
    gradient: ['rgba(14, 20, 42, 0.08)', 'rgba(8, 11, 24, 0.88)'] as [string, string],
    buttonLabel: 'Begin Session',
    titleColor: '#F7F8FF',
    bodyColor: 'rgba(243, 244, 255, 0.9)',
    buttonBackground: 'rgba(63, 76, 122, 0.82)',
    buttonBorder: 'rgba(223, 230, 255, 0.4)',
    buttonText: '#F5F7FF',
    footerColor: 'rgba(216, 227, 255, 0.82)',
  },
} as const;

export default function FocusGateBlockScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ blockedPackage?: string; blockedAppLabel?: string }>();
  const { tradition } = useTradition();
  const uiTheme = useMemo(() => getTraditionUiTheme(tradition), [tradition]);

  const variant = useMemo(() => {
    if (tradition === 'islam') return BLOCKING_VARIANTS.islam;
    if (tradition === 'buddhism') return BLOCKING_VARIANTS.buddhism;
    if (tradition === 'christianity') return BLOCKING_VARIANTS.christianity;
    return BLOCKING_VARIANTS.general;
  }, [tradition]);

  const blockedAppLabel = Array.isArray(params.blockedAppLabel)
    ? params.blockedAppLabel[0]
    : params.blockedAppLabel;

  const ctaRoute = tradition ? uiTheme.ctaRoute : '/active-session';

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <Image source={variant.image} style={StyleSheet.absoluteFillObject} contentFit="cover" />
      <LinearGradient colors={variant.gradient} style={StyleSheet.absoluteFillObject} />
      <View style={styles.content}>
        <View style={styles.spacer} />
        <View style={styles.copyBlock}>
          <ThemedText
            style={[
              styles.title,
              {
                color: variant.titleColor,
                fontFamily: tradition === 'islam' ? Fonts.serif : undefined,
              },
            ]}
          >
            Pause. Realign.
          </ThemedText>
          <ThemedText style={[styles.body, { color: variant.bodyColor }]}>
            {blockedAppLabel
              ? `${blockedAppLabel} is locked right now.\nComplete a session in Oremus to continue.`
              : "You've chosen to protect your focus.\nComplete a session in Oremus to continue."}
          </ThemedText>
          <Button
            title={variant.buttonLabel}
            onPress={() => router.replace(ctaRoute)}
            style={[
              styles.button,
              {
                backgroundColor: variant.buttonBackground,
                borderColor: variant.buttonBorder,
                borderWidth: 1,
              },
            ]}
            textStyle={[styles.buttonText, { color: variant.buttonText }]}
          />
          <ThemedText style={[styles.footer, { color: variant.footerColor }]}>
            Open Oremus to continue
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#081124',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 40,
  },
  spacer: {
    flex: 0.56,
  },
  copyBlock: {
    alignItems: 'center',
    gap: 14,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    fontSize: 17,
    lineHeight: 26,
    textAlign: 'center',
    maxWidth: 320,
  },
  button: {
    minWidth: '100%',
    minHeight: 58,
    borderRadius: 16,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
