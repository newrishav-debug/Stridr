/**
 * File: app/_layout.tsx
 * Purpose: Root layout component handling navigation stack and context providers.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Documentation added.
 */
import { Stack, useRouter, useSegments } from 'expo-router';
import { GameProvider } from '../src/context/GameContext';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { PreferencesProvider, usePreferences } from '../src/context/PreferencesContext';
import { ToastProvider } from '../src/context/ToastContext';

const ProtectedLayout = () => {
    const { user, isLoading } = useAuth();
    const { preferences } = usePreferences();
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === 'login' || segments[0] === 'signup';

        if (!user && !inAuthGroup) {
            // Redirect to login
            router.replace('/login');
        } else if (user && inAuthGroup) {
            // Redirect back to home
            router.replace('/(tabs)');
        }
    }, [user, isLoading, segments]);

    if (isLoading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>;

    return (
        <PreferencesProvider>
            <GameProvider>
                <ToastProvider>
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="login" />
                        <Stack.Screen name="signup" />
                        <Stack.Screen name="trail/[id]" />
                        <Stack.Screen name="edit-profile" />
                        <Stack.Screen name="my-dashboard" />
                        <Stack.Screen name="preferences" />
                    </Stack>
                    <StatusBar style={preferences.theme === 'dark' ? 'light' : 'dark'} />
                </ToastProvider>
            </GameProvider>
        </PreferencesProvider>
    );
};

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <ProtectedLayout />
            </AuthProvider>
        </SafeAreaProvider>
    );
}
