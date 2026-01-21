/**
 * File: app/_layout.tsx
 * Purpose: Root layout component handling navigation stack and context providers.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Documentation added.
 * 2026-01-20: Fixed context provider order and navigation race condition.
 */
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { GameProvider } from '../src/context/GameContext';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { SubscriptionProvider, useSubscription } from '../src/context/SubscriptionContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { PreferencesProvider, usePreferences } from '../src/context/PreferencesContext';
import { ToastProvider } from '../src/context/ToastContext';
import { logger } from '../src/services/LogService';

const ProtectedLayout = () => {
    const { user, isLoading: isAuthLoading } = useAuth();
    const { isPro, isLoading: isSubLoading } = useSubscription();
    const { preferences } = usePreferences();
    const router = useRouter();
    const segments = useSegments();
    const navigationState = useRootNavigationState();

    const isLoading = isAuthLoading || isSubLoading;

    useEffect(() => {
        // Wait for the navigation state to be ready before navigating
        if (!navigationState?.key) return;

        logger.info('App Launched - Checking Auth and Sub State');
        if (isLoading) return;

        const inAuthGroup = segments[0] === 'login' || segments[0] === 'signup';
        const inPaywall = segments[0] === 'paywall';

        if (!user && !inAuthGroup) {
            // Not logged in, and not in auth group -> Go to login
            router.replace('/login');
        } else if (user) {
            // Logged in
            if (inAuthGroup) {
                // User just logged in - go to home (free users see locked features)
                router.replace('/(tabs)/');
            } else if (isPro && inPaywall) {
                // Logged in, is pro, but on paywall -> Go to home
                router.replace('/(tabs)/');
            }
            // Free users can access app normally - they just see locked premium features
        }
    }, [user, isPro, isLoading, segments, navigationState?.key]);

    if (isLoading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}><ActivityIndicator size="large" color="#FFD700" /></View>;

    return (
        <GameProvider>
            <ToastProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="login" />
                    <Stack.Screen name="signup" />
                    <Stack.Screen name="paywall" options={{ gestureEnabled: false }} />
                    <Stack.Screen name="trail/[id]" />
                    <Stack.Screen name="edit-profile" />
                    <Stack.Screen name="my-dashboard" />
                </Stack>
                <StatusBar style={preferences.theme === 'dark' ? 'light' : 'dark'} />
            </ToastProvider>
        </GameProvider>
    );
};

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <SubscriptionProvider>
                    <PreferencesProvider>
                        <ProtectedLayout />
                    </PreferencesProvider>
                </SubscriptionProvider>
            </AuthProvider>
        </SafeAreaProvider>
    );
}
