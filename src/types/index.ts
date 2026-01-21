/**
 * File: src/types/index.ts
 * Purpose: Global TypeScript type definitions.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Added CompletedTrail and DailyLog types.
 * 2026-01-15: Added MonthlyProgress and YearlyProgress for badge revamp.
 */
export interface Trail {
  id: string;
  name: string;
  description: string;
  extendedDescription?: string; // Additional context: beauty, history, tips
  totalDistanceMeters: number;
  image: any; // Using 'any' for require('path/to/image')
  color: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Extreme';
  landmarks: Landmark[];
  startCoordinate?: { latitude: number; longitude: number };
  endCoordinate?: { latitude: number; longitude: number };
  region?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
}

export interface Landmark {
  id: string;
  name: string;
  distanceMeters: number; // At what distance is this landmark unlocked?
  description: string;
  image?: any;
  coordinate?: { latitude: number; longitude: number };
}

export interface CompletedTrail {
  trailId: string;
  completedDate: string; // ISO Date
  startDate: string; // ISO Date
  totalSteps: number;
  totalDays: number; // Duration
  avgStepsPerDay: number;
  maxStepsInOneDay: number;
}

export interface UserStats {
  totalStepsLifetime: number;
  totalDistanceMetersLifetime: number;
  completedTrailsCount: number;
}

// ============================================
// MONTHLY BADGE PROGRESS (resets each month)
// ============================================
export interface MonthlyProgress {
  year: number;
  month: number; // 1-12
  stepsThisMonth: number;
  distanceMetersThisMonth: number;
  unlockedBadgeIds: string[]; // e.g., ["step-5k", "step-10k", "dist-5k"]
  monthlyBadgeEarned: boolean; // True if 10/15 badges earned
}

// ============================================
// YEARLY BADGE PROGRESS
// ============================================
export interface YearlyProgress {
  year: number;
  monthlyBadgesEarned: number[]; // Array of months (1-12) where monthly badge was earned
  yearlyBadgeEarned: boolean; // True if all 12 monthly badges earned
}

export interface UserProgress {
  selectedTrailId: string | null;
  trailStartDate: string | null; // ISO Date
  targetDays: number; // User set goal

  // Trail Progress tracking (resets per trail)
  totalStepsValid: number;
  currentDistanceMeters: number;

  // Global Stats (Lifetime)
  stats: UserStats;

  // Last sync info
  lastSyncTime: string; // ISO Date String

  // Monthly Badge Progress (new system)
  monthlyProgress: MonthlyProgress;
  yearlyProgress: YearlyProgress[];

  // Trail Badges (lifetime - never reset)
  trailBadges: string[]; // e.g., ["trail-1", "trail-3"]

  // Completed Trails
  completedTrails: CompletedTrail[]; // List of completed Trail stats
  favoriteTrails?: string[]; // List of favorite trail IDs

  // Monthly Badge History
  pastMonths?: MonthlyProgress[]; // Archive of previous months

  // Legacy fields (kept for compatibility)
  currentStreak: number;
  lastLogDate: string | null; // YYYY-MM-DD
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  steps: number;
  distanceMeters: number;
}
