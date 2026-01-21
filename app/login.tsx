/**
 * File: app/login.tsx
 * Purpose: Login screen for user authentication with email.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Documentation added.
 * 2026-01-12: Added scenic background image.
 * 2026-01-13: Removed social login buttons (Google/Facebook).
 */
import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const { login, forgotPassword } = useAuth();
    const router = useRouter();

    const handleForgotPassword = async () => {
        if (!email) {
            return Alert.alert('Enter Email', 'Please enter your email address in the field above to receive a password reset link.');
        }
        Alert.alert(
            'Reset Password',
            `Send reset link to ${email}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Send',
                    onPress: async () => {
                        try {
                            await forgotPassword(email);
                            Alert.alert('Email Sent', 'Please check your inbox and SPAM folder.');
                        } catch (e: any) {
                            Alert.alert('Error', e.message);
                        }
                    }
                }
            ]
        );
    };

    const handleLogin = async () => {
        try {
            if (!email || !pass) return Alert.alert('Error', 'Please fill all fields');
            await login(email, pass);
            router.replace('/(tabs)');
        } catch (e: any) {
            Alert.alert('Login Failed', e.message);
        }
    };

    return (
        <ImageBackground
            source={require('../assets/auth_background.png')}
            style={styles.backgroundImage}
            resizeMode="cover"
        >
            <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
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
                            <Text style={styles.title}>Stridr</Text>
                            <Text style={styles.subtitle}>Sign in to continue your journey</Text>

                            <View style={styles.form}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput
                                    style={styles.input}
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    placeholder="user@example.com"
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                />

                                <Text style={styles.label}>Password</Text>
                                <TextInput
                                    style={styles.input}
                                    value={pass}
                                    onChangeText={setPass}
                                    secureTextEntry
                                    placeholder="••••••"
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                />

                                <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordButton}>
                                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                                    <Text style={styles.loginButtonText}>Login</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => router.push('/signup')} style={styles.linkInfo}>
                                    <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
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
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontSize: 42,
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
        marginBottom: 40,
    },
    form: {
        gap: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.9)',
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
    loginButton: {
        backgroundColor: '#2563EB',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    linkInfo: {
        marginTop: 20,
        alignItems: 'center',
    },
    linkText: {
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
    },
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        paddingVertical: 4,
    },
    forgotPasswordText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
    }
});
