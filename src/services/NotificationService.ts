/**
 * File: src/services/NotificationService.ts
 * Purpose: Handles all push notification logic including permissions, scheduling, and sending.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Initial creation with all notification types.
 */
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { StorageService } from './StorageService';
import { ReminderTime } from '../context/PreferencesContext';

// Background task name
const INACTIVITY_CHECK_TASK = 'INACTIVITY_CHECK_TASK';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// Reminder time presets (hour in 24h format)
export const REMINDER_TIMES: Record<ReminderTime, { hour: number; label: string }> = {
    morning: { hour: 9, label: '9:00 AM' },
    afternoon: { hour: 14, label: '2:00 PM' },
    evening: { hour: 18, label: '6:00 PM' },
};

export const NotificationService = {
    /**
     * Request notification permissions from the user
     */
    async requestPermissions(): Promise<boolean> {
        if (!Device.isDevice) {
            if (__DEV__) console.log('Push notifications require a physical device');
            return false;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            if (__DEV__) console.log('Failed to get push notification permissions');
            return false;
        }

        // Android-specific channel setup
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        return true;
    },

    /**
     * Schedule a daily reminder notification
     */
    async scheduleDailyReminder(time: ReminderTime): Promise<string | null> {
        // Cancel existing daily reminder first
        await this.cancelDailyReminder();

        const hourToSchedule = REMINDER_TIMES[time].hour;

        try {
            const identifier = await Notifications.scheduleNotificationAsync({
                content: {
                    title: '⏰ Time for your daily walk!',
                    body: 'Every step counts. Let\'s make today great!',
                    sound: true,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DAILY,
                    hour: hourToSchedule,
                    minute: 0,
                },
            });
            if (__DEV__) console.log('Daily reminder scheduled:', identifier);
            return identifier;
        } catch (error) {
            console.error('Failed to schedule daily reminder:', error);
            return null;
        }
    },

    /**
     * Cancel daily reminder notification
     */
    async cancelDailyReminder(): Promise<void> {
        await Notifications.cancelAllScheduledNotificationsAsync();
    },

    /**
     * Send goal achievement notification
     */
    async sendGoalAchievement(goal: number): Promise<void> {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '🎉 Goal Achieved!',
                body: `Amazing! You've hit your ${goal.toLocaleString()} step goal today!`,
                sound: true,
            },
            trigger: null, // Send immediately
        });
    },

    /**
     * Send badge unlock notification
     */
    async sendBadgeUnlock(badgeName: string, icon: string): Promise<void> {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: `${icon} New Badge Unlocked!`,
                body: `You just earned the "${badgeName}" badge!`,
                sound: true,
            },
            trigger: null,
        });
    },

    /**
     * Send milestone celebration notification
     */
    async sendMilestone(percent: number, trailName: string): Promise<void> {
        const emoji = percent === 100 ? '🎊' : '🎯';
        const message = percent === 100
            ? `Congratulations! You've completed ${trailName}!`
            : `You've reached ${percent}% of ${trailName}!`;

        await Notifications.scheduleNotificationAsync({
            content: {
                title: `${emoji} Trail Milestone!`,
                body: message,
                sound: true,
            },
            trigger: null,
        });
    },

    /**
     * Send landmark reached notification
     */
    async sendLandmarkReached(landmarkName: string): Promise<void> {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '📍 Landmark Reached!',
                body: `You've arrived at ${landmarkName}!`,
                sound: true,
            },
            trigger: null,
        });
    },

    /**
     * Send inactivity nudge notification
     */
    async sendInactivityNudge(daysSinceLastWalk: number): Promise<void> {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '👋 We miss you!',
                body: `It's been ${daysSinceLastWalk} days since your last walk. Ready to get moving?`,
                sound: true,
            },
            trigger: null,
        });
    },

    /**
     * Register background task for inactivity checks
     */
    async registerInactivityCheck(): Promise<void> {
        try {
            await BackgroundFetch.registerTaskAsync(INACTIVITY_CHECK_TASK, {
                minimumInterval: 60 * 60 * 24, // Check once per day
                stopOnTerminate: false,
                startOnBoot: true,
            });
            if (__DEV__) console.log('Inactivity check task registered');
        } catch (error) {
            console.error('Failed to register inactivity check:', error);
        }
    },

    /**
     * Unregister background task
     */
    async unregisterInactivityCheck(): Promise<void> {
        try {
            await BackgroundFetch.unregisterTaskAsync(INACTIVITY_CHECK_TASK);
            if (__DEV__) console.log('Inactivity check task unregistered');
        } catch (error) {
            console.error('Failed to unregister inactivity check:', error);
        }
    },

    /**
     * Check if user has been inactive and send nudge if needed
     */
    async checkInactivityAndNotify(): Promise<void> {
        try {
            const userId = await StorageService.getCurrentUserId();
            if (!userId) return;

            const progress = await StorageService.getProgress(userId);
            const prefs = await StorageService.getPreferences();

            if (!progress || !prefs) return;
            if (!prefs.notificationsEnabled || !prefs.notificationSettings?.inactivityNudge) return;

            const lastLogDate = progress.lastLogDate;
            if (!lastLogDate) return;

            const today = new Date();
            const lastLog = new Date(lastLogDate);
            const diffTime = Math.abs(today.getTime() - lastLog.getTime());
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays >= 3) {
                await this.sendInactivityNudge(diffDays);
            }
        } catch (error) {
            console.error('Error checking inactivity:', error);
        }
    },
};

// Define the background task
TaskManager.defineTask(INACTIVITY_CHECK_TASK, async () => {
    try {
        await NotificationService.checkInactivityAndNotify();
        return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
        console.error('Background inactivity check failed:', error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});
