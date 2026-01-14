/**
 * File: src/context/GameContext.tsx
 * Purpose: Manages game state, user progress, and logic synchronization.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Refactored to use services.
 * 2024-01-12: Added notification triggers for badges, goals, milestones.
 */
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AppState } from 'react-native';
import { UserProgress, CompletedTrail, DailyLog } from '../types';
import { StorageService } from '../services/StorageService';
import { StepService } from '../services/StepService';
import { NotificationService } from '../services/NotificationService';
import { stepsToMeters } from '../utils/conversion';
import { BADGES } from '../const/badges';
import { TRAILS } from '../const/trails';
import { useAuth } from './AuthContext';
import { StatsService } from '../services/StatsService';
import { BadgeService } from '../services/BadgeService';

interface GameContextType {
    progress: UserProgress | null;
    isLoading: boolean;
    sync: () => Promise<void>;
    selectTrail: (trailId: string, days: number) => Promise<void>;
    extendTrail: (additionalDays: number) => Promise<void>;
    todaySteps: number;
    completedTrailsCount: number;
    debug?: {
        addSteps: (amount: number) => Promise<void>;
        setStreak: (days: number) => Promise<void>;
        resetProgress: () => Promise<void>;
        unlockAllBadges: () => Promise<void>;
    };
}

const GameContext = createContext<GameContextType>({} as GameContextType);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [progress, setProgress] = useState<UserProgress | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [todaySteps, setTodaySteps] = useState(0);
    const previousUnlockedLandmarks = useRef<Set<string>>(new Set());
    const goalNotifiedToday = useRef<string | null>(null);

    useEffect(() => {
        if (user) {
            loadData(user.id);
        } else {
            setProgress(null);
            setIsLoading(false);
        }
    }, [user]);

    const loadData = async (userId: string) => {
        setIsLoading(true);
        let p = await StorageService.getProgress(userId);

        // Initialize progress for new users
        if (!p) {
            p = {
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
            await StorageService.saveProgress(userId, p);
        }

        if (!p.completedTrails) {
            p.completedTrails = []; // Initialize if missing
        } else if (p.completedTrails.length > 0 && typeof p.completedTrails[0] === 'string') {
            // Migration: Convert old string IDs to CompletedTrail objects
            console.log('Migrating completedTrails from strings to objects');
            p.completedTrails = (p.completedTrails as any[]).map((id: string) => ({
                trailId: id,
                completedDate: new Date().toISOString(), // Fallback
                startDate: new Date().toISOString(), // Fallback
                totalSteps: 0,
                totalDays: 1,
                avgStepsPerDay: 0,
                maxStepsInOneDay: 0
            }));
        }

        setProgress(p);

        const permitted = await StepService.requestPermissions();
        if (permitted) {
            const today = await StepService.getTodaySteps();
            setTodaySteps(today);
        }

        setIsLoading(false);
    };

    // Automatic hourly sync while app is active
    useEffect(() => {
        if (!user || !progress?.selectedTrailId) return;

        // Initial sync when component loads with active trail
        sync();

        // Set up hourly sync interval (3600000 ms = 1 hour)
        const HOUR_IN_MS = 60 * 60 * 1000;
        const syncInterval = setInterval(() => {
            console.log('[GameContext] Automatic hourly sync triggered');
            sync();
        }, HOUR_IN_MS);

        // Cleanup interval on unmount or when dependencies change
        return () => {
            console.log('[GameContext] Cleaning up sync interval');
            clearInterval(syncInterval);
        };
    }, [user, progress?.selectedTrailId]);

    // Sync when app comes to foreground/resumes
    useEffect(() => {
        if (!user || !progress?.selectedTrailId) return;

        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                console.log('[GameContext] App resumed - triggering sync');
                sync();
            }
        });

        // Cleanup listener on unmount
        return () => {
            subscription.remove();
        };
    }, [user, progress?.selectedTrailId]);

    // Helper to check and handle trail completion
    const checkAndCompleteTrail = async (currentProgress: UserProgress): Promise<UserProgress> => {
        if (!currentProgress.selectedTrailId || !user) return currentProgress;

        const currentTrail = TRAILS.find(t => t.id === currentProgress.selectedTrailId);
        if (!currentTrail) return currentProgress;

        if (currentProgress.currentDistanceMeters >= currentTrail.totalDistanceMeters) {
            const logs = await StorageService.getDailyLogs(user.id);
            const completedTrail = StatsService.checkTrailCompletion(currentProgress, currentTrail, new Date(), logs);

            if (completedTrail) {
                return {
                    ...currentProgress,
                    completedTrails: [...(currentProgress.completedTrails || []), completedTrail],
                    selectedTrailId: null,
                    currentDistanceMeters: 0,
                    totalStepsValid: 0,
                    trailStartDate: null,
                    targetDays: 0
                };
            }
        }
        return currentProgress;
    };

    const sync = async () => {
        if (!progress || !user) return;

        try {
            const lastSync = new Date(progress.lastSyncTime);
            const now = new Date();

            if (now <= lastSync) return;

            const permitted = await StepService.requestPermissions();
            if (!permitted) {
                alert('Permission denied. Please enable motion permissions in settings.');
                return;
            }

            const newSteps = await StepService.getStepsBetween(lastSync, now);

            if (newSteps > 0) {
                const addedDistance = stepsToMeters(newSteps);

                // Streak Logic
                const newStreak = StatsService.calculateStreak(progress.currentStreak || 0, progress.lastLogDate, now);
                const nowString = now.toISOString().split('T')[0];

                // Get user preferences for notifications
                const prefs = await StorageService.getPreferences(user.id);
                const notificationsEnabled = prefs?.notificationsEnabled ?? false;
                const notifSettings = prefs?.notificationSettings;

                let newProgress: UserProgress = {
                    ...progress,
                    totalStepsValid: progress.totalStepsValid + newSteps,
                    currentDistanceMeters: progress.currentDistanceMeters + addedDistance,
                    lastSyncTime: now.toISOString(),
                    currentStreak: newStreak,
                    lastLogDate: nowString,
                    completedTrails: progress.completedTrails || []
                };

                // Store previous milestone % before update for milestone notifications
                const currentTrail = progress.selectedTrailId
                    ? TRAILS.find(t => t.id === progress.selectedTrailId)
                    : null;
                const prevPercent = currentTrail
                    ? Math.floor((progress.currentDistanceMeters / currentTrail.totalDistanceMeters) * 100)
                    : 0;

                // Check for Trail Completion
                const wasCompleted = newProgress.selectedTrailId !== null;
                newProgress = await checkAndCompleteTrail(newProgress);
                const isNowCompleted = newProgress.selectedTrailId === null && wasCompleted;

                // Milestone notification (25%, 50%, 75%, 100%)
                if (notificationsEnabled && notifSettings?.milestone && currentTrail && !isNowCompleted) {
                    const newPercent = Math.floor((newProgress.currentDistanceMeters / currentTrail.totalDistanceMeters) * 100);
                    const milestones = [25, 50, 75];
                    for (const milestone of milestones) {
                        if (prevPercent < milestone && newPercent >= milestone) {
                            await NotificationService.sendMilestone(milestone, currentTrail.name);
                            break;
                        }
                    }
                }

                // Trail completion notification
                if (isNowCompleted && notificationsEnabled && notifSettings?.milestone && currentTrail) {
                    await NotificationService.sendMilestone(100, currentTrail.name);
                }

                // Landmark reached notification
                if (notificationsEnabled && notifSettings?.landmarkReached && currentTrail) {
                    const newlyReachedLandmarks = currentTrail.landmarks.filter(
                        lm => lm.distanceMeters <= newProgress.currentDistanceMeters &&
                            !previousUnlockedLandmarks.current.has(lm.id)
                    );
                    for (const lm of newlyReachedLandmarks) {
                        await NotificationService.sendLandmarkReached(lm.name);
                        previousUnlockedLandmarks.current.add(lm.id);
                    }
                }

                // Check for new badges
                const newBadgeIds = BadgeService.checkNewBadges(newProgress);
                if (newBadgeIds.length > 0) {
                    newProgress.unlockedBadges = [...(newProgress.unlockedBadges || []), ...newBadgeIds];

                    // Badge unlock notifications
                    if (notificationsEnabled && notifSettings?.badgeUnlock) {
                        for (const badgeId of newBadgeIds) {
                            const badge = BADGES.find(b => b.id === badgeId);
                            if (badge) {
                                await NotificationService.sendBadgeUnlock(badge.name, badge.icon);
                            }
                        }
                    }
                }

                setProgress(newProgress);
                await StorageService.saveProgress(user.id, newProgress);

                const today = await StepService.getTodaySteps();
                setTodaySteps(today);

                // Goal achievement notification (once per day)
                const dailyGoal = prefs?.dailyGoal ?? 10000;
                if (notificationsEnabled && notifSettings?.goalAchievement) {
                    if (today >= dailyGoal && goalNotifiedToday.current !== nowString) {
                        await NotificationService.sendGoalAchievement(dailyGoal);
                        goalNotifiedToday.current = nowString;
                    }
                }
            } else {
                const newProgress = { ...progress, lastSyncTime: now.toISOString() };
                setProgress(newProgress);
                await StorageService.saveProgress(user.id, newProgress);
            }
        } catch (error) {
            console.error('Sync Error', error);
        }
    };

    const selectTrail = async (trailId: string, days: number) => {
        if (!user) return;
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const newProgress: UserProgress = {
            selectedTrailId: trailId,
            targetDays: days,
            trailStartDate: startOfToday.toISOString(),
            totalStepsValid: 0,
            currentDistanceMeters: 0,
            lastSyncTime: startOfToday.toISOString(),
            unlockedBadges: progress?.unlockedBadges || [],
            completedTrails: progress?.completedTrails || [],
            currentStreak: progress?.currentStreak || 0,
            lastLogDate: progress?.lastLogDate || null
        };
        setProgress(newProgress);
        await StorageService.saveProgress(user.id, newProgress);
    };

    const extendTrail = async (additionalDays: number) => {
        if (!user || !progress) return;

        const newProgress: UserProgress = {
            ...progress,
            targetDays: progress.targetDays + additionalDays,
        };
        setProgress(newProgress);
        await StorageService.saveProgress(user.id, newProgress);
    };



    if (isLoading && !progress) {
        // Only block if loading AND no data. If not loading and no progress, it means no user or empty data.
        return null;
    }

    return (
        <GameContext.Provider value={{
            progress,
            isLoading,
            sync,
            selectTrail,
            extendTrail,
            todaySteps,
            completedTrailsCount: progress?.completedTrails?.length || 0,
            debug: {
                addSteps: async (amount: number) => {
                    if (!progress || !user) return;
                    let newProgress = {
                        ...progress,
                        totalStepsValid: progress.totalStepsValid + amount,
                        currentDistanceMeters: progress.currentDistanceMeters + stepsToMeters(amount)
                    };

                    // Check for completion immediately
                    newProgress = await checkAndCompleteTrail(newProgress);

                    setProgress(newProgress);
                    await StorageService.saveProgress(user.id, newProgress);
                },
                setStreak: async (days: number) => {
                    if (!progress || !user) return;
                    const newProgress = { ...progress, currentStreak: days };
                    setProgress(newProgress);
                    await StorageService.saveProgress(user.id, newProgress);
                },
                resetProgress: async () => {
                    if (!user) return;
                    await StorageService.saveProgress(user.id, {
                        selectedTrailId: null,
                        trailStartDate: null,
                        targetDays: 0,
                        totalStepsValid: 0,
                        currentDistanceMeters: 0,
                        lastSyncTime: new Date().toISOString(),
                        unlockedBadges: [],
                        completedTrails: [],
                        currentStreak: 0,
                        lastLogDate: null
                    });
                    loadData(user.id);
                },
                unlockAllBadges: async () => {
                    if (!progress || !user) return;
                    const allIds = BADGES.map(b => b.id);
                    const newProgress = { ...progress, unlockedBadges: allIds };
                    setProgress(newProgress);
                    await StorageService.saveProgress(user.id, newProgress);
                }
            }
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
