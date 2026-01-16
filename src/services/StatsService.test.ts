/**
 * File: src/services/StatsService.test.ts
 * Purpose: Unit tests for StatsService.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Initial tests created.
 */
import { StatsService } from './StatsService';
import { DailyLog, Trail, UserProgress } from '../types';

describe('StatsService', () => {
    describe('calculateStreak', () => {
        it('should return 1 if no last log date', () => {
            const streak = StatsService.calculateStreak(0, null, new Date('2024-01-01'));
            expect(streak).toBe(1);
        });

        it('should increment streak if last log was yesterday', () => {
            const today = new Date('2024-01-02');
            const streak = StatsService.calculateStreak(5, '2024-01-01', today);
            expect(streak).toBe(6);
        });

        it('should reset streak to 1 if last log was before yesterday', () => {
            const today = new Date('2024-01-05');
            const streak = StatsService.calculateStreak(5, '2024-01-01', today);
            expect(streak).toBe(1);
        });

        it('should maintain streak if already logged today', () => {
            const today = new Date('2024-01-01');
            const streak = StatsService.calculateStreak(5, '2024-01-01', today);
            expect(streak).toBe(5);
        });
    });

    describe('checkTrailCompletion', () => {
        const mockTrail: Trail = {
            id: 'test-trail',
            name: 'Test Trail',
            description: '',
            extendedDescription: '',
            totalDistanceMeters: 1000, // 1km
            color: '#000',
            difficulty: 'Easy',
            image: 0,
            startCoordinate: { latitude: 0, longitude: 0 },
            endCoordinate: { latitude: 0, longitude: 0 },
            region: { latitude: 0, longitude: 0, latitudeDelta: 0, longitudeDelta: 0 },
            landmarks: []
        };

        const mockProgress: UserProgress = {
            selectedTrailId: 'test-trail',
            targetDays: 5,
            trailStartDate: '2024-01-01T00:00:00.000Z',
            totalStepsValid: 2000,
            currentDistanceMeters: 1500, // Completed (> 1000)
            lastSyncTime: '2024-01-05T00:00:00.000Z',
            stats: {
                totalStepsLifetime: 2000,
                totalDistanceMetersLifetime: 1500,
                completedTrailsCount: 0
            },
            monthlyProgress: {
                year: 2024,
                month: 1,
                stepsThisMonth: 2000,
                distanceMetersThisMonth: 1500,
                unlockedBadgeIds: [],
                monthlyBadgeEarned: false
            },
            yearlyProgress: [],
            trailBadges: [],
            completedTrails: [],
            currentStreak: 1,
            lastLogDate: '2024-01-05'
        };

        const mockLogs: DailyLog[] = [
            { date: '2024-01-01', steps: 500, distanceMeters: 400 },
            { date: '2024-01-02', steps: 500, distanceMeters: 400 },
            { date: '2024-01-03', steps: 0, distanceMeters: 0 },
            { date: '2024-01-04', steps: 1000, distanceMeters: 800 },
            { date: '2024-01-05', steps: 0, distanceMeters: 0 }
        ];

        it('should return null if distance not met', () => {
            const p = { ...mockProgress, currentDistanceMeters: 500 };
            const result = StatsService.checkTrailCompletion(p, mockTrail, new Date('2024-01-05'), mockLogs);
            expect(result).toBeNull();
        });

        it('should return null if already completed', () => {
            const p = {
                ...mockProgress,
                completedTrails: [{
                    trailId: 'test-trail',
                    completedDate: '',
                    startDate: '',
                    totalSteps: 0,
                    totalDays: 0,
                    avgStepsPerDay: 0,
                    maxStepsInOneDay: 0
                }]
            };
            const result = StatsService.checkTrailCompletion(p, mockTrail, new Date('2024-01-05'), mockLogs);
            expect(result).toBeNull();
        });

        it('should calculate stats correctly upon completion', () => {
            const endDate = new Date('2024-01-05T12:00:00.000Z');
            const result = StatsService.checkTrailCompletion(mockProgress, mockTrail, endDate, mockLogs);

            expect(result).not.toBeNull();
            expect(result?.trailId).toBe('test-trail');
            expect(result?.totalSteps).toBe(2000);

            // Duration: Jan 1 to Jan 5 = 5 days (approx)
            // 5th at 12:00 minus 1st at 00:00 = 4.5 days -> ceil -> 5 days
            expect(result?.totalDays).toBe(5);

            // Avg: 2000 / 5 = 400
            expect(result?.avgStepsPerDay).toBe(400);

            // Max: 1000 (from logs)
            expect(result?.maxStepsInOneDay).toBe(1000);
        });
    });
});
