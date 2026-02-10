import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTradition } from '@/hooks/use-tradition';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { traditionDetails } = useTradition();
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerLeft: () => (
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.backButton}>
                <IconSymbol name="arrow.left" size={24} color={theme.text} />
              </TouchableOpacity>
              <ThemedText style={styles.headerTitleText}>Profile</ThemedText>
            </View>
          ),
          headerRight: () => (
            <TouchableOpacity style={styles.iconButton}>
              <IconSymbol name="settings" size={24} color={theme.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlRsitAUHhAJL2HPTIZDpJmf_oWjwXfZfh2vD0kAe0RxWS-ZV9wTm_yMifwO_Lv7NbiPi2kzLhLqZZkke7kJVBa24kqT6l_guj1nbe3K8Afqg3w2RgEhsv3tlQT_o2Y1GlxIzPMdvJOEBEC8AQcjzVDb-n1kFJZwrFxuxKqdPzem3h-AgK93WGSuWNahyeuRXkjOvOnXr7lyqOtKHVrP_ywczBWc2DmNa2NMWeG9jTyBtkdfjdvk-db3hpONSWlQf4AAxKT_L88zA',
              }}
              style={styles.avatar}
            />
            <View
              style={[
                styles.editBadge,
                { backgroundColor: theme.primary, borderColor: theme.background },
              ]}
            >
              <IconSymbol name="pencil" size={12} color="#fff" />
            </View>
          </View>

          <View style={styles.profileInfo}>
            <ThemedText style={styles.userName}>Gabriel Vance</ThemedText>
            {traditionDetails && (
              <View style={[styles.traditionBadge, { backgroundColor: `${traditionDetails.color}1A` }]}>
                <IconSymbol name={traditionDetails.icon} size={14} color={traditionDetails.color} />
                <ThemedText style={[styles.traditionText, { color: traditionDetails.color }]}>
                  {traditionDetails.title}
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionLabel}>PREFERENCES</ThemedText>
          <View
            style={[
              styles.settingsList,
              {
                backgroundColor: theme.surface,
                borderColor:
                  colorScheme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
              },
            ]}
          >
            <SettingItem
              icon="slider.horizontal.3"
              title="Change Tradition"
              color={theme.primary}
              isFirst
              onPress={() => router.push('/onboarding')}
            />
            <SettingItem icon="doc.text" title="Manage Templates" color="#10b981" />
            <SettingItem icon="bell.fill" title="Notifications" color="#fbbf24" isLast />
          </View>
        </View>

        {/* Data & Privacy Section */}
        <View style={styles.section}>
          <Card style={styles.privacyCard}>
            <View style={styles.privacyHeader}>
              <View
                style={[styles.privacyIconContainer, { backgroundColor: `${theme.primary}1A` }]}
              >
                <IconSymbol name="shield.lock" size={20} color={theme.primary} />
              </View>
              <ThemedText style={styles.privacyTitle}>Data & Privacy</ThemedText>
            </View>
            <ThemedText style={styles.privacyDescription}>
              Your data is private. Sessions, notes, and templates are stored on this device only
              and{' '}
              <ThemedText style={{ color: theme.primary, fontWeight: '600' }}>
                not synced to the cloud
              </ThemedText>
              .
            </ThemedText>

            <View style={styles.privacyActions}>
              <Button
                title="Export Data (JSON)"
                icon={<IconSymbol name="square.and.arrow.up.fill" size={18} color="#fff" />}
                style={styles.exportBtn}
              />
              <TouchableOpacity style={styles.clearBtn}>
                <IconSymbol name="trash.fill" size={18} color="#ef4444" />
                <ThemedText style={styles.clearBtnText}>Clear All Local Data</ThemedText>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        {/* Version Info */}
        <View style={styles.footer}>
          <ThemedText style={styles.versionText}>
            App Version 1.2.0 (Build 45){'\n'}
            Made for distraction-free practice.
          </ThemedText>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ThemedView>
  );
}

function SettingItem({ icon, title, color, isFirst, isLast, onPress }: any) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.settingItem,
        !isLast && styles.borderBottom,
        !isLast && { borderBottomColor: colorScheme === 'light' ? '#f1f5f9' : '#1e293b' },
      ]}
    >
      <View style={[styles.settingIconContainer, { backgroundColor: `${color}1A` }]}>
        <IconSymbol name={icon} size={20} color={color} />
      </View>
      <ThemedText style={styles.settingTitle}>{title}</ThemedText>
      <IconSymbol name="chevron.right" size={20} color={theme.muted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 100,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: 'rgba(19, 91, 236, 0.2)',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  traditionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  traditionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
    letterSpacing: 1.5,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  settingsList: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTitle: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  privacyCard: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  privacyIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  privacyDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: '#64748b',
    marginBottom: 24,
  },
  privacyActions: {
    gap: 12,
  },
  exportBtn: {
    borderRadius: 16,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  clearBtnText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  versionText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
  },
});
