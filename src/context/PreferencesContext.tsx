/**
 * File: src/context/PreferencesContext.tsx
 * Purpose: Manages user preferences like theme, units, and notifications.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Documentation added.
 * 2024-01-12: Added granular notification settings.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { StorageService } from '../services/StorageService';
import { useAuth } from './AuthContext';

export type DistanceUnit = 'km' | 'mi';
export type Theme = 'light' | 'dark';
export type ReminderTime = 'morning' | 'afternoon' | 'evening'; // 9am, 2pm, 6pm

export interface NotificationSettings {
    dailyReminder: boolean;
    dailyReminderTime: ReminderTime;
    goalAchievement: boolean;
    badgeUnlock: boolean;
    milestone: boolean;
    inactivityNudge: boolean;
    landmarkReached: boolean;
}

export const defaultNotificationSettings: NotificationSettings = {
    dailyReminder: true,
    dailyReminderTime: 'morning',
    goalAchievement: true,
    badgeUnlock: true,
    milestone: true,
    inactivityNudge: true,
    landmarkReached: true,
};

interface Preferences {
    distanceUnit: DistanceUnit;
    theme: Theme;
    dailyGoal: number;
    notificationsEnabled: boolean;
    notificationSettings: NotificationSettings;
    strideLength: number; // in cm
}

interface PreferencesContextType {
    preferences: Preferences;
    setDistanceUnit: (unit: DistanceUnit) => void;
    setTheme: (theme: Theme) => void;
    setDailyGoal: (goal: number) => void;
    setNotificationsEnabled: (enabled: boolean) => void;
    setNotificationSettings: (settings: NotificationSettings) => void;
    updateNotificationSetting: <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => void;
    setStrideLength: (length: number) => void;
}

const defaultPreferences: Preferences = {
    distanceUnit: 'km',
    theme: 'light',
    dailyGoal: 10000,
    notificationsEnabled: true,
    notificationSettings: defaultNotificationSettings,
    strideLength: 75,
};

const PreferencesContext = createContext<PreferencesContextType>({
    preferences: defaultPreferences,
    setDistanceUnit: () => { },
    setTheme: () => { },
    setDailyGoal: () => { },
    setNotificationsEnabled: () => { },
    setNotificationSettings: () => { },
    updateNotificationSetting: () => { },
    setStrideLength: () => { },
});

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);

    const { user } = useAuth();

    // Load preferences on mount or when user changes
    useEffect(() => {
        if (user) {
            loadPreferences();
        }
    }, [user]);

    const loadPreferences = async () => {
        if (!user) return;
        const stored = await StorageService.getPreferences(user.id);
        if (stored) {
            // Merge with defaults to handle backward compatibility and new fields
            setPreferences({ ...defaultPreferences, ...stored });
        }
    };

    const updatePreference = async (key: keyof Preferences, value: any) => {
        if (!user) return;
        const newPrefs = { ...preferences, [key]: value };
        setPreferences(newPrefs);
        await StorageService.savePreferences(user.id, newPrefs);
    };

    const setDistanceUnit = (unit: DistanceUnit) => updatePreference('distanceUnit', unit);
    const setTheme = (theme: Theme) => updatePreference('theme', theme);
    const setDailyGoal = (goal: number) => updatePreference('dailyGoal', goal);
    const setNotificationsEnabled = (enabled: boolean) => updatePreference('notificationsEnabled', enabled);
    const setStrideLength = (length: number) => updatePreference('strideLength', length);

    const setNotificationSettings = (settings: NotificationSettings) => updatePreference('notificationSettings', settings);

    const updateNotificationSetting = <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => {
        const newSettings = { ...preferences.notificationSettings, [key]: value };
        updatePreference('notificationSettings', newSettings);
    };

    return (
        <PreferencesContext.Provider value={{
            preferences,
            setDistanceUnit,
            setTheme,
            setDailyGoal,
            setNotificationsEnabled,
            setNotificationSettings,
            updateNotificationSetting,
            setStrideLength
        }}>
            {children}
        </PreferencesContext.Provider>
    );
};

export const usePreferences = () => useContext(PreferencesContext);

export const useTheme = () => {
    const { preferences } = usePreferences();
    const { Colors } = require('../const/colors');
    return Colors[preferences.theme];
};
