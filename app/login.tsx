/**
 * File: app/login.tsx
 * Purpose: Login screen for user authentication with email and social providers.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Documentation added.
 * 2024-01-12: Added Google and Facebook sign-in buttons.
 * 2026-01-12: Added scenic background image.
 */
import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, ImageBackground, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isFacebookLoading, setIsFacebookLoading] = useState(false);
    const { login, loginWithGoogle, loginWithFacebook, googlePromptAsync, facebookPromptAsync } = useAuth();
    const router = useRouter();

    const handleLogin = async () => {
        try {
            if (!email || !pass) return Alert.alert('Error', 'Please fill all fields');
            await login(email, pass);
            router.replace('/');
        } catch (e: any) {
            Alert.alert('Login Failed', e.message);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setIsGoogleLoading(true);
            await loginWithGoogle();
        } catch (e: any) {
            Alert.alert('Google Sign-In Failed', e.message);
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handleFacebookLogin = async () => {
        try {
            setIsFacebookLoading(true);
            await loginWithFacebook();
        } catch (e: any) {
            Alert.alert('Facebook Sign-In Failed', e.message);
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

                                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                                    <Text style={styles.loginButtonText}>Login</Text>
                                </TouchableOpacity>

                                {/* Divider */}
                                <View style={styles.divider}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dividerText}>or continue with</Text>
                                    <View style={styles.dividerLine} />
                                </View>

                                {/* Social Login Buttons */}
                                <View style={styles.socialButtons}>
                                    <TouchableOpacity
                                        style={[styles.socialButton, styles.googleButton]}
                                        onPress={handleGoogleLogin}
                                        disabled={isGoogleLoading || !googlePromptAsync}
                                    >
                                        {isGoogleLoading ? (
                                            <ActivityIndicator color="#fff" size="small" />
                                        ) : (
                                            <>
                                                <Text style={styles.googleIcon}>G</Text>
                                                <Text style={styles.socialButtonText}>Google</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.socialButton, styles.facebookButton]}
                                        onPress={handleFacebookLogin}
                                        disabled={isFacebookLoading || !facebookPromptAsync}
                                    >
                                        {isFacebookLoading ? (
                                            <ActivityIndicator color="#fff" size="small" />
                                        ) : (
                                            <>
                                                <Text style={styles.facebookIcon}>f</Text>
                                                <Text style={styles.socialButtonText}>Facebook</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>

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
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
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
        flexDirection: 'row',
        gap: 12,
    },
    socialButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 8,
        gap: 8,
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
        fontSize: 14,
        fontWeight: '600',
    },
    linkInfo: {
        marginTop: 20,
        alignItems: 'center',
    },
    linkText: {
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
    }
});
