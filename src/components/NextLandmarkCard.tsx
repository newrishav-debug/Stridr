/**
 * File: src/components/NextLandmarkCard.tsx
 * Purpose: Card displaying the next landmark on the trail.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Documentation added.
 */
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Landmark, Trail } from '../types';
import { useTheme } from '../context/PreferencesContext';
import { MapPin, Flag, Navigation } from 'lucide-react-native';
import { getDistanceValue, getDistanceUnit } from '../utils/conversion';
import { usePreferences } from '../context/PreferencesContext';

interface Props {
    landmark: Landmark;
    currentDistance: number;
    trailColor?: string;
}

export const NextLandmarkCard: React.FC<Props> = ({
    landmark,
    currentDistance,
    trailColor = '#3B82F6',
}) => {
    const theme = useTheme();
    const { preferences } = usePreferences();

    const distanceRemaining = Math.max(landmark.distanceMeters - currentDistance, 0);
    const distanceVal = getDistanceValue(distanceRemaining, preferences.distanceUnit);
    const unit = getDistanceUnit(preferences.distanceUnit);

    return (
        <View style={[styles.container, { backgroundColor: theme.card }]}>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: `${trailColor}20` }]}>
                    <Flag size={20} color={trailColor} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.label, { color: theme.textSecondary }]}>UP NEXT</Text>
                    <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                        {landmark.name}
                    </Text>
                </View>
            </View>

            <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
                {landmark.description}
            </Text>

            <View style={styles.footer}>
                <View style={[styles.distanceBadge, { backgroundColor: theme.background }]}>
                    <Navigation size={14} color={trailColor} />
                    <Text style={[styles.distanceText, { color: theme.text }]}>
                        {distanceVal.toFixed(1)} {unit} away
                    </Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 24,
        marginBottom: 24,
        padding: 16,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    label: {
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 2,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 16,
    },
    footer: {
        flexDirection: 'row',
    },
    distanceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        gap: 6,
    },
    distanceText: {
        fontSize: 13,
        fontWeight: '600',
    },
});
