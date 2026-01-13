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
    }
};
