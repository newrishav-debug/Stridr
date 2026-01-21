/**
 * File: src/config/firebase.ts
 * Purpose: Firebase configuration and initialization
 * Created: 2026-01-14
 * Author: AI Assistant
 */
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyBLC81hxiAJ5Jyan8An3kse3jRyMIySqgQ",
    authDomain: "stridr-4d854.firebaseapp.com",
    projectId: "stridr-4d854",
    storageBucket: "stridr-4d854.firebasestorage.app",
    messagingSenderId: "75802515342",
    appId: "1:75802515342:web:2df7354e88776c7972f6df"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence for React Native
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore
export const db = getFirestore(app);

export default app;
