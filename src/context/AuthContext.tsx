/**
 * File: src/context/AuthContext.tsx
 * Purpose: Manages user authentication state and session.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Documentation added.
 * 2024-01-13: Removed Google and Facebook OAuth (to be added with development build later).
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    email: string;
    profileImage?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    register: (firstName: string, lastName: string, email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const USERS_KEY = 'stridr_users_db';
const SESSION_KEY = 'stridr_current_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const session = await AsyncStorage.getItem(SESSION_KEY);
            if (session) {
                setUser(JSON.parse(session));
            }
        } catch (e) {
            console.error('Session check failed', e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, pass: string) => {
        // 1. Get all users
        const json = await AsyncStorage.getItem(USERS_KEY);
        const users = json ? JSON.parse(json) : [];

        // 2. Find match
        const match = users.find((u: any) => u.email === email && u.pass === pass);

        if (match) {
            const userObj = { id: match.id, name: match.name, email: match.email, profileImage: match.profileImage };
            setUser(userObj);
            await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(userObj));
        } else {
            throw new Error('Invalid email or password');
        }
    };

    const register = async (firstName: string, lastName: string, email: string, pass: string) => {
        const json = await AsyncStorage.getItem(USERS_KEY);
        const users = json ? JSON.parse(json) : [];

        if (users.find((u: any) => u.email === email)) {
            throw new Error('User already exists with this email');
        }

        const newUser = {
            id: Date.now().toString(),
            name: `${firstName} ${lastName}`,
            firstName,
            lastName,
            email,
            pass,
        };

        users.push(newUser);
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));

        // Auto login
        await login(email, pass);
    };

    const logout = async () => {
        setUser(null);
        await AsyncStorage.removeItem(SESSION_KEY);
    };

    const updateProfile = async (data: Partial<User>) => {
        if (!user) return;

        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));

        // Update in DB
        const json = await AsyncStorage.getItem(USERS_KEY);
        if (json) {
            const users = JSON.parse(json);
            const index = users.findIndex((u: any) => u.id === user.id);
            if (index !== -1) {
                users[index] = { ...users[index], ...data };
                await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
            }
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            login,
            register,
            logout,
            updateProfile,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
