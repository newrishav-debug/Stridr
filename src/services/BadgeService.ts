/**
 * File: src/services/BadgeService.ts
 * Purpose: Logic for checking and unlocking badges.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Created for gamification features.
 */
import { BADGES } from '../const/badges';
import { UserProgress } from '../types';

export const BadgeService = {
    /**
     * Checks for any new badges that should be unlocked based on the current progress.
     * Returns an array of NEWLY unlocked badge IDs.
     */
    checkNewBadges(progress: UserProgress): string[] {
        const currentUnlockedIds = new Set(progress.unlockedBadges || []);
        const newUnlockedIds: string[] = [];

        BADGES.forEach(badge => {
            if (currentUnlockedIds.has(badge.id)) return;

            let unlocked = false;
            // Condition checks
            if (badge.conditionType === 'TOTAL_STEPS' && progress.totalStepsValid >= badge.conditionValue) {
                unlocked = true;
            }
            if (badge.conditionType === 'TOTAL_DISTANCE' && progress.currentDistanceMeters >= badge.conditionValue) {
                unlocked = true;
            }
            if (badge.conditionType === 'STREAK' && (progress.currentStreak || 0) >= badge.conditionValue) {
                unlocked = true;
            }

            if (unlocked) {
                newUnlockedIds.push(badge.id);
            }
        });

        return newUnlockedIds;
    }
};
