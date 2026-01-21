import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSubscription } from '../src/context/SubscriptionContext';
import { Check, ShieldCheck, Zap, Map, Award, BarChart3, Bell, Download, Target } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaywallScreen() {
    const { purchase, packages, isLoading, isPro, restore, mockPurchase } = useSubscription();
    const router = useRouter();

    const handlePurchase = async () => {
        // In real app, we would select the monthly package from 'packages'
        // For now/mock mode, we just trigger success
        try {
            await mockPurchase();
            Alert.alert('Success', 'Welcome to Pro! Your trial has started.');
            router.replace('/(tabs)');
        } catch (e: any) {
            Alert.alert('Error', e.message);
        }
    };

    const handleRestore = async () => {
        try {
            await restore();
            if (isPro) {
                Alert.alert('Restored', 'Your purchases have been restored.');
                router.replace('/(tabs)');
            } else {
                Alert.alert('No Subscription', 'We could not find an active subscription to restore.');
            }
        } catch (e: any) {
            // In mock mode restore might do nothing or error
            Alert.alert('Info', 'Restore functionality disabled in preview.');
        }
    };

    const features = [
        { icon: Map, text: 'Unlock All 24 Global Trails' },
        { icon: Award, text: 'Earn & Collect Badges' },
        { icon: BarChart3, text: 'Detailed Analytics Dashboard' },
        { icon: Bell, text: 'Custom Notification Preferences' },
        { icon: Download, text: 'Export Your Walking Data' },
        { icon: Target, text: 'Set Custom Daily Goals' },
    ];

    return (
        <View style={styles.container}>
            {/* Background Image Placeholder - Generate a real one if needed */}
            <Image
                source={{ uri: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=2070' }}
                style={styles.backgroundImage}
            />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)', '#000000']}
                style={styles.gradient}
            />

            <SafeAreaView style={styles.content}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.appName}>STRIDR <Text style={styles.proBadge}>PRO</Text></Text>
                        <Text style={styles.title}>Elevate Your Walk.</Text>
                        <Text style={styles.subtitle}>Get full access to all features and take your fitness journey to the next level.</Text>
                    </View>

                    <View style={styles.featuresContainer}>
                        {features.map((feature, index) => (
                            <View key={index} style={styles.featureRow}>
                                <View style={styles.iconContainer}>
                                    <feature.icon size={24} color="#FFD700" />
                                </View>
                                <Text style={styles.featureText}>{feature.text}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={styles.pricingContainer}>
                        <Text style={styles.priceText}>$4.99/month</Text>
                        <Text style={styles.cancelText}>Cancel anytime. No commitment.</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.subscribeButton}
                        onPress={handlePurchase}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={['#FFD700', '#FFA500']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.buttonGradient}
                        >
                            <Text style={styles.subscribeButtonText}>Upgrade to Premium</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleRestore} style={styles.restoreButton}>
                        <Text style={styles.restoreText}>Restore Purchases</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.back()} style={styles.skipButton}>
                        <Text style={styles.skipText}>Continue with Free Version</Text>
                    </TouchableOpacity>

                    <Text style={styles.legalText}>
                        By subscribing, you agree to our Terms of Service and Privacy Policy. Subscription automatically renews unless auto-renew is turned off at least 24-hours before the end of the current period.
                    </Text>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.6,
        resizeMode: 'cover',
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        minHeight: '100%',
        justifyContent: 'flex-end',
    },
    header: {
        marginBottom: 32,
    },
    appName: {
        fontSize: 14,
        fontWeight: '900',
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 2,
        marginBottom: 12,
        alignSelf: 'center',
    },
    proBadge: {
        color: '#FFD700',
    },
    title: {
        fontSize: 42,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 48,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        lineHeight: 24,
    },
    featuresContainer: {
        marginBottom: 40,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    iconContainer: {
        marginRight: 16,
        padding: 8,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderRadius: 12,
    },
    featureText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    pricingContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    freeTrialText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFD700',
        marginBottom: 4,
    },
    priceText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 2,
    },
    cancelText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
    },
    subscribeButton: {
        width: '100%',
        height: 56,
        borderRadius: 28,
        overflow: 'hidden',
        marginBottom: 16,
        shadowColor: '#FFD700',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    buttonGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    subscribeButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
    },
    restoreButton: {
        padding: 12,
        alignSelf: 'center',
        marginBottom: 24,
    },
    restoreText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '500',
    },
    legalText: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.3)',
        textAlign: 'center',
        lineHeight: 14,
    },
    skipButton: {
        padding: 12,
        alignSelf: 'center',
        marginBottom: 20,
    },
    skipText: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600',
        textDecorationLine: 'underline',
    },
});
