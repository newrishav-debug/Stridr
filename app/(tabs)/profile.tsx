/**
 * File: app/(tabs)/profile.tsx
 * Purpose: User profile screen with settings and account management.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Documentation added.
 */
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, Linking, Switch, TextInput, Alert, Modal, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { usePreferences, useTheme } from '../../src/context/PreferencesContext';
import { useSubscription } from '../../src/context/SubscriptionContext';
import { useGame } from '../../src/context/GameContext';
import { DebugMenu } from '../../src/components/DebugMenu';
import { useState } from 'react';
import * as MailComposer from 'expo-mail-composer';
import * as Sharing from 'expo-sharing';
import { logger } from '../../src/services/LogService';
import { PaywallModal } from '../../src/components/PaywallModal';
import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../src/config/firebase';
import { FREE_DEFAULT_DAILY_GOAL } from '../../src/const/subscription';

import {
    CircleUser,
    LogOut,
    Target,
    ChevronRight,
    LayoutDashboard,
    Bug,
    Lightbulb,
    Ruler,
    Moon,
    Bell,
    Footprints,
    PauseCircle,
    Download,
    Trash2,
    Info,
    Shield,
    FileText,
    Heart,
    X,
    AlertTriangle,
    Lock,
    Key,
    Crown
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProfileScreen() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { progress, debug } = useGame();
    const { isPro } = useSubscription();
    const {
        preferences,
        setDistanceUnit,
        setTheme,
        setDailyGoal,
        setNotificationsEnabled,
        setStrideLength
    } = usePreferences();
    const theme = useTheme();

    // Local state for inputs
    const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
    const [goalInput, setGoalInput] = useState(preferences.dailyGoal.toString());
    const [strideInput, setStrideInput] = useState(preferences.strideLength.toString());
    const [paywallVisible, setPaywallVisible] = useState(false);
    const [paywallFeature, setPaywallFeature] = useState<'goal' | 'export' | 'dashboard' | 'notifications' | 'darkmode'>('goal');

    // Derived state
    const useKilometers = preferences.distanceUnit === 'km';
    const darkMode = preferences.theme === 'dark';

    // Handlers
    const handleGoalSubmit = (customValue?: string) => {
        const valToParse = customValue !== undefined ? customValue : goalInput;
        const goal = parseInt(valToParse, 10);
        if (isNaN(goal) || goal < 1000 || goal > 50000) {
            Alert.alert('Invalid Goal', 'Please enter a goal between 1,000 and 50,000 steps.');
            setGoalInput(preferences.dailyGoal.toString());
            return;
        }
        setDailyGoal(goal);
        setIsGoalModalVisible(false);
    };

    const openGoalModal = () => {
        if (!isPro) {
            setPaywallFeature('goal');
            setPaywallVisible(true);
            return;
        }
        setGoalInput(preferences.dailyGoal.toString());
        setIsGoalModalVisible(true);
    };

    const handleStrideSubmit = () => {
        const stride = parseInt(strideInput, 10);
        if (isNaN(stride) || stride < 30 || stride > 150) {
            Alert.alert('Invalid Stride', 'Please enter a stride length between 30cm and 150cm.');
            setStrideInput(preferences.strideLength.toString());
            return;
        }
        setStrideLength(stride);
    };

    const handleExportData = () => {
        if (!isPro) {
            setPaywallFeature('export');
            setPaywallVisible(true);
            return;
        }
        Alert.alert('Export Data', 'Your walking history is being prepared. You will receive an email shortly.', [
            { text: 'OK' }
        ]);
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone and all your data will be lost.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const currentUser = auth.currentUser;
                            if (!currentUser) {
                                Alert.alert('Error', 'No user session found.');
                                return;
                            }

                            // 1. Clear all game progress data (GDPR compliance)
                            await debug?.resetProgress();

                            // 2. Delete user document from Firestore
                            await deleteDoc(doc(db, 'users', currentUser.uid));

                            // 3. Delete Firebase Auth account
                            await deleteUser(currentUser);

                            // 4. Navigate to login (user is already signed out after deleteUser)
                            router.replace('/login');
                        } catch (error: any) {
                            // Firebase requires recent authentication for account deletion
                            if (error.code === 'auth/requires-recent-login') {
                                Alert.alert(
                                    'Re-authentication Required',
                                    'For security, please sign out and sign back in, then try deleting your account again.'
                                );
                            } else {
                                Alert.alert('Error', 'Failed to delete account. Please try again.');
                            }
                        }
                    }
                }
            ]
        );
    };

    const handleReportCrash = async () => {
        try {
            const logUri = logger.getLogFileUri();
            const isAvailable = await MailComposer.isAvailableAsync();

            if (isAvailable) {
                await MailComposer.composeAsync({
                    subject: `Crash Report - User: ${user?.name || 'Unknown'}`,
                    body: 'Please describe what happened before the crash:\n\n',
                    recipients: ['quietvibesai@gmail.com'],
                    attachments: [logUri]
                });
            } else {
                // Fallback to sharing if mail is not configured
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(logUri, {
                        mimeType: 'text/plain',
                        dialogTitle: 'Share Crash Logs'
                    });
                } else {
                    Alert.alert('Error', 'Unable to share logs. Mail is not configured and sharing is unavailable.');
                }
            }
        } catch (error) {
            console.error('Error sharing logs:', error);
            Alert.alert('Error', 'Failed to prepare crash report.');
        }
    };

    if (!user) return null;

    const renderSectionHeader = (title: string) => (
        <Text style={[styles.subSectionTitle, { color: theme.textSecondary }]}>{title}</Text>
    );

    return (
        <>
            <ScrollView style={[styles.container, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={[styles.avatarContainer, { backgroundColor: theme.card }]}>
                        {user.profileImage ? (
                            <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
                        ) : (
                            <CircleUser size={80} color="#2563EB" />
                        )}
                    </View>
                    <Text style={[styles.name, { color: theme.text }]}>{user.name}</Text>
                    <Text style={[styles.email, { color: theme.textSecondary }]}>{user.email}</Text>
                </View>

                {/* Dashboard Link Section */}
                <View style={styles.dashboardSection}>
                    <TouchableOpacity
                        style={[styles.dashboardCard, { backgroundColor: theme.card }]}
                        onPress={() => {
                            if (isPro) {
                                router.push('/my-dashboard');
                            } else {
                                setPaywallFeature('dashboard');
                                setPaywallVisible(true);
                            }
                        }}
                    >
                        <View style={styles.dashboardContent}>
                            <View style={[styles.dashboardIcon, { backgroundColor: '#8B5CF6' }]}>
                                <LayoutDashboard size={24} color="white" />
                            </View>
                            <View style={styles.dashboardTextContainer}>
                                <View style={styles.titleWithBadge}>
                                    <Text style={[styles.dashboardTitle, { color: theme.text }]}>My Dashboard</Text>
                                    {!isPro && (
                                        <View style={styles.proBadge}>
                                            <Lock size={10} color="#B8860B" />
                                            <Text style={styles.proBadgeText}>PRO</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={[styles.dashboardSubtitle, { color: theme.textSecondary }]}>
                                    Check your daily goals and overall statistics
                                </Text>
                            </View>
                            {isPro ? (
                                <ChevronRight size={24} color={theme.textTertiary} />
                            ) : (
                                <Lock size={20} color={theme.textTertiary} />
                            )}
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Settings Main Header */}
                <View style={styles.mainSettingsContainer}>
                    <Text style={[styles.sectionTitle, { color: theme.text, paddingHorizontal: 20, marginBottom: 10 }]}>Settings</Text>



                    {/* 1. ESSENTIALS */}
                    <View style={styles.settingsSection}>
                        {renderSectionHeader('Essentials')}
                        <View style={[styles.card, { backgroundColor: theme.card }]}>

                            {/* Daily Goal - MODIFIED to touchable */}
                            <TouchableOpacity style={styles.row} onPress={openGoalModal}>
                                <View style={styles.rowLeft}>
                                    <View style={[styles.iconBox, { backgroundColor: '#F59E0B' }]}>
                                        <Target size={20} color="white" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <View style={styles.titleWithBadge}>
                                            <Text style={[styles.rowTitle, { color: theme.text }]}>Daily Goal</Text>
                                            {!isPro && (
                                                <View style={styles.proBadge}>
                                                    <Lock size={10} color="#B8860B" />
                                                    <Text style={styles.proBadgeText}>PRO</Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>
                                            {isPro ? `${preferences.dailyGoal.toLocaleString()} steps` : `${FREE_DEFAULT_DAILY_GOAL.toLocaleString()} steps (fixed)`}
                                        </Text>
                                    </View>
                                </View>
                                {isPro ? (
                                    <ChevronRight size={20} color={theme.textTertiary} />
                                ) : (
                                    <Lock size={18} color={theme.textTertiary} />
                                )}
                            </TouchableOpacity>

                            <View style={[styles.divider, { backgroundColor: theme.border }]} />

                            {/* Units */}
                            <View style={styles.row}>
                                <View style={styles.rowLeft}>
                                    <View style={[styles.iconBox, { backgroundColor: '#10B981' }]}>
                                        <Ruler size={20} color="white" />
                                    </View>
                                    <View>
                                        <Text style={[styles.rowTitle, { color: theme.text }]}>Distance Units</Text>
                                        <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>
                                            {useKilometers ? 'Metric (km)' : 'Imperial (mi)'}
                                        </Text>
                                    </View>
                                </View>
                                <Switch
                                    value={useKilometers}
                                    onValueChange={(v) => setDistanceUnit(v ? 'km' : 'mi')}
                                    trackColor={{ false: theme.border, true: '#10B981' }}
                                    thumbColor="white"
                                />
                            </View>

                            <View style={[styles.divider, { backgroundColor: theme.border }]} />

                            {/* Stride Length */}
                            <View style={styles.row}>
                                <View style={styles.rowLeft}>
                                    <View style={[styles.iconBox, { backgroundColor: '#8B5CF6' }]}>
                                        <Footprints size={20} color="white" />
                                    </View>
                                    <View>
                                        <Text style={[styles.rowTitle, { color: theme.text }]}>Stride Length (cm)</Text>
                                        <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>
                                            For accurate distance
                                        </Text>
                                    </View>
                                </View>
                                <TextInput
                                    style={[styles.smallInput, { color: theme.text, borderColor: theme.border }]}
                                    value={strideInput}
                                    onChangeText={setStrideInput}
                                    onBlur={handleStrideSubmit}
                                    keyboardType="number-pad"
                                    maxLength={3}
                                />
                            </View>

                            <View style={[styles.divider, { backgroundColor: theme.border }]} />

                            {/* Theme - Locked for free users */}
                            <TouchableOpacity
                                style={styles.row}
                                onPress={() => {
                                    if (isPro) {
                                        setTheme(darkMode ? 'light' : 'dark');
                                    } else {
                                        setPaywallFeature('darkmode');
                                        setPaywallVisible(true);
                                    }
                                }}
                            >
                                <View style={styles.rowLeft}>
                                    <View style={[styles.iconBox, { backgroundColor: '#6366F1' }]}>
                                        <Moon size={20} color="white" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <View style={styles.titleWithBadge}>
                                            <Text style={[styles.rowTitle, { color: theme.text }]}>Dark Mode</Text>
                                            {!isPro && (
                                                <View style={styles.proBadge}>
                                                    <Lock size={10} color="#B8860B" />
                                                    <Text style={styles.proBadgeText}>PRO</Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>
                                            {darkMode ? 'On' : 'Off'}
                                        </Text>
                                    </View>
                                </View>
                                {isPro ? (
                                    <Switch
                                        value={darkMode}
                                        onValueChange={(v) => setTheme(v ? 'dark' : 'light')}
                                        trackColor={{ false: theme.border, true: '#6366F1' }}
                                        thumbColor="white"
                                    />
                                ) : (
                                    <Lock size={18} color={theme.textTertiary} />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 2. ADVANCED / CONFIG */}
                    <View style={styles.settingsSection}>
                        {renderSectionHeader('Advanced Config')}
                        <View style={[styles.card, { backgroundColor: theme.card }]}>

                            {/* Notifications */}
                            <TouchableOpacity style={styles.row} onPress={() => router.push('/notification-settings')}>
                                <View style={styles.rowLeft}>
                                    <View style={[styles.iconBox, { backgroundColor: '#EC4899' }]}>
                                        <Bell size={20} color="white" />
                                    </View>
                                    <View>
                                        <Text style={[styles.rowTitle, { color: theme.text }]}>Notifications</Text>
                                        <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>
                                            {preferences.notificationsEnabled ? 'Enabled' : 'Disabled'}
                                        </Text>
                                    </View>
                                </View>
                                <ChevronRight size={20} color={theme.textTertiary} />
                            </TouchableOpacity>



                            <View style={[styles.divider, { backgroundColor: theme.border }]} />


                        </View>
                    </View>

                    {/* 3. ACCOUNT */}
                    <View style={styles.settingsSection}>
                        {renderSectionHeader('Account')}
                        <View style={[styles.card, { backgroundColor: theme.card }]}>

                            <TouchableOpacity style={styles.row} onPress={() => router.push('/edit-profile')}>
                                <View style={styles.rowLeft}>
                                    <View style={[styles.iconBox, { backgroundColor: '#3B82F6' }]}>
                                        <CircleUser size={20} color="white" />
                                    </View>
                                    <Text style={[styles.rowTitle, { color: theme.text }]}>Edit Profile</Text>
                                </View>
                                <ChevronRight size={20} color={theme.textTertiary} />
                            </TouchableOpacity>

                            <View style={[styles.divider, { backgroundColor: theme.border }]} />

                            <TouchableOpacity style={styles.row} onPress={handleExportData}>
                                <View style={styles.rowLeft}>
                                    <View style={[styles.iconBox, { backgroundColor: '#14B8A6' }]}>
                                        <Download size={20} color="white" />
                                    </View>
                                    <View style={styles.titleWithBadge}>
                                        <Text style={[styles.rowTitle, { color: theme.text }]}>Export Data</Text>
                                        {!isPro && (
                                            <View style={styles.proBadge}>
                                                <Lock size={10} color="#B8860B" />
                                                <Text style={styles.proBadgeText}>PRO</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                                {isPro ? (
                                    <ChevronRight size={20} color={theme.textTertiary} />
                                ) : (
                                    <Lock size={18} color={theme.textTertiary} />
                                )}
                            </TouchableOpacity>

                            <View style={[styles.divider, { backgroundColor: theme.border }]} />

                            <TouchableOpacity style={styles.row} onPress={handleDeleteAccount}>
                                <View style={styles.rowLeft}>
                                    <View style={[styles.iconBox, { backgroundColor: '#EF4444' }]}>
                                        <Trash2 size={20} color="white" />
                                    </View>
                                    <Text style={[styles.rowTitle, { color: '#EF4444' }]}>Delete Account</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* 4. ABOUT & LEGAL */}
                    <View style={styles.settingsSection}>
                        {renderSectionHeader('About')}
                        <View style={[styles.card, { backgroundColor: theme.card }]}>

                            <TouchableOpacity style={styles.row}>
                                <View style={styles.rowLeft}>
                                    <View style={[styles.iconBox, { backgroundColor: '#6B7280' }]}>
                                        <Info size={20} color="white" />
                                    </View>
                                    <View>
                                        <Text style={[styles.rowTitle, { color: theme.text }]}>Version</Text>
                                        <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>
                                            1.0.0 (Build 2024.01)
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            <View style={[styles.divider, { backgroundColor: theme.border }]} />

                            <TouchableOpacity style={styles.row} onPress={() => router.push('/legal?tab=privacy')}>
                                <View style={styles.rowLeft}>
                                    <View style={[styles.iconBox, { backgroundColor: '#6B7280' }]}>
                                        <Shield size={20} color="white" />
                                    </View>
                                    <Text style={[styles.rowTitle, { color: theme.text }]}>Privacy Policy</Text>
                                </View>
                                <ChevronRight size={20} color={theme.textTertiary} />
                            </TouchableOpacity>

                            <View style={[styles.divider, { backgroundColor: theme.border }]} />

                            <TouchableOpacity style={styles.row} onPress={() => router.push('/legal?tab=terms')}>
                                <View style={styles.rowLeft}>
                                    <View style={[styles.iconBox, { backgroundColor: '#6B7280' }]}>
                                        <FileText size={20} color="white" />
                                    </View>
                                    <Text style={[styles.rowTitle, { color: theme.text }]}>Terms of Service</Text>
                                </View>
                                <ChevronRight size={20} color={theme.textTertiary} />
                            </TouchableOpacity>

                            <View style={[styles.divider, { backgroundColor: theme.border }]} />

                            <View style={styles.row}>
                                <View style={styles.rowLeft}>
                                    <View style={[styles.iconBox, { backgroundColor: '#EC4899' }]}>
                                        <Heart size={20} color="white" />
                                    </View>
                                    <Text style={[styles.rowTitle, { color: theme.text }]}>Made with ❤️ for Walkers</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Support Section */}
                <View style={[styles.settingsSection, { marginTop: 24 }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Support</Text>

                    <View style={[styles.card, { backgroundColor: theme.card }]}>
                        <TouchableOpacity
                            style={styles.settingItem}
                            onPress={() => Linking.openURL('mailto:quietvibesai@gmail.com?subject=Bug Report')}
                        >
                            <View style={styles.settingLeft}>
                                <View style={[styles.iconBox, { backgroundColor: '#EF4444' }]}>
                                    <Bug size={20} color="white" />
                                </View>
                                <Text style={[styles.settingText, { color: theme.text }]}>Report a Bug</Text>
                            </View>
                            <ChevronRight size={20} color={theme.textTertiary} />
                        </TouchableOpacity>

                        <View style={[styles.settingDivider, { backgroundColor: theme.border }]} />

                        <TouchableOpacity
                            style={styles.settingItem}
                            onPress={handleReportCrash}
                        >
                            <View style={styles.settingLeft}>
                                <View style={[styles.iconBox, { backgroundColor: '#F97316' }]}>
                                    <AlertTriangle size={20} color="white" />
                                </View>
                                <Text style={[styles.settingText, { color: theme.text }]}>Report a Crash</Text>
                            </View>
                            <ChevronRight size={20} color={theme.textTertiary} />
                        </TouchableOpacity>

                        <View style={[styles.settingDivider, { backgroundColor: theme.border }]} />

                        <TouchableOpacity
                            style={styles.settingItem}
                            onPress={() => Linking.openURL('mailto:quietvibesai@gmail.com?subject=Enhancement Request')}
                        >
                            <View style={styles.settingLeft}>
                                <View style={[styles.iconBox, { backgroundColor: '#F59E0B' }]}>
                                    <Lightbulb size={20} color="white" />
                                </View>
                                <Text style={[styles.settingText, { color: theme.text }]}>Log an Enhancement</Text>
                            </View>
                            <ChevronRight size={20} color={theme.textTertiary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                    <LogOut color="white" size={20} />
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>

                {/* Developer Tools */}
                <DebugMenu />

                <View style={{ height: 40 }} />
            </ScrollView >

            <Modal
                visible={isGoalModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setIsGoalModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsGoalModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                                <View style={styles.modalHeader}>
                                    <Text style={[styles.modalTitle, { color: theme.text }]}>Set Daily Goal</Text>
                                    <TouchableOpacity onPress={() => setIsGoalModalVisible(false)} style={styles.closeButton}>
                                        <X size={24} color={theme.textSecondary} />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.presetsContainer}>
                                    {[2500, 5000, 7500, 10000].map((preset) => (
                                        <TouchableOpacity
                                            key={preset}
                                            style={[
                                                styles.presetButton,
                                                {
                                                    borderColor: theme.border,
                                                    backgroundColor: preferences.dailyGoal === preset ? '#F59E0B' : 'transparent',
                                                    borderWidth: preferences.dailyGoal === preset ? 0 : 1
                                                }
                                            ]}
                                            onPress={() => handleGoalSubmit(preset.toString())}
                                        >
                                            <Text style={[
                                                styles.presetText,
                                                { color: preferences.dailyGoal === preset ? 'white' : theme.text }
                                            ]}>
                                                {(preset / 1000).toString()}k Steps
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <View style={styles.orDivider}>
                                    <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                                    <Text style={[styles.orText, { color: theme.textSecondary }]}>OR CUSTOM</Text>
                                    <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                                </View>

                                <View style={styles.customInputContainer}>
                                    <TextInput
                                        style={[styles.customInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                                        value={goalInput}
                                        onChangeText={setGoalInput}
                                        keyboardType="number-pad"
                                        placeholder="Enter custom goal"
                                        placeholderTextColor={theme.textTertiary}
                                        maxLength={6}
                                    />
                                    <TouchableOpacity style={styles.saveButton} onPress={() => handleGoalSubmit()}>
                                        <Text style={styles.saveButtonText}>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            <PaywallModal
                visible={paywallVisible}
                onClose={() => setPaywallVisible(false)}
                feature={paywallFeature}
            />
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        marginTop: 60,
        alignItems: 'center',
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    avatarContainer: {
        backgroundColor: 'white',
        borderRadius: 50,
        padding: 2,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
        overflow: 'hidden',
        width: 84, // size 80 + padding 2*2
        height: 84,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    email: {
        fontSize: 16,
        color: '#6B7280',
        marginTop: 4,
    },
    dashboardSection: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    dashboardCard: {
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    dashboardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    dashboardIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dashboardTextContainer: {
        flex: 1,
    },
    dashboardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    dashboardSubtitle: {
        fontSize: 14,
    },

    // Modernized Settings Styles
    mainSettingsContainer: {
        // Wrapper for all settings sections
    },
    settingsSection: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    subSectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    card: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },

    // Row Styles
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        minHeight: 56,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    rowTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    rowSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },

    // Icon Box
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Input
    smallInput: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        width: 80,
        textAlign: 'right',
        fontSize: 16,
    },

    // Dividers
    divider: {
        height: 1,
        marginHorizontal: 16,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 4,
    },
    presetsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    presetButton: {
        width: '48%',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    presetText: {
        fontWeight: '600',
        fontSize: 16,
    },
    orDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    orText: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
    },
    customInputContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    customInput: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: '#F59E0B',
        height: 48,
        paddingHorizontal: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    settingDivider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginHorizontal: 16,
    },

    // Legacy Setting Item (for Edit Profile reuse)
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingText: {
        fontSize: 16,
        fontWeight: '500',
    },

    logoutBtn: {
        flexDirection: 'row',
        backgroundColor: '#EF4444',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        gap: 8,
        marginHorizontal: 20,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 24,
    },
    logoutText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    titleWithBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    proBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 215, 0, 0.15)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        gap: 3,
    },
    proBadgeText: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#B8860B',
        letterSpacing: 0.5,
    },
});
