/**
 * File: src/services/StorageService.ts
 * Purpose: Persistence layer using AsyncStorage.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Documentation added.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, DailyLog } from '../types';

const getKeys = (userId: string) => ({
    USER_PROGRESS: `stridr_user_progress_${userId}`,
    DAILY_LOGS: `stridr_daily_logs_${userId}`,
});

const INITIAL_PROGRESS: UserProgress = {
    selectedTrailId: null,
    trailStartDate: null,
    targetDays: 7,
    totalStepsValid: 0,
    currentDistanceMeters: 0,
    lastSyncTime: new Date().toISOString(),
    unlockedBadges: [],
    currentStreak: 0,
    lastLogDate: null,
    completedTrails: [],
};

export const StorageService = {
    async saveProgress(userId: string, progress: UserProgress): Promise<void> {
        try {
            const keys = getKeys(userId);
            await AsyncStorage.setItem(keys.USER_PROGRESS, JSON.stringify(progress));
        } catch (e) {
            console.error('Failed to save progress', e);
        }
    },

    async getProgress(userId: string): Promise<UserProgress> {
        try {
            const keys = getKeys(userId);
            const json = await AsyncStorage.getItem(keys.USER_PROGRESS);
            return json != null ? JSON.parse(json) : { ...INITIAL_PROGRESS }; // Return copy
        } catch (e) {
            console.error('Failed to load progress', e);
            return { ...INITIAL_PROGRESS };
        }
    },

    async saveDailyLog(userId: string, log: DailyLog): Promise<void> {
        try {
            // Get existing logs
            const existing = await this.getDailyLogs(userId);
            // Remove entry if exists for same date
            const filtered = existing.filter(l => l.date !== log.date);
            // Add new
            filtered.push(log);
            // Save
            const keys = getKeys(userId);
            await AsyncStorage.setItem(keys.DAILY_LOGS, JSON.stringify(filtered));
        } catch (e) {
            console.error('Failed to save log', e);
        }
    },

    async getDailyLogs(userId: string): Promise<DailyLog[]> {
        try {
            const keys = getKeys(userId);
            const json = await AsyncStorage.getItem(keys.DAILY_LOGS);
            return json != null ? JSON.parse(json) : [];
        } catch (e) {
            return [];
        }
    },

    async savePreferences(preferences: any): Promise<void> {
        try {
            await AsyncStorage.setItem('stridr_preferences', JSON.stringify(preferences));
        } catch (e) {
            console.error('Failed to save preferences', e);
        }
    },

    async getPreferences(): Promise<any | null> {
        try {
            const json = await AsyncStorage.getItem('stridr_preferences');
            return json != null ? JSON.parse(json) : null;
        } catch (e) {
            console.error('Failed to load preferences', e);
            return null;
        }
    },

    // For background tasks that need user ID
    async saveCurrentUserId(userId: string): Promise<void> {
        try {
            await AsyncStorage.setItem('stridr_current_user_id', userId);
        } catch (e) {
            console.error('Failed to save current user id', e);
        }
    },

    async getCurrentUserId(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem('stridr_current_user_id');
        } catch (e) {
            console.error('Failed to get current user id', e);
            return null;
        }
    },

    async clearCurrentUserId(): Promise<void> {
        try {
            await AsyncStorage.removeItem('stridr_current_user_id');
        } catch (e) {
            console.error('Failed to clear current user id', e);
        }
    }
};
