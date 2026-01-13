/**
 * File: app/my-dashboard.tsx
 * Purpose: Personal dashboard showing detailed statistics and badges.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Created dashboard screen.
 */
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { useGame } from '../src/context/GameContext';
import { usePreferences, useTheme } from '../src/context/PreferencesContext';
import { getDistanceValue, getDistanceUnit } from '../src/utils/conversion';
import { Award, Target, Footprints, MapPin, Flame, ChevronLeft, Trophy, Flag, ChevronRight, Calendar, Clock, BarChart2, CheckCircle2 } from 'lucide-react-native';
import { ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BADGES, getBadgeDescription } from '../src/const/badges';
import { TRAILS } from '../src/const/trails';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MyDashboardScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { progress, todaySteps, completedTrailsCount } = useGame();
    const { preferences } = usePreferences();
    const theme = useTheme();

    if (!user) return null;

    const distanceValue = progress?.currentDistanceMeters
        ? getDistanceValue(progress.currentDistanceMeters, preferences.distanceUnit)
        : 0;
    const distanceUnit = getDistanceUnit(preferences.distanceUnit);
    const totalSteps = progress?.totalStepsValid || 0;
    const currentStreak = progress?.currentStreak || 0;
    const unlockedBadges = progress?.unlockedBadges || [];

    // Calculate badge statistics
    const unlockedBadgeObjects = (progress?.unlockedBadges || [])
        .map(badgeId => BADGES.find(b => b.id === badgeId))
        .filter(Boolean);
    const recentBadges = unlockedBadgeObjects.slice(-5).reverse();

    // Calculate trail statistics
    const activeTrail = progress?.selectedTrailId
        ? TRAILS.find(t => t.id === progress.selectedTrailId)
        : null;
    // const completedTrailsCount: number = 0; // Handled by Context now
    const currentDistance = progress?.currentDistanceMeters || 0;
    const trailProgress = activeTrail
        ? Math.min((currentDistance / activeTrail.totalDistanceMeters) * 100, 100)
        : 0;

    // Daily step goal from user preferences
    const dailyGoal = preferences.dailyGoal;
    const goalProgress = Math.min((todaySteps / dailyGoal) * 100, 100);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>My Dashboard</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.contentContainer}>
                    {/* Daily Goal Progress */}
                    <View style={[styles.goalSection, { backgroundColor: theme.card }]}>
                        <View style={styles.goalHeader}>
                            <Target size={24} color="#10B981" />
                            <Text style={[styles.goalTitle, { color: theme.text }]}>Today's Goal</Text>
                        </View>

                        <View style={styles.goalProgressContainer}>
                            <View style={styles.circularProgress}>
                                <Text style={[styles.goalSteps, { color: '#065F46' }]}>{todaySteps.toLocaleString()}</Text>
                                <Text style={[styles.goalLabel, { color: '#065F46' }]}>steps</Text>
                            </View>
                            <View style={styles.goalDetails}>
                                <Text style={[styles.goalText, { color: theme.text }]}>
                                    {todaySteps >= dailyGoal ? '🎉 Goal Achieved!' : `${(dailyGoal - todaySteps).toLocaleString()} to go`}
                                </Text>
                                <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                                    <View style={[styles.progressFill, { width: `${goalProgress}%` }]} />
                                </View>
                                <Text style={[styles.goalPercentage, { color: theme.textSecondary }]}>{Math.round(goalProgress)}% of {dailyGoal.toLocaleString()}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Enhanced Statistics */}
                    <View style={styles.statsSection}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Overall Statistics</Text>

                        <View style={styles.statsGrid}>
                            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
                                <View style={[styles.statIcon, { backgroundColor: '#EF4444' }]}>
                                    <Flame size={24} color="white" />
                                </View>
                                <Text style={[styles.statValue, { color: theme.text }]}>{currentStreak}</Text>
                                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Day Streak</Text>
                            </View>

                            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
                                <View style={[styles.statIcon, { backgroundColor: '#3B82F6' }]}>
                                    <Footprints size={24} color="white" />
                                </View>
                                <Text style={[styles.statValue, { color: theme.text }]}>{totalSteps.toLocaleString()}</Text>
                                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Steps</Text>
                            </View>

                            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
                                <View style={[styles.statIcon, { backgroundColor: '#10B981' }]}>
                                    <MapPin size={24} color="white" />
                                </View>
                                <Text style={[styles.statValue, { color: theme.text }]}>{distanceValue.toFixed(1)} {distanceUnit}</Text>
                                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Distance</Text>
                            </View>

                            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
                                <View style={[styles.statIcon, { backgroundColor: '#F59E0B' }]}>
                                    <Award size={24} color="white" />
                                </View>
                                <Text style={[styles.statValue, { color: theme.text }]}>{unlockedBadges.length}</Text>
                                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Badges</Text>
                            </View>
                        </View>
                    </View>

                    {/* Achievement Highlights */}
                    {recentBadges.length > 0 && (
                        <View style={styles.achievementsSection}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: theme.text }]}>Achievement Highlights</Text>
                                <TouchableOpacity onPress={() => router.push('/(tabs)/achievements')}>
                                    <Text style={[styles.viewAllText, { color: '#3B82F6' }]}>View All</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.badgesCarousel}
                            >
                                {recentBadges.map((badge: any, index: number) => (
                                    <View
                                        key={badge.id}
                                        style={[
                                            styles.badgeCard,
                                            { backgroundColor: theme.card },
                                            index === 0 && styles.firstBadgeCard
                                        ]}
                                    >
                                        <View style={[styles.badgeIconContainer, { backgroundColor: theme.backgroundTertiary }]}>
                                            <Text style={styles.badgeIcon}>{badge.icon}</Text>
                                        </View>
                                        <Text style={[styles.badgeName, { color: theme.text }]} numberOfLines={1}>
                                            {badge.name}
                                        </Text>
                                        <Text style={[styles.badgeDescription, { color: theme.textSecondary }]} numberOfLines={2}>
                                            {getBadgeDescription(badge, preferences.distanceUnit)}
                                        </Text>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Trail Stats */}
                    <View style={styles.trailStatsSection}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Trail Stats</Text>

                        <View style={[styles.trailStatsCard, { backgroundColor: theme.card }]}>
                            {/* Active Trail */}
                            {activeTrail ? (
                                <View style={styles.trailStatItem}>
                                    <View style={styles.trailStatLeft}>
                                        <View style={[styles.trailStatIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                                            <MapPin size={20} color="#3B82F6" />
                                        </View>
                                        <View style={styles.trailStatInfo}>
                                            <Text style={[styles.trailStatLabel, { color: theme.textSecondary }]}>Active Trail</Text>
                                            <Text style={[styles.trailStatValue, { color: theme.text }]} numberOfLines={1}>
                                                {activeTrail.name}
                                            </Text>
                                            <View style={styles.trailProgressContainer}>
                                                <View style={[styles.trailProgressTrack, { backgroundColor: theme.backgroundTertiary }]}>
                                                    <View
                                                        style={[
                                                            styles.trailProgressFill,
                                                            { backgroundColor: activeTrail.color, width: `${trailProgress}%` }
                                                        ]}
                                                    />
                                                </View>
                                                <Text style={[styles.trailProgressText, { color: theme.textSecondary }]}>
                                                    {trailProgress.toFixed(0)}%
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={() => router.push('/(tabs)/progress')}>
                                        <ChevronRight size={20} color={theme.textTertiary} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.trailStatItem}>
                                    <View style={styles.trailStatLeft}>
                                        <View style={[styles.trailStatIcon, { backgroundColor: 'rgba(107, 114, 128, 0.15)' }]}>
                                            <Flag size={20} color="#6B7280" />
                                        </View>
                                        <View style={styles.trailStatInfo}>
                                            <Text style={[styles.trailStatLabel, { color: theme.textSecondary }]}>Active Trail</Text>
                                            <Text style={[styles.trailStatValue, { color: theme.textSecondary }]}>
                                                No active trail
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={() => router.push('/(tabs)/trails')}>
                                        <ChevronRight size={20} color={theme.textTertiary} />
                                    </TouchableOpacity>
                                </View>
                            )}

                            <View style={[styles.trailStatDivider, { backgroundColor: theme.border }]} />

                            {/* Completed Trails List */}
                            <View style={styles.completedTrailsContainer}>
                                <View style={styles.completedTrailsHeader}>
                                    <View style={[styles.trailStatIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                                        <Trophy size={20} color="#10B981" />
                                    </View>
                                    <Text style={[styles.trailStatLabel, { color: theme.textSecondary, marginBottom: 0, marginLeft: 12 }]}>
                                        Completed Trails ({completedTrailsCount})
                                    </Text>
                                </View>

                                {progress?.completedTrails && progress.completedTrails.length > 0 ? (
                                    <View style={styles.completedList}>
                                        {[...progress.completedTrails].reverse().map((completed, index) => {
                                            const trailInfo = TRAILS.find(t => t.id === completed.trailId);
                                            if (!trailInfo) return null;

                                            const PLACEHOLDER_IMG = { uri: 'https://via.placeholder.com/400x200' };
                                            // Fallback image if trail image is missing
                                            const trailImage = trailInfo.image || PLACEHOLDER_IMG;

                                            return (
                                                <TouchableOpacity
                                                    key={`${completed.trailId}-${index}`}
                                                    style={styles.completedTrailCard}
                                                    activeOpacity={0.9}
                                                    onPress={() => router.push(`/(tabs)/trails`)}
                                                >
                                                    <ImageBackground
                                                        source={trailImage}
                                                        style={styles.completedTrailBackground}
                                                        imageStyle={{ borderRadius: 16 }}
                                                    >
                                                        <LinearGradient
                                                            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)']}
                                                            style={styles.completedTrailGradient}
                                                        >
                                                            <View style={styles.completedTrailContent}>
                                                                <View style={styles.completedTrailTop}>
                                                                    <Text style={styles.completedTrailName}>{trailInfo.name}</Text>
                                                                    <View style={styles.completedDateBadge}>
                                                                        <CheckCircle2 size={12} color="#10B981" style={{ marginRight: 4 }} />
                                                                        <Text style={styles.completedDateText}>
                                                                            Completed {new Date(completed.completedDate).toLocaleDateString()}
                                                                        </Text>
                                                                    </View>
                                                                </View>

                                                                <View style={styles.completedStatsRow}>
                                                                    <View style={styles.completedStat}>
                                                                        <Footprints size={20} color="#E0F2FE" />
                                                                        <Text style={styles.completedStatValue}>
                                                                            {completed.totalSteps.toLocaleString()}
                                                                        </Text>
                                                                        <Text style={styles.completedStatLabel}>Steps</Text>
                                                                    </View>
                                                                    <View style={[styles.verticalDivider, { backgroundColor: 'rgba(255,255,255,0.3)', height: 24 }]} />
                                                                    <View style={styles.completedStat}>
                                                                        <Calendar size={20} color="#E0F2FE" />
                                                                        <Text style={styles.completedStatValue}>
                                                                            {completed.totalDays}
                                                                        </Text>
                                                                        <Text style={styles.completedStatLabel}>Days</Text>
                                                                    </View>
                                                                    <View style={[styles.verticalDivider, { backgroundColor: 'rgba(255,255,255,0.3)', height: 24 }]} />
                                                                    <View style={styles.completedStat}>
                                                                        <BarChart2 size={20} color="#E0F2FE" />
                                                                        <Text style={styles.completedStatValue}>
                                                                            {completed.avgStepsPerDay.toLocaleString()}
                                                                        </Text>
                                                                        <Text style={styles.completedStatLabel}>Avg/Day</Text>
                                                                    </View>
                                                                </View>
                                                            </View>
                                                        </LinearGradient>
                                                    </ImageBackground>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                ) : (
                                    <View style={styles.emptyCompleted}>
                                        <Text style={[styles.emptyCompletedText, { color: theme.textSecondary }]}>
                                            No completed trails yet. Keep walking!
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 60,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    scrollContent: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    goalSection: {
        marginBottom: 24,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    goalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    goalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    goalProgressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    circularProgress: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#F0FDF4',
        borderWidth: 6,
        borderColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
    },
    goalSteps: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    goalLabel: {
        fontSize: 12,
    },
    goalDetails: {
        flex: 1,
    },
    goalText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 6,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#10B981',
        borderRadius: 4,
    },
    goalPercentage: {
        fontSize: 14,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statsSection: {
        marginBottom: 24,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 16,
    },
    statCard: {
        width: (SCREEN_WIDTH - 52) / 2, // 20 padding * 2 = 40, + 12 gap = 52
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
    },
    // Achievement Highlights Section
    achievementsSection: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: '600',
    },
    badgesCarousel: {
        gap: 12,
    },
    badgeCard: {
        width: 140,
        padding: 16,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginRight: 0,
    },
    firstBadgeCard: {
        marginLeft: 0,
    },
    badgeIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    badgeIcon: {
        fontSize: 32,
    },
    badgeName: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    badgeDescription: {
        fontSize: 11,
        lineHeight: 14,
    },
    // Trail Stats Section
    trailStatsSection: {
        marginBottom: 24,
    },
    trailStatsCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    trailStatItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    trailStatLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    trailStatIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    trailStatInfo: {
        flex: 1,
    },
    trailStatLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    trailStatValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    trailStatDivider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 16,
    },
    trailProgressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    trailProgressTrack: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    trailProgressFill: {
        height: '100%',
        borderRadius: 3,
    },
    trailProgressText: {
        fontSize: 12,
        fontWeight: '600',
        minWidth: 32,
    },
    completedTrailsContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    completedTrailsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        marginTop: 8,
    },
    completedList: {
        gap: 16, // Increase gap for larger cards
    },
    completedTrailCard: {
        height: 200, // Fixed height for visual impact
        borderRadius: 16,
        // No background color here, handled by ImageBackground
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    completedTrailBackground: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
    },
    completedTrailGradient: {
        flex: 1,
        justifyContent: 'flex-end', // Push content to bottom
        padding: 16,
    },
    completedTrailContent: {
        justifyContent: 'space-between',
        height: '100%',
    },
    completedTrailTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    completedTrailName: {
        fontSize: 22,
        fontWeight: '900',
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        flex: 1,
        marginRight: 8,
    },
    completedDateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    completedDateText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#059669', // Emerald 600
    },
    completedStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end', // Align text baseline ideally
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.2)',
    },
    completedStat: {
        alignItems: 'center',
        gap: 4,
        flex: 1,
    },
    completedStatValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    completedStatLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.9)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    emptyCompleted: {
        paddingVertical: 24,
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderRadius: 12,
    },
    emptyCompletedText: {
        fontSize: 15,
        fontStyle: 'italic',
    },
});
