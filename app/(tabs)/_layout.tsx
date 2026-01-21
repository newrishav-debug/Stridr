/**
 * File: app/(tabs)/_layout.tsx
 * Purpose: Tab navigator layout for the main application screens.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Documentation added.
 */
import { Tabs } from 'expo-router';
import { TrendingUp, Map, Trophy, CircleUser, Home } from 'lucide-react-native';
import { useTheme } from '../../src/context/PreferencesContext';

export default function TabLayout() {
    const theme = useTheme();

    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: '#2563EB',
            tabBarInactiveTintColor: theme.textTertiary,
            tabBarStyle: {
                backgroundColor: theme.card,
                borderTopColor: theme.border,
            },
            headerShown: false,
        }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <Home size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="trails"
                options={{
                    title: 'Trails',
                    tabBarIcon: ({ color }) => <Map size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="progress"
                options={{
                    title: 'Progress',
                    tabBarIcon: ({ color }) => <TrendingUp size={24} color={color} />,
                }}
            />

            <Tabs.Screen
                name="achievements"
                options={{
                    title: 'Badges',
                    tabBarIcon: ({ color }) => <Trophy size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color }) => <CircleUser size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
