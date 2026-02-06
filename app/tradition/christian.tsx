import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ChristianScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: 'Daily Scripture',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
              <IconSymbol name="book.fill" size={24} color={theme.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity style={styles.headerIcon}>
              <IconSymbol name="search" size={24} color={theme.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Verse Card */}
        <View style={styles.heroSection}>
          <Card variant="default" style={styles.verseCard}>
            <View style={styles.verseDecoration}>
              <IconSymbol
                name="auto.stories"
                size={160}
                color={theme.primary}
                style={{ opacity: 0.05 }}
              />
            </View>
            <View style={styles.verseContent}>
              <ThemedText style={styles.verseLabel}>VERSE OF THE DAY</ThemedText>
              <ThemedText style={styles.verseText}>
                &quot;For unto us a child is born, unto us a son is given: and the government shall
                be upon his shoulder: and his name shall be called Wonderful, Counsellor, The mighty
                God, The everlasting Father, The Prince of Peace.&quot;
              </ThemedText>
              <View style={styles.verseFooter}>
                <IconSymbol name="bookmark.fill" size={14} color={theme.muted} />
                <ThemedText style={styles.verseReference}>Isaiah 9:6</ThemedText>
              </View>
            </View>
          </Card>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Scripture Library</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            Guided readings for your daily walk
          </ThemedText>
        </View>

        {/* Library List */}
        <View style={styles.libraryList}>
          <LibraryItem
            title="Advent & Christmas"
            description="Preparing for the coming of Christ the King"
            icon="sparkles"
            active
          />
          <LibraryItem
            title="Table Blessings"
            description="Prayers and gratitude for the nourishment of body and soul"
            icon="fork.knife"
          />
          <LibraryItem
            title="Strength & Courage"
            description="Fortifying the spirit through trials and uncertainty"
            icon="fort.fill"
          />
          <LibraryItem
            title="Inner Peace"
            description="Finding rest for your soul in the presence of God"
            icon="leaf.fill"
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.privacyRow}>
            <IconSymbol name="shield.person.fill" size={12} color={theme.muted} />
            <ThemedText style={styles.privacyText}>LOCAL DATA ONLY • PRIVACY FIRST</ThemedText>
          </View>
          <ThemedText style={styles.footerSubtext}>
            Your spiritual journey stays on your device.
          </ThemedText>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ThemedView>
  );
}

function LibraryItem({ title, description, icon, active = false }: any) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <TouchableOpacity style={[styles.libraryItem, { backgroundColor: theme.surface }]}>
      <View
        style={[
          styles.itemIconContainer,
          {
            backgroundColor: active
              ? `${theme.primary}1A`
              : colorScheme === 'light'
                ? '#f1f5f9'
                : '#1e293b',
          },
        ]}
      >
        <IconSymbol name={icon} size={24} color={active ? theme.primary : theme.text} />
      </View>
      <View style={styles.itemContent}>
        <ThemedText style={styles.itemTitle}>{title}</ThemedText>
        <ThemedText style={styles.itemDescription} numberOfLines={2}>
          {description}
        </ThemedText>
      </View>
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
  headerIcon: {
    padding: 8,
    marginHorizontal: 8,
  },
  heroSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  verseCard: {
    minHeight: 300,
    justifyContent: 'flex-end',
    padding: 32,
    backgroundColor: '#fdfbf7',
  },
  verseDecoration: {
    position: 'absolute',
    top: -20,
    right: -20,
  },
  verseContent: {
    gap: 16,
  },
  verseLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#1152d4',
  },
  verseText: {
    fontSize: 24,
    fontStyle: 'italic',
    lineHeight: 36,
    color: '#111318',
  },
  verseFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 16,
  },
  verseReference: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#64748b',
    fontWeight: '500',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  libraryList: {
    paddingHorizontal: 12,
    gap: 4,
  },
  libraryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    minHeight: 80,
  },
  itemIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemDescription: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  footer: {
    marginTop: 32,
    padding: 32,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    opacity: 0.5,
  },
  privacyText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    color: '#64748b',
  },
  footerSubtext: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#94a3b8',
    marginTop: 8,
  },
});
