/**
 * File: src/services/StatsService.ts
 * Purpose: Business logic for trail stats, completion, and streak calculation.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Created with streak and completion logic.
 */
import { CompletedTrail, DailyLog, Trail, UserProgress } from '../types';

export const StatsService = {
    /**
     * Calculates the new streak based on the last log date and the current date (now).
     */
    calculateStreak(currentStreak: number, lastLogDate: string | null | undefined, now: Date): number {
        const nowString = now.toISOString().split('T')[0];

        // If already logged today, streak doesn't change
        if (lastLogDate === nowString) {
            return currentStreak;
        }

        if (!lastLogDate) {
            return 1;
        }

        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];

        if (lastLogDate === yesterdayString) {
            return currentStreak + 1;
        } else {
            return 1;
        }
    },

    /**
     * Checks if a trail is completed and generates the completion stats.
     * Returns null if not completed.
     */
    checkTrailCompletion(
        progress: UserProgress,
        trail: Trail,
        now: Date,
        dailyLogs: DailyLog[]
    ): CompletedTrail | null {
        if (progress.currentDistanceMeters < trail.totalDistanceMeters) {
            return null;
        }

        // Check if already completed to avoid duplicate entries (though caller should handle this too)
        const alreadyCompleted = progress.completedTrails?.some(ct => ct.trailId === trail.id);
        if (alreadyCompleted) return null;

        const startDate = new Date(progress.trailStartDate || progress.lastSyncTime);
        const endDate = now;

        // Filter logs for this trail's duration
        const trailLogs = dailyLogs.filter(l => {
            const logDate = new Date(l.date);
            return logDate >= startDate && logDate <= endDate;
        });

        const totalSteps = progress.totalStepsValid;
        // Duration in days (min 1)
        const durationMs = endDate.getTime() - startDate.getTime();
        const totalDays = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));
        const avgSteps = Math.round(totalSteps / totalDays);

        // Find max steps in a single day during this period
        const maxStepsLog = trailLogs.reduce((max, log) => Math.max(max, log.steps), 0);

        // Also check "current session" steps logic from original code:
        // ideally we should trust the logs, but the original code did a fallback check against 
        // (totalValid - initialValid). Since we don't have "initialValid" passed here easily without more state,
        // we'll rely on the pure calculation or the caller passing in better data.
        // For now, let's stick to the log-based max, but ensure it's at least avgSteps if logs are missing.
        const maxSteps = maxStepsLog > 0 ? maxStepsLog : avgSteps;

        return {
            trailId: trail.id,
            completedDate: endDate.toISOString(),
            startDate: startDate.toISOString(),
            totalSteps: totalSteps,
            totalDays: totalDays,
            avgStepsPerDay: avgSteps,
            maxStepsInOneDay: maxSteps
        };
    }
};
