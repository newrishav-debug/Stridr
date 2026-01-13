/**
 * File: app/signup.tsx
 * Purpose: Signup screen for new user registration with email and social providers.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Documentation added.
 * 2024-01-12: Added Google and Facebook sign-in buttons.
 * 2026-01-12: Added scenic background image.
 * 2026-01-12: Extended registration form with firstName, lastName, confirmPassword.
 */
import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, ImageBackground, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function SignupScreen() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isFacebookLoading, setIsFacebookLoading] = useState(false);
    const { register, loginWithGoogle, loginWithFacebook, googlePromptAsync, facebookPromptAsync } = useAuth();
    const router = useRouter();

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleRegister = async () => {
        try {
            // Validation
            if (!firstName.trim()) {
                return Alert.alert('Error', 'Please enter your first name');
            }
            if (!lastName.trim()) {
                return Alert.alert('Error', 'Please enter your last name');
            }
            if (!email.trim()) {
                return Alert.alert('Error', 'Please enter your email');
            }
            if (!validateEmail(email)) {
                return Alert.alert('Error', 'Please enter a valid email address');
            }
            if (!pass) {
                return Alert.alert('Error', 'Please enter a password');
            }
            if (pass.length < 6) {
                return Alert.alert('Error', 'Password must be at least 6 characters');
            }
            if (pass !== confirmPass) {
                return Alert.alert('Error', 'Passwords do not match');
            }

            await register(firstName.trim(), lastName.trim(), email.trim(), pass);
            Alert.alert('Success', 'Account created! Logging you in...');
            router.replace('/');
        } catch (e: any) {
            Alert.alert('Registration Failed', e.message);
        }
    };

    const handleGoogleSignup = async () => {
        try {
            setIsGoogleLoading(true);
            await loginWithGoogle();
        } catch (e: any) {
            Alert.alert('Google Sign-Up Failed', e.message);
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleFacebookSignup = async () => {
        try {
            setIsFacebookLoading(true);
            await loginWithFacebook();
        } catch (e: any) {
            Alert.alert('Facebook Sign-Up Failed', e.message);
        } finally {
            setIsFacebookLoading(false);
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
                                {/* Social Sign-up Buttons First */}
                                <View style={styles.socialButtons}>
                                    <TouchableOpacity
                                        style={[styles.socialButton, styles.googleButton]}
                                        onPress={handleGoogleSignup}
                                        disabled={isGoogleLoading || !googlePromptAsync}
                                    >
                                        {isGoogleLoading ? (
                                            <ActivityIndicator color="#fff" size="small" />
                                        ) : (
                                            <>
                                                <Text style={styles.googleIcon}>G</Text>
                                                <Text style={styles.socialButtonText}>Sign up with Google</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.socialButton, styles.facebookButton]}
                                        onPress={handleFacebookSignup}
                                        disabled={isFacebookLoading || !facebookPromptAsync}
                                    >
                                        {isFacebookLoading ? (
                                            <ActivityIndicator color="#fff" size="small" />
                                        ) : (
                                            <>
                                                <Text style={styles.facebookIcon}>f</Text>
                                                <Text style={styles.socialButtonText}>Sign up with Facebook</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>

                                {/* Divider */}
                                <View style={styles.divider}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dividerText}>or sign up with email</Text>
                                    <View style={styles.dividerLine} />
                                </View>

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
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
    dividerText: {
        marginHorizontal: 12,
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
    },
    socialButtons: {
        gap: 12,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 12,
        gap: 10,
    },
    googleButton: {
        backgroundColor: '#EA4335',
    },
    facebookButton: {
        backgroundColor: '#1877F2',
    },
    googleIcon: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    facebookIcon: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    socialButtonText: {
        color: '#fff',
        fontSize: 15,
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
