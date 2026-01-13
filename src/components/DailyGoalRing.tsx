/**
 * File: src/components/DailyGoalRing.tsx
 * Purpose: Circular progress indicator for daily step goals.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Documentation added.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useTheme } from '../context/PreferencesContext';

interface Props {
    current: number;
    target?: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
}

export const DailyGoalRing: React.FC<Props> = ({
    current,
    target = 10000,
    size = 140,
    strokeWidth = 12,
    color = '#3B82F6',
}) => {
    const theme = useTheme();
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(Math.max(current / target, 0), 1);
    const strokeDashoffset = circumference - progress * circumference;

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <View style={{ transform: [{ rotate: '-90deg' }] }}>
                <Svg width={size} height={size}>
                    <G>
                        {/* Background Track */}
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={theme.border}
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            opacity={0.3}
                        />
                        {/* Progress Circle */}
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={color}
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                        />
                    </G>
                </Svg>
            </View>

            {/* Center Content */}
            <View style={[styles.content, { width: size, height: size }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Today</Text>
                <Text style={[styles.value, { color: theme.text }]}>
                    {current >= 1000 ? `${(current / 1000).toFixed(1)}k` : current}
                </Text>
                <Text style={[styles.subValue, { color: theme.textSecondary }]}>
                    / {(target / 1000).toFixed(0)}k
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 2,
    },
    value: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    subValue: {
        fontSize: 10,
    },
});
