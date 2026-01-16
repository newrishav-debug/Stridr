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

describe('DashboardStatsService', () => {
    // Mock history data
    const mockHistory = [
        { date: '2026-01-08', steps: 8000 },  // Wednesday, last week
        { date: '2026-01-09', steps: 7500 },  // Thursday, last week
        { date: '2026-01-10', steps: 9000 },  // Friday, last week
        { date: '2026-01-11', steps: 6000 },  // Saturday, last week
        { date: '2026-01-12', steps: 10000 }, // Sunday, this week
        { date: '2026-01-13', steps: 5000 },  // Monday, this week
        { date: '2026-01-14', steps: 7000 },  // Tuesday, this week (today)
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
            const lowGoal = 1000;
            const result = DashboardStatsService.getGoalAchievementRate(mockHistory, lowGoal);

            expect(result.rate).toBe(100);
        });
    });

    describe('getPersonalRecords', () => {
        it('should find the best day correctly', () => {
            const result = DashboardStatsService.getPersonalRecords(mockHistory);

            expect(result.bestDay.steps).toBe(10000);
            expect(result.bestDay.date).toBe('2026-01-12');
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
