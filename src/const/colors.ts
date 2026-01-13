/**
 * File: src/const/colors.ts
 * Purpose: Color palette definitions for light and dark themes.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Documentation added.
 */
export const Colors = {
    light: {
        // Backgrounds
        background: '#F9FAFB',
        backgroundSecondary: '#FFFFFF',
        backgroundTertiary: '#F3F4F6',

        // Text
        text: '#111827',
        textSecondary: '#6B7280',
        textTertiary: '#9CA3AF',
        textInverse: '#FFFFFF',

        // Borders & Dividers
        border: '#E5E7EB',
        divider: '#F3F4F6',

        // Cards & Surfaces
        card: '#FFFFFF',
        cardSecondary: '#F9FAFB',

        // Specific UI Elements
        handle: '#E5E7EB',
        shadow: '#000000',

        // Status Bar
        statusBar: 'dark-content' as const,
    },
    dark: {
        // Backgrounds
        background: '#111827',
        backgroundSecondary: '#1F2937',
        backgroundTertiary: '#374151',

        // Text
        text: '#F9FAFB',
        textSecondary: '#D1D5DB',
        textTertiary: '#9CA3AF',
        textInverse: '#111827',

        // Borders & Dividers
        border: '#374151',
        divider: '#1F2937',

        // Cards & Surfaces
        card: '#1F2937',
        cardSecondary: '#111827',

        // Specific UI Elements
        handle: '#4B5563',
        shadow: '#000000',

        // Status Bar
        statusBar: 'light-content' as const,
    }
};

export type ThemeColors = typeof Colors.light;
