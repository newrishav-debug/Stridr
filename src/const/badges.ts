/**
 * File: src/const/badges.ts
 * Purpose: Definitions of all badges - monthly challenges, trail badges, and super badges.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Added badge collections.
 * 2026-01-15: Complete revamp - monthly recurring badges with step/distance goals.
 */

// ============================================
// BADGE TYPE DEFINITIONS
// ============================================

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    conditionType: 'MONTHLY_STEPS' | 'MONTHLY_DISTANCE' | 'TRAILS_COMPLETED' | 'MONTHLY_MASTER' | 'YEARLY_CHAMPION';
    conditionValue: number;
    collection: 'steps' | 'distance' | 'trails' | 'monthly' | 'yearly';
}

export interface BadgeCollection {
    id: string;
    name: string;
    description: string;
    emoji: string;
    badges: Badge[];
}

// ============================================
// MONTHLY STEP BADGES (7 badges - reset monthly)
// ============================================
export const MONTHLY_STEP_BADGES: Badge[] = [
    { id: 'step-5k', name: 'First Steps', description: 'Walk 5,000 steps this month', icon: '👶', conditionType: 'MONTHLY_STEPS', conditionValue: 5000, collection: 'steps' },
    { id: 'step-10k', name: 'Getting Moving', description: 'Walk 10,000 steps this month', icon: '🚶', conditionType: 'MONTHLY_STEPS', conditionValue: 10000, collection: 'steps' },
    { id: 'step-25k', name: 'Stride Master', description: 'Walk 25,000 steps this month', icon: '🎯', conditionType: 'MONTHLY_STEPS', conditionValue: 25000, collection: 'steps' },
    { id: 'step-50k', name: 'Step Champion', description: 'Walk 50,000 steps this month', icon: '⭐', conditionType: 'MONTHLY_STEPS', conditionValue: 50000, collection: 'steps' },
    { id: 'step-100k', name: 'Century Walker', description: 'Walk 100,000 steps this month', icon: '💯', conditionType: 'MONTHLY_STEPS', conditionValue: 100000, collection: 'steps' },
    { id: 'step-250k', name: 'Step Legend', description: 'Walk 250,000 steps this month', icon: '🌟', conditionType: 'MONTHLY_STEPS', conditionValue: 250000, collection: 'steps' },
    { id: 'step-500k', name: 'Step Titan', description: 'Walk 500,000 steps this month', icon: '👑', conditionType: 'MONTHLY_STEPS', conditionValue: 500000, collection: 'steps' },
];

// ============================================
// MONTHLY DISTANCE BADGES (8 badges - reset monthly)
// ============================================
export const MONTHLY_DISTANCE_BADGES: Badge[] = [
    { id: 'dist-5k', name: '5K Explorer', description: 'Cover 5 km this month', icon: '📏', conditionType: 'MONTHLY_DISTANCE', conditionValue: 5000, collection: 'distance' },
    { id: 'dist-10k', name: '10K Traveler', description: 'Cover 10 km this month', icon: '🏃', conditionType: 'MONTHLY_DISTANCE', conditionValue: 10000, collection: 'distance' },
    { id: 'dist-21k', name: 'Half Marathon', description: 'Cover 21 km this month', icon: '🎖️', conditionType: 'MONTHLY_DISTANCE', conditionValue: 21000, collection: 'distance' },
    { id: 'dist-42k', name: 'Marathon Master', description: 'Cover 42 km this month', icon: '🏁', conditionType: 'MONTHLY_DISTANCE', conditionValue: 42000, collection: 'distance' },
    { id: 'dist-50k', name: 'Ultra Runner', description: 'Cover 50 km this month', icon: '🦅', conditionType: 'MONTHLY_DISTANCE', conditionValue: 50000, collection: 'distance' },
    { id: 'dist-100k', name: 'Century Seeker', description: 'Cover 100 km this month', icon: '🚀', conditionType: 'MONTHLY_DISTANCE', conditionValue: 100000, collection: 'distance' },
    { id: 'dist-150k', name: 'Distance King', description: 'Cover 150 km this month', icon: '🌍', conditionType: 'MONTHLY_DISTANCE', conditionValue: 150000, collection: 'distance' },
    { id: 'dist-200k', name: 'Distance Demon', description: 'Cover 200 km this month', icon: '👹', conditionType: 'MONTHLY_DISTANCE', conditionValue: 200000, collection: 'distance' },
];

// ============================================
// TRAIL COMPLETION BADGES (7 badges - lifetime)
// ============================================
export const TRAIL_BADGES: Badge[] = [
    { id: 'trail-1', name: 'Trail Starter', description: 'Complete your first trail', icon: '🥇', conditionType: 'TRAILS_COMPLETED', conditionValue: 1, collection: 'trails' },
    { id: 'trail-3', name: 'Path Finder', description: 'Complete 3 trails', icon: '🗺️', conditionType: 'TRAILS_COMPLETED', conditionValue: 3, collection: 'trails' },
    { id: 'trail-5', name: 'Trail Blazer', description: 'Complete 5 trails', icon: '🔥', conditionType: 'TRAILS_COMPLETED', conditionValue: 5, collection: 'trails' },
    { id: 'trail-10', name: 'Explorer Elite', description: 'Complete 10 trails', icon: '⛰️', conditionType: 'TRAILS_COMPLETED', conditionValue: 10, collection: 'trails' },
    { id: 'trail-15', name: 'Trail Master', description: 'Complete 15 trails', icon: '🏔️', conditionType: 'TRAILS_COMPLETED', conditionValue: 15, collection: 'trails' },
    { id: 'trail-25', name: 'Adventure Legend', description: 'Complete 25 trails', icon: '🌄', conditionType: 'TRAILS_COMPLETED', conditionValue: 25, collection: 'trails' },
    { id: 'trail-all', name: 'Trail Conqueror', description: 'Complete all trails', icon: '🏆', conditionType: 'TRAILS_COMPLETED', conditionValue: -1, collection: 'trails' }, // -1 means "all"
];

// ============================================
// MONTH NAMES FOR DISPLAY
// ============================================
export const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const MONTH_ICONS = ['🎆', '💝', '☘️', '🌷', '🌺', '🌻', '🎇', '🌞', '🍁', '🎃', '🦃', '🎄'];

// ============================================
// MONTHLY MASTER BADGES (12 badges - calendar year)
// ============================================
export const MONTHLY_MASTER_BADGES: Badge[] = MONTH_NAMES.map((month, index) => ({
    id: `master-${index + 1}`,
    name: `${month} Master`,
    description: `Earn Monthly Master in ${month}`,
    icon: MONTH_ICONS[index],
    conditionType: 'MONTHLY_MASTER',
    conditionValue: index + 1, // 1 for Jan, 2 for Feb, etc.
    collection: 'monthly'
}));

// ============================================
// COLLECTIONS FOR UI DISPLAY
// ============================================
export const BADGE_COLLECTIONS: BadgeCollection[] = [
    {
        id: 'steps',
        name: 'Walking Warriors',
        description: 'Monthly step challenges',
        emoji: '⚔️',
        badges: MONTHLY_STEP_BADGES
    },
    {
        id: 'distance',
        name: 'Distance Destroyers',
        description: 'Monthly distance milestones',
        emoji: '🗺️',
        badges: MONTHLY_DISTANCE_BADGES
    },
    {
        id: 'trails',
        name: 'Trail Blazers',
        description: 'Lifetime trail achievements',
        emoji: '🏔️',
        badges: TRAIL_BADGES
    },
    {
        id: 'monthly',
        name: 'Calendar Masters',
        description: 'Collect all 12 monthly masters',
        emoji: '📅',
        badges: MONTHLY_MASTER_BADGES
    }
];

// All monthly badges combined (for counting towards monthly master)
export const ALL_MONTHLY_BADGES: Badge[] = [...MONTHLY_STEP_BADGES, ...MONTHLY_DISTANCE_BADGES];

// Total monthly badges count
export const MONTHLY_BADGES_TOTAL = ALL_MONTHLY_BADGES.length; // 15

// Required badges to earn Monthly Master
export const MONTHLY_MASTER_REQUIREMENT = 10;

// Export all badges for compatibility
export const BADGES: Badge[] = [...ALL_MONTHLY_BADGES, ...TRAIL_BADGES];
