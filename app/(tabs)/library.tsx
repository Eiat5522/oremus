import React from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  TouchableOpacity,
  Dimensions,
  TextInput
} from 'react-native';
import { Stack } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

export default function LibraryScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
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
              <IconSymbol name="book.fill" size={24} color={theme.text} />
              <ThemedText style={styles.headerTitleText}>Daily Scripture</ThemedText>
            </View>
          ),
          headerRight: () => (
            <TouchableOpacity style={styles.iconButton}>
              <IconSymbol name="search" size={24} color={theme.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Verse Card */}
        <View style={styles.heroSection}>
          <TouchableOpacity onPress={() => router.push('/tradition/christian')}>
            <Card variant="default" style={styles.verseCard}>
              <View style={styles.verseDecoration}>
                <IconSymbol name="auto.stories" size={160} color={theme.primary} style={{ opacity: 0.05 }} />
              </View>
              <View style={styles.verseContent}>
                <ThemedText style={styles.verseLabel}>VERSE OF THE DAY</ThemedText>
                <ThemedText style={styles.verseText}>
                  "For unto us a child is born, unto us a son is given: and the government shall be upon his shoulder: and his name shall be called Wonderful, Counsellor, The mighty God, The everlasting Father, The Prince of Peace."
                </ThemedText>
                <View style={styles.verseFooter}>
                  <IconSymbol name="bookmark.fill" size={14} color={theme.muted} />
                  <ThemedText style={styles.verseReference}>Isaiah 9:6</ThemedText>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <ThemedText type="title" style={styles.sectionTitle}>Tradition Tools</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>Specialized tools for your practice</ThemedText>
        </View>

        {/* Library List */}
        <View style={styles.libraryList}>
          <LibraryItem 
            title="Qibla Compass" 
            description="Find the direction of Makkah from anywhere" 
            icon="kaaba" 
            onPress={() => router.push('/tradition/qibla')}
          />
          <LibraryItem 
            title="Buddhist Chants" 
            description="Tibetan, Zen, and Theravada mantras" 
            icon="flower.fill" 
            onPress={() => router.push('/tradition/buddhist')}
          />
          <LibraryItem 
            title="Quiet Reflection" 
            description="Universal mindfulness and focus tools" 
            icon="spa" 
            onPress={() => router.push('/tradition/general')}
          />
          <LibraryItem 
            title="Advent & Christmas" 
            description="Preparing for the coming of Christ the King" 
            icon="sparkles" 
            active
            onPress={() => router.push('/tradition/christian')}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.privacyRow}>
            <IconSymbol name="shield.person.fill" size={12} color={theme.muted} />
            <ThemedText style={styles.privacyText}>LOCAL DATA ONLY • PRIVACY FIRST</ThemedText>
          </View>
          <ThemedText style={styles.footerSubtext}>Your spiritual journey stays on your device.</ThemedText>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ThemedView>
  );
}

function LibraryItem({ title, description, icon, active = false, onPress }: any) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <TouchableOpacity 
      style={[styles.libraryItem, { backgroundColor: theme.surface }]}
      onPress={onPress}
    >
      <View style={[styles.itemIconContainer, { backgroundColor: active ? `${theme.primary}1A` : (colorScheme === 'light' ? '#f1f5f9' : '#1e293b') }]}>
        <IconSymbol name={icon} size={24} color={active ? theme.primary : theme.text} />
      </View>
      <View style={styles.itemContent}>
        <ThemedText style={styles.itemTitle}>{title}</ThemedText>
        <ThemedText style={styles.itemDescription} numberOfLines={2}>{description}</ThemedText>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 16,
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
  heroSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  verseCard: {
    minHeight: 300,
    justifyContent: 'flex-end',
    padding: 32,
    backgroundColor: '#fdfbf7', // Paper texture color from HTML
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
    fontSize: 24,
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
