/**
 * File: src/services/StorageService.ts
 * Purpose: Centralized persistence layer using Firestore.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Documentation added.
 * 2026-01-14: Migrated from AsyncStorage to Firestore.
 */
import { doc, setDoc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserProgress, DailyLog } from '../types';

export const StorageService = {
    /**
     * Save user progress to Firestore
     */
    async saveProgress(userId: string, progress: UserProgress): Promise<void> {
        try {
            await setDoc(doc(db, 'userProgress', userId), {
                ...progress,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error saving progress:', error);
            throw error;
        }
    },

    /**
     * Get user progress from Firestore
     */
    async getProgress(userId: string): Promise<UserProgress | null> {
        try {
            const docSnap = await getDoc(doc(db, 'userProgress', userId));
            if (docSnap.exists()) {
                return docSnap.data() as UserProgress;
            }
            return null;
        } catch (error) {
            console.error('Error getting progress:', error);
            return null;
        }
    },

    /**
     * Save a daily log entry to Firestore
     */
    async saveDailyLog(userId: string, log: DailyLog): Promise<void> {
        try {
            await setDoc(doc(db, 'dailyLogs', userId, 'logs', log.date), log);
        } catch (error) {
            console.error('Error saving daily log:', error);
            throw error;
        }
    },

    /**
     * Get all daily logs for a user from Firestore
     */
    async getDailyLogs(userId: string): Promise<DailyLog[]> {
        try {
            const logsCollection = collection(db, 'dailyLogs', userId, 'logs');
            const q = query(logsCollection, orderBy('date', 'desc'));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => doc.data() as DailyLog);
        } catch (error) {
            console.error('Error getting daily logs:', error);
            return [];
        }
    },

    /**
     * Save user preferences to Firestore
     */
    async savePreferences(userId: string, preferences: any): Promise<void> {
        try {
            await setDoc(doc(db, 'preferences', userId), {
                ...preferences,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error saving preferences:', error);
            throw error;
        }
    },

    /**
     * Get user preferences from Firestore
     */
    async getPreferences(userId: string): Promise<any | null> {
        try {
            const docSnap = await getDoc(doc(db, 'preferences', userId));
            if (docSnap.exists()) {
                return docSnap.data();
            }
            return null;
        } catch (error) {
            console.error('Error getting preferences:', error);
            return null;
        }
    },
};
