/**
 * File: app/signup.tsx
 * Purpose: Signup screen for new user registration with email.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Documentation added.
 * 2026-01-12: Added scenic background image.
 * 2026-01-12: Extended registration form with firstName, lastName, confirmPassword.
 * 2026-01-13: Removed social login buttons (Google/Facebook).
 */
import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useToast } from '../src/context/ToastContext';

export default function SignupScreen() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const { register } = useAuth();
    const router = useRouter();
    const { showToast } = useToast();

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleRegister = async () => {
        try {
            // Validation
            if (!firstName.trim()) {
                return showToast('Please enter your first name', 'error');
            }
            if (!lastName.trim()) {
                return showToast('Please enter your last name', 'error');
            }
            if (!email.trim()) {
                return showToast('Please enter your email', 'error');
            }
            if (!validateEmail(email)) {
                return showToast('Please enter a valid email address', 'error');
            }
            if (!pass) {
                return showToast('Please enter a password', 'error');
            }
            if (pass.length < 6) {
                return showToast('Password must be at least 6 characters', 'error');
            }
            if (pass !== confirmPass) {
                return showToast('Passwords do not match', 'error');
            }

            await register(firstName.trim(), lastName.trim(), email.trim(), pass);
            showToast('Account created! Please check your email to verify your account.', 'success');
            router.replace('/');
        } catch (e: any) {
            showToast(e.message || 'Registration Failed', 'error');
        }
    };

    return (
        <ImageBackground
            source={require('../assets/auth_background.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                style={styles.overlay}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.container}>
                            <Text style={styles.title}>Create Account</Text>
                            <Text style={styles.subtitle}>Start your adventure today</Text>

                            <View style={styles.form}>
                                {/* Name Row */}
                                <View style={styles.nameRow}>
                                    <View style={styles.nameField}>
                                        <Text style={styles.label}>First Name</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={firstName}
                                            onChangeText={setFirstName}
                                            placeholder="John"
                                            placeholderTextColor="rgba(255,255,255,0.5)"
                                            autoCapitalize="words"
                                        />
                                    </View>
                                    <View style={styles.nameField}>
                                        <Text style={styles.label}>Last Name</Text>
                                        <TextInput
                                            style={styles.input}
                                            value={lastName}
                                            onChangeText={setLastName}
                                            placeholder="Doe"
                                            placeholderTextColor="rgba(255,255,255,0.5)"
                                            autoCapitalize="words"
                                        />
                                    </View>
                                </View>

                                <Text style={styles.label}>Email</Text>
                                <TextInput
                                    style={styles.input}
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    placeholder="user@example.com"
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    keyboardType="email-address"
                                />

                                <Text style={styles.label}>Password</Text>
                                <TextInput
                                    style={styles.input}
                                    value={pass}
                                    onChangeText={setPass}
                                    secureTextEntry
                                    placeholder="Min. 6 characters"
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                />

                                <Text style={styles.label}>Confirm Password</Text>
                                <TextInput
                                    style={styles.input}
                                    value={confirmPass}
                                    onChangeText={setConfirmPass}
                                    secureTextEntry
                                    placeholder="Re-enter password"
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                />

                                <TouchableOpacity style={styles.signupButton} onPress={handleRegister}>
                                    <Text style={styles.signupButtonText}>Sign Up</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => router.back()} style={styles.linkInfo}>
                                    <Text style={styles.linkText}>Already have an account? Login</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    overlay: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 40,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 30,
    },
    form: {
        gap: 12,
    },
    nameRow: {
        flexDirection: 'row',
        gap: 12,
    },
    nameField: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 6,
    },
    input: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        backgroundColor: 'rgba(255,255,255,0.15)',
        color: '#fff',
    },
    signupButton: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    signupButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    linkInfo: {
        marginTop: 16,
        alignItems: 'center',
    },
    linkText: {
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
    }
});
