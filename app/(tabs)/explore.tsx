import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Dimensions } from 'react-native';
import { Stack } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

export default function JournalScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

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
                <IconSymbol name="chevron.left" size={24} color={theme.text} />
              </TouchableOpacity>
              <ThemedText style={styles.headerTitleText}>History & Progress</ThemedText>
            </View>
          ),
          headerRight: () => (
            <TouchableOpacity style={styles.exportButton}>
              <ThemedText style={{ color: theme.primary, fontWeight: '600' }}>Export</ThemedText>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Weekly Progress Title */}
        <View style={styles.sectionHeader}>
          <ThemedText type="title" style={styles.sectionTitle}>
            Weekly Progress
          </ThemedText>
          <ThemedText style={styles.dateRangeText}>Oct 24 - Oct 30</ThemedText>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard title="Sessions" value="12" trend="+20%" icon="calendar" bgIcon="spa" />
          <StatCard
            title="Minutes"
            value="340"
            unit="m"
            trend="+15%"
            icon="timer"
            bgIcon="hourglass"
          />
          <Card style={styles.fullWidthStatCard}>
            <View style={styles.focusHeader}>
              <View>
                <View style={styles.focusLabelRow}>
                  <ThemedText style={styles.statLabel}>Avg. Focus</ThemedText>
                  <View style={styles.focusTrendBadge}>
                    <ThemedText style={styles.focusTrendText}>+0.5%</ThemedText>
                  </View>
                </View>
                <View style={styles.focusValueRow}>
                  <ThemedText style={styles.statValue}>4.5</ThemedText>
                  <View style={styles.starsRow}>
                    <IconSymbol name="star.fill" size={16} color="#fbbf24" />
                    <IconSymbol name="star.fill" size={16} color="#fbbf24" />
                    <IconSymbol name="star.fill" size={16} color="#fbbf24" />
                    <IconSymbol name="star.fill" size={16} color="#fbbf24" />
                    <IconSymbol name="star.leadinghalf.filled" size={16} color="#fbbf24" />
                  </View>
                </View>
              </View>
              {/* Mini Chart Visualization */}
              <View style={styles.miniChart}>
                <View style={[styles.chartBar, { height: '40%', opacity: 0.2 }]} />
                <View style={[styles.chartBar, { height: '60%', opacity: 0.3 }]} />
                <View style={[styles.chartBar, { height: '50%', opacity: 0.5 }]} />
                <View style={[styles.chartBar, { height: '80%', opacity: 0.7 }]} />
                <View style={[styles.chartBar, { height: '70%', opacity: 1.0 }]} />
              </View>
            </View>
          </Card>
        </View>

        {/* Recent Sessions */}
        <View style={styles.recentHeader}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitleSmall}>
            Recent Sessions
          </ThemedText>
        </View>

        <View style={styles.sessionList}>
          <SessionItem
            title="Today, 6:00 AM"
            type="Hesychasm"
            duration="20 min"
            icon="twilight"
            color={theme.primary}
            rating={5}
          />
          <SessionItem
            title="Yesterday, 8:30 PM"
            type="Rosary"
            duration="15 min"
            icon="moon.fill"
            color="#475569"
            rating={4}
          />
          <SessionItem
            title="Mon, Oct 24"
            type="Centering Prayer"
            duration="10 min"
            icon="brain.headset"
            color="#6366f1"
            rating={3}
          />
        </View>

        {/* Privacy Footer */}
        <View style={styles.footer}>
          <IconSymbol name="shield.lock" size={14} color={theme.muted} />
          <ThemedText style={styles.footerText}>
            Your data is stored securely on this device only.
          </ThemedText>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ThemedView>
  );
}

function StatCard({ title, value, unit, trend, icon, bgIcon }: any) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <Card style={styles.statCard}>
      <View style={styles.bgIconContainer}>
        <IconSymbol name={bgIcon} size={40} color={theme.primary} style={{ opacity: 0.05 }} />
      </View>
      <View style={styles.statHeader}>
        <View style={[styles.statIconContainer, { backgroundColor: `${theme.primary}1A` }]}>
          <IconSymbol name={icon} size={16} color={theme.primary} />
        </View>
        <ThemedText style={styles.statLabel}>{title}</ThemedText>
      </View>
      <View style={styles.statValueContainer}>
        <ThemedText style={styles.statValue}>{value}</ThemedText>
        {unit && <ThemedText style={styles.statUnit}>{unit}</ThemedText>}
        <View style={styles.trendRow}>
          <IconSymbol name="arrow.up" size={10} color="#10b981" />
          <ThemedText style={styles.trendText}>{trend}</ThemedText>
        </View>
      </View>
    </Card>
  );
}

function SessionItem({ title, type, duration, icon, color, rating }: any) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <TouchableOpacity style={[styles.sessionItem, { backgroundColor: theme.surface }]}>
      <View style={[styles.sessionIconContainer, { backgroundColor: color }]}>
        <IconSymbol name={icon} size={24} color="#fff" />
      </View>
      <View style={styles.sessionContent}>
        <View style={styles.sessionTitleRow}>
          <ThemedText style={styles.sessionTitle}>{title}</ThemedText>
          <View style={styles.starsRow}>
            {[...Array(5)].map((_, i) => (
              <IconSymbol
                key={i}
                name="star.fill"
                size={12}
                color={i < rating ? '#fbbf24' : theme.muted + '4D'}
              />
            ))}
          </View>
        </View>
        <View style={styles.sessionMetaRow}>
          <View style={[styles.typeBadge, { backgroundColor: `${theme.primary}1A` }]}>
            <ThemedText style={styles.typeBadgeText}>{type}</ThemedText>
          </View>
          <ThemedText style={styles.dot}>•</ThemedText>
          <ThemedText style={styles.durationText}>{duration}</ThemedText>
        </View>
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
    paddingHorizontal: 20,
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
  exportButton: {
    marginRight: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  dateRangeText: {
    fontSize: 12,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    width: (width - 52) / 2,
    padding: 16,
    height: 120,
  },
  fullWidthStatCard: {
    width: '100%',
    padding: 20,
  },
  bgIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  statUnit: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 4,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    marginBottom: 4,
  },
  trendText: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: 'bold',
    marginLeft: 2,
  },
  focusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  focusLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  focusTrendBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  focusTrendText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: 'bold',
  },
  focusValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 40,
    width: 80,
  },
  chartBar: {
    flex: 1,
    backgroundColor: '#1152d4',
    borderRadius: 2,
  },
  recentHeader: {
    marginBottom: 12,
  },
  sectionTitleSmall: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sessionList: {
    gap: 12,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  sessionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionContent: {
    flex: 1,
    marginLeft: 12,
    gap: 4,
  },
  sessionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  sessionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1152d4',
    textTransform: 'uppercase',
  },
  dot: {
    color: '#94a3b8',
    fontSize: 10,
  },
  durationText: {
    fontSize: 13,
    color: '#64748b',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    opacity: 0.6,
  },
  footerText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
});
