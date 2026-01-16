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
import { View, Text, StyleSheet, ScrollView, FlatList, Dimensions } from 'react-native';
import { useGame } from '../../src/context/GameContext';
import {
    BADGE_COLLECTIONS,
    Badge,
    MONTHLY_STEP_BADGES,
    MONTHLY_DISTANCE_BADGES,
    TRAIL_BADGES,
    MONTHLY_BADGES_TOTAL,
    MONTHLY_MASTER_REQUIREMENT,
    MONTH_NAMES,
    MONTH_ICONS
} from '../../src/const/badges';
import { BadgeService } from '../../src/services/BadgeService';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../src/context/PreferencesContext';
import { Award, Target, MapPin, Trophy, Lock } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BADGE_CARD_WIDTH = 140;

export default function AchievementsScreen() {
    const { progress } = useGame();
    const theme = useTheme();

    const monthlyProgress = progress?.monthlyProgress;
    const yearlyProgress = progress?.yearlyProgress || [];
    const trailBadges = progress?.trailBadges || [];

    // Current month info
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const monthName = MONTH_NAMES[currentMonth - 1];
    const monthIcon = MONTH_ICONS[currentMonth - 1];

    // Monthly badge counts
    const monthlyUnlockedCount = monthlyProgress?.unlockedBadgeIds.length || 0;
    const badgesRemaining = Math.max(0, MONTHLY_MASTER_REQUIREMENT - monthlyUnlockedCount);
    const monthlyMasterEarned = monthlyProgress?.monthlyBadgeEarned || false;

    // Get current year progress
    const currentYearProgress = yearlyProgress.find(yp => yp.year === currentYear);
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
                    {badge.description.replace('this month', `in ${monthName}`)}
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
        const unlockedIds = new Set(monthlyProgress?.unlockedBadgeIds || []);
        const currentValue = type === 'steps'
            ? (monthlyProgress?.stepsThisMonth || 0)
            : (monthlyProgress?.distanceMetersThisMonth || 0);

        return (
            <View style={styles.collectionContainer}>
                <View style={styles.collectionHeader}>
                    <View style={styles.collectionTitleRow}>
                        <Text style={styles.collectionEmoji}>{emoji}</Text>
                        <View style={styles.collectionInfo}>
                            <Text style={[styles.collectionName, { color: theme.text }]}>{title}</Text>
                            <Text style={[styles.collectionDesc, { color: theme.textSecondary }]}>
                                {type === 'steps'
                                    ? `${(currentValue).toLocaleString()} steps this month`
                                    : `${(currentValue / 1000).toFixed(1)} km this month`
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
                                {completedCount} trails completed
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

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header with Monthly Progress */}
            <LinearGradient
                colors={monthlyMasterEarned ? ['#10B981', '#059669'] : ['#F59E0B', '#D97706']}
                style={styles.headerGradient}
            >
                <View style={styles.headerTop}>
                    <Text style={styles.monthIcon}>{monthIcon}</Text>
                    <Text style={styles.title}>{monthName} Challenge</Text>
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

                {/* Yearly Progress */}
                <View style={styles.yearlySection}>
                    <Text style={styles.yearlyTitle}>
                        {currentYear} Champion: {monthlyBadgesEarnedThisYear}/12 months
                    </Text>
                    {yearlyChampionEarned && (
                        <Text style={styles.yearlyChampionText}>🏆 Champion!</Text>
                    )}
                </View>
            </LinearGradient>

            {/* Badge Collections */}
            <ScrollView style={styles.collectionsScroll} showsVerticalScrollIndicator={false}>
                {renderMonthlyCollection('Walking Warriors', '⚔️', MONTHLY_STEP_BADGES, 'steps')}
                {renderMonthlyCollection('Distance Destroyers', '🗺️', MONTHLY_DISTANCE_BADGES, 'distance')}
                {renderTrailBadges()}
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
});

