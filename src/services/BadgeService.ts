/**
 * File: src/services/BadgeService.ts
 * Purpose: Logic for checking and unlocking badges (monthly and trail).
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Created for gamification features.
 * 2026-01-15: Complete revamp for monthly recurring badges.
 */
import {
    MONTHLY_STEP_BADGES,
    MONTHLY_DISTANCE_BADGES,
    TRAIL_BADGES,
    ALL_MONTHLY_BADGES,
    MONTHLY_MASTER_REQUIREMENT,
    MONTH_NAMES,
    MONTH_ICONS,
    Badge
} from '../const/badges';
import { MonthlyProgress, YearlyProgress } from '../types';

export interface NextBadgeInfo {
    badge: Badge;
    current: number;
    target: number;
    remaining: number;
    percentComplete: number;
}

export const BadgeService = {
    /**
     * Check for newly unlocked monthly step badges
     */
    checkMonthlyStepBadges(stepsThisMonth: number, alreadyUnlocked: string[]): string[] {
        const newBadges: string[] = [];
        const unlockedSet = new Set(alreadyUnlocked);

        for (const badge of MONTHLY_STEP_BADGES) {
            if (!unlockedSet.has(badge.id) && stepsThisMonth >= badge.conditionValue) {
                newBadges.push(badge.id);
            }
        }

        return newBadges;
    },

    /**
     * Check for newly unlocked monthly distance badges
     */
    checkMonthlyDistanceBadges(distanceMetersThisMonth: number, alreadyUnlocked: string[]): string[] {
        const newBadges: string[] = [];
        const unlockedSet = new Set(alreadyUnlocked);

        for (const badge of MONTHLY_DISTANCE_BADGES) {
            if (!unlockedSet.has(badge.id) && distanceMetersThisMonth >= badge.conditionValue) {
                newBadges.push(badge.id);
            }
        }

        return newBadges;
    },

    /**
     * Check all monthly badges (steps + distance) at once
     */
    checkAllMonthlyBadges(monthlyProgress: MonthlyProgress): string[] {
        const stepBadges = this.checkMonthlyStepBadges(
            monthlyProgress.stepsThisMonth,
            monthlyProgress.unlockedBadgeIds
        );
        const distanceBadges = this.checkMonthlyDistanceBadges(
            monthlyProgress.distanceMetersThisMonth,
            monthlyProgress.unlockedBadgeIds
        );

        return [...stepBadges, ...distanceBadges];
    },

    /**
     * Check if user has earned the Monthly Master badge (10/15 badges)
     */
    checkMonthlyMaster(monthlyProgress: MonthlyProgress): boolean {
        if (monthlyProgress.monthlyBadgeEarned) return false; // Already earned
        return monthlyProgress.unlockedBadgeIds.length >= MONTHLY_MASTER_REQUIREMENT;
    },

    /**
     * Check for newly unlocked trail badges (lifetime)
     */
    checkTrailBadges(completedTrailsCount: number, totalTrailsCount: number, alreadyUnlocked: string[]): string[] {
        const newBadges: string[] = [];
        const unlockedSet = new Set(alreadyUnlocked);

        for (const badge of TRAIL_BADGES) {
            if (unlockedSet.has(badge.id)) continue;

            if (badge.conditionValue === -1) {
                // "All trails" badge
                if (completedTrailsCount >= totalTrailsCount && totalTrailsCount > 0) {
                    newBadges.push(badge.id);
                }
            } else if (completedTrailsCount >= badge.conditionValue) {
                newBadges.push(badge.id);
            }
        }

        return newBadges;
    },

    /**
     * Check if user has earned the Yearly Champion badge
     */
    checkYearlyChampion(yearlyProgress: YearlyProgress): boolean {
        if (yearlyProgress.yearlyBadgeEarned) return false; // Already earned
        return yearlyProgress.monthlyBadgesEarned.length >= 12;
    },

    /**
     * Get the next closest badges to completion (top 3)
     */
    getNextBadges(monthlyProgress: MonthlyProgress): NextBadgeInfo[] {
        const unlockedSet = new Set(monthlyProgress.unlockedBadgeIds);
        const nextBadges: NextBadgeInfo[] = [];

        // Check step badges
        for (const badge of MONTHLY_STEP_BADGES) {
            if (unlockedSet.has(badge.id)) continue;

            const current = monthlyProgress.stepsThisMonth;
            const target = badge.conditionValue;
            const remaining = Math.max(0, target - current);
            const percentComplete = Math.min(100, Math.round((current / target) * 100));

            nextBadges.push({ badge, current, target, remaining, percentComplete });
        }

        // Check distance badges
        for (const badge of MONTHLY_DISTANCE_BADGES) {
            if (unlockedSet.has(badge.id)) continue;

            const current = monthlyProgress.distanceMetersThisMonth;
            const target = badge.conditionValue;
            const remaining = Math.max(0, target - current);
            const percentComplete = Math.min(100, Math.round((current / target) * 100));

            nextBadges.push({ badge, current, target, remaining, percentComplete });
        }

        // Sort by percent complete (descending) and take top 3
        nextBadges.sort((a, b) => b.percentComplete - a.percentComplete);
        return nextBadges.slice(0, 3);
    },

    /**
     * Get number of badges remaining to earn Monthly Master
     */
    getBadgesRemainingForMonthly(monthlyProgress: MonthlyProgress): number {
        const earned = monthlyProgress.unlockedBadgeIds.length;
        return Math.max(0, MONTHLY_MASTER_REQUIREMENT - earned);
    },

    /**
     * Get formatted Monthly Master badge name
     */
    getMonthlyMasterName(year: number, month: number): string {
        return `${MONTH_NAMES[month - 1]} ${year} Master`;
    },

    /**
     * Get Monthly Master badge icon
     */
    getMonthlyMasterIcon(month: number): string {
        return MONTH_ICONS[month - 1] || '🏆';
    },

    /**
     * Get Yearly Champion badge name
     */
    getYearlyChampionName(year: number): string {
        return `${year} Champion`;
    },

    /**
     * Create a fresh MonthlyProgress for a new month
     */
    createNewMonthlyProgress(year: number, month: number): MonthlyProgress {
        return {
            year,
            month,
            stepsThisMonth: 0,
            distanceMetersThisMonth: 0,
            unlockedBadgeIds: [],
            monthlyBadgeEarned: false
        };
    },

    /**
     * Get or create YearlyProgress for a given year
     */
    getOrCreateYearlyProgress(yearlyProgressList: YearlyProgress[], year: number): YearlyProgress {
        let yearProgress = yearlyProgressList.find(yp => yp.year === year);
        if (!yearProgress) {
            yearProgress = {
                year,
                monthlyBadgesEarned: [],
                yearlyBadgeEarned: false
            };
        }
        return yearProgress;
    },

    /**
     * Get specific past month progress from archive
     */
    getPastMonthProgress(pastMonths: MonthlyProgress[] | undefined, year: number, month: number): MonthlyProgress | undefined {
        return pastMonths?.find(pm => pm.year === year && pm.month === month);
    }
};
