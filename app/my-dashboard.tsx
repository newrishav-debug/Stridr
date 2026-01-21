/**
 * File: app/my-dashboard.tsx
 * Purpose: Personal dashboard showing detailed statistics and badges.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Created dashboard screen.
 * 2026-01-14: Added weekly/monthly stats, goal rate, personal records, landmarks, next badge progress.
 */
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { useGame } from '../src/context/GameContext';
import { usePreferences, useTheme } from '../src/context/PreferencesContext';
import { getDistanceValue, getDistanceUnit } from '../src/utils/conversion';
import {
    Award, Target, Footprints, MapPin, ChevronLeft, Trophy, Flag, ChevronRight,
    Calendar, BarChart2, CheckCircle2, TrendingUp, TrendingDown, Minus, Zap,
    Star, Crown, Mountain, RefreshCw
} from 'lucide-react-native';
import { ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BADGES, MONTHLY_BADGES_TOTAL, MONTHLY_MASTER_REQUIREMENT, MONTH_NAMES, MONTH_ICONS } from '../src/const/badges';
import { TRAILS } from '../src/const/trails';
import { CalendarView } from '../src/components/CalendarView';
import { SimpleLineChart } from '../src/components/SimpleLineChart';
import { StepService } from '../src/services/StepService';
import { BadgeService } from '../src/services/BadgeService';
import { DashboardStatsService, WeeklyStats, GoalAchievementStats, PersonalRecords, NextBadgeProgress, filterHistoryByStartDate } from '../src/services/DashboardStatsService';
import { useState, useEffect, useMemo } from 'react';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MyDashboardScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { progress, todaySteps, sync } = useGame();
    const { preferences } = usePreferences();
    const theme = useTheme();

    const [rawHistory, setRawHistory] = useState<{ date: string; steps: number }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    if (!user) return null;

    const dailyGoal = preferences.dailyGoal;
    const distanceValue = progress?.stats?.totalDistanceMetersLifetime
        ? getDistanceValue(progress.stats.totalDistanceMetersLifetime, preferences.distanceUnit)
        : 0;
    const distanceUnit = getDistanceUnit(preferences.distanceUnit);
    const totalSteps = progress?.stats?.totalStepsLifetime || 0;
    const goalProgress = Math.min((todaySteps / dailyGoal) * 100, 100);

    // Monthly badge progress
    const monthlyProgress = progress?.monthlyProgress;
    const monthlyUnlockedCount = monthlyProgress?.unlockedBadgeIds.length || 0;

    // Calculate TOTAL lifetime badges - memoized to avoid recalculation on every render
    const totalBadgesEarned = useMemo(() => {
        const pastMonthsCount = (progress?.pastMonths || []).reduce((acc, pm) => acc + pm.unlockedBadgeIds.length, 0);
        const trailBadgesCount = (progress?.trailBadges || []).length;
        const masterBadgesCount = (progress?.yearlyProgress || []).reduce((acc, yp) => acc + yp.monthlyBadgesEarned.length + (yp.yearlyBadgeEarned ? 1 : 0), 0);
        return monthlyUnlockedCount + pastMonthsCount + trailBadgesCount + masterBadgesCount;
    }, [progress, monthlyUnlockedCount]);

    const badgesRemaining = Math.max(0, MONTHLY_MASTER_REQUIREMENT - monthlyUnlockedCount);
    const currentMonth = new Date().getMonth() + 1;
    const monthName = MONTH_NAMES[currentMonth - 1];
    const monthIcon = MONTH_ICONS[currentMonth - 1];

    // Calculate derived stats
    const landmarksReached = useMemo(() =>
        DashboardStatsService.getLandmarksReached(progress, TRAILS),
        [progress]
    );

    const nextBadge = useMemo(() =>
        DashboardStatsService.getNextBadgeProgress(progress),
        [progress]
    );

    // --- OPTIMIZATION START ---
    // Fetch base history only once (or when user/year changes)
    useEffect(() => {
        const loadStats = async () => {
            setIsLoading(true);
            try {
                const currentYear = new Date().getFullYear();
                const raw = await StepService.getYearlyHistory(currentYear);
                const filtered = filterHistoryByStartDate(raw, user?.createdAt);
                setRawHistory(filtered);
            } catch (error) {
                console.error('Failed to load dashboard stats:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadStats();
    }, [user?.id, user?.createdAt]);

    // Combine raw history with live todaySteps
    const history = useMemo(() => {
        if (rawHistory.length === 0) return [];
        const todayStr = new Date().toISOString().split('T')[0];

        // Clone the array to avoid mutating state
        const updated = [...rawHistory];

        // Check if last entry is today
        const lastEntry = updated[updated.length - 1];
        if (lastEntry && lastEntry.date === todayStr) {
            // Update today's steps with live value
            updated[updated.length - 1] = { ...lastEntry, steps: todaySteps };
        } else {
            // Append today if missing
            updated.push({ date: todayStr, steps: todaySteps });
        }
        return updated;
    }, [rawHistory, todaySteps]);

    // Derive all stats from the live `history` using useMemo
    const weeklyStats = useMemo(() => DashboardStatsService.getWeeklyStats(history), [history]);
    const monthlySteps = useMemo(() => DashboardStatsService.getMonthlySteps(history), [history]);
    const goalAchievement = useMemo(() => DashboardStatsService.getGoalAchievementRate(history, dailyGoal), [history, dailyGoal]);
    const personalRecords = useMemo(() => DashboardStatsService.getPersonalRecords(history), [history]);
    const chartData = useMemo(() => DashboardStatsService.getChartData(history, 7), [history]);
    // --- OPTIMIZATION END ---

    // Calculate badge statistics (using monthly badges)
    const unlockedBadgeObjects = (monthlyProgress?.unlockedBadgeIds || [])
        .map((badgeId: string) => BADGES.find(b => b.id === badgeId))
        .filter(Boolean);
    const recentBadges = unlockedBadgeObjects.slice(-5).reverse();

    // Calculate trail statistics
    const activeTrail = progress?.selectedTrailId
        ? TRAILS.find(t => t.id === progress.selectedTrailId)
        : null;
    const currentDistance = progress?.currentDistanceMeters || 0;
    const trailProgress = activeTrail
        ? Math.min((currentDistance / activeTrail.totalDistanceMeters) * 100, 100)
        : 0;

    // Trend icon helper
    const TrendIcon = ({ trend, size = 16 }: { trend: 'up' | 'down' | 'same'; size?: number }) => {
        if (trend === 'up') return <TrendingUp size={size} color="#10B981" />;
        if (trend === 'down') return <TrendingDown size={size} color="#EF4444" />;
        return <Minus size={size} color="#6B7280" />;
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>My Dashboard</Text>
                <TouchableOpacity
                    onPress={async () => {
                        setIsSyncing(true);
                        await sync();
                        setIsSyncing(false);
                    }}
                    style={styles.syncButton}
                    disabled={isSyncing}
                >
                    <RefreshCw
                        size={20}
                        color={isSyncing ? theme.textTertiary : '#3B82F6'}
                        style={isSyncing ? { opacity: 0.5 } : undefined}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.contentContainer}>

                    {/* ===== SECTION 1: TODAY'S GOAL ===== */}
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

                    {/* ===== SECTION 1B: MONTHLY BADGE PROGRESS ===== */}
                    <TouchableOpacity
                        style={[styles.monthlyBadgeCard, { backgroundColor: theme.card }]}
                        onPress={() => router.push('/(tabs)/achievements')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.monthlyBadgeHeader}>
                            <Text style={styles.monthlyIcon}>{monthIcon}</Text>
                            <View style={styles.monthlyInfo}>
                                <Text style={[styles.monthlyTitle, { color: theme.text }]}>{monthName} Challenge</Text>
                                <Text style={[styles.monthlySubtitle, { color: theme.textSecondary }]}>
                                    {monthlyUnlockedCount}/{MONTHLY_BADGES_TOTAL} badges earned
                                </Text>
                            </View>
                            <ChevronRight size={20} color={theme.textTertiary} />
                        </View>
                        <View style={[styles.monthlyProgressBar, { backgroundColor: theme.border }]}>
                            <View style={[styles.monthlyProgressFill, { width: `${(monthlyUnlockedCount / MONTHLY_BADGES_TOTAL) * 100}%` }]} />
                        </View>
                        <Text style={[styles.monthlyRemaining, { color: badgesRemaining > 0 ? '#F59E0B' : '#10B981' }]}>
                            {badgesRemaining > 0
                                ? `${badgesRemaining} more for Monthly Master! 🏆`
                                : '🎉 Monthly Master Earned!'
                            }
                        </Text>
                    </TouchableOpacity>

                    {/* ===== SECTION 1C: NEXT BADGE PROGRESS ===== */}
                    {nextBadge && (
                        <View style={[styles.nextBadgeCard, { backgroundColor: theme.card }]}>
                            <View style={styles.nextBadgeLeft}>
                                <View style={[styles.nextBadgeIconBg, { backgroundColor: theme.backgroundTertiary }]}>
                                    <Text style={styles.nextBadgeEmoji}>{nextBadge.badge.icon}</Text>
                                </View>
                                <View style={styles.nextBadgeInfo}>
                                    <Text style={[styles.nextBadgeName, { color: theme.text }]}>{nextBadge.badge.name}</Text>
                                    <Text style={[styles.nextBadgeDesc, { color: theme.textSecondary }]} numberOfLines={1}>
                                        {nextBadge.badge.description.replace('this month', `in ${monthName}`)}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.nextBadgeProgress}>
                                <Text style={[styles.nextBadgePercent, { color: '#3B82F6' }]}>{nextBadge.percent}%</Text>
                                <View style={[styles.nextBadgeProgressBar, { backgroundColor: theme.border }]}>
                                    <View style={[styles.nextBadgeProgressFill, { width: `${nextBadge.percent}%` }]} />
                                </View>
                            </View>
                        </View>
                    )}

                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Weekly & Monthly</Text>
                    <View style={styles.weeklyMonthlyRow}>
                        {/* Weekly Stats Card */}
                        <View style={[styles.halfCard, { backgroundColor: theme.card }]}>
                            <View style={styles.cardIconRow}>
                                <View style={[styles.miniIcon, { backgroundColor: '#3B82F6' }]}>
                                    <Calendar size={16} color="white" />
                                </View>
                                <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>This Week</Text>
                            </View>
                            <Text style={[styles.cardValue, { color: theme.text }]}>
                                {(weeklyStats?.thisWeek || 0).toLocaleString()}
                            </Text>
                            {weeklyStats && (
                                <View style={styles.trendRow}>
                                    <TrendIcon trend={weeklyStats.trend} />
                                    <Text style={[
                                        styles.trendText,
                                        { color: weeklyStats.trend === 'up' ? '#10B981' : weeklyStats.trend === 'down' ? '#EF4444' : '#6B7280' }
                                    ]}>
                                        {Math.abs(weeklyStats.changePercent)}% vs last week
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Monthly Steps Card */}
                        <View style={[styles.halfCard, { backgroundColor: theme.card }]}>
                            <View style={styles.cardIconRow}>
                                <View style={[styles.miniIcon, { backgroundColor: '#8B5CF6' }]}>
                                    <BarChart2 size={16} color="white" />
                                </View>
                                <Text style={[styles.cardLabel, { color: theme.textSecondary }]}>This Month</Text>
                            </View>
                            <Text style={[styles.cardValue, { color: theme.text }]}>
                                {monthlySteps.toLocaleString()}
                            </Text>
                            <Text style={[styles.cardSubtext, { color: theme.textSecondary }]}>
                                {new Date().toLocaleDateString('en-US', { month: 'long' })}
                            </Text>
                        </View>
                    </View>

                    {/* ===== SECTION 3: GOAL ACHIEVEMENT RATE ===== */}
                    {goalAchievement && (
                        <View style={[styles.achievementCard, { backgroundColor: theme.card }]}>
                            <View style={styles.achievementLeft}>
                                <View style={[styles.achievementIcon, { backgroundColor: goalAchievement.rate >= 70 ? '#10B981' : goalAchievement.rate >= 40 ? '#F59E0B' : '#EF4444' }]}>
                                    <Zap size={24} color="white" />
                                </View>
                                <View>
                                    <Text style={[styles.achievementLabel, { color: theme.textSecondary }]}>Goal Achievement</Text>
                                    <Text style={[styles.achievementValue, { color: theme.text }]}>{goalAchievement.rate}%</Text>
                                </View>
                            </View>
                            <View style={styles.achievementRight}>
                                <Text style={[styles.achievementDetail, { color: theme.textSecondary }]}>
                                    {goalAchievement.daysHit}/{goalAchievement.totalDays} in Last 14 Days
                                </Text>
                                <View style={[styles.miniProgressBar, { backgroundColor: theme.border }]}>
                                    <View style={[styles.miniProgressFill, {
                                        width: `${goalAchievement.rate}%`,
                                        backgroundColor: goalAchievement.rate >= 70 ? '#10B981' : goalAchievement.rate >= 40 ? '#F59E0B' : '#EF4444'
                                    }]} />
                                </View>
                            </View>
                        </View>
                    )}

                    {/* ===== SECTION 4: STEP TREND CHART ===== */}
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>7-Day Trend</Text>
                    <View style={[styles.chartCard, { backgroundColor: theme.card }]}>
                        {chartData.length > 0 ? (
                            <SimpleLineChart
                                data={chartData}
                                height={180}
                                lineColor="#3B82F6"
                                fillColor="rgba(59, 130, 246, 0.1)"
                                labelColor={theme.textSecondary}
                                gridColor={theme.border}
                                showDots={true}
                                showLabels={true}
                                showValues={true}
                            />
                        ) : (
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No step data available</Text>
                        )}
                    </View>

                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Monthly Goal History</Text>
                    <CalendarView history={history} dailyGoal={dailyGoal} />

                    {/* ===== SECTION 5: PERSONAL RECORDS ===== */}
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Personal Records</Text>
                    <View style={styles.recordsRow}>
                        <View style={[styles.recordCard, { backgroundColor: theme.card }]}>
                            <View style={[styles.recordIcon, { backgroundColor: '#FFD700' }]}>
                                <Crown size={18} color="white" />
                            </View>
                            <Text style={[styles.recordValue, { color: theme.text }]}>
                                {(personalRecords?.bestDay.steps || 0).toLocaleString()}
                            </Text>
                            <Text style={[styles.recordLabel, { color: theme.textSecondary }]}>Best Day</Text>
                            {personalRecords?.bestDay.date && (
                                <Text style={[styles.recordDate, { color: theme.textTertiary }]}>
                                    {new Date(personalRecords.bestDay.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                </Text>
                            )}
                        </View>
                        <View style={[styles.recordCard, { backgroundColor: theme.card }]}>
                            <View style={[styles.recordIcon, { backgroundColor: '#C0C0C0' }]}>
                                <Star size={18} color="white" />
                            </View>
                            <Text style={[styles.recordValue, { color: theme.text }]}>
                                {(personalRecords?.bestWeek.steps || 0).toLocaleString()}
                            </Text>
                            <Text style={[styles.recordLabel, { color: theme.textSecondary }]}>Best Week</Text>
                            {personalRecords?.bestWeek.weekStart && (
                                <Text style={[styles.recordDate, { color: theme.textTertiary }]}>
                                    {(() => {
                                        const start = new Date(personalRecords.bestWeek.weekStart);
                                        const end = new Date(start);
                                        end.setDate(end.getDate() + 6);
                                        return `${start.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`;
                                    })()}
                                </Text>
                            )}
                        </View>
                        <View style={[styles.recordCard, { backgroundColor: theme.card }]}>
                            <View style={[styles.recordIcon, { backgroundColor: '#CD7F32' }]}>
                                <Trophy size={18} color="white" />
                            </View>
                            <Text style={[styles.recordValue, { color: theme.text }]}>
                                {(personalRecords?.bestMonth.steps || 0).toLocaleString()}
                            </Text>
                            <Text style={[styles.recordLabel, { color: theme.textSecondary }]}>Best Month</Text>
                            {personalRecords?.bestMonth.month && (
                                <Text style={[styles.recordDate, { color: theme.textTertiary }]}>
                                    {new Date(personalRecords.bestMonth.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </Text>
                            )}
                        </View>
                    </View>

                    {/* ===== SECTION 6: LIFETIME STATS ===== */}
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Lifetime Stats</Text>
                    <View style={styles.statsGrid}>
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

                        <TouchableOpacity
                            style={[styles.statCard, { backgroundColor: theme.card }]}
                            onPress={() => router.push({ pathname: '/(tabs)/achievements', params: { view: 'history' } })}
                        >
                            <View style={[styles.statIcon, { backgroundColor: '#F59E0B' }]}>
                                <Award size={24} color="white" />
                            </View>
                            <Text style={[styles.statValue, { color: theme.text }]}>{totalBadgesEarned}</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Badges</Text>
                        </TouchableOpacity>

                        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
                            <View style={[styles.statIcon, { backgroundColor: '#EC4899' }]}>
                                <Mountain size={24} color="white" />
                            </View>
                            <Text style={[styles.statValue, { color: theme.text }]}>{landmarksReached}</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Landmarks</Text>
                        </View>
                    </View>





                    {/* ===== SECTION 9: ACHIEVEMENT HIGHLIGHTS ===== */}
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
                                            {badge.description}
                                        </Text>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* ===== SECTION 10: TRAIL STATS ===== */}
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
                                        Completed Trails ({progress?.stats?.completedTrailsCount || 0})
                                    </Text>
                                </View>

                                {progress?.completedTrails && progress.completedTrails.length > 0 ? (
                                    <View style={styles.completedList}>
                                        {[...progress.completedTrails].reverse().map((completed, index) => {
                                            const trailInfo = TRAILS.find(t => t.id === completed.trailId);
                                            if (!trailInfo) return null;

                                            const PLACEHOLDER_IMG = { uri: 'https://via.placeholder.com/400x200' };
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
    syncButton: {
        padding: 4,
    },
    scrollContent: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },
    // Today's Goal Section
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
    // Monthly Badge Card
    monthlyBadgeCard: {
        marginBottom: 24,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    monthlyBadgeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    monthlyIcon: {
        fontSize: 32,
        marginRight: 12,
    },
    monthlyInfo: {
        flex: 1,
    },
    monthlyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    monthlySubtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    monthlyProgressBar: {
        height: 10,
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 8,
    },
    monthlyProgressFill: {
        height: '100%',
        backgroundColor: '#F59E0B',
        borderRadius: 5,
    },
    monthlyRemaining: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    // Section Titles
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        marginTop: 8,
    },

    // Weekly & Monthly Cards
    weeklyMonthlyRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    halfCard: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    miniIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    cardValue: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    cardSubtext: {
        fontSize: 12,
    },
    trendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    trendText: {
        fontSize: 11,
        fontWeight: '500',
    },
    // Achievement Rate Card
    achievementCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    achievementLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    achievementIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    achievementLabel: {
        fontSize: 12,
    },
    achievementValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    achievementRight: {
        alignItems: 'flex-end',
    },
    achievementDetail: {
        fontSize: 11,
        marginBottom: 4,
    },
    miniProgressBar: {
        width: 80,
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    miniProgressFill: {
        height: '100%',
        borderRadius: 3,
    },
    // Chart Card
    chartCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    emptyText: {
        textAlign: 'center',
        fontStyle: 'italic',
        paddingVertical: 40,
    },
    // Personal Records
    recordsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 24,
    },
    recordCard: {
        flex: 1,
        borderRadius: 14,
        padding: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    recordIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    recordValue: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    recordLabel: {
        fontSize: 10,
        textAlign: 'center',
    },
    recordDate: {
        fontSize: 9,
        textAlign: 'center',
        marginTop: 2,
    },
    // Lifetime Stats Grid
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        width: (SCREEN_WIDTH - 52) / 2,
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
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
    },
    // Next Badge Card
    nextBadgeCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    nextBadgeLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    nextBadgeIconBg: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nextBadgeEmoji: {
        fontSize: 32,
    },
    nextBadgeInfo: {
        flex: 1,
    },
    nextBadgeName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    nextBadgeDesc: {
        fontSize: 12,
        marginTop: 2,
    },
    nextBadgeProgress: {
        alignItems: 'flex-end',
    },
    nextBadgePercent: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    nextBadgeProgressBar: {
        width: '100%',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    nextBadgeProgressFill: {
        height: '100%',
        backgroundColor: '#3B82F6',
        borderRadius: 4,
    },
    // Achievements Section
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
        gap: 16,
    },
    completedTrailCard: {
        height: 200,
        borderRadius: 16,
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
        justifyContent: 'flex-end',
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
        color: '#059669',
    },
    completedStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
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
    verticalDivider: {
        width: 1,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
});
