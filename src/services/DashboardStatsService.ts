/**
 * File: src/services/DashboardStatsService.ts
 * Purpose: Utility functions for computing dashboard statistics.
 * Created: 2026-01-14
 * Author: AI Assistant
 *
 * Modification History:
 * 2026-01-14: Initial creation with weekly, monthly, goal, records, landmarks, and badge stats.
 */

import { UserProgress, Trail, Landmark } from '../types';
import { Badge, BADGES } from '../const/badges';

export interface WeeklyStats {
    thisWeek: number;
    lastWeek: number;
    changePercent: number;
    trend: 'up' | 'down' | 'same';
}

export interface GoalAchievementStats {
    rate: number; // percentage 0-100
    daysHit: number;
    totalDays: number;
}

export interface PersonalRecords {
    bestDay: { date: string; steps: number };
    bestWeek: { weekStart: string; steps: number };
    bestMonth: { month: string; steps: number };
}

export interface NextBadgeProgress {
    badge: Badge;
    current: number;
    target: number;
    percent: number;
}

export interface DailyHistoryEntry {
    date: string; // YYYY-MM-DD
    steps: number;
}

/**
 * Filter history to only include entries from a specific start date onwards.
 * Used to filter out device step history from before account creation.
 */
export function filterHistoryByStartDate(
    history: DailyHistoryEntry[],
    startDate: string | undefined
): DailyHistoryEntry[] {
    if (!startDate) return history;

    const startDateStr = startDate.split('T')[0]; // Convert ISO to YYYY-MM-DD
    return history.filter(entry => entry.date >= startDateStr);
}

export const DashboardStatsService = {
    /**
     * Calculate weekly stats comparing this week to last week
     */
    getWeeklyStats(history: DailyHistoryEntry[]): WeeklyStats {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday

        // Calculate start of this week (Sunday)
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - dayOfWeek);
        thisWeekStart.setHours(0, 0, 0, 0);

        // Calculate start of last week
        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        const lastWeekEnd = new Date(thisWeekStart);
        lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);

        const thisWeekStartStr = thisWeekStart.toISOString().split('T')[0];
        const lastWeekStartStr = lastWeekStart.toISOString().split('T')[0];
        const lastWeekEndStr = lastWeekEnd.toISOString().split('T')[0];

        let thisWeek = 0;
        let lastWeek = 0;

        for (const entry of history) {
            if (entry.date >= thisWeekStartStr) {
                thisWeek += entry.steps;
            } else if (entry.date >= lastWeekStartStr && entry.date <= lastWeekEndStr) {
                lastWeek += entry.steps;
            }
        }

        const changePercent = lastWeek > 0
            ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100)
            : (thisWeek > 0 ? 100 : 0);

        const trend = changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'same';

        return { thisWeek, lastWeek, changePercent, trend };
    },

    /**
     * Get total steps for the current month
     */
    getMonthlySteps(history: DailyHistoryEntry[]): number {
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthStartStr = monthStart.toISOString().split('T')[0];

        return history
            .filter(entry => entry.date >= monthStartStr)
            .reduce((sum, entry) => sum + entry.steps, 0);
    },

    /**
     * Calculate goal achievement rate for the last 14 days
     */
    getGoalAchievementRate(history: DailyHistoryEntry[], dailyGoal: number): GoalAchievementStats {
        const today = new Date();
        const fourteenDaysAgo = new Date(today);
        fourteenDaysAgo.setDate(today.getDate() - 13); // 14 days including today

        const startStr = fourteenDaysAgo.toISOString().split('T')[0];
        const todayStr = today.toISOString().split('T')[0];

        const recentEntries = history.filter(
            entry => entry.date >= startStr && entry.date <= todayStr
        );

        const daysHit = recentEntries.filter(entry => entry.steps >= dailyGoal).length;
        const totalDays = 14; // Always show out of 14
        const rate = Math.round((daysHit / totalDays) * 100);

        return { rate, daysHit, totalDays };
    },

    /**
     * Get personal records: best day, week, and month ever
     */
    getPersonalRecords(history: DailyHistoryEntry[]): PersonalRecords {
        // Best Day
        let bestDay = { date: '', steps: 0 };
        for (const entry of history) {
            if (entry.steps > bestDay.steps) {
                bestDay = { date: entry.date, steps: entry.steps };
            }
        }

        // Best Week - group by week and find maximum
        const weeklyTotals: Map<string, number> = new Map();
        for (const entry of history) {
            const date = new Date(entry.date);
            const dayOfWeek = date.getDay();
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - dayOfWeek);
            const weekKey = weekStart.toISOString().split('T')[0];

            weeklyTotals.set(weekKey, (weeklyTotals.get(weekKey) || 0) + entry.steps);
        }

        let bestWeek = { weekStart: '', steps: 0 };
        for (const [weekStart, steps] of weeklyTotals) {
            if (steps > bestWeek.steps) {
                bestWeek = { weekStart, steps };
            }
        }

        // Best Month - group by month and find maximum
        const monthlyTotals: Map<string, number> = new Map();
        for (const entry of history) {
            const monthKey = entry.date.substring(0, 7); // YYYY-MM
            monthlyTotals.set(monthKey, (monthlyTotals.get(monthKey) || 0) + entry.steps);
        }

        let bestMonth = { month: '', steps: 0 };
        for (const [month, steps] of monthlyTotals) {
            if (steps > bestMonth.steps) {
                bestMonth = { month, steps };
            }
        }

        return { bestDay, bestWeek, bestMonth };
    },

    /**
     * Count total landmarks reached across active and completed trails
     */
    getLandmarksReached(progress: UserProgress | null, trails: Trail[]): number {
        if (!progress) return 0;

        let count = 0;

        // Count landmarks from active trail
        if (progress.selectedTrailId) {
            const activeTrail = trails.find(t => t.id === progress.selectedTrailId);
            if (activeTrail) {
                const currentDistance = progress.currentDistanceMeters || 0;
                count += activeTrail.landmarks.filter(
                    (lm: Landmark) => lm.distanceMeters <= currentDistance
                ).length;
            }
        }

        // Count all landmarks from completed trails
        for (const completed of progress.completedTrails || []) {
            const trail = trails.find(t => t.id === completed.trailId);
            if (trail) {
                count += trail.landmarks.length;
            }
        }

        return count;
    },

    /**
     * Find the next closest badge the user can unlock and their progress toward it
     * Updated for monthly badge system
     */
    getNextBadgeProgress(progress: UserProgress | null): NextBadgeProgress | null {
        if (!progress || !progress.monthlyProgress) return null;

        const monthlyProgress = progress.monthlyProgress;
        const unlockedBadges = new Set(monthlyProgress.unlockedBadgeIds || []);
        const stepsThisMonth = monthlyProgress.stepsThisMonth || 0;
        const distanceThisMonth = monthlyProgress.distanceMetersThisMonth || 0;

        // Filter to only monthly step and distance badges
        const progressBadges = BADGES.filter(b =>
            !unlockedBadges.has(b.id) &&
            (b.conditionType === 'MONTHLY_STEPS' || b.conditionType === 'MONTHLY_DISTANCE')
        );

        if (progressBadges.length === 0) return null;

        // Calculate progress for each and find the closest to completion
        let closest: NextBadgeProgress | null = null;

        for (const badge of progressBadges) {
            let current = 0;
            let target = badge.conditionValue;

            switch (badge.conditionType) {
                case 'MONTHLY_STEPS':
                    current = stepsThisMonth;
                    break;
                case 'MONTHLY_DISTANCE':
                    current = distanceThisMonth;
                    break;
            }

            const percent = Math.min(Math.round((current / target) * 100), 100);

            // Find badge closest to completion (highest percentage < 100)
            if (!closest || percent > closest.percent) {
                closest = { badge, current, target, percent };
            }
        }

        return closest;
    },


    /**
     * Get last N days of step history for chart display
     */
    getChartData(history: DailyHistoryEntry[], days: number = 7): { label: string; value: number }[] {
        const today = new Date();
        const result: { label: string; value: number }[] = [];

        // Create a map for quick lookup
        const historyMap = new Map(history.map(h => [h.date, h.steps]));

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });

            result.push({
                label: dayLabel,
                value: historyMap.get(dateStr) || 0
            });
        }

        return result;
    }
};
