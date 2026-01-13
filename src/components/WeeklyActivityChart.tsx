/**
 * File: src/components/WeeklyActivityChart.tsx
 * Purpose: Bar chart visualization for weekly step history.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Documentation added.
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../context/PreferencesContext';

interface DayData {
    date: string;
    steps: number;
}

interface Props {
    data: DayData[];
    height?: number;
    barColor?: string;
    showValues?: boolean;
    formatDate?: (date: string) => string;
    title?: string;
    containerStyle?: ViewStyle;
}

export const WeeklyActivityChart: React.FC<Props> = ({
    data,
    height = 120,
    barColor = '#3B82F6',
    showValues = false,
    formatDate,
    title = 'Weekly Activity',
    containerStyle,
}) => {
    const theme = useTheme();
    const maxSteps = Math.max(...data.map(d => d.steps), 100); // Scale relative to at least 100 (avoid 0)

    const getDayLabel = (dateStr: string) => {
        if (formatDate) return formatDate(dateStr);

        const date = new Date(dateStr);
        const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        return dayNames[date.getUTCDay()];
    };

    return (
        <View style={[styles.container, { height, backgroundColor: theme.card }, containerStyle]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.text }]}>Last 7 Days</Text>
            </View>

            <View style={styles.chartArea}>
                {data.map((item, index) => {
                    const progress = item.steps / maxSteps;
                    const isToday = index === data.length - 1;

                    return (
                        <View key={item.date} style={styles.column}>
                            {showValues && (
                                <Text style={[styles.valueLabel, { color: theme.textSecondary }]}>
                                    {item.steps >= 1000 ? (item.steps / 1000).toFixed(1) + 'k' : item.steps}
                                </Text>
                            )}
                            {/* Bar Track */}
                            <View style={styles.barTrack}>
                                <View
                                    style={[
                                        styles.bar,
                                        {
                                            height: `${Math.max(progress * 100, 5)}%`,
                                            backgroundColor: barColor
                                        }
                                    ]}
                                />
                            </View>
                            <Text style={[styles.label, { color: theme.textTertiary }]}>
                                {getDayLabel(item.date)}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        borderRadius: 20,
        marginHorizontal: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 12,
    },
    chartArea: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    column: {
        alignItems: 'center',
        flex: 1,
        height: '100%',
        justifyContent: 'flex-end',
        gap: 8,
    },
    valueLabel: {
        fontSize: 9,
        fontWeight: '600',
        marginBottom: 4,
    },
    barTrack: {
        width: 8,
        flex: 1,
        backgroundColor: 'transparent',
        justifyContent: 'flex-end',
        borderRadius: 4,
    },
    bar: {
        width: '100%',
        borderRadius: 4,
        minHeight: 4, // Always show a little pill
    },
    label: {
        fontSize: 10,
        fontWeight: '600',
    },
});
