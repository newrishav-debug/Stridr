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
            if (__DEV__) {
                // console.log('[StepService] getStepsBetween:', start.toISOString(), '->', end.toISOString());
            }

            const result = await Pedometer.getStepCountAsync(start, end);
            return result.steps;
        } catch (error) {
            if (__DEV__) console.warn('Pedometer query failed', error);
            return 0;
        }
    },

    async getTodaySteps(): Promise<number> {
        const end = new Date();
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const steps = await this.getStepsBetween(start, end);
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
        const startOfYear = new Date(year, 0, 1);
        const today = new Date();

        // Only fetch up to today if the year is the current year
        const effectiveEnd = year === today.getFullYear() ? today : new Date(year, 11, 31);

        // Build array of all days we need to query
        const days: Date[] = [];
        const current = new Date(startOfYear);
        current.setHours(0, 0, 0, 0);

        while (current <= effectiveEnd) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        // Process in batches of 30 to avoid overwhelming the bridge
        const BATCH_SIZE = 30;
        const history: { date: string; steps: number }[] = [];

        for (let i = 0; i < days.length; i += BATCH_SIZE) {
            const batch = days.slice(i, i + BATCH_SIZE);

            const batchResults = await Promise.all(
                batch.map(async (day) => {
                    const start = new Date(day);
                    start.setHours(0, 0, 0, 0);
                    const end = new Date(day);
                    end.setHours(23, 59, 59, 999);

                    try {
                        const steps = await this.getStepsBetween(start, end);
                        return {
                            date: start.toISOString().split('T')[0],
                            steps
                        };
                    } catch (e) {
                        return { date: start.toISOString().split('T')[0], steps: 0 };
                    }
                })
            );

            history.push(...batchResults);
        }

        return history;
    }
};
