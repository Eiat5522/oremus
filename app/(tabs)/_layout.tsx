import { Tabs, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import React, { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getTraditionUiTheme } from '@/constants/tradition-ui';
import { useTradition } from '@/hooks/use-tradition';

export default function TabLayout() {
  const { tradition } = useTradition();
  const router = useRouter();
  const uiTheme = useMemo(() => getTraditionUiTheme(tradition), [tradition]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: uiTheme.tabActiveTint,
        tabBarInactiveTintColor: uiTheme.tabInactiveTint,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: 'transparent',
          },
        ],
        tabBarBackground: () => (
          <View
            style={[
              StyleSheet.absoluteFill,
              styles.tabBackground,
              {
                backgroundColor: uiTheme.tabBarColor,
                borderColor: uiTheme.tabBarBorderColor,
              },
            ]}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="prayers"
        options={{
          href: tradition === 'islam' ? undefined : null,
          title: 'Prayer Times',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="timer" color={color} />,
        }}
      />
      <Tabs.Screen
        name="start-prayer"
        options={{
          title: 'Start',
          tabBarButton: (props) => (
            <HapticTab
              {...props}
              style={[props.style, styles.centerTabButton]}
              onPress={() => {
                router.push(uiTheme.ctaRoute);
              }}
            />
          ),
          tabBarIcon: () => (
            <View style={styles.centerIconOuterRing}>
              <View style={styles.centerIconWrap}>
                <Image
                  source={require('@/assets/images/app-logo-mark.png')}
                  style={styles.centerLogoIcon}
                  contentFit="contain"
                />
              </View>
            </View>
          ),
          tabBarActiveTintColor: '#ffffff',
          tabBarInactiveTintColor: '#ffffff',
        }}
      />
      <Tabs.Screen
        name="qibla"
        options={{
          href: tradition === 'islam' ? undefined : null,
          title: 'Qibla',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="location.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="settings" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: Platform.select({ ios: 20, default: 10 }),
    height: 70,
    borderRadius: 22,
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    paddingBottom: 10,
    paddingTop: 10,
  },
  tabBackground: {
    borderRadius: 22,
    borderWidth: 1,
  },
  centerTabButton: {
    marginTop: -18,
  },
  centerIconOuterRing: {
    width: 62,
    height: 62,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
  },
  centerIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBF6EE',
    borderWidth: 1,
    borderColor: 'rgba(39, 60, 107, 0.08)',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    // Android shadow
    elevation: 8,
  },
  centerLogoIcon: {
    width: 34,
    height: 34,
  },
});
