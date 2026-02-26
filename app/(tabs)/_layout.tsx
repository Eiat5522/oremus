import { Tabs, useRouter } from 'expo-router';
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
        tabBarButton: HapticTab,
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
          href: tradition === 'islam' ? undefined : null,
          title: 'Start',
          tabBarButton: (props) => (
            <HapticTab
              {...props}
              style={[props.style, styles.centerTabButton]}
              onPress={() => {
                router.push('/active-session');
              }}
            />
          ),
          tabBarIcon: ({ color }) => (
            <View style={[styles.centerIconWrap, { backgroundColor: uiTheme.tabActiveTint }]}>
              <IconSymbol size={30} name="play.fill" color={color} />
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
  centerIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 18px rgba(0, 0, 0, 0.22)',
  },
});
