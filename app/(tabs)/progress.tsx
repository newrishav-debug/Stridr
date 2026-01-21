/**
 * File: app/(tabs)/progress.tsx
 * Purpose: Screen showing detailed progress for the active trail.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Documentation added.
 */
import { View, Text, StyleSheet, Animated, Dimensions, ScrollView, RefreshControl, Image, TouchableOpacity, Alert } from 'react-native';
import { useGame } from '../../src/context/GameContext';
import { useAuth } from '../../src/context/AuthContext';
import { TRAILS } from '../../src/const/trails';
import { ProgressBar } from '../../src/components/ProgressBar';
import { GoalPromptModal } from '../../src/components/GoalPromptModal';
import { metersToKm } from '../../src/utils/conversion';
import { useState, useRef, useEffect, useCallback } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StepService } from '../../src/services/StepService';
import { useTheme, usePreferences } from '../../src/context/PreferencesContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { WeeklyActivityChart } from '../../src/components/WeeklyActivityChart';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const PLACEHOLDER_IMG = { uri: 'https://via.placeholder.com/400x300' };

// Helper: Check if milestone just reached
const getMilestoneReached = (prevPercent: number, currPercent: number) => {
    const milestones = [0.25, 0.5, 0.75, 1.0];
    for (const milestone of milestones) {
        if (prevPercent < milestone && currPercent >= milestone) {
            return milestone;
        }
    }
    return null;
};

export default function ProgressScreen() {
    const { progress, todaySteps, sync, extendTrail } = useGame();
    const { user } = useAuth();
    const theme = useTheme();
    const { preferences } = usePreferences();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [extendModalVisible, setExtendModalVisible] = useState(false);
    const [history, setHistory] = useState<{ date: string; steps: number }[]>([]);
    const [showCelebration, setShowCelebration] = useState(false);
    const [celebrationMessage, setCelebrationMessage] = useState('');
    const celebrationSlide = useRef(new Animated.Value(-200)).current;

    // Track previous completion for milestone detection
    const prevCompletion = useRef(0);

    const activeTrail = TRAILS.find(t => t.id === progress?.selectedTrailId);

    // Sync and refresh history when screen gains focus
    useFocusEffect(
        useCallback(() => {
            const refreshData = async () => {
                await sync(); // Sync latest steps
                await loadHistory(); // Reload history
            };
            refreshData();
        }, [sync, progress?.trailStartDate])
    );

    useEffect(() => {
        loadHistory();
    }, [progress?.trailStartDate]);

    const loadHistory = async () => {
        const data = await StepService.getDailyHistory(7);
        if (progress?.trailStartDate) {
            const startDateStr = progress.trailStartDate.split('T')[0];
            const filteredData = data.filter(d => d.date >= startDateStr);
            setHistory(filteredData);
        } else {
            setHistory(data);
        }
    };

    const dismissCelebration = () => {
        Animated.timing(celebrationSlide, {
            toValue: -200,
            duration: 300,
            useNativeDriver: true
        }).start(() => setShowCelebration(false));
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await sync();
        await loadHistory();
        setRefreshing(false);
    };

    // Milestone celebration detection
    useEffect(() => {
        if (!activeTrail || !progress) return;

        const currentPercent = progress.currentDistanceMeters / activeTrail.totalDistanceMeters;
        const milestone = getMilestoneReached(prevCompletion.current, currentPercent);

        if (milestone) {
            const percentDisplay = Math.round(milestone * 100);
            setCelebrationMessage(`🎉 ${percentDisplay}% Complete!`);
            setShowCelebration(true);

            // Slide in animation
            Animated.spring(celebrationSlide, {
                toValue: 70,
                useNativeDriver: true,
                damping: 15,
                stiffness: 150
            }).start();

            // Auto-hide after 4 seconds
            setTimeout(() => dismissCelebration(), 4000);
        }

        prevCompletion.current = currentPercent;
    }, [progress?.currentDistanceMeters, activeTrail]);

    if (progress === null) return null;

    if (!activeTrail) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={{ padding: 24, flex: 1, justifyContent: 'center' }}>
                    <TouchableOpacity
                        style={[styles.card, { height: 280, padding: 0, overflow: 'hidden', borderWidth: 0 }]}
                        onPress={() => router.push('/(tabs)/trails')}
                        activeOpacity={0.9}
                    >
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=2070&auto=format&fit=crop' }}
                            style={styles.bannerImage}
                            resizeMode="cover"
                        />
                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                            style={styles.bannerGradient}
                        />
                        <View style={styles.bannerContent}>
                            <Text style={styles.bannerTitle}>Start New Adventure</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, marginBottom: 16, lineHeight: 24 }}>
                                You don't have an active trail. Select a destination to track your progress and unlock achievements.
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, alignSelf: 'flex-start' }}>
                                <Text style={{ color: '#2563EB', fontWeight: 'bold', fontSize: 14 }}>Explore Trails</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const completionPercent = progress.currentDistanceMeters / activeTrail.totalDistanceMeters;
    const distanceKm = metersToKm(progress.currentDistanceMeters).toFixed(2);
    const totalKm = metersToKm(activeTrail.totalDistanceMeters).toFixed(0);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.primary}
                    />
                }
            >
                {/* Image Banner */}
                <View style={styles.bannerContainer}>
                    <Image
                        source={activeTrail.image || PLACEHOLDER_IMG}
                        style={styles.bannerImage}
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        style={styles.bannerGradient}
                    />
                    <View style={styles.bannerContent}>
                        <Text style={styles.bannerTitle}>{activeTrail.name}</Text>
                        <Text style={styles.bannerSubtitle}>{activeTrail.description}</Text>
                    </View>
                </View>

                {/* Content Section */}
                <View style={[styles.content, { backgroundColor: theme.background }]}>
                    {/* Progress Section */}
                    <View style={[styles.card, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                        <View style={styles.rowBetween}>
                            <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>Your Progress</Text>
                            <Text style={[styles.percentBig, { color: theme.text }]}>{(completionPercent * 100).toFixed(0)}%</Text>
                        </View>
                        <Text style={[styles.distanceText, { color: theme.text }]}>
                            {distanceKm} km of {totalKm} km
                        </Text>
                        <View style={{ height: 16 }} />
                        <ProgressBar progress={completionPercent} color={activeTrail.color} />
                    </View>

                    {/* End Date Section */}
                    <View style={[styles.card, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                        <View style={styles.endDateHeader}>
                            <Text style={[styles.endDateTitle, { color: theme.text }]}>Trail Timeline</Text>
                            <TouchableOpacity
                                style={[styles.extendButton, { backgroundColor: activeTrail.color }]}
                                onPress={() => setExtendModalVisible(true)}
                            >
                                <Text style={styles.extendButtonText}>Extend</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.dateRow}>
                            <Text style={[styles.dateLabel, { color: theme.textSecondary }]}>Start Date</Text>
                            <Text style={[styles.dateValue, { color: theme.text }]}>
                                {new Date(progress.trailStartDate!).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </Text>
                        </View>

                        <View style={styles.dateRow}>
                            <Text style={[styles.dateLabel, { color: theme.textSecondary }]}>End Date</Text>
                            <Text style={[styles.dateValue, { color: theme.text }]}>
                                {(() => {
                                    const startDate = new Date(progress.trailStartDate!);
                                    const endDate = new Date(startDate);
                                    endDate.setDate(startDate.getDate() + progress.targetDays);
                                    return endDate.toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    });
                                })()}
                            </Text>
                        </View>

                        <View style={styles.dateRow}>
                            <Text style={[styles.dateLabel, { color: theme.textSecondary }]}>Est End Date</Text>
                            <Text style={[styles.dateValue, { color: activeTrail.color, fontWeight: '700' }]}>
                                {(() => {
                                    const daysSinceStart = Math.max(1, Math.floor(
                                        (new Date().getTime() - new Date(progress.trailStartDate!).getTime()) / (1000 * 60 * 60 * 24)
                                    ));
                                    const avgStepsPerDay = progress.totalStepsValid / daysSinceStart;
                                    const remainingDistance = activeTrail.totalDistanceMeters - progress.currentDistanceMeters;
                                    const stepsPerMeter = progress.totalStepsValid / Math.max(1, progress.currentDistanceMeters);
                                    const remainingSteps = remainingDistance * stepsPerMeter;
                                    const daysRemaining = Math.max(1, Math.ceil(remainingSteps / Math.max(1, avgStepsPerDay)));

                                    const estimatedEndDate = new Date();
                                    estimatedEndDate.setDate(estimatedEndDate.getDate() + daysRemaining);

                                    return estimatedEndDate.toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    });
                                })()}
                            </Text>
                        </View>

                        <View style={[styles.divider, { backgroundColor: theme.divider }]} />

                        <View style={styles.dateRow}>
                            <Text style={[styles.dateLabel, { color: theme.textSecondary }]}>Avg Steps to Complete</Text>
                            <Text style={[styles.dateValue, { color: activeTrail.color, fontWeight: '700' }]}>
                                {(() => {
                                    const startDate = new Date(progress.trailStartDate!);
                                    const endDate = new Date(startDate);
                                    endDate.setDate(startDate.getDate() + progress.targetDays);

                                    const daysRemaining = Math.max(1, Math.ceil(
                                        (endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                                    ));

                                    const remainingDistance = activeTrail.totalDistanceMeters - progress.currentDistanceMeters;
                                    const stepsPerMeter = progress.totalStepsValid / Math.max(1, progress.currentDistanceMeters);
                                    const remainingSteps = remainingDistance * stepsPerMeter;
                                    const avgStepsNeeded = Math.max(0, Math.ceil(remainingSteps / daysRemaining));

                                    return avgStepsNeeded.toLocaleString();
                                })()}
                            </Text>
                        </View>

                        <Text style={[styles.estimateNote, { color: theme.textSecondary }]}>
                            Daily steps needed to finish by target date
                        </Text>
                    </View>

                    {/* Stats Grid */}
                    {/* Stats Grid */}
                    <View style={[styles.card, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={[styles.statVal, { color: theme.text }]}>{todaySteps.toLocaleString()}</Text>
                                <Text style={[styles.statLab, { color: theme.textSecondary }]}>Steps Today</Text>
                            </View>

                            <View style={[styles.verticalDivider, { backgroundColor: theme.border }]} />

                            <View style={styles.statItem}>
                                <Text style={[styles.statVal, { color: theme.text }]}>{progress.totalStepsValid?.toLocaleString() || 0}</Text>
                                <Text style={[styles.statLab, { color: theme.textSecondary }]}>Total Steps</Text>
                            </View>

                            <View style={[styles.verticalDivider, { backgroundColor: theme.border }]} />

                            <View style={styles.statItem}>
                                <Text style={[styles.statVal, { color: theme.text }]}>
                                    {(() => {
                                        const daysSinceStart = Math.floor(
                                            (new Date().getTime() - new Date(progress.trailStartDate!).getTime()) / (1000 * 60 * 60 * 24)
                                        ) + 1;
                                        const avgSteps = Math.round(progress.totalStepsValid / Math.max(1, daysSinceStart));
                                        return avgSteps.toLocaleString();
                                    })()}
                                </Text>
                                <Text style={[styles.statLab, { color: theme.textSecondary }]}>Avg Steps</Text>
                            </View>
                        </View>
                    </View>

                    {/* Activity Chart */}
                    <View style={[styles.card, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>Trail Activity</Text>
                        <WeeklyActivityChart
                            data={history}
                            barColor="#F97316"
                            showValues={true}
                            height={160}
                            title=""
                            containerStyle={{
                                marginHorizontal: 0,
                                marginBottom: 0,
                                padding: 0,
                                backgroundColor: 'transparent',
                                shadowOpacity: 0,
                                elevation: 0,
                            }}
                            formatDate={(dateStr) => {
                                const d = new Date(dateStr);
                                return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                            }}
                        />
                    </View>

                    {/* Trail Progress Section */}
                    <View style={[styles.card, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                        <Text style={[styles.cardTitle, { color: theme.text }]}>Trail Progress</Text>
                        <View style={styles.landmarksTimeline}>
                            {activeTrail.landmarks.map((landmark, index) => {
                                const isPassed = progress.currentDistanceMeters >= landmark.distanceMeters;
                                const distance = isPassed
                                    ? 0
                                    : landmark.distanceMeters - progress.currentDistanceMeters;
                                const isLast = index === activeTrail.landmarks.length - 1;

                                return (
                                    <View key={landmark.id} style={styles.timelineItem}>
                                        {/* Timeline Line */}
                                        {!isLast && (
                                            <View style={[
                                                styles.timelineLine,
                                                { backgroundColor: isPassed ? activeTrail.color : theme.border }
                                            ]} />
                                        )}

                                        {/* Landmark Marker */}
                                        <View style={[
                                            styles.timelineMarker,
                                            {
                                                backgroundColor: isPassed ? activeTrail.color : theme.backgroundSecondary,
                                                borderColor: isPassed ? activeTrail.color : theme.border,
                                            }
                                        ]}>
                                            {isPassed && <View style={styles.markerCheck} />}
                                        </View>

                                        {/* Landmark Content */}
                                        <View style={[styles.timelineContent, { opacity: isPassed ? 0.7 : 1 }]}>
                                            <View style={styles.landmarkHeader}>
                                                <Text style={[
                                                    styles.landmarkName,
                                                    { color: theme.text },
                                                    isPassed && styles.landmarkPassed
                                                ]}>
                                                    {landmark.name}
                                                </Text>
                                                {isPassed ? (
                                                    <Text style={[styles.statusBadge, { color: '#10B981' }]}>✓ Completed</Text>
                                                ) : (
                                                    <Text style={[styles.landmarkDistNum, { color: activeTrail.color }]}>
                                                        {metersToKm(distance).toFixed(1)} km
                                                    </Text>
                                                )}
                                            </View>
                                            <Text style={[styles.landmarkDesc, { color: theme.textSecondary }]}>
                                                {landmark.description}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    {/* Bottom Padding */}
                    <View style={{ height: 120 }} />
                </View>
            </ScrollView>

            {/* Milestone Celebration Notification */}
            {showCelebration && (
                <Animated.View
                    style={[
                        styles.celebrationNotification,
                        { transform: [{ translateY: celebrationSlide }] }
                    ]}
                >
                    <TouchableOpacity
                        style={[styles.celebrationToast, { backgroundColor: theme.card }]}
                        onPress={dismissCelebration}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.celebrationEmoji}>🎉</Text>
                        <View style={styles.celebrationContent}>
                            <Text style={[styles.celebrationTitle, { color: theme.text }]}>{celebrationMessage}</Text>
                            <Text style={[styles.celebrationSubtext, { color: theme.textSecondary }]}>Keep it up! Tap to dismiss</Text>
                        </View>
                    </TouchableOpacity>
                </Animated.View>
            )}

            <GoalPromptModal
                visible={extendModalVisible}
                onCancel={() => setExtendModalVisible(false)}
                onStart={(days) => {
                    const additionalDays = parseInt(days || '0', 10);
                    if (additionalDays > 0) {
                        extendTrail(additionalDays);
                    }
                    setExtendModalVisible(false);
                }}
                initialDays="3"
                title="Extend Your Trail"
                message="How many additional days would you like to add?"
                submitLabel="Extend"
                cancelLabel="Cancel"
            />
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold'
    },
    subtitle: {
        fontSize: 16,
        marginTop: 8
    },
    scrollContainer: {
        flexGrow: 1,
    },
    bannerContainer: {
        height: 200,
        position: 'relative',
        width: '100%',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    bannerGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60%',
    },
    bannerContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
    },
    bannerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: 'white',
        marginBottom: 4,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    bannerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.95)',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    card: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        borderWidth: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    endDateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    endDateTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    extendButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    extendButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '700',
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    dateLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    dateValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        marginVertical: 12,
    },
    estimateNote: {
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 8,
        textAlign: 'center',
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressLabel: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    percentBig: {
        fontSize: 36,
        fontWeight: '900',
    },
    distanceText: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: 4,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statVal: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    statLab: {
        fontSize: 13,
        fontWeight: '600',
        marginTop: 4,
        textAlign: 'center',
    },
    verticalDivider: {
        width: 1,
        height: '60%',
        alignSelf: 'center',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    trailProgressSection: {
        marginBottom: 32,
    },
    landmarksTimeline: {
        paddingLeft: 8,
    },
    timelineItem: {
        flexDirection: 'row',
        position: 'relative',
        marginBottom: 24,
    },
    timelineLine: {
        position: 'absolute',
        left: 11,
        top: 28,
        width: 2,
        height: '100%',
    },
    timelineMarker: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 3,
        marginRight: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    markerCheck: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'white',
    },
    timelineContent: {
        flex: 1,
        paddingBottom: 8,
    },
    landmarkHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    landmarkName: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
        marginRight: 8,
    },
    landmarkPassed: {
        textDecorationLine: 'line-through',
        opacity: 0.6,
    },
    landmarkDesc: {
        fontSize: 14,
        lineHeight: 18,
    },
    statusBadge: {
        fontSize: 12,
        fontWeight: '700',
    },
    landmarkDistNum: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    celebrationNotification: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        zIndex: 1000,
    },
    celebrationToast: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    celebrationEmoji: {
        fontSize: 32,
        marginRight: 12,
    },
    celebrationContent: {
        flex: 1,
    },
    celebrationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    celebrationSubtext: {
        fontSize: 12,
    },
});
