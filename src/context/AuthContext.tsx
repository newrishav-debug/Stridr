/**
 * File: src/context/AuthContext.tsx
 * Purpose: Manages user authentication state and session with Firebase.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Documentation added.
 * 2024-01-13: Removed Google and Facebook OAuth (to be added with development build later).
 * 2026-01-14: Migrated to Firebase Authentication and Firestore.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendEmailVerification,
    sendPasswordResetEmail,
    User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

interface User {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    email: string;
    profileImage?: string;
    createdAt?: string; // ISO date string of account creation
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    register: (firstName: string, lastName: string, email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    resetPassword: () => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Listen to Firebase auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                // User is signed in, fetch profile from Firestore
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUser({
                            id: firebaseUser.uid,
                            email: firebaseUser.email || '',
                            name: userData.name || '',
                            firstName: userData.firstName,
                            lastName: userData.lastName,
                            profileImage: userData.profileImage,
                            createdAt: userData.createdAt
                        });
                    } else {
                        // User doc doesn't exist, sign out
                        await signOut(auth);
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setUser(null);
                }
            } else {
                // User is signed out
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, pass: string) => {
        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email.toLowerCase(),
                pass
            );
            // User state will be updated by onAuthStateChanged listener
        } catch (error: any) {
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
                throw new Error('Invalid email or password');
            }
            throw error;
        }
    };

    const register = async (firstName: string, lastName: string, email: string, pass: string) => {
        try {
            // Create Firebase auth user
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email.toLowerCase(),
                pass
            );
            const userId = userCredential.user.uid;

            // Send verification email
            try {
                await sendEmailVerification(userCredential.user);
            } catch (emailError) {
                console.warn('Failed to send verification email:', emailError);
                // Continue with registration even if email fails
            }

            // Create user profile in Firestore
            await setDoc(doc(db, 'users', userId), {
                firstName,
                lastName,
                name: `${firstName} ${lastName}`,
                email: email.toLowerCase(),
                createdAt: new Date().toISOString()
            });

            // User state will be updated by onAuthStateChanged listener
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                throw new Error('User already exists with this email');
            }
            throw error;
        }
    };

    const logout = async () => {
        await signOut(auth);
        // User state will be updated by onAuthStateChanged listener
    };

    const updateProfile = async (data: Partial<User>) => {
        if (!user) return;

        try {
            // Update local state
            const updatedUser = { ...user, ...data };
            setUser(updatedUser);

            // Update Firestore
            await updateDoc(doc(db, 'users', user.id), {
                ...data,
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    };

    const resetPassword = async () => {
        if (!user?.email) throw new Error('No email found');
        await sendPasswordResetEmail(auth, user.email);
    };

    const forgotPassword = async (email: string) => {
        await sendPasswordResetEmail(auth, email);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            login,
            register,
            logout,
            updateProfile,
            resetPassword,
            forgotPassword,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
