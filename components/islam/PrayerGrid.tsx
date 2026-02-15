
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { CrescentMoonProgress } from '@/components/crescent-moon-progress';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatTime } from '@/lib/prayer-times';

type PrayerGridProps = {
    currentPrayer?: { label: string; time: Date };
    nextPrayer?: { label: string; time: Date; timeRemaining?: string };
    progress: number;
    completedCount: number;
};

export function PrayerGrid({
    currentPrayer,
    nextPrayer,
    progress,
    completedCount,
}: PrayerGridProps) {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    return (
        <View style={styles.container}>
            {/* Current/Next Prayer Card */}
            <Card style={[styles.card, { backgroundColor: '#1e4e3c' }]}>
                <View style={styles.cardHeader}>
                    <ThemedText style={styles.nowLabel}>Now</ThemedText>
                </View>

                <View style={styles.mainContent}>
                    <ThemedText style={styles.prayerName}>
                        {currentPrayer ? currentPrayer.label : nextPrayer?.label || 'None'}
                    </ThemedText>
                    <View style={styles.weatherRow}>
                        {/* Placeholder for weather icon, using unicode for now */}
                        <ThemedText style={styles.weatherIcon}>☁️</ThemedText>
                        <ThemedText style={styles.prayerTime}>
                            {currentPrayer
                                ? formatTime(currentPrayer.time)
                                : nextPrayer
                                    ? formatTime(nextPrayer.time)
                                    : '--:--'}
                        </ThemedText>
                    </View>
                </View>

                {nextPrayer && (
                    <ThemedText style={styles.nextInfo}>
                        {nextPrayer.label} in {nextPrayer.timeRemaining || 'soon'}
                    </ThemedText>
                )}
            </Card>

            {/* Progress Card */}
            <Card style={[styles.card, { backgroundColor: '#1e4e3c', alignItems: 'center', justifyContent: 'center' }]}>
                <CrescentMoonProgress
                    progress={progress}
                    size={80}
                    color="#a7f3d0"
                    emptyColor="rgba(255,255,255,0.2)"
                />
                <View style={styles.progressTextContainer}>
                    <ThemedText style={styles.progressCount}>{completedCount}/5</ThemedText>
                    <ThemedText style={styles.progressLabel}>prayed</ThemedText>
                </View>
            </Card>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 12,
        marginHorizontal: 16,
        marginTop: 12,
    },
    card: {
        flex: 1,
        padding: 16,
        borderRadius: 20,
        minHeight: 140,
        justifyContent: 'space-between',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 4,
    },
    nowLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
    },
    mainContent: {
        alignItems: 'center',
        marginVertical: 4,
    },
    prayerName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    weatherRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 2,
    },
    weatherIcon: {
        fontSize: 18,
    },
    prayerTime: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
    },
    nextInfo: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
    },
    progressTextContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressCount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    progressLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
    },
});
