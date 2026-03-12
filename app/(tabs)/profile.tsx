import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PrayerLocationSettingsCard } from '@/components/islam/prayer-location-settings-card';
import { Button } from '@/components/ui/button';
import type { IconSymbolName } from '@/components/ui/icon-symbol';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { usePrayerLocationSettings } from '@/hooks/use-prayer-location-settings';
import { getTraditionUiTheme } from '@/constants/tradition-ui';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTradition } from '@/hooks/use-tradition';
import { useUser } from '@/hooks/use-user';
import * as ImagePicker from 'expo-image-picker';

type SettingItemProps = {
  icon: IconSymbolName;
  title: string;
  color: string;
  isLast?: boolean;
  onPress?: () => void;
  islamMode: boolean;
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const { tradition, traditionDetails } = useTradition();
  const uiTheme = useMemo(() => getTraditionUiTheme(tradition), [tradition]);
  const isIslam = tradition === 'islam';
  const prayerLocationSettings = usePrayerLocationSettings({ enabled: isIslam });
  const isImmersiveTradition =
    tradition === 'islam' || tradition === 'buddhism' || tradition === 'christianity';
  const useTraditionTheme = isImmersiveTradition;
  const backgroundImageStyle = useMemo(
    () => [StyleSheet.absoluteFillObject, isIslam ? styles.islamBackgroundShift : null],
    [isIslam],
  );
  const { user, userName, userProfileImage, setProfileImage, setUser } = useUser();
  const router = useRouter();
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(userName === 'Guest' ? '' : userName);

  useEffect(() => {
    setNameDraft(userName === 'Guest' ? '' : userName);
  }, [userName]);

  const trimmedNameDraft = nameDraft.trim();
  const canSaveName = trimmedNameDraft.length > 0 && trimmedNameDraft !== userName;

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        'Permission Required',
        'Permission to access media library is required to change your profile picture.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await setProfileImage(result.assets[0].uri);
    }
  };

  const saveName = async () => {
    if (!trimmedNameDraft) {
      Alert.alert('Name Required', 'Please enter a valid name.');
      return;
    }

    try {
      await setUser({
        ...(user ?? {}),
        name: trimmedNameDraft,
      });
      setIsEditingName(false);
    } catch {
      Alert.alert('Update Failed', 'Unable to save your name right now. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {isImmersiveTradition ? (
        <>
          <Image source={uiTheme.backgroundImage} style={backgroundImageStyle} contentFit="cover" />
          <LinearGradient colors={uiTheme.overlayGradient} style={StyleSheet.absoluteFillObject} />
        </>
      ) : null}

      <ThemedView style={[styles.container, isImmersiveTradition ? styles.transparentBg : null]}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerTransparent: true,
            headerTitle: isIslam ? 'Account' : 'Profile',
            headerTintColor: isIslam ? uiTheme.textColor : theme.text,
            headerTitleStyle: isIslam
              ? {
                  color: uiTheme.textColor,
                  fontFamily: Fonts.serif,
                  fontSize: 28,
                }
              : undefined,
          }}
        />

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isImmersiveTradition ? styles.scrollContentImmersive : null,
          ]}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
        >
          <View
            style={[
              styles.profileHeader,
              isImmersiveTradition ? styles.profileHeaderImmersive : null,
            ]}
          >
            <View style={styles.avatarContainer}>
              {userProfileImage ? (
                <Image
                  source={{ uri: userProfileImage }}
                  style={styles.avatar}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={[
                    styles.avatar,
                    styles.avatarPlaceholder,
                    useTraditionTheme ? styles.avatarPlaceholderImmersive : null,
                  ]}
                >
                  <IconSymbol
                    name="person.fill"
                    size={44}
                    color={useTraditionTheme ? uiTheme.actionTextColor : '#9ca3af'}
                  />
                </View>
              )}
              <Pressable
                style={[
                  styles.editBadge,
                  useTraditionTheme
                    ? {
                        backgroundColor: uiTheme.actionCardColor,
                        borderColor: uiTheme.actionCardBorderColor,
                      }
                    : { backgroundColor: theme.primary, borderColor: theme.background },
                ]}
                onPress={pickImage}
              >
                <IconSymbol
                  name="pencil"
                  size={12}
                  color={useTraditionTheme ? uiTheme.actionTextColor : '#fff'}
                />
              </Pressable>
            </View>

            <View style={styles.profileInfo}>
              <ThemedText
                style={[
                  styles.userName,
                  useTraditionTheme ? { color: uiTheme.textColor, fontFamily: Fonts.serif } : null,
                ]}
              >
                {userName}
              </ThemedText>
              {isEditingName ? (
                <View style={styles.nameEditor}>
                  <TextInput
                    value={nameDraft}
                    onChangeText={setNameDraft}
                    placeholder="Enter your name"
                    placeholderTextColor={useTraditionTheme ? 'rgba(232,255,247,0.72)' : '#94a3b8'}
                    autoCapitalize="words"
                    returnKeyType="done"
                    onSubmitEditing={saveName}
                    style={[
                      styles.nameInput,
                      useTraditionTheme
                        ? {
                            color: uiTheme.actionTextColor,
                            borderColor: uiTheme.actionCardBorderColor,
                            backgroundColor: 'rgba(8, 52, 40, 0.4)',
                          }
                        : {
                            color: theme.text,
                            borderColor: 'rgba(15, 23, 42, 0.12)',
                            backgroundColor: theme.surface,
                          },
                    ]}
                  />
                  <View style={styles.nameActions}>
                    <Pressable
                      onPress={() => {
                        setNameDraft(userName === 'Guest' ? '' : userName);
                        setIsEditingName(false);
                      }}
                      style={styles.nameActionSecondary}
                    >
                      <ThemedText
                        style={[
                          styles.nameActionSecondaryText,
                          useTraditionTheme ? { color: uiTheme.actionTextColor } : null,
                        ]}
                      >
                        Cancel
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      onPress={saveName}
                      disabled={!canSaveName}
                      style={[
                        styles.nameActionPrimary,
                        {
                          backgroundColor: canSaveName
                            ? useTraditionTheme
                              ? uiTheme.actionIconColor
                              : theme.primary
                            : useTraditionTheme
                              ? 'rgba(172, 239, 215, 0.24)'
                              : 'rgba(100, 116, 139, 0.6)',
                        },
                      ]}
                    >
                      <ThemedText style={styles.nameActionPrimaryText}>Save</ThemedText>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  onPress={() => setIsEditingName(true)}
                  style={[
                    styles.editNameChip,
                    useTraditionTheme
                      ? {
                          backgroundColor: uiTheme.actionCardColor,
                          borderColor: uiTheme.actionCardBorderColor,
                        }
                      : {
                          backgroundColor: 'rgba(15, 23, 42, 0.04)',
                          borderColor: 'rgba(15, 23, 42, 0.08)',
                        },
                  ]}
                >
                  <IconSymbol
                    name="pencil"
                    size={12}
                    color={useTraditionTheme ? uiTheme.actionIconColor : theme.primary}
                  />
                  <ThemedText
                    style={[
                      styles.editNameChipText,
                      { color: useTraditionTheme ? uiTheme.actionTextColor : theme.primary },
                    ]}
                  >
                    Edit Name
                  </ThemedText>
                </Pressable>
              )}
              {traditionDetails ? (
                <View
                  style={[
                    styles.traditionBadge,
                    useTraditionTheme
                      ? {
                          backgroundColor: uiTheme.actionCardColor,
                          borderColor: uiTheme.actionCardBorderColor,
                        }
                      : { backgroundColor: `${traditionDetails.color}1A` },
                  ]}
                >
                  <IconSymbol
                    name={traditionDetails.icon}
                    size={14}
                    color={useTraditionTheme ? uiTheme.actionIconColor : traditionDetails.color}
                  />
                  <ThemedText
                    style={[
                      styles.traditionText,
                      {
                        color: useTraditionTheme ? uiTheme.actionTextColor : traditionDetails.color,
                      },
                    ]}
                  >
                    {traditionDetails.title}
                  </ThemedText>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText
              style={[
                styles.sectionLabel,
                useTraditionTheme ? { color: uiTheme.actionIconColor } : null,
              ]}
            >
              PREFERENCES
            </ThemedText>
            <View
              style={[
                styles.settingsList,
                useTraditionTheme
                  ? {
                      backgroundColor: uiTheme.actionCardColor,
                      borderColor: uiTheme.actionCardBorderColor,
                    }
                  : {
                      backgroundColor: theme.surface,
                      borderColor:
                        colorScheme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                    },
              ]}
            >
              <SettingItem
                icon="slider.horizontal.3"
                title="Change Tradition"
                color={useTraditionTheme ? uiTheme.actionIconColor : theme.primary}
                onPress={() => router.push('/onboarding')}
                islamMode={useTraditionTheme}
              />
              <SettingItem
                icon="shield.lock"
                title="App Blocking"
                color={useTraditionTheme ? uiTheme.actionIconColor : '#16a34a'}
                onPress={() => router.push('/settings/app-blocking')}
                isLast
                islamMode={useTraditionTheme}
              />
            </View>
          </View>

          {isIslam ? (
            <View style={styles.section}>
              <ThemedText style={[styles.sectionLabel, { color: uiTheme.actionIconColor }]}>
                PRAYER TIMES
              </ThemedText>
              <PrayerLocationSettingsCard
                canAskLocationPermission={prayerLocationSettings.canAskLocationPermission}
                clearSavedPrayerLocation={prayerLocationSettings.clearSavedPrayerLocation}
                isRequestingLocationPermission={
                  prayerLocationSettings.isRequestingLocationPermission
                }
                isUsingDeviceLocation={prayerLocationSettings.isUsingDeviceLocation}
                locationError={prayerLocationSettings.locationError}
                locationPermissionStatus={prayerLocationSettings.locationPermissionStatus}
                locationText={prayerLocationSettings.locationText}
                requestLocationPermission={prayerLocationSettings.requestLocationPermission}
                savedPrayerLocation={prayerLocationSettings.savedPrayerLocation}
                selectSavedPrayerLocation={prayerLocationSettings.selectSavedPrayerLocation}
                showPresets
              />
            </View>
          ) : null}

          <View style={styles.section}>
            <View
              style={[
                styles.privacyCard,
                useTraditionTheme
                  ? {
                      backgroundColor: uiTheme.actionCardColor,
                      borderColor: uiTheme.actionCardBorderColor,
                    }
                  : null,
              ]}
            >
              <View style={styles.privacyHeader}>
                <View
                  style={[
                    styles.privacyIconContainer,
                    useTraditionTheme
                      ? { backgroundColor: 'rgba(172, 239, 215, 0.18)' }
                      : { backgroundColor: `${theme.primary}1A` },
                  ]}
                >
                  <IconSymbol
                    name="shield.lock"
                    size={20}
                    color={useTraditionTheme ? uiTheme.actionIconColor : theme.primary}
                  />
                </View>
                <ThemedText
                  style={[
                    styles.privacyTitle,
                    useTraditionTheme ? { color: uiTheme.actionTextColor } : null,
                  ]}
                >
                  Data & Privacy
                </ThemedText>
              </View>
              <ThemedText
                style={[
                  styles.privacyDescription,
                  useTraditionTheme ? { color: uiTheme.actionTextColor } : null,
                ]}
              >
                Your data is private. Sessions, notes, and templates are stored on this device only
                and{' '}
                <ThemedText
                  style={{ color: useTraditionTheme ? uiTheme.actionIconColor : theme.primary }}
                >
                  not synced to the cloud
                </ThemedText>
                .
              </ThemedText>

              <View style={styles.privacyActions}>
                <Button
                  title="Export Data (JSON)"
                  icon={
                    <IconSymbol
                      name="square.and.arrow.up.fill"
                      size={18}
                      color={useTraditionTheme ? '#0C4B3A' : '#fff'}
                    />
                  }
                  style={styles.exportBtn}
                  variant={useTraditionTheme ? 'secondary' : 'primary'}
                />
                <Pressable style={styles.clearBtn}>
                  <IconSymbol
                    name="trash.fill"
                    size={18}
                    color={useTraditionTheme ? '#FEE2E2' : '#ef4444'}
                  />
                  <ThemedText
                    style={[styles.clearBtnText, useTraditionTheme ? { color: '#FEE2E2' } : null]}
                  >
                    Clear All Local Data
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <ThemedText
              style={[
                styles.versionText,
                useTraditionTheme ? { color: uiTheme.actionIconColor } : null,
              ]}
            >
              App Version 1.2.0 (Build 45){'\n'}
              Made for distraction-free practice.
            </ThemedText>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </ThemedView>
    </View>
  );
}

function SettingItem({ icon, title, color, isLast, onPress, islamMode }: SettingItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.settingItem,
        !isLast ? styles.borderBottom : null,
        !isLast ? { borderBottomColor: islamMode ? 'rgba(232,255,247,0.24)' : '#f1f5f9' } : null,
      ]}
    >
      <View style={[styles.settingIconContainer, { backgroundColor: `${color}1A` }]}>
        <IconSymbol name={icon} size={20} color={color} />
      </View>
      <ThemedText style={[styles.settingTitle, islamMode ? { color: '#EBFFF7' } : null]}>
        {title}
      </ThemedText>
      <IconSymbol
        name="chevron.right"
        size={20}
        color={islamMode ? 'rgba(232,255,247,0.72)' : '#64748b'}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  islamBackgroundShift: {
    top: -28,
  },
  transparentBg: {
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingTop: 72,
  },
  scrollContentImmersive: {
    paddingBottom: 120,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  profileHeaderImmersive: {
    paddingTop: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 3,
    borderColor: 'rgba(232,255,247,0.4)',
  },
  avatarPlaceholder: {
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderImmersive: {
    backgroundColor: 'rgba(8, 52, 40, 0.45)',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  userName: {
    fontSize: 32,
    fontWeight: '700',
  },
  editNameChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  editNameChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  nameEditor: {
    width: '100%',
    maxWidth: 360,
    gap: 8,
  },
  nameInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  nameActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  nameActionSecondary: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  nameActionSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  nameActionPrimary: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  nameActionPrimaryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  traditionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
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
    borderWidth: 1,
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
