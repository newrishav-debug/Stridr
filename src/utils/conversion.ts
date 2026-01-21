/**
 * File: src/utils/conversion.ts
 * Purpose: Utility functions for unit conversion and formatting.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Documentation added.
 */
export const AVG_STRIDE_LENGTH_METERS = 0.762; // ~2.5 feet

// Base conversion functions
export function stepsToMeters(steps: number): number {
    return steps * AVG_STRIDE_LENGTH_METERS;
}

export function metersToMiles(meters: number): number {
    return meters * 0.000621371;
}

export function metersToKm(meters: number): number {
    return meters / 1000;
}

// Utility function to format distance based on unit preference
export function formatDistance(meters: number, unit: 'km' | 'mi' = 'km', decimals: number = 1): string {
    if (unit === 'mi') {
        const miles = metersToMiles(meters);
        return `${miles.toFixed(decimals)} mi`;
    } else {
        const km = metersToKm(meters);
        return `${km.toFixed(decimals)} km`;
    }
}

// Get just the numeric value
export function getDistanceValue(meters: number, unit: 'km' | 'mi' = 'km'): number {
    return unit === 'mi' ? metersToMiles(meters) : metersToKm(meters);
}

// Get the unit label
export function getDistanceUnit(unit: 'km' | 'mi' = 'km'): string {
    return unit === 'mi' ? 'mi' : 'km';
}

// Format distance for badge descriptions (e.g., "100 km" or "62 mi")
export function formatBadgeDistance(meters: number, unit: 'km' | 'mi' = 'km'): string {
    const value = getDistanceValue(meters, unit);
    const unitLabel = unit === 'mi' ? 'miles' : 'kilometers';
    const shortLabel = unit === 'mi' ? 'mi' : 'km';

    // For round numbers, use whole numbers
    if (value >= 1 && value === Math.round(value)) {
        return `${Math.round(value)} ${unitLabel}`;
    }
    // For smaller values or non-round, use decimal
    return `${value.toFixed(1)} ${shortLabel}`;
}
