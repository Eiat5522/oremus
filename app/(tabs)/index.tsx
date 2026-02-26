import { Image } from 'expo-image';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { getTraditionUiTheme } from '@/constants/tradition-ui';
import { useTradition } from '@/hooks/use-tradition';
import { useUser } from '@/hooks/use-user';

export default function HomeScreen() {
  const router = useRouter();
  const { tradition } = useTradition();
  const { userName } = useUser();

  const uiTheme = useMemo(() => getTraditionUiTheme(tradition), [tradition]);
  const backgroundImageStyle = useMemo(
    () => [
      StyleSheet.absoluteFillObject,
      tradition === 'islam' ? styles.islamBackgroundShift : null,
    ],
    [tradition],
  );
  const displayName = userName.trim().length > 0 && userName !== 'Guest' ? userName : 'Sarah';

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <Image source={uiTheme.backgroundImage} style={backgroundImageStyle} contentFit="cover" />
      <LinearGradient colors={uiTheme.overlayGradient} style={StyleSheet.absoluteFillObject} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.heroWrap}>
          <ThemedText
            style={[
              styles.greeting,
              {
                color: uiTheme.textColor,
                fontFamily: Fonts.serif,
              },
            ]}
          >
            {uiTheme.greeting},{'\n'}
            {displayName}.
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: uiTheme.subtitleColor }]}>
            {uiTheme.subtitle}
          </ThemedText>
        </View>

        <Pressable onPress={() => router.push(uiTheme.ctaRoute)} style={styles.ctaButtonWrap}>
          <LinearGradient colors={uiTheme.ctaGradient} style={styles.ctaButton}>
            <ThemedText style={styles.ctaLabel}>{uiTheme.ctaLabel}</ThemedText>
          </LinearGradient>
        </Pressable>

        <View
          style={[
            styles.actionList,
            {
              backgroundColor: uiTheme.actionCardColor,
              borderColor: uiTheme.actionCardBorderColor,
            },
          ]}
        >
          {uiTheme.actions.map((action, index) => (
            <Pressable
              key={action.id}
              onPress={() => router.push(action.route)}
              style={[
                styles.actionRow,
                index < uiTheme.actions.length - 1 ? styles.actionBorder : null,
              ]}
            >
              <View style={styles.actionLeft}>
                <IconSymbol name={action.icon} size={19} color={uiTheme.actionIconColor} />
                <ThemedText style={[styles.actionLabel, { color: uiTheme.actionTextColor }]}>
                  {action.label}
                </ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={20} color={uiTheme.actionIconColor} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  islamBackgroundShift: {
    top: -28,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingTop: 88,
    paddingBottom: 140,
  },
  heroWrap: {
    alignItems: 'center',
    gap: 14,
    marginTop: 16,
  },
  greeting: {
    textAlign: 'center',
    fontSize: 50,
    lineHeight: 60,
    letterSpacing: 0.2,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 21,
    lineHeight: 30,
    fontWeight: '500',
  },
  ctaButtonWrap: {
    marginTop: 48,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  ctaButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    paddingHorizontal: 20,
  },
  ctaLabel: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  actionList: {
    marginTop: 34,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  actionRow: {
    minHeight: 68,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.24)',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionLabel: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '500',
  },
});
