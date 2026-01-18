/**
 * File: app/notification-settings.tsx
 * Purpose: Settings screen for configuring notification preferences.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Initial creation.
 */
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { usePreferences, useTheme, ReminderTime } from '../src/context/PreferencesContext';
import { useSubscription } from '../src/context/SubscriptionContext';
import { NotificationService, REMINDER_TIMES } from '../src/services/NotificationService';
import { useEffect, useState } from 'react';
import {
    ChevronLeft,
    Bell,
    Clock,
    Target,
    Award,
    Flag,
    MapPin,
    AlertCircle,
    BellOff,
    Lock
} from 'lucide-react-native';
import { PaywallModal } from '../src/components/PaywallModal';

export default function NotificationSettingsScreen() {
    const router = useRouter();
    const theme = useTheme();
    const { isPro } = useSubscription();
    const {
        preferences,
        setNotificationsEnabled,
        updateNotificationSetting
    } = usePreferences();

    const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
    const [paywallVisible, setPaywallVisible] = useState(false);

    const { notificationsEnabled, notificationSettings } = preferences;

    useEffect(() => {
        checkPermission();
    }, []);

    const checkPermission = async () => {
        const granted = await NotificationService.requestPermissions();
        setPermissionGranted(granted);
    };

    const handleMasterToggle = async (enabled: boolean) => {
        if (enabled && !permissionGranted) {
            const granted = await NotificationService.requestPermissions();
            if (!granted) {
                Alert.alert(
                    'Permissions Required',
                    'Please enable notifications in your device settings to receive alerts.',
                    [{ text: 'OK' }]
                );
                return;
            }
            setPermissionGranted(true);
        }

        setNotificationsEnabled(enabled);

        // Handle daily reminder scheduling
        if (enabled && notificationSettings.dailyReminder) {
            await NotificationService.scheduleDailyReminder(notificationSettings.dailyReminderTime);
        } else {
            await NotificationService.cancelDailyReminder();
        }

        // Handle inactivity background task
        if (enabled && notificationSettings.inactivityNudge) {
            await NotificationService.registerInactivityCheck();
        } else {
            await NotificationService.unregisterInactivityCheck();
        }
    };

    const handleDailyReminderToggle = async (enabled: boolean) => {
        updateNotificationSetting('dailyReminder', enabled);
        if (notificationsEnabled) {
            if (enabled) {
                await NotificationService.scheduleDailyReminder(notificationSettings.dailyReminderTime);
            } else {
                await NotificationService.cancelDailyReminder();
            }
        }
    };

    const handleReminderTimeChange = async (time: ReminderTime) => {
        updateNotificationSetting('dailyReminderTime', time);
        if (notificationsEnabled && notificationSettings.dailyReminder) {
            await NotificationService.scheduleDailyReminder(time);
        }
    };

    const handleInactivityToggle = async (enabled: boolean) => {
        updateNotificationSetting('inactivityNudge', enabled);
        if (notificationsEnabled) {
            if (enabled) {
                await NotificationService.registerInactivityCheck();
            } else {
                await NotificationService.unregisterInactivityCheck();
            }
        }
    };

    const renderSettingRow = (
        icon: React.ReactNode,
        title: string,
        subtitle: string,
        value: boolean,
        onToggle: (value: boolean) => void,
        iconBgColor: string,
        disabled: boolean = false,
        isPremiumLocked: boolean = false
    ) => {
        const isLocked = isPremiumLocked && !isPro;
        const isDisabled = disabled || isLocked;

        const handlePress = () => {
            if (isLocked) {
                setPaywallVisible(true);
            }
        };

        return (
            <TouchableOpacity
                style={[styles.row, isDisabled && styles.rowDisabled]}
                onPress={handlePress}
                activeOpacity={isLocked ? 0.7 : 1}
                disabled={!isLocked}
            >
                <View style={styles.rowLeft}>
                    <View style={[styles.iconBox, { backgroundColor: iconBgColor }]}>
                        {icon}
                    </View>
                    <View style={styles.rowTextContainer}>
                        <View style={styles.titleRow}>
                            <Text style={[styles.rowTitle, { color: isDisabled ? theme.textTertiary : theme.text }]}>
                                {title}
                            </Text>
                            {isLocked && (
                                <View style={styles.premiumBadge}>
                                    <Lock size={10} color="#B8860B" />
                                    <Text style={styles.premiumBadgeText}>PRO</Text>
                                </View>
                            )}
                        </View>
                        <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>
                            {subtitle}
                        </Text>
                    </View>
                </View>
                {isLocked ? (
                    <Lock size={20} color={theme.textTertiary} />
                ) : (
                    <Switch
                        value={value}
                        onValueChange={onToggle}
                        trackColor={{ false: theme.border, true: iconBgColor }}
                        thumbColor="white"
                        disabled={isDisabled}
                    />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Notifications</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Master Toggle Card */}
                <View style={[styles.masterCard, { backgroundColor: theme.card }]}>
                    <View style={styles.masterContent}>
                        <View style={[styles.masterIcon, { backgroundColor: notificationsEnabled ? '#EC4899' : theme.border }]}>
                            {notificationsEnabled ? (
                                <Bell size={28} color="white" />
                            ) : (
                                <BellOff size={28} color={theme.textTertiary} />
                            )}
                        </View>
                        <View style={styles.masterTextContainer}>
                            <Text style={[styles.masterTitle, { color: theme.text }]}>
                                Push Notifications
                            </Text>
                            <Text style={[styles.masterSubtitle, { color: theme.textSecondary }]}>
                                {notificationsEnabled ? 'Notifications are enabled' : 'Notifications are disabled'}
                            </Text>
                        </View>
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={handleMasterToggle}
                            trackColor={{ false: theme.border, true: '#EC4899' }}
                            thumbColor="white"
                        />
                    </View>
                </View>

                {/* Individual Settings */}
                <View style={[styles.section, !notificationsEnabled && styles.sectionDisabled]}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                        NOTIFICATION TYPES
                    </Text>

                    <View style={[styles.card, { backgroundColor: theme.card }]}>
                        {/* Daily Reminder */}
                        {renderSettingRow(
                            <Clock size={20} color="white" />,
                            'Daily Reminder',
                            'Get a reminder to walk each day',
                            notificationSettings.dailyReminder,
                            handleDailyReminderToggle,
                            '#8B5CF6',
                            !notificationsEnabled,
                            true
                        )}

                        {/* Time Picker - Only for Pro users */}
                        {isPro && notificationsEnabled && notificationSettings.dailyReminder && (
                            <View style={[styles.timePickerContainer, { borderTopColor: theme.border }]}>
                                <Text style={[styles.timePickerLabel, { color: theme.textSecondary }]}>
                                    Reminder Time
                                </Text>
                                <View style={styles.timePresets}>
                                    {(Object.keys(REMINDER_TIMES) as ReminderTime[]).map((time) => (
                                        <TouchableOpacity
                                            key={time}
                                            style={[
                                                styles.timeButton,
                                                {
                                                    backgroundColor: notificationSettings.dailyReminderTime === time
                                                        ? '#8B5CF6'
                                                        : theme.backgroundTertiary,
                                                }
                                            ]}
                                            onPress={() => handleReminderTimeChange(time)}
                                        >
                                            <Text style={[
                                                styles.timeButtonLabel,
                                                { color: notificationSettings.dailyReminderTime === time ? 'white' : theme.textSecondary }
                                            ]}>
                                                {time.charAt(0).toUpperCase() + time.slice(1)}
                                            </Text>
                                            <Text style={[
                                                styles.timeButtonTime,
                                                { color: notificationSettings.dailyReminderTime === time ? 'rgba(255,255,255,0.8)' : theme.textTertiary }
                                            ]}>
                                                {REMINDER_TIMES[time].label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        <View style={[styles.divider, { backgroundColor: theme.border }]} />

                        {/* Goal Achievement */}
                        {renderSettingRow(
                            <Target size={20} color="white" />,
                            'Goal Achievement',
                            'Celebrate when you hit your daily goal',
                            notificationSettings.goalAchievement,
                            (v) => updateNotificationSetting('goalAchievement', v),
                            '#10B981',
                            !notificationsEnabled,
                            true
                        )}

                        <View style={[styles.divider, { backgroundColor: theme.border }]} />

                        {/* Badge Unlock */}
                        {renderSettingRow(
                            <Award size={20} color="white" />,
                            'Badge Unlocks',
                            'Know when you earn new achievements',
                            notificationSettings.badgeUnlock,
                            (v) => updateNotificationSetting('badgeUnlock', v),
                            '#F59E0B',
                            !notificationsEnabled,
                            true
                        )}

                        <View style={[styles.divider, { backgroundColor: theme.border }]} />

                        {/* Milestone */}
                        {renderSettingRow(
                            <Flag size={20} color="white" />,
                            'Trail Milestones',
                            'Celebrate 25%, 50%, 75%, 100% progress',
                            notificationSettings.milestone,
                            (v) => updateNotificationSetting('milestone', v),
                            '#3B82F6',
                            !notificationsEnabled,
                            true
                        )}

                        <View style={[styles.divider, { backgroundColor: theme.border }]} />

                        {/* Landmark Reached */}
                        {renderSettingRow(
                            <MapPin size={20} color="white" />,
                            'Landmark Reached',
                            'Get notified when you reach landmarks',
                            notificationSettings.landmarkReached,
                            (v) => updateNotificationSetting('landmarkReached', v),
                            '#06B6D4',
                            !notificationsEnabled,
                            true
                        )}

                        <View style={[styles.divider, { backgroundColor: theme.border }]} />

                        {/* Inactivity Nudge */}
                        {renderSettingRow(
                            <AlertCircle size={20} color="white" />,
                            'Inactivity Nudge',
                            'Reminder if no walks for 3+ days',
                            notificationSettings.inactivityNudge,
                            handleInactivityToggle,
                            '#EF4444',
                            !notificationsEnabled,
                            true
                        )}
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            <PaywallModal
                visible={paywallVisible}
                onClose={() => setPaywallVisible(false)}
                feature="notifications"
            />
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
    content: {
        flex: 1,
        padding: 20,
    },
    masterCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    masterContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    masterIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    masterTextContainer: {
        flex: 1,
    },
    masterTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    masterSubtitle: {
        fontSize: 14,
    },
    section: {
        marginBottom: 24,
    },
    sectionDisabled: {
        opacity: 0.5,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        letterSpacing: 0.5,
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        minHeight: 72,
    },
    rowDisabled: {
        opacity: 0.5,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    rowTextContainer: {
        flex: 1,
    },
    rowTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    rowSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    divider: {
        height: 1,
        marginHorizontal: 16,
    },
    timePickerContainer: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderTopWidth: 1,
    },
    timePickerLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 12,
    },
    timePresets: {
        flexDirection: 'row',
        gap: 12,
    },
    timeButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        alignItems: 'center',
    },
    timeButtonLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 2,
    },
    timeButtonTime: {
        fontSize: 11,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    premiumBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.15)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        gap: 3,
    },
    premiumBadgeText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#B8860B',
        letterSpacing: 0.5,
    },
});
