/**
 * File: app/edit-profile.tsx
 * Purpose: Screen for editing user profile information.
 * Created: 2024-01-12
 * Author: AI Assistant
 *
 * Modification History:
 * 2024-01-12: Documentation added.
 */
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../src/context/AuthContext';
import { ChevronLeft, Camera, Mail, Lock, User } from 'lucide-react-native';
import { useTheme } from '../src/context/PreferencesContext';
import { useToast } from '../src/context/ToastContext';

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, updateProfile, resetPassword } = useAuth();
    const theme = useTheme();
    const { showToast } = useToast();

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [image, setImage] = useState(user?.profileImage || null);

    const handleSave = async () => {
        try {
            if (user) {
                await updateProfile({ name, profileImage: image || undefined });
            }
            showToast('Profile updated successfully!', 'success');
            router.back();
        } catch (error) {
            showToast('Failed to update profile', 'error');
        }
    };

    const handleChangePhoto = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleResetPassword = () => {
        Alert.alert(
            'Reset Password',
            `Send a password reset email to ${email}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Send Email',
                    onPress: async () => {
                        try {
                            await resetPassword();
                            showToast('Email sent! check your inbox and SPAM folder.', 'success');
                        } catch (error: any) {
                            showToast(error.message || 'Failed to send reset email', 'error');
                        }
                    }
                }
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Edit Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Profile Photo */}
                <View style={[styles.photoSection, { backgroundColor: theme.card }]}>
                    <View style={[styles.photoContainer, { backgroundColor: theme.backgroundTertiary }]}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.profileImage} />
                        ) : (
                            <User size={60} color={theme.textTertiary} />
                        )}
                    </View>
                    <TouchableOpacity onPress={handleChangePhoto} style={styles.changePhotoButton}>
                        <Camera size={16} color="#2563EB" />
                        <Text style={styles.changePhotoText}>Change Photo</Text>
                    </TouchableOpacity>
                </View>

                {/* Form Fields */}
                <View style={[styles.formSection, { backgroundColor: theme.card }]}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Name</Text>
                        <View style={[styles.inputContainer, { backgroundColor: theme.backgroundTertiary, borderColor: theme.border }]}>
                            <User size={20} color={theme.textTertiary} />
                            <TextInput
                                style={[styles.input, { color: theme.text }]}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your name"
                                placeholderTextColor={theme.textTertiary}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>Email</Text>
                        <View style={[styles.inputContainer, { backgroundColor: theme.backgroundTertiary, borderColor: theme.border }]}>
                            <Mail size={20} color={theme.textTertiary} />
                            <TextInput
                                style={[styles.input, { color: theme.text }]}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholderTextColor={theme.textTertiary}
                            />
                        </View>
                    </View>

                    {/* Reset Password */}
                    <TouchableOpacity
                        style={[styles.resetPasswordButton, { backgroundColor: theme.background }]}
                        onPress={handleResetPassword}
                    >
                        <Lock size={20} color="#EF4444" />
                        <Text style={styles.resetPasswordText}>Reset Password</Text>
                        <ChevronLeft size={20} color={theme.textTertiary} style={{ transform: [{ rotate: '180deg' }] }} />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Save Button */}
            <View style={[styles.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    content: {
        flex: 1,
    },
    photoSection: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: 'white',
        marginBottom: 16,
    },
    photoContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        overflow: 'hidden',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    changePhotoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    changePhotoText: {
        fontSize: 16,
        color: '#2563EB',
        fontWeight: '600',
    },
    formSection: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    inputGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
    resetPasswordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
        gap: 12,
        marginTop: 8,
    },
    resetPasswordText: {
        flex: 1,
        fontSize: 16,
        color: '#EF4444',
        fontWeight: '600',
    },
    footer: {
        padding: 20,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    saveButton: {
        backgroundColor: '#2563EB',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
