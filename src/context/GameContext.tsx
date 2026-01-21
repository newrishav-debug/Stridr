/**
 * File: src/context/GameContext.tsx
 * Purpose: Manages game state, user progress, and logic synchronization.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Refactored to use services.
 * 2024-01-12: Added notification triggers for badges, goals, milestones.
 * 2026-01-15: Revamped badge system with monthly recurring badges.
 * 2026-01-20: Fixed trail sync to not count steps from before account creation.
 */
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import { UserProgress, CompletedTrail, MonthlyProgress, YearlyProgress } from '../types';
import { StorageService } from '../services/StorageService';
import { StepService } from '../services/StepService';
import { NotificationService } from '../services/NotificationService';
import { stepsToMeters } from '../utils/conversion';
import { BADGES, ALL_MONTHLY_BADGES, TRAIL_BADGES } from '../const/badges';
import { TRAILS } from '../const/trails';
import { useAuth } from './AuthContext';
import { StatsService } from '../services/StatsService';
import { BadgeService } from '../services/BadgeService';

interface GameContextType {
    progress: UserProgress | null;
    isLoading: boolean;
    sync: () => Promise<void>;
    selectTrail: (trailId: string, days: number) => Promise<void>;
    cancelTrail: () => Promise<void>;
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

/**
 * Helper: Check if we need to reset monthly progress (new month started)
 */
const checkAndResetMonthlyProgress = (currentProgress: MonthlyProgress | undefined, now: Date): { newCurrent: MonthlyProgress, toArchive: MonthlyProgress | null } => {
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12

    if (!currentProgress || currentProgress.year !== currentYear || currentProgress.month !== currentMonth) {
        if (__DEV__) console.log(`[GameContext] New month detected: ${currentMonth}/${currentYear}. Resetting monthly progress.`);
        return {
            newCurrent: BadgeService.createNewMonthlyProgress(currentYear, currentMonth),
            toArchive: currentProgress || null
        };
    }

    return { newCurrent: currentProgress, toArchive: null };
};

/**
 * Helper: Create default UserProgress
 * @param accountCreatedAt - ISO date string of when the user account was created
 */
const createDefaultProgress = (accountCreatedAt?: string): UserProgress => {
    const now = new Date();
    // Use account creation time as lastSyncTime to avoid counting steps from before signup
    const lastSyncTime = accountCreatedAt || now.toISOString();
    return {
        selectedTrailId: null,
        trailStartDate: null,
        targetDays: 7,
        totalStepsValid: 0,
        currentDistanceMeters: 0,
        stats: {
            totalStepsLifetime: 0,
            totalDistanceMetersLifetime: 0,
            completedTrailsCount: 0
        },
        lastSyncTime,
        monthlyProgress: BadgeService.createNewMonthlyProgress(now.getFullYear(), now.getMonth() + 1),
        pastMonths: [],
        yearlyProgress: [],
        trailBadges: [],
        completedTrails: [],
        currentStreak: 0,
        lastLogDate: null
    };
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [progress, setProgress] = useState<UserProgress | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [todaySteps, setTodaySteps] = useState(0);
    const progressRef = useRef<UserProgress | null>(null);
    const previousUnlockedLandmarks = useRef<Set<string>>(new Set());
    const goalNotifiedToday = useRef<string | null>(null);

    useEffect(() => {
        progressRef.current = progress;
    }, [progress]);

    useEffect(() => {
        if (user) {
            loadData(user.id, user.createdAt);
        } else {
            setProgress(null);
            setIsLoading(false);
        }
    }, [user]);

    const loadData = async (userId: string, accountCreatedAt?: string) => {
        setIsLoading(true);
        let p = await StorageService.getProgress(userId);
        const now = new Date();

        // Initialize progress for new users
        if (!p) {
            p = createDefaultProgress(accountCreatedAt);
            await StorageService.saveProgress(userId, p);
        }

        // Migration: Ensure stats object exists
        if (!p.stats) {
            if (__DEV__) console.log('Migrating: Adding stats object to UserProgress');
            p.stats = {
                totalStepsLifetime: p.totalStepsValid + (p.completedTrails?.reduce((acc: number, t: any) => acc + (t.totalSteps || 0), 0) || 0),
                totalDistanceMetersLifetime: p.currentDistanceMeters,
                completedTrailsCount: p.completedTrails?.length || 0
            };
        }

        // Migration: Initialize monthly progress if missing
        if (!p.monthlyProgress) {
            if (__DEV__) console.log('Migrating: Adding monthlyProgress to UserProgress');
            p.monthlyProgress = BadgeService.createNewMonthlyProgress(now.getFullYear(), now.getMonth() + 1);
        }

        // Migration: Initialize yearly progress if missing
        if (!p.yearlyProgress) {
            p.yearlyProgress = [];
        }

        // Migration: Initialize trail badges if missing
        if (!p.trailBadges) {
            p.trailBadges = [];
        }

        // Migration: Ensure completedTrails is array
        if (!p.completedTrails) {
            p.completedTrails = [];
        } else if (p.completedTrails.length > 0 && typeof p.completedTrails[0] === 'string') {
            if (__DEV__) console.log('Migrating completedTrails from strings to objects');
            p.completedTrails = (p.completedTrails as any[]).map((id: string) => ({
                trailId: id,
                completedDate: new Date().toISOString(),
                startDate: new Date().toISOString(),
                totalSteps: 0,
                totalDays: 1,
                avgStepsPerDay: 0,
                maxStepsInOneDay: 0
            }));
        }

        // Migration: Initialize pastMonths if missing
        if (!p.pastMonths) {
            p.pastMonths = [];
        }

        // Check if month has changed and reset monthly progress
        const { newCurrent, toArchive } = checkAndResetMonthlyProgress(p.monthlyProgress, now);
        p.monthlyProgress = newCurrent;
        if (toArchive) {
            p.pastMonths = [...(p.pastMonths || []), toArchive];
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
        if (!user) return;

        sync();

        const HOUR_IN_MS = 60 * 60 * 1000;
        const syncInterval = setInterval(() => {
            if (__DEV__) console.log('[GameContext] Automatic hourly sync triggered');
            sync();
        }, HOUR_IN_MS);

        return () => {
            if (__DEV__) console.log('[GameContext] Cleaning up sync interval');
            clearInterval(syncInterval);
        };
    }, [user]);

    // Sync when app comes to foreground
    useEffect(() => {
        if (!user) return;

        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                if (__DEV__) console.log('[GameContext] App resumed - triggering sync');
                sync();
            }
        });

        return () => {
            subscription.remove();
        };
    }, [user]);

    // Helper to check and handle trail completion
    const checkAndCompleteTrail = useCallback(async (currentProgress: UserProgress): Promise<UserProgress> => {
        if (!currentProgress.selectedTrailId || !user) return currentProgress;

        const currentTrail = TRAILS.find(t => t.id === currentProgress.selectedTrailId);
        if (!currentTrail) return currentProgress;

        if (currentProgress.currentDistanceMeters >= currentTrail.totalDistanceMeters) {
            const logs = await StorageService.getDailyLogs(user.id);
            const completedTrail = StatsService.checkTrailCompletion(currentProgress, currentTrail, new Date(), logs);

            if (completedTrail) {
                const newCompletedTrails = [...(currentProgress.completedTrails || []), completedTrail];
                const newCompletedCount = newCompletedTrails.length;

                // Check for new trail badges
                const newTrailBadges = BadgeService.checkTrailBadges(
                    newCompletedCount,
                    TRAILS.length,
                    currentProgress.trailBadges || []
                );

                return {
                    ...currentProgress,
                    completedTrails: newCompletedTrails,
                    trailBadges: [...(currentProgress.trailBadges || []), ...newTrailBadges],
                    stats: {
                        ...currentProgress.stats,
                        completedTrailsCount: newCompletedCount
                    },
                    selectedTrailId: null,
                    currentDistanceMeters: 0,
                    totalStepsValid: 0,
                    trailStartDate: null,
                    targetDays: 0
                };
            }
        }
        return currentProgress;
    }, [user]);

    const sync = useCallback(async () => {
        const currentProgress = progressRef.current;
        if (!currentProgress || !user) return;

        try {
            const lastSync = new Date(currentProgress.lastSyncTime);
            const now = new Date();

            if (now <= lastSync) return;

            const permitted = await StepService.requestPermissions();
            if (!permitted) {
                if (__DEV__) console.log('Step permission denied during sync');
                return;
            }

            const newSteps = await StepService.getStepsBetween(lastSync, now);

            if (newSteps > 0) {
                const addedDistance = stepsToMeters(newSteps);

                // Streak Logic
                const newStreak = StatsService.calculateStreak(currentProgress.currentStreak || 0, currentProgress.lastLogDate, now);
                const nowString = now.toISOString().split('T')[0];

                // Get user preferences
                const prefs = await StorageService.getPreferences(user.id);
                const notificationsEnabled = prefs?.notificationsEnabled ?? false;
                const notifSettings = prefs?.notificationSettings;

                // Check if month changed and reset monthly progress
                const { newCurrent: resetMonthly, toArchive } = checkAndResetMonthlyProgress(currentProgress.monthlyProgress, now);
                let monthlyProgress = resetMonthly;

                // Handle archiving if month changed during sync
                let pastMonths = currentProgress.pastMonths || [];
                if (toArchive) {
                    pastMonths = [...pastMonths, toArchive];
                }

                // Update monthly progress
                monthlyProgress = {
                    ...monthlyProgress,
                    stepsThisMonth: monthlyProgress.stepsThisMonth + newSteps,
                    distanceMetersThisMonth: monthlyProgress.distanceMetersThisMonth + addedDistance
                };

                // Check for new monthly badges
                const newMonthlyBadges = BadgeService.checkAllMonthlyBadges(monthlyProgress);
                if (newMonthlyBadges.length > 0) {
                    monthlyProgress.unlockedBadgeIds = [...monthlyProgress.unlockedBadgeIds, ...newMonthlyBadges];

                    // Badge unlock notifications
                    if (notificationsEnabled && notifSettings?.badgeUnlock) {
                        for (const badgeId of newMonthlyBadges) {
                            const badge = BADGES.find(b => b.id === badgeId);
                            if (badge) {
                                await NotificationService.sendBadgeUnlock(badge.name, badge.icon);
                            }
                        }
                    }
                }

                // Check if monthly master earned
                let yearlyProgress = [...(currentProgress.yearlyProgress || [])];
                if (!monthlyProgress.monthlyBadgeEarned && BadgeService.checkMonthlyMaster(monthlyProgress)) {
                    monthlyProgress.monthlyBadgeEarned = true;

                    // Update yearly progress
                    let yearProgress = yearlyProgress.find(yp => yp.year === monthlyProgress.year);
                    if (!yearProgress) {
                        yearProgress = { year: monthlyProgress.year, monthlyBadgesEarned: [], yearlyBadgeEarned: false };
                        yearlyProgress.push(yearProgress);
                    }
                    if (!yearProgress.monthlyBadgesEarned.includes(monthlyProgress.month)) {
                        yearProgress.monthlyBadgesEarned.push(monthlyProgress.month);
                    }

                    // Check yearly champion
                    if (!yearProgress.yearlyBadgeEarned && BadgeService.checkYearlyChampion(yearProgress)) {
                        yearProgress.yearlyBadgeEarned = true;
                        if (notificationsEnabled && notifSettings?.badgeUnlock) {
                            await NotificationService.sendBadgeUnlock(
                                BadgeService.getYearlyChampionName(yearProgress.year),
                                '🏆'
                            );
                        }
                    }

                    // Notify monthly master
                    if (notificationsEnabled && notifSettings?.badgeUnlock) {
                        await NotificationService.sendBadgeUnlock(
                            BadgeService.getMonthlyMasterName(monthlyProgress.year, monthlyProgress.month),
                            BadgeService.getMonthlyMasterIcon(monthlyProgress.month)
                        );
                    }
                }

                // Build updated progress
                let newProgress: UserProgress = {
                    ...currentProgress,
                    stats: {
                        ...currentProgress.stats,
                        totalStepsLifetime: (currentProgress.stats?.totalStepsLifetime || 0) + newSteps,
                        totalDistanceMetersLifetime: (currentProgress.stats?.totalDistanceMetersLifetime || 0) + addedDistance,
                        completedTrailsCount: currentProgress.completedTrails?.length || 0
                    },
                    totalStepsValid: currentProgress.selectedTrailId ? currentProgress.totalStepsValid + newSteps : currentProgress.totalStepsValid,
                    currentDistanceMeters: currentProgress.selectedTrailId ? currentProgress.currentDistanceMeters + addedDistance : currentProgress.currentDistanceMeters,
                    lastSyncTime: now.toISOString(),
                    currentStreak: newStreak,
                    lastLogDate: nowString,
                    completedTrails: currentProgress.completedTrails || [],
                    monthlyProgress,
                    pastMonths,
                    yearlyProgress
                };

                // Trail milestone notifications
                const currentTrail = newProgress.selectedTrailId
                    ? TRAILS.find(t => t.id === newProgress.selectedTrailId)
                    : null;
                const prevPercent = currentTrail
                    ? Math.floor((currentProgress.currentDistanceMeters / currentTrail.totalDistanceMeters) * 100)
                    : 0;

                // Check for Trail Completion
                const wasCompleted = newProgress.selectedTrailId !== null;
                if (currentTrail) {
                    newProgress = await checkAndCompleteTrail(newProgress);
                }
                const isNowCompleted = newProgress.selectedTrailId === null && wasCompleted;

                if (isNowCompleted) {
                    newProgress.stats.completedTrailsCount = newProgress.completedTrails.length;
                }

                // Trail milestone notifications
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

                // Landmark notifications
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

                setProgress(newProgress);
                await StorageService.saveProgress(user.id, newProgress);

                const today = await StepService.getTodaySteps();
                setTodaySteps(today);

                // Goal achievement notification
                const dailyGoal = prefs?.dailyGoal ?? 10000;
                if (notificationsEnabled && notifSettings?.goalAchievement) {
                    if (today >= dailyGoal && goalNotifiedToday.current !== nowString) {
                        await NotificationService.sendGoalAchievement(dailyGoal);
                        goalNotifiedToday.current = nowString;
                    }
                }
            } else {
                // Even if no steps, check if month changed
                const { newCurrent, toArchive } = checkAndResetMonthlyProgress(currentProgress.monthlyProgress, now);
                let pastMonths = currentProgress.pastMonths || [];
                if (toArchive) {
                    pastMonths = [...pastMonths, toArchive];
                }

                const newProgress = { ...currentProgress, lastSyncTime: now.toISOString(), monthlyProgress: newCurrent, pastMonths };
                setProgress(newProgress);
                await StorageService.saveProgress(user.id, newProgress);
            }
        } catch (error) {
            console.error('Sync Error', error);
        }
    }, [user, checkAndCompleteTrail]);

    const selectTrail = async (trailId: string, days: number) => {
        if (!user) return;
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        // Use the later of start of today or account creation time
        // This ensures we don't count steps from before the account was created
        const accountCreatedAt = user.createdAt ? new Date(user.createdAt) : startOfToday;
        const syncStartTime = accountCreatedAt > startOfToday ? accountCreatedAt : startOfToday;

        const newProgress: UserProgress = {
            selectedTrailId: trailId,
            targetDays: days,
            trailStartDate: startOfToday.toISOString(),
            totalStepsValid: 0,
            currentDistanceMeters: 0,
            stats: progress?.stats || {
                totalStepsLifetime: 0,
                totalDistanceMetersLifetime: 0,
                completedTrailsCount: 0
            },
            lastSyncTime: syncStartTime.toISOString(),
            monthlyProgress: progress?.monthlyProgress || BadgeService.createNewMonthlyProgress(startOfToday.getFullYear(), startOfToday.getMonth() + 1),
            pastMonths: progress?.pastMonths || [],
            yearlyProgress: progress?.yearlyProgress || [],
            trailBadges: progress?.trailBadges || [],
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
        return null;
    }

    return (
        <GameContext.Provider value={{
            progress,
            isLoading,
            sync,
            selectTrail,
            cancelTrail: async () => {
                if (!user || !progress) return;

                const now = new Date();
                const newProgress: UserProgress = {
                    ...progress,
                    selectedTrailId: null,
                    trailStartDate: null,
                    targetDays: 0,
                    totalStepsValid: 0,
                    currentDistanceMeters: 0,
                    // Preserve stats and other history
                };

                setProgress(newProgress);
                await StorageService.saveProgress(user.id, newProgress);
            },
            extendTrail,
            todaySteps,
            completedTrailsCount: progress?.completedTrails?.length || 0,
            debug: {
                addSteps: async (amount: number) => {
                    if (!progress || !user) return;
                    const addedDistance = stepsToMeters(amount);

                    // Update monthly progress
                    let monthlyProgress = { ...progress.monthlyProgress };
                    monthlyProgress.stepsThisMonth += amount;
                    monthlyProgress.distanceMetersThisMonth += addedDistance;

                    // Check monthly badges
                    const newMonthlyBadges = BadgeService.checkAllMonthlyBadges(monthlyProgress);
                    if (newMonthlyBadges.length > 0) {
                        monthlyProgress.unlockedBadgeIds = [...monthlyProgress.unlockedBadgeIds, ...newMonthlyBadges];
                    }

                    // Check monthly master
                    if (!monthlyProgress.monthlyBadgeEarned && BadgeService.checkMonthlyMaster(monthlyProgress)) {
                        monthlyProgress.monthlyBadgeEarned = true;
                    }

                    let newProgress: UserProgress = {
                        ...progress,
                        totalStepsValid: progress.totalStepsValid + amount,
                        currentDistanceMeters: progress.currentDistanceMeters + addedDistance,
                        monthlyProgress
                    };

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
                    const now = new Date();
                    await StorageService.saveProgress(user.id, {
                        selectedTrailId: null,
                        trailStartDate: null,
                        targetDays: 0,
                        totalStepsValid: 0,
                        currentDistanceMeters: 0,
                        stats: {
                            totalStepsLifetime: 0,
                            totalDistanceMetersLifetime: 0,
                            completedTrailsCount: 0
                        },
                        lastSyncTime: now.toISOString(),
                        monthlyProgress: BadgeService.createNewMonthlyProgress(now.getFullYear(), now.getMonth() + 1),
                        pastMonths: [],
                        yearlyProgress: [],
                        trailBadges: [],
                        completedTrails: [],
                        currentStreak: 0,
                        lastLogDate: null
                    });
                    loadData(user.id);
                },
                unlockAllBadges: async () => {
                    if (!progress || !user) return;
                    const allMonthlyIds = ALL_MONTHLY_BADGES.map(b => b.id);
                    const allTrailIds = TRAIL_BADGES.map(b => b.id);
                    const newProgress = {
                        ...progress,
                        monthlyProgress: {
                            ...progress.monthlyProgress,
                            unlockedBadgeIds: allMonthlyIds,
                            monthlyBadgeEarned: true
                        },
                        trailBadges: allTrailIds
                    };
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
