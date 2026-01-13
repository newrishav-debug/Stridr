/**
 * File: src/services/BadgeService.test.ts
 * Purpose: Unit tests for BadgeService.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Initial tests created.
 */
import { BadgeService } from './BadgeService';
import { UserProgress } from '../types';
import { BADGES } from '../const/badges';

describe('BadgeService', () => {
    // Mock Badges ensures we test against known conditions regardless of the real file
    // But typically we want to test with the real badges or mock the import.
    // For this simple service, testing with real BADGES import is fine as it's a const file.

    const baseProgress: UserProgress = {
        selectedTrailId: 't1',
        targetDays: 1,
        trailStartDate: '2024-01-01',
        totalStepsValid: 0,
        currentDistanceMeters: 0,
        lastSyncTime: '2024-01-01',
        unlockedBadges: [],
        completedTrails: [],
        currentStreak: 0,
        lastLogDate: null
    };

    it('should return empty array if no new badges unlocked', () => {
        const result = BadgeService.checkNewBadges(baseProgress);
        expect(result).toEqual([]);
    });

    it('should unlock step-based badge', () => {
        const p = { ...baseProgress, totalStepsValid: 150000 }; // E.g. "First 10k" or similar
        const unlocked = BadgeService.checkNewBadges(p);

        // Assuming we have some step badges
        const stepBadges = BADGES.filter(b => b.conditionType === 'TOTAL_STEPS' && b.conditionValue <= 150000);
        expect(unlocked.length).toBeGreaterThanOrEqual(stepBadges.length);

        // Check a specific one if known, e.g., 'first-steps'
        const hasFirstSteps = stepBadges.find(b => b.id === 'first-steps');
        if (hasFirstSteps) {
            expect(unlocked).toContain('first-steps');
        }
    });

    it('should not return already unlocked badges', () => {
        const p = { ...baseProgress, totalStepsValid: 150000, unlockedBadges: ['first-steps'] };
        const unlocked = BadgeService.checkNewBadges(p);

        expect(unlocked).not.toContain('first-steps');
    });

    it('should unlock distance-based badge', () => {
        const p = { ...baseProgress, currentDistanceMeters: 55000 };
        const unlocked = BadgeService.checkNewBadges(p);

        const distBadges = BADGES.filter(b => b.conditionType === 'TOTAL_DISTANCE' && b.conditionValue <= 55000);
        expect(unlocked.length).toBeGreaterThanOrEqual(distBadges.length);
    });

    it('should unlock streak-based badge', () => {
        const p = { ...baseProgress, currentStreak: 7 };
        const unlocked = BadgeService.checkNewBadges(p);

        const streakBadges = BADGES.filter(b => b.conditionType === 'STREAK' && b.conditionValue <= 7);
        expect(unlocked.length).toBeGreaterThanOrEqual(streakBadges.length);
    });
});
