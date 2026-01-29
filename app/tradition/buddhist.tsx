import React, { useState } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  TouchableOpacity,
  Dimensions,
  Platform
} from 'react-native';
import { Stack, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

type BuddhistTradition = 'tibetan' | 'zen' | 'theravada' | 'pure-land';

export default function BuddhistScreen() {
  const [activeTradition, setActiveTradition] = useState<BuddhistTradition>('tibetan');
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const traditions = [
    { id: 'tibetan', label: 'Tibetan' },
    { id: 'zen', label: 'Zen' },
    { id: 'theravada', label: 'Theravada' },
    { id: 'pure-land', label: 'Pure Land' },
  ];

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: 'Buddhist Traditions',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
              <IconSymbol name="spa" size={24} color="#f4a825" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={styles.headerRight}>
              <View style={[styles.localBadge, { backgroundColor: '#dcfce7' }]}>
                <IconSymbol name="shield.lock" size={14} color="#166534" />
                <ThemedText style={styles.localText}>LOCAL</ThemedText>
              </View>
              <TouchableOpacity style={styles.headerIcon}>
                <IconSymbol name="settings" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tradition Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {traditions.map((t) => (
              <TouchableOpacity 
                key={t.id} 
                onPress={() => setActiveTradition(t.id as BuddhistTradition)}
                style={[
                  styles.tab, 
                  activeTradition === t.id && { borderBottomColor: '#f4a825' }
                ]}
              >
                <ThemedText style={[
                  styles.tabText, 
                  { color: activeTradition === t.id ? '#f4a825' : '#8a7b60' }
                ]}>
                  {t.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Mantra */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Selected Tradition</ThemedText>
          <View style={[styles.featuredCard, { backgroundColor: colorScheme === 'light' ? '#f5f3f0' : '#2d2417', borderLeftColor: '#f4a825' }]}>
            <View style={styles.featuredContent}>
              <View>
                <View style={styles.traditionTag}>
                  <ThemedText style={styles.traditionTagText}>TIBETAN BUDDHISM</ThemedText>
                </View>
                <ThemedText style={styles.featuredTitle}>Om Mani Padme Hum</ThemedText>
                <ThemedText style={styles.featuredSubtitle}>"The Jewel is in the Lotus"</ThemedText>
                <ThemedText style={styles.featuredDescription}>
                  The most common mantra in Tibet, recited to invoke the embodiment of compassion.
                </ThemedText>
              </View>
              <View style={[styles.featuredIconContainer, { backgroundColor: colorScheme === 'light' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.05)' }]}>
                <IconSymbol name="flower.fill" size={40} color="#f4a825" />
              </View>
            </View>
          </View>
        </View>

        {/* Chants List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Chants & Mantras</ThemedText>
            <ThemedText style={styles.countText}>4 Found</ThemedText>
          </View>
          
          <View style={styles.list}>
            <ChantItem 
              title="Om Mani Padme Hum" 
              subtitle="Mantra of Compassion" 
              icon="sparkles" 
              bpm="60 BPM"
              active
            />
            <ChantItem 
              title="Tayata Om Bekanze" 
              subtitle="Medicine Buddha Healing" 
              icon="heart.text.square.fill" 
            />
            <ChantItem 
              title="Om Tare Tuttare" 
              subtitle="Green Tara for Protection" 
              icon="eco" 
            />
            <ChantItem 
              title="Vajrasattva Mantra" 
              subtitle="100-Syllable Purification" 
              icon="drop.fill" 
            />
          </View>
        </View>

        {/* Practice Settings */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Practice Settings</ThemedText>
          <View style={[styles.settingsCard, { backgroundColor: colorScheme === 'light' ? '#f5f3f0' : '#2d2417' }]}>
            <View style={styles.settingsHeader}>
              <ThemedText style={styles.settingsLabel}>Auto-scroll Pace</ThemedText>
              <ThemedText style={styles.settingsValue}>60 BPM</ThemedText>
            </View>
            <View style={[styles.sliderTrack, { backgroundColor: colorScheme === 'light' ? '#e6e2db' : '#3d3221' }]}>
              <View style={[styles.sliderFill, { width: '40%', backgroundColor: '#f4a825' }]} />
              <View style={[styles.sliderThumb, { left: '40%', borderColor: '#f4a825', backgroundColor: '#fff' }]} />
            </View>
            <View style={styles.sliderLabels}>
              <ThemedText style={styles.sliderLabelText}>Meditative</ThemedText>
              <ThemedText style={styles.sliderLabelText}>Steady</ThemedText>
              <ThemedText style={styles.sliderLabelText}>Rhythmic</ThemedText>
            </View>
          </View>
        </View>

        <ThemedText style={styles.footerNote}>
          Focused Spiritual Practice • All data stored locally
        </ThemedText>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={[styles.fab, { backgroundColor: '#f4a825' }]}>
          <IconSymbol name="chevron.up.double" size={24} color="#fff" />
          <ThemedText style={styles.fabText}>Start Chanting</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

function ChantItem({ title, subtitle, icon, bpm, active = false }: any) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <TouchableOpacity style={[
      styles.chantItem,
      active && { backgroundColor: '#f4a8251A', borderColor: '#f4a82533', borderWidth: 1 }
    ]}>
      <View style={[styles.chantIconContainer, { backgroundColor: active ? '#f4a82533' : (colorScheme === 'light' ? '#f5f3f0' : '#3d3221') }]}>
        <IconSymbol name={icon} size={24} color={active ? '#f4a825' : theme.text} />
      </View>
      <View style={styles.chantContent}>
        <ThemedText style={styles.chantTitle}>{title}</ThemedText>
        <ThemedText style={styles.chantSubtitle}>{subtitle}</ThemedText>
      </View>
      <View style={styles.chantAction}>
        {bpm && <ThemedText style={styles.bpmText}>{bpm}</ThemedText>}
        <IconSymbol 
          name={active ? "checkmark.circle.fill" : "play.circle.fill"} 
          size={active ? 20 : 24} 
          color={active ? "#f4a825" : "#8a7b6080"} 
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerIcon: {
    padding: 8,
    marginLeft: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
  },
  localBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  localText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#166534',
  },
  scrollContent: {
    paddingTop: 100,
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e6e2db',
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 32,
  },
  tab: {
    paddingVertical: 16,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  featuredCard: {
    borderRadius: 16,
    padding: 24,
    borderLeftWidth: 4,
    shadowColor: '#f4a825',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  featuredContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  traditionTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#f4a8251A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  traditionTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#f4a825',
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  featuredSubtitle: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#8a7b60',
    marginTop: 4,
  },
  featuredDescription: {
    fontSize: 14,
    marginTop: 16,
    lineHeight: 20,
    maxWidth: 240,
  },
  featuredIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 12,
    color: '#8a7b60',
  },
  list: {
    gap: 8,
  },
  chantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  chantIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chantContent: {
    flex: 1,
    marginLeft: 12,
  },
  chantTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chantSubtitle: {
    fontSize: 12,
    color: '#8a7b60',
    marginTop: 2,
  },
  chantAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bpmText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#f4a825',
  },
  settingsCard: {
    padding: 16,
    borderRadius: 16,
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  settingsLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingsValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f4a825',
  },
  sliderTrack: {
    height: 8,
    borderRadius: 4,
    position: 'relative',
  },
  sliderFill: {
    height: '100%',
    borderRadius: 4,
  },
  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    top: -6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  sliderLabelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#8a7b60',
    textTransform: 'uppercase',
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#8a7b60',
    marginTop: 32,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: 'transparent',
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 64,
    borderRadius: 16,
    shadowColor: '#f4a825',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    gap: 8,
  },
  fabText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
