/**
 * File: src/services/StepService.ts
 * Purpose: Abstraction for Pedometer/Step counting sensors.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Documentation added.
 */
import { Pedometer } from 'expo-sensors';

export const StepService = {
    async isAvailable(): Promise<boolean> {
        return await Pedometer.isAvailableAsync();
    },

    async requestPermissions(): Promise<boolean> {
        const { status } = await Pedometer.requestPermissionsAsync();
        return status === 'granted';
    },

    async getStepsBetween(start: Date, end: Date): Promise<number> {
        try {
            console.log('[StepService] getStepsBetween called:', {
                start: start.toISOString(),
                end: end.toISOString(),
                startMs: start.getTime(),
                endMs: end.getTime()
            });

            const result = await Pedometer.getStepCountAsync(start, end);
            console.log('[StepService] Pedometer result:', result);
            return result.steps;
        } catch (error) {
            console.warn('Pedometer query failed', error);
            return 0;
        }
    },

    async getTodaySteps(): Promise<number> {
        const end = new Date();
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        console.log('[StepService] Querying today steps:', {
            start: start.toISOString(),
            end: end.toISOString()
        });

        const steps = await this.getStepsBetween(start, end);
        console.log('[StepService] Today steps result:', steps);
        return steps;
    },

    async getDailyHistory(days: number): Promise<{ date: string; steps: number }[]> {
        const history = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);

            try {
                const steps = await this.getStepsBetween(start, end);
                history.push({
                    date: start.toISOString().split('T')[0],
                    steps
                });
            } catch (e) {
                console.warn(`Failed to get steps for ${date}`, e);
                history.push({ date: start.toISOString().split('T')[0], steps: 0 });
            }
        }
        return history;
    },

    async getYearlyHistory(year: number): Promise<{ date: string; steps: number }[]> {
        const history = [];
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31);
        const today = new Date();

        // We only need to fetch up to today if the year is the current year
        const effectiveEnd = year === today.getFullYear() ? today : endOfYear;
        // However, the calendar expects data for the whole month potentially (future days are handled by UI)
        // actually, we just need existing data.

        // Let's iterate day by day. Pedometer.getStepCountAsync is fast enough usually.
        // Optimization: create an array of promises?
        // Let's try sequential first to avoid overwhelming the bridge, or batch by month?
        // Creating 365 promises might be too much. Let's do month by month parallel or linear day by day.

        // Let's try day by day for simplicity and robustness first.
        const current = new Date(startOfYear);
        current.setHours(0, 0, 0, 0);

        while (current <= effectiveEnd) {
            const start = new Date(current);
            start.setHours(0, 0, 0, 0);
            const end = new Date(current);
            end.setHours(23, 59, 59, 999);

            try {
                const steps = await this.getStepsBetween(start, end);
                history.push({
                    date: start.toISOString().split('T')[0],
                    steps
                });
            } catch (e) {
                console.warn(`Failed to get steps for ${current}`, e);
                history.push({ date: start.toISOString().split('T')[0], steps: 0 });
            }

            current.setDate(current.getDate() + 1);
        }

        return history;
    }
};
