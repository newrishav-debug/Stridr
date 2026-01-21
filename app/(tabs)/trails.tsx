/**
 * File: app/(tabs)/trails.tsx
 * Purpose: Screen for browsing and selecting available trails.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Documentation added.
 */
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useState } from 'react';

import { INDIAN_TRAILS, CLASSIC_MARATHONS, CITY_MARATHONS } from '../../src/const/trails';
import { useGame } from '../../src/context/GameContext';
import { useSubscription } from '../../src/context/SubscriptionContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Trail } from '../../src/types';
import { useRouter } from 'expo-router';
import { useTheme, usePreferences } from '../../src/context/PreferencesContext';
import { getDistanceValue, getDistanceUnit } from '../../src/utils/conversion';
import { GoalPromptModal } from '../../src/components/GoalPromptModal';
import { PaywallModal } from '../../src/components/PaywallModal';
import { isTrailFree } from '../../src/const/subscription';
import { Lock } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.55;
const CARD_SPACING = 16;

export default function TrailsScreen() {
    const { progress } = useGame();
    const { isPro } = useSubscription();
    const theme = useTheme();
    const router = useRouter();
    const { preferences } = usePreferences();
    const { selectTrail } = useGame();
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTrailIdForModal, setSelectedTrailIdForModal] = useState<string | null>(null);
    const [paywallVisible, setPaywallVisible] = useState(false);

    const handleTrailPress = (trailId: string) => {
        // Allow viewing trail details even if locked
        router.push(`/trail/${trailId}`);
    };

    const handleLockedTrailPress = () => {
        setPaywallVisible(true);
    };

    const handleStartPress = (trailId: string) => {
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

    const renderTrailCard = (trail: Trail, index: number, isFirstInSection: boolean) => {
        const isActive = progress?.selectedTrailId === trail.id;
        const isLocked = !isPro && !isTrailFree(trail.id);


        return (
            <TouchableOpacity
                key={trail.id}
                style={[
                    styles.card,
                    isFirstInSection && index === 0 && styles.firstCard,
                ]}
                onPress={() => handleTrailPress(trail.id)}
                activeOpacity={0.95}
            >
                <Image
                    source={trail.image}
                    style={styles.cardImage}
                    resizeMode="cover"
                />

                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.9)']}
                    style={styles.gradient}
                />

                {/* Lock Overlay for Premium Trails */}
                {isLocked && (
                    <View style={styles.lockOverlay}>
                        <View style={styles.lockBadge}>
                            <Lock size={16} color="white" />
                            <Text style={styles.lockBadgeText}>PREMIUM</Text>
                        </View>
                    </View>
                )}

                <View style={styles.cardContent}>
                    {isActive && (
                        <View style={styles.activeBadge}>
                            <Text style={styles.activeBadgeText}>ACTIVE TRAIL</Text>
                        </View>
                    )}

                    <Text style={styles.trailName}>{trail.name}</Text>

                    <View style={styles.difficultyContainer}>
                        <View style={styles.difficultyBadge}>
                            <Text style={styles.difficultyText}>{trail.difficulty}</Text>
                        </View>
                    </View>

                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Text style={styles.statValue}>{getDistanceValue(trail.totalDistanceMeters, preferences.distanceUnit).toFixed(0)} {getDistanceUnit(preferences.distanceUnit)}</Text>
                            <Text style={styles.statLabel}>Distance</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={styles.statValue}>{trail.landmarks.length}</Text>
                            <Text style={styles.statLabel}>Landmarks</Text>
                        </View>
                    </View>

                    {!isActive && (
                        isLocked ? (
                            <TouchableOpacity
                                style={styles.lockedButtonWrapper}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    handleLockedTrailPress();
                                }}
                            >
                                <LinearGradient
                                    colors={['rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.5)']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.lockedButtonGradient}
                                >
                                    <Lock size={16} color="white" />
                                    <Text style={styles.selectButtonText}>Unlock Premium</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={[styles.selectButton, { backgroundColor: trail.color }]}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    handleStartPress(trail.id);
                                }}
                            >
                                <Text style={styles.selectButtonText}>Start Trail</Text>
                            </TouchableOpacity>
                        )
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.mainHeader}>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Explore Trails</Text>
                <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Choose your next adventure</Text>
            </View>



            {/* Incredible India Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Incredible India</Text>
                <ScrollView
                    horizontal
                    pagingEnabled={false}
                    showsHorizontalScrollIndicator={false}
                    decelerationRate="fast"
                    snapToInterval={CARD_WIDTH + CARD_SPACING}
                    snapToAlignment="start"
                    contentContainerStyle={styles.scrollContent}
                >
                    {INDIAN_TRAILS.map((trail, index) => renderTrailCard(trail, index, true))}
                </ScrollView>
            </View>

            {/* Classic Marathons Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Classic Marathons</Text>
                <ScrollView
                    horizontal
                    pagingEnabled={false}
                    showsHorizontalScrollIndicator={false}
                    decelerationRate="fast"
                    snapToInterval={CARD_WIDTH + CARD_SPACING}
                    snapToAlignment="start"
                    contentContainerStyle={styles.scrollContent}
                >
                    {CLASSIC_MARATHONS.map((trail, index) => renderTrailCard(trail, index, true))}
                </ScrollView>
            </View>

            {/* City Marathons Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>City Marathons</Text>
                <ScrollView
                    horizontal
                    pagingEnabled={false}
                    showsHorizontalScrollIndicator={false}
                    decelerationRate="fast"
                    snapToInterval={CARD_WIDTH + CARD_SPACING}
                    snapToAlignment="start"
                    contentContainerStyle={styles.scrollContent}
                >
                    {CITY_MARATHONS.map((trail, index) => renderTrailCard(trail, index, true))}
                </ScrollView>
            </View>

            {/* Coming Soon Message */}
            <View style={styles.comingSoonContainer}>
                <Text style={[styles.comingSoonText, { color: '#000000' }]}>
                    ✨ More Trails are coming soon! Stay Tuned 🏔️
                </Text>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.textTertiary }]}>Swipe to explore • {INDIAN_TRAILS.length + CLASSIC_MARATHONS.length + CITY_MARATHONS.length} trails total</Text>
            </View>

            <GoalPromptModal
                visible={modalVisible}
                onCancel={handleModalCancel}
                onStart={handleModalStart}
            />

            <PaywallModal
                visible={paywallVisible}
                onClose={() => setPaywallVisible(false)}
                feature="trails"
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
    },
    mainHeader: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#6B7280',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginLeft: 24,
        marginBottom: 16,
    },
    scrollContent: {
        paddingVertical: 20,
    },
    card: {
        width: CARD_WIDTH,
        height: 380,
        marginLeft: CARD_SPACING,
        borderRadius: 24,
        backgroundColor: 'white',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    firstCard: {
        marginLeft: 24,
    },
    cardImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '65%',
    },
    cardContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 24,
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
    difficultyContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    difficultyBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    difficultyText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },

    trailName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },

    statsRow: {
        flexDirection: 'row',
        gap: 24,
        marginBottom: 20,
    },
    stat: {
        flex: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 2,
    },
    selectButton: {
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    lockedButtonWrapper: {
        overflow: 'hidden',
        borderRadius: 12,
    },
    lockedButtonGradient: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    selectButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    lockOverlay: {
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 10,
    },
    lockBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 4,
    },
    lockBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    comingSoonContainer: {
        marginTop: 40,
        marginBottom: 24,
        marginHorizontal: 24,
        paddingVertical: 32,
        paddingHorizontal: 20,
        borderRadius: 24,
        backgroundColor: '#F3F4F6', // Fallback color
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
    },
    comingSoonText: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        opacity: 0.8,
    },
    footer: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 13,
        color: '#9CA3AF',
    },
});
