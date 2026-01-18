/**
 * File: src/context/SubscriptionContext.tsx
 * Purpose: Manages user subscription state using RevenueCat.
 * Created: 2026-01-16
 * Author: AI Assistant
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import Purchases, { PurchasesPackage, CustomerInfo, LOG_LEVEL } from 'react-native-purchases';
import { logger } from '../services/LogService';

// --- CONFIGURATION ---
// TODO: Replace with your actual RevenueCat API Keys
const API_KEYS = {
    apple: 'appl_REPLACE_WITH_YOUR_KEY',
    google: 'goog_REPLACE_WITH_YOUR_KEY'
};

// ============================================
// BETA TESTING FLAG
// Set to false before production release!
// ============================================
const IS_BETA = true;

// Dynamically detect if running in Expo Go (where native modules don't work)
// In Expo Go: appOwnership === 'expo'
// In standalone/dev builds: appOwnership === 'standalone' or null
const IS_EXPO_GO = Constants.appOwnership === 'expo';

// Use mock subscriptions in Expo Go OR during beta testing
// This allows beta testers to access premium features without real charges
const USE_MOCK_SUBSCRIPTIONS = IS_EXPO_GO || IS_BETA;

interface SubscriptionContextType {
    isPro: boolean;
    isLoading: boolean;
    packages: PurchasesPackage[];
    purchase: (pack: PurchasesPackage) => Promise<void>;
    restore: () => Promise<void>;
    mockPurchase: () => void; // For testing only
    togglePro: () => void; // For debug menu
}

const SubscriptionContext = createContext<SubscriptionContextType>({} as SubscriptionContextType);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isPro, setIsPro] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [packages, setPackages] = useState<PurchasesPackage[]>([]);

    useEffect(() => {
        const init = async () => {
            // If we are in "Mock Mode" (Expo Go or Beta testing), skip native RevenueCat init
            if (USE_MOCK_SUBSCRIPTIONS) {
                logger.info('Subscription: Running in MOCK MODE (Expo Go or Beta Testing)');
                // Simulate fetching packages
                setIsLoading(false);
                return;
            }

            try {
                if (Platform.OS === 'ios') {
                    Purchases.configure({ apiKey: API_KEYS.apple });
                } else if (Platform.OS === 'android') {
                    Purchases.configure({ apiKey: API_KEYS.google });
                }

                Purchases.setLogLevel(LOG_LEVEL.DEBUG);

                // Check initial Pro status
                const customerInfo = await Purchases.getCustomerInfo();
                checkEntitlements(customerInfo);

                // Load offerings
                const offerings = await Purchases.getOfferings();
                if (offerings.current && offerings.current.availablePackages.length !== 0) {
                    setPackages(offerings.current.availablePackages);
                }
            } catch (e) {
                logger.error('Subscription Init Error', e);
            } finally {
                setIsLoading(false);
            }
        };

        const checkEntitlements = (customerInfo: CustomerInfo) => {
            if (customerInfo.entitlements.active['pro_access']) {
                setIsPro(true);
            } else {
                setIsPro(false);
            }
        };

        init();
    }, []);

    const purchase = async (pack: PurchasesPackage) => {
        try {
            const { customerInfo } = await Purchases.purchasePackage(pack);
            if (customerInfo.entitlements.active['pro_access']) {
                setIsPro(true);
            }
        } catch (e: any) {
            if (!e.userCancelled) {
                logger.error('Purchase Error', e);
                throw e;
            }
        }
    };

    const restore = async () => {
        try {
            const customerInfo = await Purchases.restorePurchases();
            if (customerInfo.entitlements.active['pro_access']) {
                setIsPro(true);
            } else {
                // throw new Error('No active subscription found to restore.');
                logger.info('Restore completed, no active subscription.');
            }
        } catch (e) {
            logger.error('Restore Error', e);
            throw e;
        }
    };

    const mockPurchase = () => {
        logger.info('Subscription: MOCK PURCHASE SUCCESSFUL');
        setIsPro(true);
    };

    const togglePro = () => {
        const newValue = !isPro;
        logger.info(`Subscription: DEBUG TOGGLE - isPro now ${newValue}`);
        setIsPro(newValue);
    };

    return (
        <SubscriptionContext.Provider value={{
            isPro,
            isLoading,
            packages,
            purchase,
            restore,
            mockPurchase,
            togglePro
        }}>
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscription = () => useContext(SubscriptionContext);
