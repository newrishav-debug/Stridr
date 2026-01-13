/**
 * File: src/context/AuthContext.tsx
 * Purpose: Manages user authentication state and session including social login.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Documentation added.
 * 2024-01-12: Added Google and Facebook OAuth sign-in support.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { makeRedirectUri } from 'expo-auth-session';

// Enable web browser redirect handling
WebBrowser.maybeCompleteAuthSession();

interface User {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    email: string;
    profileImage?: string;
    provider?: 'email' | 'google' | 'facebook';
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    register: (firstName: string, lastName: string, email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    loginWithFacebook: () => Promise<void>;
    googlePromptAsync: (() => Promise<any>) | null;
    facebookPromptAsync: (() => Promise<any>) | null;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const USERS_KEY = 'stridr_users_db';
const SESSION_KEY = 'stridr_current_session';

// OAuth Client IDs
const GOOGLE_CLIENT_ID = '697965281026-1m613lmhaa7u75c6o7ls442so3bp7q6r.apps.googleusercontent.com';
const FACEBOOK_APP_ID = '1232968842067986';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Configure Google OAuth
    const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        redirectUri: makeRedirectUri({
            scheme: 'stridr',
            path: 'auth'
        }),
    });

    // Configure Facebook OAuth
    const [facebookRequest, facebookResponse, facebookPromptAsync] = Facebook.useAuthRequest({
        clientId: FACEBOOK_APP_ID,
        redirectUri: makeRedirectUri({
            scheme: 'stridr',
            path: 'auth'
        }),
    });

    useEffect(() => {
        checkSession();
    }, []);

    // Handle Google OAuth response
    useEffect(() => {
        if (googleResponse?.type === 'success') {
            const { authentication } = googleResponse;
            if (authentication?.accessToken) {
                handleGoogleToken(authentication.accessToken);
            }
        }
    }, [googleResponse]);

    // Handle Facebook OAuth response
    useEffect(() => {
        if (facebookResponse?.type === 'success') {
            const { authentication } = facebookResponse;
            if (authentication?.accessToken) {
                handleFacebookToken(authentication.accessToken);
            }
        }
    }, [facebookResponse]);

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

    const handleGoogleToken = async (accessToken: string) => {
        try {
            // Fetch user info from Google
            const response = await fetch('https://www.googleapis.com/userinfo/v2/me', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const googleUser = await response.json();

            await loginOrCreateSocialUser({
                id: `google_${googleUser.id}`,
                name: googleUser.name || googleUser.email?.split('@')[0] || 'User',
                email: googleUser.email,
                profileImage: googleUser.picture,
                provider: 'google',
            });
        } catch (error) {
            console.error('Google login error:', error);
            throw new Error('Failed to sign in with Google');
        }
    };

    const handleFacebookToken = async (accessToken: string) => {
        try {
            // Fetch user info from Facebook
            const response = await fetch(
                `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`
            );
            const fbUser = await response.json();

            await loginOrCreateSocialUser({
                id: `facebook_${fbUser.id}`,
                name: fbUser.name || 'User',
                email: fbUser.email || `${fbUser.id}@facebook.com`,
                profileImage: fbUser.picture?.data?.url,
                provider: 'facebook',
            });
        } catch (error) {
            console.error('Facebook login error:', error);
            throw new Error('Failed to sign in with Facebook');
        }
    };

    const loginOrCreateSocialUser = async (socialUser: User) => {
        // Get existing users
        const json = await AsyncStorage.getItem(USERS_KEY);
        const users = json ? JSON.parse(json) : [];

        // Check if user already exists (by email or provider ID)
        let existingUserIndex = users.findIndex(
            (u: any) => u.email === socialUser.email || u.id === socialUser.id
        );

        if (existingUserIndex >= 0) {
            // Update existing user with new info
            users[existingUserIndex] = {
                ...users[existingUserIndex],
                ...socialUser,
                profileImage: socialUser.profileImage || users[existingUserIndex].profileImage,
            };
        } else {
            // Create new user
            users.push(socialUser);
        }

        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));

        // Set session
        const userObj = {
            id: socialUser.id,
            name: socialUser.name,
            email: socialUser.email,
            profileImage: socialUser.profileImage,
            provider: socialUser.provider,
        };
        setUser(userObj);
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(userObj));
    };

    const login = async (email: string, pass: string) => {
        // 1. Get all users
        const json = await AsyncStorage.getItem(USERS_KEY);
        const users = json ? JSON.parse(json) : [];

        // 2. Find match
        const match = users.find((u: any) => u.email === email && u.pass === pass);

        if (match) {
            const userObj = { id: match.id, name: match.name, email: match.email, profileImage: match.profileImage, provider: 'email' as const };
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
            provider: 'email',
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

    const loginWithGoogle = async () => {
        if (googlePromptAsync) {
            await googlePromptAsync();
        }
    };

    const loginWithFacebook = async () => {
        if (facebookPromptAsync) {
            await facebookPromptAsync();
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
            loginWithGoogle,
            loginWithFacebook,
            googlePromptAsync,
            facebookPromptAsync,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
