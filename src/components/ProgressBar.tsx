/**
 * File: src/components/ProgressBar.tsx
 * Purpose: Reusable progress bar component.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Documentation added.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/PreferencesContext';

interface Props {
    progress: number; // 0 to 1
    color?: string;
}

export const ProgressBar: React.FC<Props> = ({ progress, color = '#2563EB' }) => {
    const clamped = Math.min(Math.max(progress, 0), 1);
    const theme = useTheme();
    return (
        <View style={[styles.container, { backgroundColor: theme.border }]}>
            <View style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: color }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 12,
        backgroundColor: '#E5E7EB',
        borderRadius: 6,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 6,
    }
});
