/**
 * File: app/trail/[id].tsx
 * Purpose: Detail screen for a specific trail, including map and stats.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Documentation added.
 */
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Alert, Linking, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TRAILS } from '../../src/const/trails';
import { useGame } from '../../src/context/GameContext';
import { usePreferences, useTheme } from '../../src/context/PreferencesContext';
import { getDistanceValue, getDistanceUnit } from '../../src/utils/conversion';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, MapPin, Clock, Mountain, Award, Navigation } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function TrailDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { selectTrail, progress } = useGame();
    const { preferences } = usePreferences();
    const theme = useTheme();

    const trail = TRAILS.find(t => t.id === id);

    if (!trail) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <Text style={[styles.errorText, { color: theme.textSecondary }]}>Trail not found</Text>
            </View>
        );
    }

    const isActive = progress?.selectedTrailId === trail.id;

    // Calculate estimated completion time based on difficulty and terrain
    const getEstimatedTime = () => {
        const distanceKm = trail.totalDistanceMeters / 1000;

        // Adjust pace based on difficulty (realistic hiking speeds)
        let paceKmPerHour;
        switch (trail.difficulty) {
            case 'Easy':
                paceKmPerHour = 4; // Flat, well-maintained trails
                break;
            case 'Moderate':
                paceKmPerHour = 3; // Some elevation, rough terrain
                break;
            case 'Hard':
                paceKmPerHour = 2.5; // Significant elevation, challenging terrain
                break;
            case 'Extreme':
                paceKmPerHour = 2; // Very steep, technical, high elevation
                break;
            default:
                paceKmPerHour = 3.5;
        }

        const hours = distanceKm / paceKmPerHour;

        if (hours < 1) {
            return `${Math.round(hours * 60)} min`;
        } else if (hours < 24) {
            const wholeHours = Math.floor(hours);
            const minutes = Math.round((hours - wholeHours) * 60);
            if (minutes === 0) {
                return `${wholeHours} hr`;
            }
            return `${wholeHours} hr ${minutes} min`;
        } else {
            const days = Math.floor(hours / 24);
            const remainingHours = Math.round(hours % 24);
            return `${days} day${days > 1 ? 's' : ''}${remainingHours > 0 ? ` ${remainingHours}h` : ''}`;
        }
    };



    const handleStartTrail = () => {
        const hasActiveTrail = progress?.selectedTrailId && progress.selectedTrailId !== trail.id;

        if (hasActiveTrail) {
            // Show warning when switching trails
            Alert.alert(
                '⚠️ Switch Trail?',
                'Switching trails will reset your progress. You will lose all historical data and only today\'s steps will count towards the new trail.\n\nAre you sure you want to switch?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Switch Trail',
                        style: 'destructive',
                        onPress: () => showGoalPrompt()
                    }
                ]
            );
        } else {
            // No active trail, proceed directly
            showGoalPrompt();
        }
    };

    const showGoalPrompt = () => {
        Alert.prompt(
            'Set Your Goal',
            'How many days would you like to complete this trail?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Start',
                    onPress: (days?: string) => {
                        const numDays = parseInt(days || '7', 10);
                        if (numDays > 0) {
                            selectTrail(trail.id, numDays);
                            router.back();
                        }
                    }
                }
            ],
            'plain-text',
            '7'
        );
    };

    const handleViewProgress = () => {
        router.push('/(tabs)');
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Back Button */}
            <TouchableOpacity
                style={[styles.backButton, { backgroundColor: theme.card }]}
                onPress={() => router.back()}
            >
                <ArrowLeft size={24} color={theme.text} />
            </TouchableOpacity>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={styles.header}>
                    {isActive && (
                        <View style={styles.activeBadge}>
                            <Text style={styles.activeBadgeText}>ACTIVE TRAIL</Text>
                        </View>
                    )}
                    <Text style={[styles.trailName, { color: theme.text }]}>{trail.name}</Text>
                    <View style={[styles.difficultyBadge, { backgroundColor: theme.backgroundTertiary }]}>
                        <Text style={[styles.difficultyText, { color: theme.text }]}>{trail.difficulty}</Text>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={[styles.description, { color: theme.textSecondary }]}>{trail.description}</Text>
                    {trail.extendedDescription && (
                        <Text style={[styles.extendedDescription, { color: theme.textSecondary }]}>{trail.extendedDescription}</Text>
                    )}
                </View>

                {/* Statistics Grid */}
                <View style={styles.statsSection}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Trail Details</Text>
                    <View style={styles.statsGrid}>
                        <View style={[styles.statCard, { backgroundColor: trail.color + '15' }]}>
                            <View style={[styles.statIcon, { backgroundColor: trail.color }]}>
                                <MapPin size={20} color="white" />
                            </View>
                            <Text style={[styles.statValue, { color: theme.text }]}>
                                {getDistanceValue(trail.totalDistanceMeters, preferences.distanceUnit).toFixed(1)} {getDistanceUnit(preferences.distanceUnit)}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Distance</Text>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: trail.color + '15' }]}>
                            <View style={[styles.statIcon, { backgroundColor: trail.color }]}>
                                <Mountain size={20} color="white" />
                            </View>
                            <Text style={[styles.statValue, { color: theme.text }]}>{trail.landmarks.length}</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Landmarks</Text>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: trail.color + '15' }]}>
                            <View style={[styles.statIcon, { backgroundColor: trail.color }]}>
                                <Award size={20} color="white" />
                            </View>
                            <Text style={[styles.statValue, { color: theme.text }]}>{trail.difficulty}</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Difficulty</Text>
                        </View>

                        <View style={[styles.statCard, { backgroundColor: trail.color + '15' }]}>
                            <View style={[styles.statIcon, { backgroundColor: trail.color }]}>
                                <Clock size={20} color="white" />
                            </View>
                            <Text style={[styles.statValue, { color: theme.text }]}>{getEstimatedTime()}</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Est. Time</Text>
                        </View>
                    </View>

                    {/* Time Estimate Disclaimer */}
                    <Text style={[styles.disclaimer, { color: theme.textTertiary }]}>
                        * Times are estimates. Actual duration varies based on fitness level, weather conditions, and trail difficulty.
                    </Text>
                </View>

                {/* Landmarks Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Trail Milestones</Text>
                    <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                        {trail.landmarks.length} landmarks along your journey
                    </Text>

                    <View style={styles.landmarksContainer}>
                        {trail.landmarks.map((landmark, index) => {
                            const isUnlocked = isActive &&
                                progress?.currentDistanceMeters >= landmark.distanceMeters;

                            return (
                                <View key={landmark.id} style={styles.landmarkItem}>
                                    {/* Connection Line */}
                                    {index < trail.landmarks.length - 1 && (
                                        <View style={[
                                            styles.connectionLine,
                                            { backgroundColor: isUnlocked ? '#10B981' : theme.border }
                                        ]} />
                                    )}

                                    {/* Milestone Marker */}
                                    <View style={[
                                        styles.landmarkMarker,
                                        { borderColor: trail.color, backgroundColor: isUnlocked ? trail.color : theme.card },
                                    ]}>
                                        <Text style={[
                                            styles.landmarkNumber,
                                            { color: isUnlocked ? 'white' : theme.textSecondary }
                                        ]}>
                                            {index + 1}
                                        </Text>
                                    </View>

                                    {/* Landmark Info */}
                                    <View style={styles.landmarkContent}>
                                        <Text style={[styles.landmarkName, { color: theme.text }]}>{landmark.name}</Text>
                                        <Text style={[styles.landmarkDescription, { color: theme.textSecondary }]}>
                                            {landmark.description}
                                        </Text>
                                        <Text style={[styles.landmarkDistance, { color: theme.textTertiary }]}>
                                            {getDistanceValue(landmark.distanceMeters, preferences.distanceUnit).toFixed(2)} {getDistanceUnit(preferences.distanceUnit)}
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Bottom Spacing */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Fixed Action Button */}
            <View style={[styles.actionButtonContainer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: trail.color }]}
                    onPress={isActive ? handleViewProgress : handleStartTrail}
                    activeOpacity={0.9}
                >
                    <Text style={styles.actionButtonText}>
                        {isActive ? 'View Progress' : 'Start This Trail'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    errorText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 100,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: 'white',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        zIndex: 10,
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 16,
    },
    activeBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#10B981',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        marginBottom: 12,
    },
    activeBadgeText: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    trailName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
    },
    difficultyBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    difficultyText: {
        color: '#111827',
        fontSize: 12,
        fontWeight: 'bold',
    },
    section: {
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#4B5563',
        marginBottom: 12,
    },
    extendedDescription: {
        fontSize: 15,
        lineHeight: 22,
        color: '#6B7280',
        fontStyle: 'italic',
    },

    statsSection: {
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        width: (SCREEN_WIDTH - 72) / 2,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    landmarksContainer: {
        marginTop: 8,
    },
    landmarkItem: {
        flexDirection: 'row',
        marginBottom: 24,
        position: 'relative',
    },
    connectionLine: {
        position: 'absolute',
        left: 19,
        top: 40,
        width: 2,
        height: '100%',
        backgroundColor: '#E5E7EB',
    },
    connectionLineUnlocked: {
        backgroundColor: '#10B981',
    },
    landmarkMarker: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 3,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    landmarkNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#6B7280',
    },
    landmarkNumberUnlocked: {
        color: 'white',
    },
    landmarkContent: {
        flex: 1,
        marginLeft: 16,
    },
    landmarkName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    landmarkDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: 4,
    },
    landmarkDistance: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    disclaimer: {
        fontSize: 12,
        color: '#9CA3AF',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 12,
        paddingHorizontal: 24,
    },
    actionButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    actionButton: {
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    actionButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
