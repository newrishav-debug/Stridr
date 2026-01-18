/**
 * File: src/const/subscription.ts
 * Purpose: Subscription-related constants for the freemium model.
 * Created: 2026-01-17
 * Author: AI Assistant
 */

// Trails that are available for free users
export const FREE_TRAIL_IDS = [
    '5k-challenge',      // 5K Challenge
    '10k-classic',       // 10K Classic  
    'new-york-marathon', // New York City Marathon
] as const;

// Maximum number of active trails for free users
export const FREE_MAX_ACTIVE_TRAILS = 3;

// Default daily goal for free users (in steps)
export const FREE_DEFAULT_DAILY_GOAL = 10000;

// Helper function to check if a trail is free
export const isTrailFree = (trailId: string): boolean => {
    return FREE_TRAIL_IDS.includes(trailId as any);
};
