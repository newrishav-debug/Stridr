/**
 * File: src/components/DebugMenu.tsx
 * Purpose: Floating debug menu for developer actions.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Created component.
 * 2024-01-12: Added notification debug buttons.
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert } from 'react-native';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/PreferencesContext';
import { useSubscription } from '../context/SubscriptionContext';
import { NotificationService } from '../services/NotificationService';
import * as Notifications from 'expo-notifications';

export const DebugMenu: React.FC = () => {
    const { debug } = useGame();
    const theme = useTheme();
    const { isPro, togglePro } = useSubscription();
    const [visible, setVisible] = useState(false);

    // Only show in DEV mode
    if (!__DEV__) return null;

    if (!visible) {
        return (
            <TouchableOpacity
                style={[styles.floatingBtn, { backgroundColor: theme.card }]}
                onPress={() => setVisible(true)}
            >
                <Text style={{ fontSize: 24 }}>🐞</Text>
            </TouchableOpacity>
        );
    }

    const handleAction = async (name: string, action: () => Promise<void>) => {
        try {
            await action();
            Alert.alert('Success', `Action ${name} executed.`);
        } catch (e) {
            Alert.alert('Error', String(e));
        }
    };

    const testNotification = async (type: string) => {
        try {
            const hasPermission = await NotificationService.requestPermissions();
            if (!hasPermission) {
                Alert.alert('Permission Denied', 'Please enable notifications in device settings.');
                return;
            }

            switch (type) {
                case 'daily':
                    await NotificationService.scheduleDailyReminder('morning');
                    Alert.alert('Scheduled', 'Daily reminder scheduled for 9:00 AM');
                    break;
                case 'daily-now':
                    // Send the daily reminder immediately for testing
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: '⏰ Time for your daily walk!',
                            body: 'Every step counts. Let\'s make today great!',
                            sound: true,
                        },
                        trigger: null, // Immediate
                    });
                    break;
                case 'goal':
                    await NotificationService.sendGoalAchievement(10000);
                    break;
                case 'badge':
                    await NotificationService.sendBadgeUnlock('Marathon Maniac', '🏁');
                    break;
                case 'milestone':
                    await NotificationService.sendMilestone(50, 'Golden Triangle');
                    break;
                case 'landmark':
                    await NotificationService.sendLandmarkReached('Taj Mahal');
                    break;
                case 'inactivity':
                    await NotificationService.sendInactivityNudge(3);
                    break;
            }
        } catch (e) {
            Alert.alert('Error', String(e));
        }
    };

    return (
        <Modal transparent animationType="slide" visible={visible}>
            <View style={styles.modalOverlay}>
                <View style={[styles.container, { backgroundColor: theme.card }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: theme.text }]}>Developer Tools</Text>
                        <TouchableOpacity onPress={() => setVisible(false)}>
                            <Text style={{ color: theme.textSecondary, fontSize: 18 }}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.content}>
                        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Progress</Text>

                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: theme.primary }]}
                            onPress={() => handleAction('Add 1000 Steps', () => debug?.addSteps(1000)!)}
                        >
                            <Text style={styles.btnText}>Add 1000 Steps</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: theme.primary }]}
                            onPress={() => handleAction('Add 10k Steps', () => debug?.addSteps(10000)!)}
                        >
                            <Text style={styles.btnText}>Add 10k Steps</Text>
                        </TouchableOpacity>

                        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Step Diagnostics</Text>
                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: '#06B6D4' }]}
                            onPress={async () => {
                                const { StepService } = await import('../services/StepService');
                                const steps = await StepService.getTodaySteps();
                                const now = new Date();
                                const start = new Date();
                                start.setHours(0, 0, 0, 0);
                                Alert.alert(
                                    'Raw Pedometer Data',
                                    `Today's Steps: ${steps.toLocaleString()}\n\nQuery Range:\nFrom: ${start.toLocaleTimeString()}\nTo: ${now.toLocaleTimeString()}\n\nIf this differs from your device's Health app, the Pedometer may not be syncing properly. Try:\n1. Closing and reopening the app\n2. Check Motion & Fitness permissions\n3. Restart your device`
                                );
                            }}
                        >
                            <Text style={styles.btnText}>🔍 Show Raw Pedometer Steps</Text>
                        </TouchableOpacity>

                        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Streak</Text>
                        <View style={styles.row}>
                            <TouchableOpacity
                                style={[styles.btn, styles.halfBtn, { backgroundColor: theme.secondary }]}
                                onPress={() => handleAction('Set Streak 10', () => debug?.setStreak(10)!)}
                            >
                                <Text style={styles.btnText}>Set 10 Days</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.btn, styles.halfBtn, { backgroundColor: theme.secondary }]}
                                onPress={() => handleAction('Set Streak 0', () => debug?.setStreak(0)!)}
                            >
                                <Text style={styles.btnText}>Reset Streak</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>🔔 Notifications</Text>
                        <View style={styles.row}>
                            <TouchableOpacity
                                style={[styles.btn, styles.halfBtn, { backgroundColor: '#8B5CF6' }]}
                                onPress={() => testNotification('daily')}
                            >
                                <Text style={styles.btnText}>⏰ Schedule</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.btn, styles.halfBtn, { backgroundColor: '#7C3AED' }]}
                                onPress={() => testNotification('daily-now')}
                            >
                                <Text style={styles.btnText}>⏰ Daily Now</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.row}>
                            <TouchableOpacity
                                style={[styles.btn, styles.halfBtn, { backgroundColor: '#10B981' }]}
                                onPress={() => testNotification('goal')}
                            >
                                <Text style={styles.btnText}>🎉 Goal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.btn, styles.halfBtn, { backgroundColor: '#F59E0B' }]}
                                onPress={() => testNotification('badge')}
                            >
                                <Text style={styles.btnText}>🏆 Badge</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.row}>
                            <TouchableOpacity
                                style={[styles.btn, styles.halfBtn, { backgroundColor: '#3B82F6' }]}
                                onPress={() => testNotification('milestone')}
                            >
                                <Text style={styles.btnText}>🎯 Milestone</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.btn, styles.halfBtn, { backgroundColor: '#06B6D4' }]}
                                onPress={() => testNotification('landmark')}
                            >
                                <Text style={styles.btnText}>📍 Landmark</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: '#EF4444' }]}
                            onPress={() => testNotification('inactivity')}
                        >
                            <Text style={styles.btnText}>👋 Inactivity</Text>
                        </TouchableOpacity>

                        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Danger Zone</Text>
                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: 'red' }]}
                            onPress={() => handleAction('Reset Everything', () => debug?.resetProgress()!)}
                        >
                            <Text style={styles.btnText}>Reset ALL Progress</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: 'purple', marginTop: 10 }]}
                            onPress={() => handleAction('Unlock All Badges', () => debug?.unlockAllBadges()!)}
                        >
                            <Text style={styles.btnText}>Unlock All Badges</Text>
                        </TouchableOpacity>

                        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>💎 Subscription</Text>
                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: isPro ? '#10B981' : '#F59E0B' }]}
                            onPress={() => {
                                togglePro();
                                Alert.alert('Subscription Toggled', `isPro is now: ${!isPro}`);
                            }}
                        >
                            <Text style={styles.btnText}>
                                {isPro ? '✓ Premium Active (Tap to Disable)' : '○ Free User (Tap to Enable Pro)'}
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    floatingBtn: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 999
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        height: '70%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        gap: 15,
        paddingBottom: 40
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginTop: 10,
    },
    btn: {
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    halfBtn: {
        flex: 1,
    }
});
