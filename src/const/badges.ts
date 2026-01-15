/**
 * File: src/const/badges.ts
 * Purpose: Definitions of all badges, collections, and unlock criteria.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Added badge collections.
 * 2024-01-12: Added dynamic distance unit support for badge descriptions.
 * 2026-01-14: Simplified to use only kilometers for distance badges.
 */

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    conditionType: 'TOTAL_STEPS' | 'TOTAL_DISTANCE' | 'STREAK' | 'TRAIL_COMPLETE' | 'SEASON' | 'MONTH';
    conditionValue: number;
    collection: string; // Which collection this badge belongs to
}

export interface BadgeCollection {
    id: string;
    name: string;
    description: string;
    emoji: string;
    badges: Badge[];
}

// === BADGE DEFINITIONS ===
const allBadges: Badge[] = [
    // WALKING WARRIOR COLLECTION
    { id: 'warrior-1', name: 'Baby Steps', description: 'Take your first 1,000 steps', icon: '👶', conditionType: 'TOTAL_STEPS', conditionValue: 1000, collection: 'warrior' },
    { id: 'warrior-2', name: 'Stroller', description: '5,000 steps conquered', icon: '🚶', conditionType: 'TOTAL_STEPS', conditionValue: 5000, collection: 'warrior' },
    { id: 'warrior-3', name: 'Pavement Pounder', description: '10,000 steps of glory', icon: '🎯', conditionType: 'TOTAL_STEPS', conditionValue: 10000, collection: 'warrior' },
    { id: 'warrior-4', name: 'Step Master', description: '25,000 steps crushed', icon: '⭐', conditionType: 'TOTAL_STEPS', conditionValue: 25000, collection: 'warrior' },
    { id: 'warrior-5', name: 'Stride Legend', description: '50,000 steps achieved', icon: '🏆', conditionType: 'TOTAL_STEPS', conditionValue: 50000, collection: 'warrior' },
    { id: 'warrior-6', name: 'Walk Titan', description: '100,000 steps dominated', icon: '💯', conditionType: 'TOTAL_STEPS', conditionValue: 100000, collection: 'warrior' },
    { id: 'warrior-7', name: 'Mega Milemaker', description: '250,000 steps conquered', icon: '🌟', conditionType: 'TOTAL_STEPS', conditionValue: 250000, collection: 'warrior' },
    { id: 'warrior-8', name: 'Step Deity', description: '500,000 steps of greatness', icon: '💎', conditionType: 'TOTAL_STEPS', conditionValue: 500000, collection: 'warrior' },
    { id: 'warrior-9', name: 'Walking God', description: '1,000,000 steps - Legendary!', icon: '👑', conditionType: 'TOTAL_STEPS', conditionValue: 1000000, collection: 'warrior' },

    // DISTANCE DESTROYER COLLECTION
    { id: 'distance-1', name: 'Distance Rookie', description: 'Covered 1 km', icon: '📏', conditionType: 'TOTAL_DISTANCE', conditionValue: 1000, collection: 'distance' },
    { id: 'distance-2', name: '5K Crusher', description: '5 km in the bag', icon: '🏃', conditionType: 'TOTAL_DISTANCE', conditionValue: 5000, collection: 'distance' },
    { id: 'distance-3', name: 'Double Digit', description: '10 km traveled', icon: '📍', conditionType: 'TOTAL_DISTANCE', conditionValue: 10000, collection: 'distance' },
    { id: 'distance-4', name: 'Half Marathon Hero', description: '21 km - halfway there!', icon: '🎖️', conditionType: 'TOTAL_DISTANCE', conditionValue: 21000, collection: 'distance' },
    { id: 'distance-5', name: 'Marathon Maniac', description: '42 km of pure determination', icon: '🏁', conditionType: 'TOTAL_DISTANCE', conditionValue: 42000, collection: 'distance' },
    { id: 'distance-6', name: 'Ultra Beast', description: '50 km - beyond limits', icon: '🦅', conditionType: 'TOTAL_DISTANCE', conditionValue: 50000, collection: 'distance' },
    { id: 'distance-7', name: 'Century Seeker', description: '100 km journey complete', icon: '🚀', conditionType: 'TOTAL_DISTANCE', conditionValue: 100000, collection: 'distance' },
    { id: 'distance-8', name: 'Distance King', description: '250 km conquered', icon: '🌍', conditionType: 'TOTAL_DISTANCE', conditionValue: 250000, collection: 'distance' },
    { id: 'distance-9', name: 'Distance Demon', description: '500 km - unstoppable!', icon: '👹', conditionType: 'TOTAL_DISTANCE', conditionValue: 500000, collection: 'distance' },
    { id: 'distance-10', name: 'The Wanderer', description: '1,000 km of exploration', icon: '🗺️', conditionType: 'TOTAL_DISTANCE', conditionValue: 1000000, collection: 'distance' },


    // SEASONAL WANDERER COLLECTION
    { id: 'season-1', name: 'Blossom Walker', description: 'Walked in the spring bloom', icon: '🌸', conditionType: 'SEASON', conditionValue: 3, collection: 'seasonal' },
    { id: 'season-2', name: 'Sunshine Strider', description: 'Summer heat conquered', icon: '☀️', conditionType: 'SEASON', conditionValue: 6, collection: 'seasonal' },
    { id: 'season-3', name: 'Leaf Cruncher', description: 'Autumn trails explored', icon: '🍂', conditionType: 'SEASON', conditionValue: 9, collection: 'seasonal' },
    { id: 'season-4', name: 'Frost Fighter', description: 'Winter cold defied', icon: '❄️', conditionType: 'SEASON', conditionValue: 12, collection: 'seasonal' },

    // CALENDAR NOMAD COLLECTION
    { id: 'month-1', name: 'New Year Stepper', description: 'January strolls', icon: '🎆', conditionType: 'MONTH', conditionValue: 1, collection: 'calendar' },
    { id: 'month-2', name: 'Valentine Voyager', description: 'February wanderer', icon: '💝', conditionType: 'MONTH', conditionValue: 2, collection: 'calendar' },
    { id: 'month-3', name: 'March Marcher', description: 'Spring awakening walker', icon: '☘️', conditionType: 'MONTH', conditionValue: 3, collection: 'calendar' },
    { id: 'month-4', name: 'April Adventurer', description: 'Showers brought flowers', icon: '🌷', conditionType: 'MONTH', conditionValue: 4, collection: 'calendar' },
    { id: 'month-5', name: 'Mayday Mover', description: 'May magnificence', icon: '🌺', conditionType: 'MONTH', conditionValue: 5, collection: 'calendar' },
    { id: 'month-6', name: 'June Jubilant', description: 'Summer solstice strider', icon: '🌻', conditionType: 'MONTH', conditionValue: 6, collection: 'calendar' },
    { id: 'month-7', name: 'July Journeyer', description: 'Independence Day hiker', icon: '🎇', conditionType: 'MONTH', conditionValue: 7, collection: 'calendar' },
    { id: 'month-8', name: 'August Ace', description: 'summer\'s last hurrah', icon: '🌞', conditionType: 'MONTH', conditionValue: 8, collection: 'calendar' },
    { id: 'month-9', name: 'September Seeker', description: 'Fall transition walker', icon: '🍁', conditionType: 'MONTH', conditionValue: 9, collection: 'calendar' },
    { id: 'month-10', name: 'October Odyssey', description: 'Spooky season stroller', icon: '🎃', conditionType: 'MONTH', conditionValue: 10, collection: 'calendar' },
    { id: 'month-11', name: 'November Nomad', description: 'Thankful trails', icon: '🦃', conditionType: 'MONTH', conditionValue: 11, collection: 'calendar' },
    { id: 'month-12', name: 'December Dasher', description: 'Holiday season hiker', icon: '🎄', conditionType: 'MONTH', conditionValue: 12, collection: 'calendar' },

    // LEGENDARY LIFE COLLECTION
    { id: 'legend-1', name: 'Dawn Patrol', description: 'Walked before sunrise', icon: '🌅', conditionType: 'TOTAL_STEPS', conditionValue: 1000, collection: 'legendary' },
    { id: 'legend-2', name: 'Moonlight Mover', description: 'Night walks completed', icon: '🌙', conditionType: 'TOTAL_STEPS', conditionValue: 1000, collection: 'legendary' },
    { id: 'legend-3', name: 'Weekend Wanderer', description: 'Saturday & Sunday special', icon: '🎉', conditionType: 'TOTAL_STEPS', conditionValue: 5000, collection: 'legendary' },
    { id: 'legend-4', name: 'Trail Blazer', description: 'First trail completed', icon: '🥇', conditionType: 'TRAIL_COMPLETE', conditionValue: 1, collection: 'legendary' },
    { id: 'legend-5', name: 'Path Master', description: '3 trails conquered', icon: '🥈', conditionType: 'TRAIL_COMPLETE', conditionValue: 3, collection: 'legendary' },
    { id: 'legend-6', name: 'Route Royalty', description: '5 trails dominated', icon: '🏛️', conditionType: 'TRAIL_COMPLETE', conditionValue: 5, collection: 'legendary' },
];

// === ORGANIZE INTO COLLECTIONS ===
export const BADGE_COLLECTIONS: BadgeCollection[] = [
    {
        id: 'warrior',
        name: 'Walking Warriors',
        description: 'Step count milestones',
        emoji: '⚔️',
        badges: allBadges.filter(b => b.collection === 'warrior')
    },
    {
        id: 'distance',
        name: 'Distance Destroyers',
        description: 'Kilometer conquests',
        emoji: '🗺️',
        badges: allBadges.filter(b => b.collection === 'distance')
    },
    {
        id: 'seasonal',
        name: 'Seasonal Wanderers',
        description: 'Weather all conditions',
        emoji: '🌍',
        badges: allBadges.filter(b => b.collection === 'seasonal')
    },
    {
        id: 'calendar',
        name: 'Calendar Nomads',
        description: 'Month by month',
        emoji: '📅',
        badges: allBadges.filter(b => b.collection === 'calendar')
    },
    {
        id: 'legendary',
        name: 'Legendary Life',
        description: 'Special achievements',
        emoji: '⭐',
        badges: allBadges.filter(b => b.collection === 'legendary')
    },
];

// Export all badges for compatibility
export const BADGES = allBadges;
