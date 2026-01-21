/**
 * File: app/legal.tsx
 * Purpose: Displays Privacy Policy and Terms of Service in-app.
 * Created: 2026-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2026-01-12: Initial creation with tabbed legal document view.
 * 2026-01-12: Fixed dark mode support and text rendering issues.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../src/context/PreferencesContext';
import { ArrowLeft, Shield, FileText } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabType = 'privacy' | 'terms';

export default function LegalScreen() {
    const router = useRouter();
    const theme = useTheme();
    const params = useLocalSearchParams<{ tab?: string }>();
    const [activeTab, setActiveTab] = useState<TabType>((params.tab as TabType) || 'privacy');

    useEffect(() => {
        if (params.tab === 'privacy' || params.tab === 'terms') {
            setActiveTab(params.tab);
        }
    }, [params.tab]);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.card }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Legal</Text>
                <View style={styles.placeholder} />
            </View>

            {/* Tabs */}
            <View style={[styles.tabContainer, { backgroundColor: theme.card }]}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'privacy' && styles.activeTab,
                        activeTab === 'privacy' && { borderBottomColor: '#3B82F6' }
                    ]}
                    onPress={() => setActiveTab('privacy')}
                >
                    <Shield size={18} color={activeTab === 'privacy' ? '#3B82F6' : theme.textSecondary} />
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'privacy' ? '#3B82F6' : theme.textSecondary }
                    ]}>
                        Privacy Policy
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === 'terms' && styles.activeTab,
                        activeTab === 'terms' && { borderBottomColor: '#3B82F6' }
                    ]}
                    onPress={() => setActiveTab('terms')}
                >
                    <FileText size={18} color={activeTab === 'terms' ? '#3B82F6' : theme.textSecondary} />
                    <Text style={[
                        styles.tabText,
                        { color: activeTab === 'terms' ? '#3B82F6' : theme.textSecondary }
                    ]}>
                        Terms of Service
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {activeTab === 'privacy' ? <PrivacyPolicyContent theme={theme} /> : <TermsOfServiceContent theme={theme} />}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

// Privacy Policy Content Component
function PrivacyPolicyContent({ theme }: { theme: any }) {
    return (
        <View style={styles.documentContainer}>
            <Text style={[styles.lastUpdated, { color: theme.textSecondary }]}>Last Updated: January 12, 2026</Text>

            <Section title="Introduction" theme={theme}>
                Welcome to Stridr. We are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application.
            </Section>

            <Section title="Information We Collect" theme={theme}>
                <BulletPoint theme={theme} title="Personal Information">
                    Name, email address, profile photo (optional), and password for account creation.
                </BulletPoint>
                <BulletPoint theme={theme} title="Health & Fitness Data">
                    Step count and walking activity from your device's pedometer sensor (with permission).
                </BulletPoint>
                <BulletPoint theme={theme} title="Usage Data">
                    Trail progress, achievements, badges, daily logs, and streak information.
                </BulletPoint>
                <BulletPoint theme={theme} title="Preferences">
                    Distance units, daily goals, notification settings, and stride length.
                </BulletPoint>
            </Section>

            <Section title="How We Use Your Information" theme={theme}>
                We use your information to:{'\n'}
                • Track your steps and simulate walking famous trails{'\n'}
                • Calculate distance covered and award achievements{'\n'}
                • Personalize your experience and save preferences{'\n'}
                • Send notifications (reminders, achievements, milestones)
            </Section>

            <Section title="Data Storage" theme={theme}>
                <HighlightBox theme={theme}>
                    All your data is stored locally on your device. We do NOT upload data to external servers, share with third parties, or use for advertising.
                </HighlightBox>
            </Section>

            <Section title="Third-Party Authentication" theme={theme}>
                If you sign in with Google or Facebook, we only receive basic profile information (name, email, photo). We do not access your contacts, posts, or other social data.
            </Section>

            <Section title="Your Rights" theme={theme}>
                You can:{'\n'}
                • View all your stored data within the app{'\n'}
                • Edit your profile and preferences anytime{'\n'}
                • Delete your account and all data{'\n'}
                • Control notification settings
            </Section>

            <Section title="Permissions We Request" theme={theme}>
                <BulletPoint theme={theme} title="Motion & Fitness">To access step count data</BulletPoint>
                <BulletPoint theme={theme} title="Notifications">To send reminders and achievements</BulletPoint>
                <BulletPoint theme={theme} title="Camera/Photos">Optional, for profile photo only</BulletPoint>
            </Section>

            <Section title="Children's Privacy" theme={theme}>
                Stridr is designed for general audiences. We do not knowingly collect personal information from children under 13.
            </Section>

            <Section title="Contact Us" theme={theme}>
                For questions about this Privacy Policy, please contact us at:{'\n\n'}
                Email: quietvibesai@gmail.com
            </Section>
        </View>
    );
}

// Terms of Service Content Component
function TermsOfServiceContent({ theme }: { theme: any }) {
    return (
        <View style={styles.documentContainer}>
            <Text style={[styles.lastUpdated, { color: theme.textSecondary }]}>Last Updated: January 12, 2026</Text>

            <Section title="Agreement to Terms" theme={theme}>
                By downloading, installing, or using Stridr, you agree to be bound by these Terms of Service. If you do not agree, please do not use the App.
            </Section>

            <Section title="Description of Service" theme={theme}>
                Stridr is a step-tracking fitness application that:{'\n'}
                • Tracks your daily steps using your device's pedometer{'\n'}
                • Simulates walking famous trails around the world{'\n'}
                • Awards badges and achievements for milestones{'\n'}
                • Provides progress tracking and activity statistics
            </Section>

            <Section title="User Accounts" theme={theme}>
                <BulletPoint theme={theme} title="Account Creation">
                    You may create an account using email/password or social login.
                </BulletPoint>
                <BulletPoint theme={theme} title="Responsibility">
                    You are responsible for maintaining account confidentiality and all activities under your account.
                </BulletPoint>
                <BulletPoint theme={theme} title="Age Requirement">
                    You must be at least 13 years old to use this App.
                </BulletPoint>
            </Section>

            <Section title="Health Disclaimer" theme={theme}>
                <HighlightBox theme={theme} type="warning">
                    Stridr is for general fitness tracking only. It does NOT provide medical advice. Step counts are estimates. Consult a healthcare professional before starting any fitness program.
                </HighlightBox>
            </Section>

            <Section title="Acceptable Use" theme={theme}>
                You agree NOT to:{'\n'}
                • Use the App for illegal purposes{'\n'}
                • Attempt unauthorized access{'\n'}
                • Interfere with App functionality{'\n'}
                • Reverse engineer the App{'\n'}
                • Misrepresent your identity
            </Section>

            <Section title="Intellectual Property" theme={theme}>
                All App content, design, trail descriptions, and features are owned by us. You may not copy, modify, or distribute our content without permission.
            </Section>

            <Section title="Disclaimers" theme={theme}>
                THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We do not guarantee uninterrupted service, accuracy of step counts, or compatibility with all devices.
            </Section>

            <Section title="Limitation of Liability" theme={theme}>
                To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages. We are not responsible for data loss due to device failure.
            </Section>

            <Section title="Changes to Terms" theme={theme}>
                We may modify these Terms at any time. Changes will be posted within the App. Continued use constitutes acceptance.
            </Section>

            <Section title="Contact Information" theme={theme}>
                For questions about these Terms:{'\n\n'}
                Email: quietvibesai@gmail.com
            </Section>
        </View>
    );
}

// Reusable Section Component
function Section({ title, children, theme }: { title: string; children: React.ReactNode; theme: any }) {
    // Check if children contains React elements (like HighlightBox or BulletPoint)
    const childArray = React.Children.toArray(children);
    const hasReactElements = childArray.some(child =>
        React.isValidElement(child) &&
        (child.type === HighlightBox || child.type === BulletPoint)
    );

    return (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
            {hasReactElements ? (
                <View style={styles.sectionContentContainer}>{children}</View>
            ) : (
                <Text style={[styles.sectionContent, { color: theme.textSecondary }]}>{children}</Text>
            )}
        </View>
    );
}

// Reusable Bullet Point Component
function BulletPoint({ title, children, theme }: { title: string; children: React.ReactNode; theme: any }) {
    return (
        <View style={styles.bulletPoint}>
            <Text style={[styles.bulletTitle, { color: theme.text }]}>• {title}</Text>
            <Text style={[styles.bulletContent, { color: theme.textSecondary }]}>{children}</Text>
        </View>
    );
}

// Highlight Box Component with Dark Mode Support
function HighlightBox({ children, theme, type = 'info' }: { children: React.ReactNode; theme: any; type?: 'info' | 'warning' }) {
    // Determine if dark mode based on theme background
    const isDark = theme.background === '#111827' || theme.background === '#1F2937' || theme.text === '#F9FAFB';

    // Colors for light and dark mode
    const colors = {
        info: {
            light: { bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF' },
            dark: { bg: '#1E3A5F', border: '#60A5FA', text: '#BFDBFE' }
        },
        warning: {
            light: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' },
            dark: { bg: '#4D3A1A', border: '#FBBF24', text: '#FDE68A' }
        }
    };

    const colorSet = isDark ? colors[type].dark : colors[type].light;

    return (
        <View style={[
            styles.highlightBox,
            {
                backgroundColor: colorSet.bg,
                borderLeftColor: colorSet.border
            }
        ]}>
            <Text style={[styles.highlightText, { color: colorSet.text }]}>{children}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 16,
        paddingHorizontal: 20,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    placeholder: {
        width: 40,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomWidth: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    documentContainer: {
        paddingTop: 20,
    },
    lastUpdated: {
        fontSize: 13,
        fontStyle: 'italic',
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    sectionContent: {
        fontSize: 15,
        lineHeight: 24,
    },
    sectionContentContainer: {
        marginTop: 4,
    },
    bulletPoint: {
        marginBottom: 12,
    },
    bulletTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    bulletContent: {
        fontSize: 14,
        lineHeight: 22,
        marginLeft: 16,
    },
    highlightBox: {
        borderLeftWidth: 4,
        padding: 16,
        borderRadius: 8,
        marginTop: 8,
    },
    highlightText: {
        fontSize: 14,
        lineHeight: 22,
    },
});
