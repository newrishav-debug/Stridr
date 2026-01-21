/**
 * File: app/(tabs)/index.tsx
 * Purpose: Home screen displaying daily activity, active trail, and quick starts.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Documentation added.
 */
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useGame } from '../../src/context/GameContext';
import { useAuth } from '../../src/context/AuthContext';
import { useSubscription } from '../../src/context/SubscriptionContext';
import { TRAILS } from '../../src/const/trails';
import { isTrailFree } from '../../src/const/subscription';
import { getDistanceValue, getDistanceUnit } from '../../src/utils/conversion';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Footprints, Flame, Award, Mountain, ChevronRight, Target, Lock } from 'lucide-react-native';
import { useTheme, usePreferences } from '../../src/context/PreferencesContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { ProgressBar } from '../../src/components/ProgressBar';
import { WeeklyActivityChart } from '../../src/components/WeeklyActivityChart';
import { NextLandmarkCard } from '../../src/components/NextLandmarkCard';
import { StepService } from '../../src/services/StepService';
import { GoalPromptModal } from '../../src/components/GoalPromptModal';
import { PaywallModal } from '../../src/components/PaywallModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PLACEHOLDER_IMG = { uri: 'https://via.placeholder.com/400x300' };



export default function HomeScreen() {
    const { progress, selectTrail, sync } = useGame();
    const { user } = useAuth();
    const { isPro } = useSubscription();
    const theme = useTheme();
    const { preferences } = usePreferences();
    const router = useRouter();
    const [todaySteps, setTodaySteps] = useState(0);
    const [weeklyHistory, setWeeklyHistory] = useState<{ date: string; steps: number }[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTrailIdForModal, setSelectedTrailIdForModal] = useState<string | null>(null);
    const [dashboardPaywallVisible, setDashboardPaywallVisible] = useState(false);
    const [trailPaywallVisible, setTrailPaywallVisible] = useState(false);

    // Refresh step data when the screen gains focus
    useFocusEffect(
        useCallback(() => {
            const loadStats = async () => {
                // Sync latest data from Pedometer to GameContext
                await sync();

                const steps = await StepService.getTodaySteps();
                setTodaySteps(steps);
                const history = await StepService.getDailyHistory(7);
                setWeeklyHistory(history);
            };
            loadStats();
        }, [sync]) // Add sync to dependencies
    );

    if (progress === null) return null;

    const distanceValue = getDistanceValue(progress.currentDistanceMeters, preferences.distanceUnit);
    const distanceUnit = getDistanceUnit(preferences.distanceUnit);
    const totalSteps = progress.totalStepsValid || 0;
    const currentStreak = progress.currentStreak || 0;
    const badgeCount = progress.monthlyProgress?.unlockedBadgeIds?.length || 0;

    // Get available trails
    const availableTrails = TRAILS;

    const activeTrail = progress.selectedTrailId ? TRAILS.find(t => t.id === progress.selectedTrailId) : null;
    const progressRatio = activeTrail ? Math.min(progress.currentDistanceMeters / activeTrail.totalDistanceMeters, 1) : 0;
    const nextLandmark = activeTrail?.landmarks.find(l => l.distanceMeters > progress.currentDistanceMeters);

    // Handler for quick start from trail card
    const handleQuickStart = (trailId: string) => {
        // Check if there's an active trail and user is selecting a different one
        if (progress?.selectedTrailId && progress.selectedTrailId !== trailId) {
            Alert.alert(
                '⚠️ Switch Trail?',
                'Switching trails will reset your progress. You will lose all historical data and only today\'s steps will count towards the new trail.\n\nAre you sure you want to switch?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Switch Trail',
                        style: 'destructive',
                        onPress: () => {
                            setSelectedTrailIdForModal(trailId);
                            setModalVisible(true);
                        }
                    }
                ]
            );
        } else {
            setSelectedTrailIdForModal(trailId);
            setModalVisible(true);
        }
    };

    const handleModalStart = (days: string) => {
        const numDays = parseInt(days || '7', 10);
        if (numDays > 0 && selectedTrailIdForModal) {
            selectTrail(selectedTrailIdForModal, numDays);
            setModalVisible(false);
            router.push('/(tabs)/progress');
        } else {
            setModalVisible(false);
        }
    };

    const handleModalCancel = () => {
        setModalVisible(false);
        setSelectedTrailIdForModal(null);
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.background }]}
            showsVerticalScrollIndicator={false}
        >
            {/* Greeting Section */}
            <View style={styles.greetingSection}>
                <Text style={[styles.greetingText, { color: theme.text }]}>
                    Welcome, {user?.name?.split(' ')[0]}!
                </Text>
                {progress.selectedTrailId && (
                    <Text style={[styles.greetingSubtext, { color: theme.textSecondary }]}>
                        {`Keep walking on ${TRAILS.find(t => t.id === progress.selectedTrailId)?.name}!`}
                    </Text>
                )}
            </View>

            {/* Active Trail Card */}
            {/* Active Trail Card */}
            {/* Active Trail Card or Next Adventure Banner */}
            {activeTrail ? (
                <TouchableOpacity
                    style={[styles.activeTrailCard, { backgroundColor: theme.card }]}
                    onPress={() => router.push('/(tabs)/progress')}
                >
                    <Image
                        source={activeTrail.image || PLACEHOLDER_IMG}
                        style={styles.activeTrailImage}
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
                        style={styles.activeTrailGradient}
                    />
                    <View style={styles.activeTrailContent}>
                        <View style={styles.activeTrailHeader}>
                            <View style={styles.activeTrailBadge}>
                                <Text style={styles.activeTrailBadgeText}>ACTIVE</Text>
                            </View>
                            <Text style={styles.activeTrailName} numberOfLines={1}>{activeTrail.name}</Text>
                        </View>

                        <View style={styles.progressBarContainer}>
                            <View style={styles.progressLabelRow}>
                                <Text style={styles.progressLabel}>Progress</Text>
                                <Text style={styles.progressValue}>{(progressRatio * 100).toFixed(0)}%</Text>
                            </View>
                            <ProgressBar progress={progressRatio} color="#60A5FA" />
                        </View>
                    </View>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    style={[styles.activeTrailCard, { backgroundColor: theme.card }]}
                    onPress={() => router.push('/(tabs)/trails')}
                >
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2074&auto=format&fit=crop' }}
                        style={styles.activeTrailImage}
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
                        style={styles.activeTrailGradient}
                    />
                    <View style={styles.activeTrailContent}>
                        <View style={styles.activeTrailHeader}>
                            <View style={[styles.activeTrailBadge, { backgroundColor: '#F59E0B' }]}>
                                <Text style={styles.activeTrailBadgeText}>DISCOVER</Text>
                            </View>
                            <Text style={styles.activeTrailName}>Start Your Next Adventure</Text>
                        </View>
                        <View style={{ marginTop: 'auto' }}>
                            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15, lineHeight: 22 }}>
                                Ready for a new challenge? Browse our collection of iconic trails and begin your journey.
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            )}

            {/* Next Landmark Preview */}
            {activeTrail && nextLandmark && (
                <NextLandmarkCard
                    landmark={nextLandmark}
                    currentDistance={progress.currentDistanceMeters}
                    trailColor={activeTrail.color}
                />
            )}

            {/* Daily Activity Section */}
            <View style={{ marginBottom: 24 }}>
                <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
                    <Text style={[styles.sectionTitle, { color: theme.text, paddingHorizontal: 0, marginBottom: 0 }]}>
                        Daily Activity
                    </Text>
                </View>

                {/* Daily Goal Card */}
                <View style={[styles.dailyGoalCard, { backgroundColor: theme.card }]}>
                    <View style={styles.dailyGoalHeader}>
                        <Target size={24} color="#10B981" />
                        <Text style={[styles.dailyGoalTitle, { color: theme.text }]}>Today's Goal</Text>
                    </View>

                    <View style={styles.dailyGoalProgressContainer}>
                        <View style={styles.dailyCircularProgress}>
                            <Text style={[styles.dailyGoalSteps, { color: '#065F46' }]}>
                                {todaySteps >= 1000 ? `${(todaySteps / 1000).toFixed(1)}k` : todaySteps}
                            </Text>
                            <Text style={[styles.dailyGoalLabel, { color: '#065F46' }]}>steps</Text>
                        </View>
                        <View style={styles.dailyGoalDetails}>
                            <Text style={[styles.dailyGoalText, { color: theme.text }]}>
                                {todaySteps >= preferences.dailyGoal ? '🎉 Goal Achieved!' : `${(preferences.dailyGoal - todaySteps).toLocaleString()} to go`}
                            </Text>
                            <View style={[styles.dailyProgressBar, { backgroundColor: theme.border }]}>
                                <View style={[styles.dailyProgressFill, { width: `${Math.min((todaySteps / preferences.dailyGoal) * 100, 100)}%` }]} />
                            </View>
                            <Text style={[styles.dailyGoalPercentage, { color: theme.textSecondary }]}>
                                {Math.round(Math.min((todaySteps / preferences.dailyGoal) * 100, 100))}% of {preferences.dailyGoal.toLocaleString()}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Weekly Activity Section */}
            <View style={{ marginBottom: 24 }}>
                <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
                    <Text style={[styles.sectionTitle, { color: theme.text, paddingHorizontal: 0, marginBottom: 0 }]}>
                        Weekly Activity
                    </Text>
                </View>

                {/* Weekly Chart */}
                {weeklyHistory.length > 0 && (
                    <WeeklyActivityChart data={weeklyHistory} height={180} showValues={true} />
                )}
            </View>

            {/* My Dashboard */}
            <View style={{ paddingHorizontal: 24, marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={[styles.sectionTitle, { color: theme.text, paddingHorizontal: 0, marginBottom: 0 }]}>
                        My Dashboard
                    </Text>
                    {!isPro && (
                        <View style={styles.proBadgeSmall}>
                            <Lock size={10} color="#B8860B" />
                            <Text style={styles.proBadgeSmallText}>PRO</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Achievements Grid */}
            <TouchableOpacity
                style={[styles.accomplishmentsCard, { backgroundColor: theme.card }]}
                onPress={() => {
                    if (isPro) {
                        router.push('/my-dashboard');
                    } else {
                        setDashboardPaywallVisible(true);
                    }
                }}
                activeOpacity={0.8}
            >
                <View style={styles.statsRow}>
                    {/* Lifetime Steps */}
                    <View style={[styles.statItem, { backgroundColor: theme.backgroundTertiary }]}>
                        <View style={[styles.statIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                            <Footprints size={20} color="#3B82F6" />
                        </View>
                        <View>
                            <Text style={[styles.statValue, { color: theme.text }]}>
                                {progress.stats?.totalStepsLifetime >= 1000
                                    ? `${(progress.stats.totalStepsLifetime / 1000).toFixed(1)}k`
                                    : progress.stats?.totalStepsLifetime || 0}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Steps</Text>
                        </View>
                    </View>

                    {/* Lifetime Distance */}
                    <View style={[styles.statItem, { backgroundColor: theme.backgroundTertiary }]}>
                        <View style={[styles.statIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                            <MapPin size={20} color="#10B981" />
                        </View>
                        <View>
                            <Text style={[styles.statValue, { color: theme.text }]}>
                                {getDistanceValue(progress.stats?.totalDistanceMetersLifetime || 0, preferences.distanceUnit).toFixed(1)}
                            </Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{distanceUnit}</Text>
                        </View>
                    </View>

                    {/* Badges */}
                    <View style={[styles.statItem, { backgroundColor: theme.backgroundTertiary }]}>
                        <View style={[styles.statIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                            <Award size={20} color="#F59E0B" />
                        </View>
                        <View>
                            <Text style={[styles.statValue, { color: theme.text }]}>{badgeCount}</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Badges</Text>
                        </View>
                    </View>

                    <View style={[styles.statItem, { backgroundColor: theme.backgroundTertiary }]}>
                        <View style={[styles.statIcon, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
                            <Mountain size={20} color="#8B5CF6" />
                        </View>
                        <View>
                            <Text style={[styles.statValue, { color: theme.text }]}>{progress.stats?.completedTrailsCount || 0}</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Trails</Text>
                        </View>
                    </View>
                </View>

                {/* Lock Overlay for Dashboard */}
                {!isPro && (
                    <View style={styles.dashboardLockOverlay}>
                        <View style={styles.dashboardLockBadge}>
                            <Lock size={14} color="white" />
                            <Text style={styles.dashboardLockText}>Tap to unlock detailed insights</Text>
                        </View>
                    </View>
                )}
            </TouchableOpacity>

            {/* Start Your Journey Section */}
            <View style={styles.trailsSection}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    {progress.selectedTrailId ? 'Explore More Trails' : 'Start Your Journey'}
                </Text>
                <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                    Choose a trail and begin walking
                </Text>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.trailsCarousel}
                    decelerationRate="fast"
                    snapToInterval={SCREEN_WIDTH * 0.7 + 12}
                    snapToAlignment="start"
                >
                    {availableTrails.map((trail, index) => {
                        const isLocked = !isPro && !isTrailFree(trail.id);
                        return (
                            <TouchableOpacity
                                key={trail.id}
                                style={[
                                    styles.trailCard,
                                    { backgroundColor: theme.card },
                                    index === 0 && styles.firstTrailCard
                                ]}
                                onPress={() => {
                                    if (isLocked) {
                                        setTrailPaywallVisible(true);
                                    } else {
                                        router.push(`/trail/${trail.id}`);
                                    }
                                }}
                                activeOpacity={0.9}
                            >
                                <Image
                                    source={trail.image || PLACEHOLDER_IMG}
                                    style={styles.trailCardImage}
                                    resizeMode="cover"
                                />
                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                                    style={styles.trailCardGradient}
                                />

                                {/* Lock badge for premium trails */}
                                {isLocked && (
                                    <View style={styles.trailLockBadge}>
                                        <Lock size={12} color="white" />
                                        <Text style={styles.trailLockBadgeText}>PREMIUM</Text>
                                    </View>
                                )}

                                <View style={styles.trailCardContent}>
                                    <Text style={styles.trailCardName} numberOfLines={2}>
                                        {trail.name}
                                    </Text>

                                    <View style={[styles.trailDifficultyBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                        <Text style={styles.trailDifficultyText}>{trail.difficulty}</Text>
                                    </View>

                                    <View style={styles.trailCardStats}>
                                        <View style={styles.trailCardStat}>
                                            <MapPin size={14} color="rgba(255,255,255,0.9)" />
                                            <Text style={styles.trailCardStatText}>
                                                {getDistanceValue(trail.totalDistanceMeters, preferences.distanceUnit).toFixed(0)} {getDistanceUnit(preferences.distanceUnit)}
                                            </Text>
                                        </View>
                                        <View style={styles.trailCardStat}>
                                            <Mountain size={14} color="rgba(255,255,255,0.9)" />
                                            <Text style={styles.trailCardStatText}>
                                                {trail.landmarks.length} landmarks
                                            </Text>
                                        </View>
                                    </View>

                                    {progress.selectedTrailId !== trail.id && (
                                        isLocked ? (
                                            <TouchableOpacity
                                                style={styles.lockedQuickStartButton}
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    setTrailPaywallVisible(true);
                                                }}
                                            >
                                                <Lock size={16} color="white" />
                                                <Text style={styles.quickStartText}>Unlock Premium</Text>
                                            </TouchableOpacity>
                                        ) : (
                                            <TouchableOpacity
                                                style={[styles.quickStartButton, { backgroundColor: trail.color }]}
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    handleQuickStart(trail.id);
                                                }}
                                            >
                                                <Text style={styles.quickStartText}>Start Trail</Text>
                                            </TouchableOpacity>
                                        )
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* About Stridr Section */}
            <View style={[styles.aboutCard, { backgroundColor: theme.card }]}>
                <Text style={[styles.aboutTitle, { color: theme.text }]}>About Stridr</Text>

                <Text style={[styles.aboutDescription, { color: theme.textSecondary }]}>
                    Walk the world's most iconic trails from wherever you are.
                    Track your daily steps and visualize your progress through famous hiking routes
                    and landmarks around the globe.
                </Text>

                <View style={styles.featuresList}>
                    <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>✓</Text>
                        <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                            Virtual trail experiences
                        </Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>✓</Text>
                        <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                            Real step tracking
                        </Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>✓</Text>
                        <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                            Unlock landmarks & badges
                        </Text>
                    </View>
                    <View style={styles.featureItem}>
                        <Text style={styles.featureIcon}>✓</Text>
                        <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                            Track streaks & achievements
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.viewAllTrailsButton, { borderColor: theme.border }]}
                    onPress={() => router.push('/(tabs)/trails')}
                >
                    <Text style={[styles.viewAllTrailsText, { color: theme.text }]}>
                        View All Trails
                    </Text>
                    <ChevronRight size={20} color={theme.text} />
                </TouchableOpacity>
            </View>

            {/* Bottom Padding */}
            <View style={{ height: 40 }} />

            <GoalPromptModal
                visible={modalVisible}
                onCancel={handleModalCancel}
                onStart={handleModalStart}
            />

            <PaywallModal
                visible={dashboardPaywallVisible}
                onClose={() => setDashboardPaywallVisible(false)}
                feature="dashboard"
            />

            <PaywallModal
                visible={trailPaywallVisible}
                onClose={() => setTrailPaywallVisible(false)}
                feature="trails"
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    greetingSection: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 24,
    },
    greetingText: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    greetingSubtext: {
        fontSize: 16,
    },
    activeTrailCard: {
        marginHorizontal: 24,
        marginBottom: 24,
        height: 180, // Slightly taller for progress bar
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
    },
    activeTrailImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    activeTrailGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    activeTrailContent: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 20,
    },
    activeTrailHeader: {
        marginTop: 10,
    },
    activeTrailBadge: {
        backgroundColor: 'rgba(96, 165, 250, 0.9)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    activeTrailBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    activeTrailName: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    progressBarContainer: {
        width: '100%',
    },
    progressLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '600',
    },
    progressValue: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    accomplishmentsCard: {
        marginHorizontal: 24,
        marginBottom: 24,
        padding: 16,
        paddingVertical: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    statsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    statItem: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        gap: 12,
        marginBottom: 0,
    },
    statIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 12,
    },
    trailsSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingHorizontal: 24,
        marginBottom: 8,
    },
    sectionSubtitle: {
        fontSize: 14,
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    trailsCarousel: {
        paddingLeft: 24,
        paddingRight: 12,
        gap: 12,
    },
    trailCard: {
        width: SCREEN_WIDTH * 0.7,
        height: 280,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    firstTrailCard: {
        marginLeft: 0,
    },
    trailCardImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    trailCardGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '60%',
    },
    trailCardContent: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        padding: 16,
    },
    trailDifficultyBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginBottom: 8,
    },
    trailDifficultyText: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
    },
    trailCardName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    trailCardStats: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    trailCardStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    trailCardStatText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: 12,
    },
    quickStartButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    lockedQuickStartButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    quickStartText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    aboutCard: {
        marginHorizontal: 24,
        marginBottom: 24,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    aboutTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    aboutDescription: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 16,
    },
    featuresList: {
        gap: 10,
        marginBottom: 20,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    featureIcon: {
        fontSize: 16,
        color: '#10B981',
        fontWeight: 'bold',
    },
    featureText: {
        fontSize: 14,
        flex: 1,
    },
    viewAllTrailsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    viewAllTrailsText: {
        fontSize: 15,
        fontWeight: '600',
    },
    // Daily Goal Card
    dailyGoalCard: {
        marginHorizontal: 24,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    dailyGoalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    dailyGoalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    dailyGoalProgressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    dailyCircularProgress: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#F0FDF4',
        borderWidth: 6,
        borderColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dailyGoalSteps: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    dailyGoalLabel: {
        fontSize: 11,
    },
    dailyGoalDetails: {
        flex: 1,
    },
    dailyGoalText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    dailyProgressBar: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 6,
    },
    dailyProgressFill: {
        height: '100%',
        backgroundColor: '#10B981',
        borderRadius: 4,
    },
    dailyGoalPercentage: {
        fontSize: 14,
    },
    proBadgeSmall: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.15)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    proBadgeSmallText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#B8860B',
        letterSpacing: 0.5,
    },
    dashboardLockOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingVertical: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        alignItems: 'center',
    },
    dashboardLockBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dashboardLockText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    trailLockBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 4,
        zIndex: 10,
    },
    trailLockBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});
