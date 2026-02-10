import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import type { IconSymbolName } from '@/components/ui/icon-symbol';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTradition } from '@/hooks/use-tradition';
import { useUser } from '@/hooks/use-user';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const router = useRouter();
  const { tradition } = useTradition();
  const { userName } = useUser();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerLeft: () => (
            <View style={styles.headerLeft}>
              <IconSymbol name="spa" size={28} color={theme.primary} />
              <ThemedText style={styles.headerTitleText}>PRAYER FOCUS</ThemedText>
            </View>
          ),
          headerRight: () => (
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/profile')}>
              <IconSymbol name="person" size={24} color={theme.text} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Greeting & Hero */}
        <View style={styles.section}>
          <ThemedText style={styles.greetingText}>
            Peace be with you, {'\n'}
            <ThemedText style={{ color: theme.primary, fontWeight: 'bold' }}>{userName}</ThemedText>
          </ThemedText>
          <ThemedText style={styles.subGreetingText}>Ready to find your center today?</ThemedText>
        </View>

        {/* Main Actions */}
        <View style={styles.section}>
          {tradition === 'christianity' && (
            <TraditionActionCard
              title="Daily Scripture"
              subtitle="Verse of the day"
              icon="book.fill"
              color="#3b82f6"
              onPress={() => router.push('/tradition/christian')}
            />
          )}
          {tradition === 'islam' && (
            <TraditionActionCard
              title="Qibla Compass"
              subtitle="Find Mecca & Prayer Times"
              icon="location.fill"
              color="#10b981"
              onPress={() => router.push('/tradition/qibla')}
            />
          )}
          {tradition === 'buddhism' && (
            <TraditionActionCard
              title="Chants & Mantras"
              subtitle="Meditation & Sutras"
              icon="spa"
              color="#f59e0b"
              onPress={() => router.push('/tradition/buddhist')}
            />
          )}

          <TraditionActionCard
            title="Quiet Reflection"
            subtitle="Universal mindfulness"
            icon="brain.headset"
            color="#a855f7"
            onPress={() => router.push('/tradition/general')}
          />

          <View style={styles.lastSessionContainer}>
            <IconSymbol name="hourglass" size={14} color={theme.muted} />
            <ThemedText style={styles.lastSessionText}>Last session: 12h ago</ThemedText>
          </View>
        </View>

        {/* Habit Tracker */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Your Journey
            </ThemedText>
            <View style={[styles.streakBadge, { backgroundColor: theme.surface }]}>
              <IconSymbol name="flame.fill" size={14} color="#fb923c" />
              <ThemedText style={styles.streakText}>12 Day Streak</ThemedText>
            </View>
          </View>

          <View style={styles.streakDotsContainer}>
            {[...Array(14)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.streakDot,
                  {
                    backgroundColor:
                      i < 11 ? `${theme.primary}4D` : i === 11 ? theme.primary : theme.muted + '4D',
                  },
                  i === 11 && { borderWidth: 2, borderColor: `${theme.primary}4D` },
                ]}
              />
            ))}
          </View>
          <View style={styles.streakLabels}>
            <ThemedText style={styles.smallMutedText}>14 days ago</ThemedText>
            <ThemedText style={styles.smallMutedText}>Today</ThemedText>
          </View>
        </View>

        {/* Today's Prompt */}
        <View style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Today&apos;s Prompt
          </ThemedText>
          <Card variant="accent" style={styles.promptCard}>
            <View style={styles.promptHeader}>
              <IconSymbol name="lightbulb.fill" size={20} color={theme.primary} />
              <ThemedText style={[styles.promptLabel, { color: theme.primary }]}>
                DAILY REFLECTION
              </ThemedText>
            </View>
            <ThemedText style={styles.promptText}>
              &quot;What burden can you lay down today to find more peace?&quot;
            </ThemedText>
            <TouchableOpacity
              style={[
                styles.journalButton,
                {
                  backgroundColor:
                    colorScheme === 'light' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)',
                },
              ]}
              onPress={() => {
                /* TODO: Navigate to journal or open journal modal */
              }}
            >
              <ThemedText style={styles.journalButtonText}>Journal this</ThemedText>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Favorite Templates */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Favorite Templates
            </ThemedText>
            <TouchableOpacity onPress={() => router.push('/templates')}>
              <ThemedText style={{ color: theme.primary, fontSize: 12, fontWeight: '600' }}>
                View all
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.templateScroll}
          >
            <TemplateCard
              title="Morning Office"
              subtitle="15 min • Liturgy"
              icon="spa"
              color={theme.primary}
            />
            <TemplateCard
              title="Examen"
              subtitle="10 min • Reflection"
              icon="brain.headset"
              color="#a855f7"
            />
            <TemplateCard
              title="Silent Wait"
              subtitle="20 min • Meditation"
              icon="hourglass"
              color="#14b8a6"
            />
          </ScrollView>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </ThemedView>
  );
}

function TraditionActionCard({
  title,
  subtitle,
  icon,
  color,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: IconSymbolName;
  color: string;
  onPress: () => void;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={{ marginBottom: 12 }}>
      <Card
        variant="default"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          gap: 16,
          borderWidth: 1,
          borderColor: colorScheme === 'dark' ? '#333' : '#e2e8f0',
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: `${color}1A`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconSymbol name={icon} size={24} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>
            {title}
          </ThemedText>
          <ThemedText style={{ color: theme.muted, fontSize: 14 }}>{subtitle}</ThemedText>
        </View>
        <IconSymbol name="chevron.right" size={20} color={theme.muted} />
      </Card>
    </TouchableOpacity>
  );
}

function TemplateCard({
  title,
  subtitle,
  icon,
  color,
}: {
  title: string;
  subtitle: string;
  icon: any;
  color: string;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <TouchableOpacity style={[styles.templateCard, { backgroundColor: theme.surface }]}>
      <View style={[styles.templateIconContainer, { backgroundColor: `${color}1A` }]}>
        <IconSymbol name={icon} size={20} color={color} />
      </View>
      <View>
        <ThemedText style={styles.templateTitle}>{title}</ThemedText>
        <ThemedText style={styles.templateSubtitle}>{subtitle}</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 100, // Account for transparent header
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 16,
  },
  headerTitleText: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1.2,
    color: '#64748b',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  greetingText: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 40,
  },
  subGreetingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
  },
  lastSessionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  lastSessionText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    flex: 1,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  streakText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  streakDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  streakDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  streakLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  smallMutedText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  promptCard: {
    gap: 12,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  promptLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  promptText: {
    fontSize: 20,
    fontStyle: 'italic',
    lineHeight: 28,
  },
  journalButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  journalButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  templateScroll: {
    gap: 12,
    paddingRight: 24,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 8,
    paddingRight: 20,
    paddingVertical: 8,
    borderRadius: 30,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  templateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  templateSubtitle: {
    fontSize: 10,
    color: '#64748b',
  },
});
