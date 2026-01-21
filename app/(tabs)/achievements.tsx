/**
 * File: app/(tabs)/achievements.tsx
 * Purpose: Screen displaying monthly badge challenges and trail badges.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Documentation added.
 * 2026-01-15: Complete revamp for monthly recurring badge system.
 */
import { View, Text, StyleSheet, ScrollView, FlatList, Dimensions, TouchableOpacity, Modal } from 'react-native';
import { useGame } from '../../src/context/GameContext';
import { useSubscription } from '../../src/context/SubscriptionContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
    BADGE_COLLECTIONS,
    Badge,
    MONTHLY_STEP_BADGES,
    MONTHLY_DISTANCE_BADGES,
    TRAIL_BADGES,
    MONTHLY_MASTER_BADGES,
    MONTHLY_BADGES_TOTAL,
    MONTHLY_MASTER_REQUIREMENT,
    MONTH_NAMES,
    MONTH_ICONS
} from '../../src/const/badges';
import { BadgeService } from '../../src/services/BadgeService';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../src/context/PreferencesContext';
import { Award, Target, MapPin, Trophy, Lock, History, ChevronLeft, Calendar, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { MonthlyProgress } from '../../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BADGE_CARD_WIDTH = 140;

export default function AchievementsScreen() {
    const { progress } = useGame();
    const { isPro } = useSubscription();
    const router = useRouter();
    const theme = useTheme();
    const params = useLocalSearchParams();
    const [viewingHistory, setViewingHistory] = useState(false);
    const [selectedHistoryMonth, setSelectedHistoryMonth] = useState<MonthlyProgress | null>(null);

    useEffect(() => {
        if (params.view === 'history') {
            setViewingHistory(true);
        }
    }, [params.view]);

    const currentMonthlyProgress = progress?.monthlyProgress;
    const yearlyProgress = progress?.yearlyProgress || [];
    const trailBadges = progress?.trailBadges || [];
    const pastMonths = progress?.pastMonths || [];

    // Determine which month data to show
    const activeProgress = selectedHistoryMonth || currentMonthlyProgress;

    // Active month info
    const activeYear = activeProgress?.year || new Date().getFullYear();
    const activeMonthIndex = (activeProgress?.month || (new Date().getMonth() + 1)) - 1;
    const activeMonthName = MONTH_NAMES[activeMonthIndex];
    const activeMonthIcon = MONTH_ICONS[activeMonthIndex];

    // Badge stats for active view
    const monthlyUnlockedCount = activeProgress?.unlockedBadgeIds.length || 0;
    const badgesRemaining = Math.max(0, MONTHLY_MASTER_REQUIREMENT - monthlyUnlockedCount);
    const monthlyMasterEarned = activeProgress?.monthlyBadgeEarned || false;

    // Current year progress (kept for context, but mainly for current view)
    const currentYearProgress = yearlyProgress.find(yp => yp.year === activeYear);
    const monthlyBadgesEarnedThisYear = currentYearProgress?.monthlyBadgesEarned.length || 0;
    const yearlyChampionEarned = currentYearProgress?.yearlyBadgeEarned || false;

    const renderBadge = (badge: Badge, isUnlocked: boolean, progressPercent?: number) => {
        return (
            <View style={[styles.badgeCard, { backgroundColor: theme.card }]}>
                <View style={[
                    styles.badgeCircle,
                    isUnlocked ? styles.badgeUnlocked : [styles.badgeLocked, { backgroundColor: theme.backgroundTertiary, borderColor: theme.border }]
                ]}>
                    <Text style={styles.badgeEmoji}>
                        {isUnlocked ? badge.icon : '🔒'}
                    </Text>
                </View>
                <Text
                    style={[styles.badgeName, { color: isUnlocked ? theme.text : theme.textTertiary }]}
                    numberOfLines={2}
                >
                    {badge.name}
                </Text>
                <Text
                    style={[styles.badgeDesc, { color: isUnlocked ? theme.textSecondary : theme.textTertiary }]}
                    numberOfLines={2}
                >
                    {badge.description.replace('this month', `in ${activeMonthName}`)}
                </Text>
                {progressPercent !== undefined && !isUnlocked && (
                    <View style={styles.badgeProgressBar}>
                        <View style={[styles.badgeProgressFill, { width: `${progressPercent}%` }]} />
                    </View>
                )}
                {isUnlocked && (
                    <Text style={styles.badgeUnlockedText}>✓ Earned</Text>
                )}
            </View>
        );
    };


    const renderMonthlyCollection = (title: string, emoji: string, badges: Badge[], type: 'steps' | 'distance') => {
        const unlockedIds = new Set(activeProgress?.unlockedBadgeIds || []);
        const currentValue = type === 'steps'
            ? (activeProgress?.stepsThisMonth || 0)
            : (activeProgress?.distanceMetersThisMonth || 0);

        return (
            <View style={styles.collectionContainer}>
                <View style={styles.collectionHeader}>
                    <View style={styles.collectionTitleRow}>
                        <Text style={styles.collectionEmoji}>{emoji}</Text>
                        <View style={styles.collectionInfo}>
                            <Text style={[styles.collectionName, { color: theme.text }]}>{title}</Text>
                            <Text style={[styles.collectionDesc, { color: theme.textSecondary }]}>
                                {type === 'steps'
                                    ? `${(currentValue).toLocaleString()} steps in ${activeMonthName}`
                                    : `${(currentValue / 1000).toFixed(1)} km in ${activeMonthName}`
                                }
                            </Text>
                        </View>
                    </View>
                    <View style={styles.collectionProgress}>
                        <Text style={styles.progressText}>
                            {badges.filter(b => unlockedIds.has(b.id)).length}/{badges.length}
                        </Text>
                    </View>
                </View>

                <FlatList
                    horizontal
                    data={badges}
                    renderItem={({ item }) => {
                        const isUnlocked = unlockedIds.has(item.id);
                        const progressPercent = Math.min(100, Math.round((currentValue / item.conditionValue) * 100));
                        return renderBadge(item, isUnlocked, isUnlocked ? undefined : progressPercent);
                    }}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.carouselContent}
                    snapToInterval={BADGE_CARD_WIDTH + 12}
                    decelerationRate="fast"
                />
            </View>
        );
    };

    const renderTrailBadges = () => {
        const unlockedIds = new Set(trailBadges);
        const completedCount = progress?.stats?.completedTrailsCount || 0;

        return (
            <View style={styles.collectionContainer}>
                <View style={styles.collectionHeader}>
                    <View style={styles.collectionTitleRow}>
                        <Text style={styles.collectionEmoji}>🏔️</Text>
                        <View style={styles.collectionInfo}>
                            <Text style={[styles.collectionName, { color: theme.text }]}>Trail Blazers</Text>
                            <Text style={[styles.collectionDesc, { color: theme.textSecondary }]}>
                                {completedCount} trails completed (Lifetime)
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.collectionProgress, { backgroundColor: '#10B981' }]}>
                        <Text style={styles.progressText}>
                            {TRAIL_BADGES.filter(b => unlockedIds.has(b.id)).length}/{TRAIL_BADGES.length}
                        </Text>
                    </View>
                </View>

                <FlatList
                    horizontal
                    data={TRAIL_BADGES}
                    renderItem={({ item }) => renderBadge(item, unlockedIds.has(item.id))}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.carouselContent}
                    snapToInterval={BADGE_CARD_WIDTH + 12}
                    decelerationRate="fast"
                />
            </View>
        );
    };

    const renderCalendarMasters = () => {
        const earnedMonths = new Set(currentYearProgress?.monthlyBadgesEarned || []);

        return (
            <View style={styles.collectionContainer}>
                <View style={styles.collectionHeader}>
                    <View style={styles.collectionTitleRow}>
                        <Text style={styles.collectionEmoji}>📅</Text>
                        <View style={styles.collectionInfo}>
                            <Text style={[styles.collectionName, { color: theme.text }]}>Calendar Masters</Text>
                            <Text style={[styles.collectionDesc, { color: theme.textSecondary }]}>
                                {earnedMonths.size} months conquered in {activeYear}
                            </Text>
                        </View>
                    </View>
                    <View style={[styles.collectionProgress, { backgroundColor: '#8B5CF6' }]}>
                        <Text style={styles.progressText}>
                            {earnedMonths.size}/12
                        </Text>
                    </View>
                </View>

                <FlatList
                    horizontal
                    data={MONTHLY_MASTER_BADGES}
                    renderItem={({ item }) => {
                        // For MONTHLY_MASTER badges, conditionValue is the month number (1-12)
                        const isUnlocked = earnedMonths.has(item.conditionValue);
                        return renderBadge(item, isUnlocked);
                    }}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.carouselContent}
                    snapToInterval={BADGE_CARD_WIDTH + 12}
                    decelerationRate="fast"
                />
            </View>
        );
    };

    const renderHistoryList = () => {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={[styles.headerGradient, { backgroundColor: theme.card, paddingTop: 60 }]}>
                    <View style={styles.headerTop}>
                        <TouchableOpacity onPress={() => setViewingHistory(false)} style={styles.backButton}>
                            <ChevronLeft size={28} color={theme.text} />
                        </TouchableOpacity>
                        <Text style={[styles.title, { color: theme.text, fontSize: 24 }]}>Badge History</Text>
                    </View>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        Select a past month to view your achievements
                    </Text>
                </View>

                <ScrollView style={styles.collectionsScroll} contentContainerStyle={{ padding: 20 }}>
                    {pastMonths.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Text style={{ fontSize: 40, marginBottom: 10 }}>🕸️</Text>
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                No history available yet.
                            </Text>
                            <Text style={[styles.emptySubText, { color: theme.textTertiary }]}>
                                Your monthly badges will be archived here starting next month!
                            </Text>
                        </View>
                    ) : (
                        pastMonths.slice().reverse().map((pm, index) => (
                            <TouchableOpacity
                                key={`${pm.year}-${pm.month}`}
                                style={[styles.historyCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                                onPress={() => setSelectedHistoryMonth(pm)}
                            >
                                <View style={styles.historyCardLeft}>
                                    <Text style={styles.historyIcon}>{MONTH_ICONS[pm.month - 1]}</Text>
                                    <View>
                                        <Text style={[styles.historyTitle, { color: theme.text }]}>
                                            {MONTH_NAMES[pm.month - 1]} {pm.year}
                                        </Text>
                                        <Text style={[styles.historySubtitle, { color: theme.textSecondary }]}>
                                            {pm.monthlyBadgeEarned ? '🏆 Monthly Master Earned' : `${pm.unlockedBadgeIds.length} badges unlocked`}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.historyStats}>
                                    <View style={styles.statTag}>
                                        <Text style={[styles.statValue, { color: theme.text }]}>
                                            {(pm.stepsThisMonth / 1000).toFixed(1)}k
                                        </Text>
                                        <Text style={[styles.statLabel, { color: theme.textTertiary }]}>steps</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            </View>
        );
    };

    if (viewingHistory && !selectedHistoryMonth) {
        return renderHistoryList();
    }

    // If not pro, show locked screen
    if (!isPro) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <LinearGradient
                    colors={['#6B7280', '#4B5563']}
                    style={styles.headerGradient}
                >
                    <View style={styles.headerTopRow}>
                        <View style={styles.headerTop}>
                            <Text style={styles.monthIcon}>🏆</Text>
                            <Text style={styles.title}>Achievements</Text>
                        </View>
                    </View>
                    <Text style={styles.subtitle}>Earn badges by walking!</Text>
                </LinearGradient>

                <View style={styles.lockedContent}>
                    <View style={styles.lockIconContainer}>
                        <Lock size={48} color="#9CA3AF" />
                    </View>
                    <Text style={[styles.lockedTitle, { color: theme.text }]}>
                        Badges are a Premium Feature
                    </Text>
                    <Text style={[styles.lockedDescription, { color: theme.textSecondary }]}>
                        Upgrade to Stridr Pro to unlock achievements, earn badges, and track your walking milestones!
                    </Text>

                    <View style={styles.lockedFeatures}>
                        <View style={styles.lockedFeatureRow}>
                            <Award size={18} color="#F59E0B" />
                            <Text style={[styles.lockedFeatureText, { color: theme.text }]}>
                                Monthly step & distance badges
                            </Text>
                        </View>
                        <View style={styles.lockedFeatureRow}>
                            <MapPin size={18} color="#10B981" />
                            <Text style={[styles.lockedFeatureText, { color: theme.text }]}>
                                Trail completion badges
                            </Text>
                        </View>
                        <View style={styles.lockedFeatureRow}>
                            <Calendar size={18} color="#8B5CF6" />
                            <Text style={[styles.lockedFeatureText, { color: theme.text }]}>
                                Monthly Master challenges
                            </Text>
                        </View>
                        <View style={styles.lockedFeatureRow}>
                            <Trophy size={18} color="#EF4444" />
                            <Text style={[styles.lockedFeatureText, { color: theme.text }]}>
                                Yearly Champion achievement
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.unlockButton}
                        onPress={() => router.push('/paywall')}
                    >
                        <LinearGradient
                            colors={['#FFD700', '#FFA500']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.unlockButtonGradient}
                        >
                            <Sparkles size={20} color="#000" />
                            <Text style={styles.unlockButtonText}>Upgrade to Premium</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header with Monthly Progress */}
            <LinearGradient
                colors={monthlyMasterEarned ? ['#10B981', '#059669'] : ['#F59E0B', '#D97706']}
                style={styles.headerGradient}
            >
                <View style={styles.headerTopRow}>
                    <TouchableOpacity
                        style={styles.headerTop}
                        activeOpacity={1}
                        onPress={selectedHistoryMonth ? () => setSelectedHistoryMonth(null) : undefined}
                    >
                        {selectedHistoryMonth && (
                            <ChevronLeft size={28} color="white" style={{ marginRight: 8 }} />
                        )}
                        <Text style={styles.monthIcon}>{activeMonthIcon}</Text>
                        <Text style={styles.title}>{activeMonthName} {activeYear}</Text>
                    </TouchableOpacity>

                    {!selectedHistoryMonth && (
                        <TouchableOpacity
                            style={styles.historyButton}
                            onPress={() => setViewingHistory(true)}
                        >
                            <History size={24} color="white" />
                        </TouchableOpacity>
                    )}
                </View>

                {monthlyMasterEarned ? (
                    <View style={styles.masterEarnedBanner}>
                        <Trophy size={24} color="white" />
                        <Text style={styles.masterEarnedText}>Monthly Master Earned! 🎉</Text>
                    </View>
                ) : (
                    <>
                        <Text style={styles.subtitle}>
                            {monthlyUnlockedCount}/{MONTHLY_BADGES_TOTAL} badges unlocked
                        </Text>
                        <View style={styles.progressBarContainer}>
                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${(monthlyUnlockedCount / MONTHLY_BADGES_TOTAL) * 100}%` }
                                    ]}
                                />
                            </View>
                        </View>
                        <Text style={styles.remainingText}>
                            {badgesRemaining > 0
                                ? `${badgesRemaining} more badge${badgesRemaining > 1 ? 's' : ''} for Monthly Master!`
                                : 'Monthly Master unlocked!'
                            }
                        </Text>
                    </>
                )}

                {/* Yearly Progress or Context Text */}
                <View style={styles.yearlySection}>
                    {selectedHistoryMonth ? (
                        <Text style={styles.yearlyTitle}>
                            Viewing Archived History
                        </Text>
                    ) : (
                        <>
                            <Text style={styles.yearlyTitle}>
                                {activeYear} Champion: {monthlyBadgesEarnedThisYear}/12 months
                            </Text>
                            {yearlyChampionEarned && (
                                <Text style={styles.yearlyChampionText}>🏆 Champion!</Text>
                            )}
                        </>
                    )}
                </View>
            </LinearGradient>

            {/* Badge Collections */}
            <ScrollView style={styles.collectionsScroll} showsVerticalScrollIndicator={false}>
                {renderMonthlyCollection('Walking Warriors', '⚔️', MONTHLY_STEP_BADGES, 'steps')}
                {renderMonthlyCollection('Distance Destroyers', '🗺️', MONTHLY_DISTANCE_BADGES, 'distance')}
                {!selectedHistoryMonth && renderTrailBadges()}
                {!selectedHistoryMonth && renderCalendarMasters()}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerGradient: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    monthIcon: {
        fontSize: 32,
        marginRight: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 12,
    },
    progressBarContainer: {
        marginBottom: 8,
    },
    progressBar: {
        height: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: 'white',
        borderRadius: 5,
    },
    remainingText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.95)',
        fontWeight: '600',
        marginTop: 4,
    },
    masterEarnedBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    masterEarnedText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    yearlySection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.2)',
    },
    yearlyTitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
    },
    yearlyChampionText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
    },
    collectionsScroll: {
        flex: 1,
    },
    collectionContainer: {
        marginTop: 24,
    },
    collectionHeader: {
        paddingHorizontal: 20,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    collectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    collectionEmoji: {
        fontSize: 32,
        marginRight: 12,
    },
    collectionInfo: {
        flex: 1,
    },
    collectionName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    collectionDesc: {
        fontSize: 13,
    },
    collectionProgress: {
        backgroundColor: '#F59E0B',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    progressText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
    },
    carouselContent: {
        paddingHorizontal: 20,
        gap: 12,
    },
    badgeCard: {
        width: BADGE_CARD_WIDTH,
        borderRadius: 16,
        padding: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    badgeCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    badgeUnlocked: {
        backgroundColor: '#FEF3C7',
        borderWidth: 3,
        borderColor: '#F59E0B',
    },
    badgeLocked: {
        borderWidth: 3,
    },
    badgeEmoji: {
        fontSize: 32,
    },
    badgeName: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 2,
        textAlign: 'center',
        minHeight: 28,
    },
    badgeDesc: {
        fontSize: 10,
        textAlign: 'center',
        lineHeight: 13,
        marginBottom: 4,
        minHeight: 26,
    },
    badgeProgressBar: {
        width: '100%',
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        overflow: 'hidden',
        marginTop: 4,
    },
    badgeProgressFill: {
        height: '100%',
        backgroundColor: '#F59E0B',
        borderRadius: 2,
    },
    badgeUnlockedText: {
        fontSize: 10,
        color: '#10B981',
        fontWeight: '600',
        marginTop: 4,
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    historyButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 16,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 80,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 8,
    },
    emptySubText: {
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 40,
    },
    historyCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    historyCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    historyIcon: {
        fontSize: 32,
    },
    historyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    historySubtitle: {
        fontSize: 13,
    },
    historyStats: {
        alignItems: 'flex-end',
    },
    statTag: {
        alignItems: 'flex-end',
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 10,
    },
    // Locked state styles
    lockedContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    lockIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    lockedTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    lockedDescription: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    lockedFeatures: {
        width: '100%',
        gap: 16,
        marginBottom: 32,
    },
    lockedFeatureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 20,
    },
    lockedFeatureText: {
        fontSize: 15,
        fontWeight: '500',
    },
    unlockButton: {
        width: '100%',
        height: 52,
        borderRadius: 26,
        overflow: 'hidden',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    unlockButtonGradient: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    unlockButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
});

