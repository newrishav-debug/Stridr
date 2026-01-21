/**
 * File: src/services/DashboardStatsService.test.ts
 * Purpose: Unit tests for DashboardStatsService.
 * Created: 2026-01-14
 * Author: AI Assistant
 *
 * Modification History:
 * 2026-01-14: Initial tests created.
 */
import { DashboardStatsService } from './DashboardStatsService';
import { UserProgress } from '../types';
import { TRAILS } from '../const/trails';

// Helper to create a date string in YYYY-MM-DD format
const formatDate = (date: Date): string => date.toISOString().split('T')[0];

// Helper to get a date N days ago from today
const daysAgo = (n: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - n);
    return formatDate(date);
};

describe('DashboardStatsService', () => {
    // Mock history data using dynamic dates relative to today
    const mockHistory = [
        { date: daysAgo(6), steps: 8000 },
        { date: daysAgo(5), steps: 7500 },
        { date: daysAgo(4), steps: 9000 },
        { date: daysAgo(3), steps: 6000 },
        { date: daysAgo(2), steps: 10000 },
        { date: daysAgo(1), steps: 5000 },
        { date: daysAgo(0), steps: 7000 },  // today
    ];

    describe('getWeeklyStats', () => {
        it('should calculate weekly stats correctly', () => {
            const result = DashboardStatsService.getWeeklyStats(mockHistory);

            expect(result).toHaveProperty('thisWeek');
            expect(result).toHaveProperty('lastWeek');
            expect(result).toHaveProperty('changePercent');
            expect(result).toHaveProperty('trend');
            expect(typeof result.thisWeek).toBe('number');
            expect(typeof result.lastWeek).toBe('number');
        });

        it('should return zeros for empty history', () => {
            const result = DashboardStatsService.getWeeklyStats([]);

            expect(result.thisWeek).toBe(0);
            expect(result.lastWeek).toBe(0);
            expect(result.trend).toBe('same');
        });
    });

    describe('getMonthlySteps', () => {
        it('should calculate monthly steps for current month', () => {
            const result = DashboardStatsService.getMonthlySteps(mockHistory);

            expect(typeof result).toBe('number');
            expect(result).toBeGreaterThanOrEqual(0);
        });

        it('should return 0 for empty history', () => {
            const result = DashboardStatsService.getMonthlySteps([]);
            expect(result).toBe(0);
        });
    });

    describe('getGoalAchievementRate', () => {
        it('should calculate goal achievement rate correctly', () => {
            const dailyGoal = 7000;
            const result = DashboardStatsService.getGoalAchievementRate(mockHistory, dailyGoal);

            expect(result).toHaveProperty('rate');
            expect(result).toHaveProperty('daysHit');
            expect(result).toHaveProperty('totalDays');
            expect(result.rate).toBeGreaterThanOrEqual(0);
            expect(result.rate).toBeLessThanOrEqual(100);
        });

        it('should handle case where all days meet goal', () => {
            // Create 14 days of history where all days meet the goal
            const fullHistory = Array.from({ length: 14 }, (_, i) => ({
                date: daysAgo(13 - i), // From 13 days ago to today
                steps: 2000 // All above lowGoal of 1000
            }));
            const lowGoal = 1000;
            const result = DashboardStatsService.getGoalAchievementRate(fullHistory, lowGoal);

            expect(result.rate).toBe(100);
            expect(result.daysHit).toBe(14);
        });
    });

    describe('getPersonalRecords', () => {
        it('should find the best day correctly', () => {
            const result = DashboardStatsService.getPersonalRecords(mockHistory);

            expect(result.bestDay.steps).toBe(10000);
            expect(result.bestDay.date).toBe(daysAgo(2)); // 10000 steps was 2 days ago
        });

        it('should return zeros for empty history', () => {
            const result = DashboardStatsService.getPersonalRecords([]);

            expect(result.bestDay.steps).toBe(0);
            expect(result.bestWeek.steps).toBe(0);
            expect(result.bestMonth.steps).toBe(0);
        });
    });

    describe('getLandmarksReached', () => {
        it('should return 0 for null progress', () => {
            const result = DashboardStatsService.getLandmarksReached(null, TRAILS);
            expect(result).toBe(0);
        });

        it('should count landmarks from active trail', () => {
            const mockProgress: UserProgress = {
                selectedTrailId: 'kedarkantha-trek',
                trailStartDate: '2026-01-01',
                targetDays: 30,
                totalStepsValid: 10000,
                currentDistanceMeters: 15000, // Should unlock several landmarks
                stats: {
                    totalStepsLifetime: 10000,
                    totalDistanceMetersLifetime: 15000,
                    completedTrailsCount: 0,
                },
                lastSyncTime: '2026-01-14',
                monthlyProgress: {
                    year: 2026,
                    month: 1,
                    stepsThisMonth: 10000,
                    distanceMetersThisMonth: 15000,
                    unlockedBadgeIds: [],
                    monthlyBadgeEarned: false
                },
                yearlyProgress: [],
                trailBadges: [],
                completedTrails: [],
                currentStreak: 1,
                lastLogDate: '2026-01-14',
            };

            const result = DashboardStatsService.getLandmarksReached(mockProgress, TRAILS);
            expect(result).toBeGreaterThan(0);
        });
    });

    describe('getNextBadgeProgress', () => {
        it('should return null for null progress', () => {
            const result = DashboardStatsService.getNextBadgeProgress(null);
            expect(result).toBeNull();
        });

        it('should find next achievable badge', () => {
            const mockProgress: UserProgress = {
                selectedTrailId: null,
                trailStartDate: null,
                targetDays: 30,
                totalStepsValid: 0,
                currentDistanceMeters: 0,
                stats: {
                    totalStepsLifetime: 500,
                    totalDistanceMetersLifetime: 0,
                    completedTrailsCount: 0,
                },
                lastSyncTime: '2026-01-14',
                monthlyProgress: {
                    year: 2026,
                    month: 1,
                    stepsThisMonth: 2500, // Halfway to step-5k badge
                    distanceMetersThisMonth: 2500,
                    unlockedBadgeIds: [],
                    monthlyBadgeEarned: false
                },
                yearlyProgress: [],
                trailBadges: [],
                completedTrails: [],
                currentStreak: 0,
                lastLogDate: null,
            };

            const result = DashboardStatsService.getNextBadgeProgress(mockProgress);

            expect(result).not.toBeNull();
            expect(result?.badge).toBeDefined();
            expect(result?.percent).toBeDefined();
        });
    });

    describe('getChartData', () => {
        it('should return correct number of days', () => {
            const result = DashboardStatsService.getChartData(mockHistory, 7);
            expect(result.length).toBe(7);
        });

        it('should have labels and values for each day', () => {
            const result = DashboardStatsService.getChartData(mockHistory, 7);

            result.forEach(point => {
                expect(point).toHaveProperty('label');
                expect(point).toHaveProperty('value');
                expect(typeof point.label).toBe('string');
                expect(typeof point.value).toBe('number');
            });
        });
    });
});
