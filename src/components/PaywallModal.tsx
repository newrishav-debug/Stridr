/**
 * File: src/components/PaywallModal.tsx
 * Purpose: Reusable modal for prompting users to upgrade to premium.
 * Created: 2026-01-17
 * Author: AI Assistant
 */
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/PreferencesContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Sparkles, X } from 'lucide-react-native';

export type LockedFeature =
    | 'trails'
    | 'badges'
    | 'dashboard'
    | 'notifications'
    | 'export'
    | 'goal'
    | 'darkmode';

interface PaywallModalProps {
    visible: boolean;
    onClose: () => void;
    feature: LockedFeature;
    title?: string;
    message?: string;
}

const FEATURE_CONTENT: Record<LockedFeature, { icon: string; title: string; message: string }> = {
    trails: {
        icon: '🏔️',
        title: 'Unlock All Trails',
        message: 'Upgrade to Premium to access all 24 trails including iconic treks across India and famous city marathons worldwide.',
    },
    badges: {
        icon: '🏆',
        title: 'Earn & Collect Badges',
        message: 'Start earning achievement badges by upgrading to Premium. Track your accomplishments and build your collection!',
    },
    dashboard: {
        icon: '📊',
        title: 'Detailed Analytics',
        message: 'Get access to in-depth statistics, personal records, trends, and detailed progress insights with Premium.',
    },
    notifications: {
        icon: '🔔',
        title: 'Custom Notifications',
        message: 'Personalize your notification preferences with custom reminders, goal alerts, and milestone celebrations.',
    },
    export: {
        icon: '📤',
        title: 'Export Your Data',
        message: 'Download and export your walking history, statistics, and achievements with Premium.',
    },
    goal: {
        icon: '🎯',
        title: 'Custom Daily Goals',
        message: 'Set your own personalized daily step goal instead of the default 10,000 steps.',
    },
    darkmode: {
        icon: '🌙',
        title: 'Dark Mode',
        message: 'Enable dark theme for a comfortable viewing experience at night and to save battery on OLED screens.',
    },
};

export const PaywallModal: React.FC<PaywallModalProps> = ({
    visible,
    onClose,
    feature,
    title,
    message,
}) => {
    const theme = useTheme();
    const router = useRouter();
    const content = FEATURE_CONTENT[feature];

    const handleUpgrade = () => {
        onClose();
        router.push('/paywall');
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.container, { backgroundColor: theme.card }]}>
                            {/* Close Button */}
                            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                                <X size={24} color={theme.textTertiary} />
                            </TouchableOpacity>

                            {/* Icon */}
                            <View style={styles.iconContainer}>
                                <View style={styles.lockBadge}>
                                    <Lock size={14} color="white" />
                                </View>
                                <Text style={styles.featureIcon}>{content.icon}</Text>
                            </View>

                            {/* Title */}
                            <Text style={[styles.title, { color: theme.text }]}>
                                {title || content.title}
                            </Text>

                            {/* Message */}
                            <Text style={[styles.message, { color: theme.textSecondary }]}>
                                {message || content.message}
                            </Text>

                            {/* Premium Badge */}
                            <View style={styles.premiumBadge}>
                                <Sparkles size={14} color="#FFD700" />
                                <Text style={styles.premiumText}>PREMIUM FEATURE</Text>
                            </View>

                            {/* CTA Button */}
                            <TouchableOpacity
                                style={styles.upgradeButton}
                                onPress={handleUpgrade}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={['#FFD700', '#FFA500']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.buttonGradient}
                                >
                                    <Text style={styles.upgradeButtonText}>
                                        Upgrade to Premium
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Secondary action */}
                            <TouchableOpacity onPress={onClose} style={styles.laterButton}>
                                <Text style={[styles.laterText, { color: theme.textSecondary }]}>
                                    Maybe Later
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    container: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 4,
    },
    iconContainer: {
        marginTop: 8,
        marginBottom: 16,
        position: 'relative',
    },
    featureIcon: {
        fontSize: 56,
    },
    lockBadge: {
        position: 'absolute',
        top: -4,
        right: -8,
        backgroundColor: '#EF4444',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    message: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 20,
    },
    premiumBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
        marginBottom: 24,
    },
    premiumText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#B8860B',
        letterSpacing: 1,
    },
    upgradeButton: {
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
    buttonGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    upgradeButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    laterButton: {
        marginTop: 16,
        padding: 8,
    },
    laterText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
