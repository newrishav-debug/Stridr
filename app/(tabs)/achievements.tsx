/**
 * File: app/(tabs)/achievements.tsx
 * Purpose: Screen displaying earned and locked badges.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Documentation added.
 */
import { View, Text, StyleSheet, ScrollView, FlatList, Dimensions } from 'react-native';
import { useGame } from '../../src/context/GameContext';
import { BADGE_COLLECTIONS, Badge } from '../../src/const/badges';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, usePreferences } from '../../src/context/PreferencesContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BADGE_CARD_WIDTH = 140;

export default function AchievementsScreen() {
    const { progress } = useGame();
    const theme = useTheme();
    const { preferences } = usePreferences();
    const unlockedBadgeIds = progress?.unlockedBadges || [];

    const renderBadge = (badge: Badge, isUnlocked: boolean) => {
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
                    {badge.description}
                </Text>
            </View>
        );
    };

    const renderCollection = (collection: typeof BADGE_COLLECTIONS[0]) => {
        // Separate unlocked and locked badges within this collection
        const unlocked = collection.badges.filter(b => unlockedBadgeIds.includes(b.id));
        const locked = collection.badges.filter(b => !unlockedBadgeIds.includes(b.id));

        // Combine with unlocked first
        const sortedBadges = [...unlocked, ...locked];

        return (
            <View key={collection.id} style={styles.collectionContainer}>
                {/* Collection Header */}
                <View style={styles.collectionHeader}>
                    <View style={styles.collectionTitleRow}>
                        <Text style={styles.collectionEmoji}>{collection.emoji}</Text>
                        <View style={styles.collectionInfo}>
                            <Text style={[styles.collectionName, { color: theme.text }]}>{collection.name}</Text>
                            <Text style={[styles.collectionDesc, { color: theme.textSecondary }]}>{collection.description}</Text>
                        </View>
                    </View>
                    <View style={styles.collectionProgress}>
                        <Text style={styles.progressText}>
                            {unlocked.length}/{collection.badges.length}
                        </Text>
                    </View>
                </View>

                {/* Horizontal Badge Carousel */}
                <FlatList
                    horizontal
                    data={sortedBadges}
                    renderItem={({ item }) => renderBadge(item, unlockedBadgeIds.includes(item.id))}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.carouselContent}
                    snapToInterval={BADGE_CARD_WIDTH + 12}
                    decelerationRate="fast"
                />
            </View>
        );
    };

    const totalBadges = BADGE_COLLECTIONS.reduce((sum, col) => sum + col.badges.length, 0);
    const totalUnlocked = unlockedBadgeIds.length;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header with Gradient */}
            <LinearGradient
                colors={['#F59E0B', '#D97706']}
                style={styles.headerGradient}
            >
                <Text style={styles.title}>Trophy Case</Text>
                <Text style={styles.subtitle}>
                    {totalUnlocked} of {totalBadges} badges unlocked
                </Text>
                <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${(totalUnlocked / totalBadges) * 100}%` }
                            ]}
                        />
                    </View>
                </View>
            </LinearGradient>

            {/* Vertical Scrolling Collections */}
            <ScrollView
                style={styles.collectionsScroll}
                showsVerticalScrollIndicator={false}
            >
                {BADGE_COLLECTIONS.map(collection => renderCollection(collection))}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    headerGradient: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 16,
    },
    progressBarContainer: {
        marginTop: 8,
    },
    progressBar: {
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: 'white',
        borderRadius: 4,
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
        color: '#111827',
        marginBottom: 2,
    },
    collectionDesc: {
        fontSize: 13,
        color: '#6B7280',
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
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    badgeCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    badgeUnlocked: {
        backgroundColor: '#FEF3C7',
        borderWidth: 3,
        borderColor: '#F59E0B',
    },
    badgeLocked: {
        backgroundColor: '#F3F4F6',
        borderWidth: 3,
        borderColor: '#D1D5DB',
    },
    badgeEmoji: {
        fontSize: 40,
    },
    badgeName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 6,
        textAlign: 'center',
        minHeight: 36,
    },
    badgeNameLocked: {
        color: '#9CA3AF',
    },
    badgeDesc: {
        fontSize: 11,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 15,
    },
    badgeDescLocked: {
        color: '#B4B4B8',
    },
});
