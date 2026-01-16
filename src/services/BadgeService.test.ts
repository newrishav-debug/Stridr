/**
 * File: src/services/BadgeService.test.ts
 * Purpose: Unit tests for BadgeService.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Initial tests created.
 * 2026-01-15: Rewritten for monthly badge system.
 */
import { BadgeService } from './BadgeService';
import { MonthlyProgress, YearlyProgress } from '../types';
import { MONTHLY_STEP_BADGES, MONTHLY_DISTANCE_BADGES, TRAIL_BADGES, MONTHLY_MASTER_REQUIREMENT } from '../const/badges';

describe('BadgeService', () => {
    describe('checkMonthlyStepBadges', () => {
        it('should return empty array if no badges unlocked', () => {
            const result = BadgeService.checkMonthlyStepBadges(1000, []);
            expect(result).toEqual([]);
        });

        it('should unlock step-5k badge when reaching 5000 steps', () => {
            const result = BadgeService.checkMonthlyStepBadges(5000, []);
            expect(result).toContain('step-5k');
        });

        it('should unlock multiple step badges at once', () => {
            const result = BadgeService.checkMonthlyStepBadges(25000, []);
            expect(result).toContain('step-5k');
            expect(result).toContain('step-10k');
            expect(result).toContain('step-25k');
        });

        it('should not return already unlocked badges', () => {
            const result = BadgeService.checkMonthlyStepBadges(50000, ['step-5k', 'step-10k']);
            expect(result).not.toContain('step-5k');
            expect(result).not.toContain('step-10k');
            expect(result).toContain('step-25k');
            expect(result).toContain('step-50k');
        });
    });

    describe('checkMonthlyDistanceBadges', () => {
        it('should return empty array if distance not met', () => {
            const result = BadgeService.checkMonthlyDistanceBadges(2000, []);
            expect(result).toEqual([]);
        });

        it('should unlock dist-5k badge when reaching 5000 meters', () => {
            const result = BadgeService.checkMonthlyDistanceBadges(5000, []);
            expect(result).toContain('dist-5k');
        });

        it('should unlock half marathon badge at 21km', () => {
            const result = BadgeService.checkMonthlyDistanceBadges(21000, []);
            expect(result).toContain('dist-21k');
        });
    });

    describe('checkAllMonthlyBadges', () => {
        it('should check both step and distance badges', () => {
            const monthlyProgress: MonthlyProgress = {
                year: 2026,
                month: 1,
                stepsThisMonth: 10000,
                distanceMetersThisMonth: 10000,
                unlockedBadgeIds: [],
                monthlyBadgeEarned: false
            };

            const result = BadgeService.checkAllMonthlyBadges(monthlyProgress);
            expect(result).toContain('step-5k');
            expect(result).toContain('step-10k');
            expect(result).toContain('dist-5k');
            expect(result).toContain('dist-10k');
        });
    });

    describe('checkMonthlyMaster', () => {
        it('should return false if not enough badges', () => {
            const monthlyProgress: MonthlyProgress = {
                year: 2026,
                month: 1,
                stepsThisMonth: 0,
                distanceMetersThisMonth: 0,
                unlockedBadgeIds: ['step-5k', 'step-10k'],
                monthlyBadgeEarned: false
            };

            expect(BadgeService.checkMonthlyMaster(monthlyProgress)).toBe(false);
        });

        it('should return true when 10 or more badges earned', () => {
            const monthlyProgress: MonthlyProgress = {
                year: 2026,
                month: 1,
                stepsThisMonth: 0,
                distanceMetersThisMonth: 0,
                unlockedBadgeIds: ['step-5k', 'step-10k', 'step-25k', 'step-50k', 'step-100k',
                    'dist-5k', 'dist-10k', 'dist-21k', 'dist-42k', 'dist-50k'],
                monthlyBadgeEarned: false
            };

            expect(BadgeService.checkMonthlyMaster(monthlyProgress)).toBe(true);
        });

        it('should return false if already earned', () => {
            const monthlyProgress: MonthlyProgress = {
                year: 2026,
                month: 1,
                stepsThisMonth: 0,
                distanceMetersThisMonth: 0,
                unlockedBadgeIds: Array(15).fill('badge'),
                monthlyBadgeEarned: true
            };

            expect(BadgeService.checkMonthlyMaster(monthlyProgress)).toBe(false);
        });
    });

    describe('checkTrailBadges', () => {
        it('should unlock first trail badge', () => {
            const result = BadgeService.checkTrailBadges(1, 50, []);
            expect(result).toContain('trail-1');
        });

        it('should unlock multiple trail badges at once', () => {
            const result = BadgeService.checkTrailBadges(5, 50, []);
            expect(result).toContain('trail-1');
            expect(result).toContain('trail-3');
            expect(result).toContain('trail-5');
        });

        it('should not unlock all-trails badge if not all completed', () => {
            const result = BadgeService.checkTrailBadges(49, 50, []);
            expect(result).not.toContain('trail-all');
        });

        it('should unlock all-trails badge when all completed', () => {
            const result = BadgeService.checkTrailBadges(50, 50, []);
            expect(result).toContain('trail-all');
        });
    });

    describe('checkYearlyChampion', () => {
        it('should return false if not all months earned', () => {
            const yearlyProgress: YearlyProgress = {
                year: 2026,
                monthlyBadgesEarned: [1, 2, 3, 4, 5],
                yearlyBadgeEarned: false
            };

            expect(BadgeService.checkYearlyChampion(yearlyProgress)).toBe(false);
        });

        it('should return true when all 12 months completed', () => {
            const yearlyProgress: YearlyProgress = {
                year: 2026,
                monthlyBadgesEarned: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                yearlyBadgeEarned: false
            };

            expect(BadgeService.checkYearlyChampion(yearlyProgress)).toBe(true);
        });
    });

    describe('getNextBadges', () => {
        it('should return top 3 closest badges', () => {
            const monthlyProgress: MonthlyProgress = {
                year: 2026,
                month: 1,
                stepsThisMonth: 4000,
                distanceMetersThisMonth: 4000,
                unlockedBadgeIds: [],
                monthlyBadgeEarned: false
            };

            const result = BadgeService.getNextBadges(monthlyProgress);
            expect(result.length).toBeLessThanOrEqual(3);
            expect(result[0].percentComplete).toBeGreaterThanOrEqual(result[1]?.percentComplete || 0);
        });
    });

    describe('getBadgesRemainingForMonthly', () => {
        it('should calculate remaining badges correctly', () => {
            const monthlyProgress: MonthlyProgress = {
                year: 2026,
                month: 1,
                stepsThisMonth: 0,
                distanceMetersThisMonth: 0,
                unlockedBadgeIds: ['step-5k', 'step-10k', 'dist-5k'],
                monthlyBadgeEarned: false
            };

            expect(BadgeService.getBadgesRemainingForMonthly(monthlyProgress)).toBe(MONTHLY_MASTER_REQUIREMENT - 3);
        });

        it('should return 0 if already at requirement', () => {
            const monthlyProgress: MonthlyProgress = {
                year: 2026,
                month: 1,
                stepsThisMonth: 0,
                distanceMetersThisMonth: 0,
                unlockedBadgeIds: Array(12).fill('badge'),
                monthlyBadgeEarned: false
            };

            expect(BadgeService.getBadgesRemainingForMonthly(monthlyProgress)).toBe(0);
        });
    });

    describe('createNewMonthlyProgress', () => {
        it('should create fresh monthly progress', () => {
            const result = BadgeService.createNewMonthlyProgress(2026, 3);

            expect(result.year).toBe(2026);
            expect(result.month).toBe(3);
            expect(result.stepsThisMonth).toBe(0);
            expect(result.distanceMetersThisMonth).toBe(0);
            expect(result.unlockedBadgeIds).toEqual([]);
            expect(result.monthlyBadgeEarned).toBe(false);
        });
    });
});
