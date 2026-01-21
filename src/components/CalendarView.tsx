import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList } from 'react-native';
import { useTheme } from '../context/PreferencesContext';

interface CalendarViewProps {
    history: { date: string; steps: number }[];
    dailyGoal: number;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CALENDAR_WIDTH = SCREEN_WIDTH - 40; // minus padding (20 on each side)

export const CalendarView: React.FC<CalendarViewProps> = ({ history, dailyGoal }) => {
    const theme = useTheme();
    const flatListRef = useRef<FlatList>(null);

    const year = new Date().getFullYear();
    const currentMonthIndex = new Date().getMonth();

    // Only show current month and previous month (same year)
    // In January (month 0), only show January
    // In Feb+, show previous month and current month
    const months = useMemo(() => {
        if (currentMonthIndex === 0) {
            // January - only show January
            return [0];
        } else {
            // Show previous month and current month
            return [currentMonthIndex - 1, currentMonthIndex];
        }
    }, [currentMonthIndex]);

    // Default scroll position is the last item (current month)
    const defaultScrollIndex = months.length - 1;

    useEffect(() => {
        // Scroll to current month (last item) after render
        setTimeout(() => {
            flatListRef.current?.scrollToIndex({ index: defaultScrollIndex, animated: false });
        }, 100);
    }, [defaultScrollIndex]);

    const renderMonth = ({ item: monthIndex }: { item: number }) => {
        const monthName = new Date(year, monthIndex).toLocaleString('default', { month: 'long' });

        const firstDay = new Date(year, monthIndex, 1);
        const lastDay = new Date(year, monthIndex + 1, 0);

        const daysInMonth = lastDay.getDate();
        const startingDayIndex = firstDay.getDay(); // 0 = Sunday

        const grid: ({ date: number; status: 'achieved' | 'failed' | 'future' } | null)[] = [];

        // Fill empty slots for previous month padding
        for (let i = 0; i < startingDayIndex; i++) {
            grid.push(null);
        }

        const today = new Date();

        // Fill days
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

            // Check day status
            const currentDate = new Date(year, monthIndex, d);
            currentDate.setHours(23, 59, 59, 999);

            let status: 'achieved' | 'failed' | 'future' = 'future';

            if (currentDate < today) {
                // Past
                const log = history.find(h => h.date === dateStr);
                const steps = log ? log.steps : 0;
                status = steps >= dailyGoal ? 'achieved' : 'failed';
            } else if (currentDate.getDate() === today.getDate() && currentDate.getMonth() === today.getMonth()) {
                // Today
                const log = history.find(h => h.date === dateStr);
                const steps = log ? log.steps : 0;
                status = steps >= dailyGoal ? 'achieved' : 'future';
            }

            grid.push({ date: d, status });
        }

        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        return (
            <View style={{ width: CALENDAR_WIDTH, paddingHorizontal: 4 }}>
                <View style={[styles.monthCard, { backgroundColor: theme.card }]}>
                    <Text style={[styles.monthLabel, { color: theme.text }]}>{monthName} {year}</Text>

                    <View style={styles.headerRow}>
                        {weekDays.map(day => (
                            <Text key={day} style={[styles.dayLabel, { color: theme.textSecondary }]}>{day}</Text>
                        ))}
                    </View>

                    <View style={styles.grid}>
                        {grid.map((day, index) => {
                            if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />;

                            let bg = 'transparent';
                            let borderColor = 'transparent';

                            if (day.status === 'achieved') {
                                bg = 'rgba(16, 185, 129, 0.2)'; // Green tint
                                borderColor = '#10B981';
                            } else if (day.status === 'failed') {
                                bg = 'rgba(239, 68, 68, 0.1)'; // Red tint
                            }

                            return (
                                <View key={`day-${day.date}`} style={[styles.dayCell]}>
                                    <View style={[
                                        styles.dayCircle,
                                        { backgroundColor: bg, borderColor: borderColor, borderWidth: day.status === 'achieved' ? 1 : 0 }
                                    ]}>
                                        <Text style={[
                                            styles.dateText,
                                            { color: day.status === 'achieved' ? '#10B981' : (day.status === 'future' ? theme.textSecondary : theme.text) }
                                        ]}>
                                            {day.date}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    <View style={styles.legend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                            <Text style={[styles.legendText, { color: theme.textSecondary }]}>Goal Met</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={months}
                renderItem={renderMonth}
                keyExtractor={(item) => item.toString()}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                getItemLayout={(data, index) => (
                    { length: CALENDAR_WIDTH, offset: CALENDAR_WIDTH * index, index }
                )}
                initialScrollIndex={defaultScrollIndex}
                onScrollToIndexFailed={info => {
                    const wait = new Promise(resolve => setTimeout(resolve, 500));
                    wait.then(() => {
                        flatListRef.current?.scrollToIndex({ index: info.index, animated: false });
                    });
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    monthCard: {
        borderRadius: 16,
        padding: 16,
        width: '100%',
    },
    monthLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    dayLabel: {
        width: '14.28%',
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    dayCell: {
        width: '14.28%', // 100% / 7
        aspectRatio: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    dayCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 12,
        fontWeight: '600',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 12,
        gap: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: 12,
    }
});
