import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { AnimatedBell } from '@/components/animated-bell';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { PrayerName } from '@/lib/prayer-times';

type PrayerListProps = {
    date: Date;
    isToday: boolean;
    onDateChange: (days: number) => void;
    prayers: { name: PrayerName; label: string; time: Date; formattedTime: string }[];
    completions: Record<PrayerName, boolean>;
    currentPrayerName: PrayerName | null;
    nextPrayerName: PrayerName | null;
    onToggle: (name: PrayerName) => void;
    activeReminders: Set<string>;
    onToggleReminder: (prayer: { name: string; label: string; time: Date }) => void;
};

export function PrayerList({
    date,
    isToday,
    onDateChange,
    prayers,
    completions,
    currentPrayerName,
    nextPrayerName,
    onToggle,
    activeReminders,
    onToggleReminder,
}: PrayerListProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    const dateLabel = isToday
        ? 'Today'
        : date.toLocaleDateString([], { month: 'short', day: 'numeric' });

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <ThemedText style={styles.dateLabel}>{dateLabel}</ThemedText>
                <View style={styles.arrows}>
                    <TouchableOpacity onPress={() => onDateChange(-1)} style={styles.arrowButton}>
                        <IconSymbol name="chevron.left" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onDateChange(1)} style={styles.arrowButton}>
                        <IconSymbol name="chevron.right" size={24} color={theme.text} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* List */}
            <View style={styles.list}>
                {prayers.map((prayer) => {
                    const isComplete = completions[prayer.name];
                    const isCurrent = currentPrayerName === prayer.name;
                    const isNext = nextPrayerName === prayer.name;

                    return (
                        <TouchableOpacity
                            key={prayer.name}
                            style={[styles.row, isCurrent && styles.currentRow, isComplete && styles.completeRow]}
                            onPress={() => onToggle(prayer.name)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.leftContent}>
                                <ThemedText style={[styles.prayerName, isCurrent && styles.currentText]}>
                                    {prayer.label}
                                </ThemedText>

                                {isComplete && (
                                    <View style={styles.checkIcon}>
                                        <IconSymbol name="checkmark" size={14} color="#ffffff" />
                                    </View>
                                )}

                                <ThemedText style={[styles.prayerTime, isCurrent && styles.currentText]}>
                                    {prayer.formattedTime}
                                </ThemedText>

                                {isCurrent && (
                                    <View style={styles.nowBadge}>
                                        <IconSymbol name="sun.max.fill" size={14} color="#fcd34d" />
                                        <ThemedText style={styles.nowText}>Now</ThemedText>
                                    </View>
                                )}
                            </View>

                            <View style={styles.rightContent}>
                                <AnimatedBell
                                    size={20}
                                    isActive={false} // TODO: Hook up real reminder check logic passed from parent properly
                                    activeColor="#fbbf24"
                                    color={isCurrent ? '#ffffff' : theme.icon}
                                    onPress={() => onToggleReminder(prayer)}
                                />
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Dua Card */}
            <Card style={styles.duaCard}>
                <View style={styles.duaHeader}>
                    <IconSymbol name="moon.stars" size={20} color="#cbd5e1" style={{ marginRight: 8 }} />
                    <ThemedText style={styles.duaText} numberOfLines={1}>
                        Dua of the day: Remove fear from Heart...
                    </ThemedText>
                </View>
                <ThemedText style={styles.duaSubText}>Isyak</ThemedText>
            </Card>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        marginTop: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    dateLabel: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    arrows: {
        flexDirection: 'row',
        gap: 16,
    },
    arrowButton: {
        padding: 4,
    },
    list: {
        gap: 12,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 16,
        backgroundColor: 'rgba(30, 41, 59, 0.5)', // Dark transparent background
    },
    currentRow: {
        backgroundColor: '#1e4e3c', // Green highlight
        borderWidth: 1,
        borderColor: '#4ade80',
    },
    completeRow: {
        opacity: 0.8,
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    prayerName: {
        fontSize: 16,
        fontWeight: 'bold',
        minWidth: 60,
    },
    prayerTime: {
        fontSize: 16,
        fontFamily: 'monospace', // To align times better
    },
    currentText: {
        color: '#ffffff',
    },
    checkIcon: {
        backgroundColor: '#22c55e',
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nowBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 8,
    },
    nowText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#fcd34d',
    },
    rightContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    duaCard: {
        marginTop: 24,
        backgroundColor: '#1e293b',
        padding: 16,
        borderRadius: 16,
    },
    duaHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    duaText: {
        fontSize: 14,
        color: '#e2e8f0',
        flex: 1,
    },
    duaSubText: {
        fontSize: 14,
        color: '#94a3b8',
        fontWeight: 'bold',
        marginLeft: 28, // Align with text start
    },
});
