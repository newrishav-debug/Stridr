import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '../context/PreferencesContext';

interface GoalPromptModalProps {
    visible: boolean;
    onCancel: () => void;
    onStart: (days: string) => void;
    initialDays?: string;
    title?: string;
    message?: string;
    submitLabel?: string;
    cancelLabel?: string;
}

export const GoalPromptModal: React.FC<GoalPromptModalProps> = ({
    visible,
    onCancel,
    onStart,
    initialDays = '7',
    title = 'Set Your Goal',
    message = 'How many days would you like to complete this trail?',
    submitLabel = 'Start',
    cancelLabel = 'Cancel'
}) => {
    const [days, setDays] = useState(initialDays);
    const theme = useTheme();

    // Reset days when modal becomes visible
    useEffect(() => {
        if (visible) {
            setDays(initialDays);
        }
    }, [visible, initialDays]);

    const handleStart = () => {
        if (!days.trim()) return;
        onStart(days);
        setDays(initialDays); // Reset for next time
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onCancel}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.centeredView}
            >
                <TouchableWithoutFeedback onPress={onCancel}>
                    <View style={styles.modalOverlay} />
                </TouchableWithoutFeedback>

                <View style={[styles.modalView, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={[styles.modalTitle, { color: theme.text }]}>{title}</Text>
                    <Text style={[styles.modalText, { color: theme.textSecondary }]}>
                        {message}
                    </Text>

                    <TextInput
                        style={[styles.input, {
                            color: theme.text,
                            backgroundColor: theme.background,
                            borderColor: theme.border
                        }]}
                        onChangeText={setDays}
                        value={days}
                        keyboardType="numeric"
                        placeholder="7"
                        placeholderTextColor={theme.textTertiary}
                        autoFocus={true}
                        selectionColor={theme.primary}
                    />

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonCancel, { borderColor: theme.border }]}
                            onPress={onCancel}
                        >
                            <Text style={[styles.buttonCancelText, { color: theme.text }]}>{cancelLabel}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonStart]}
                            onPress={handleStart}
                        >
                            <Text style={styles.buttonStartText}>{submitLabel}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '85%',
        margin: 20,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderWidth: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    modalText: {
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 16,
        lineHeight: 22,
    },
    input: {
        height: 50,
        width: '100%',
        marginVertical: 12,
        borderWidth: 1,
        borderRadius: 12,
        padding: 10,
        fontSize: 18,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        marginTop: 20,
        gap: 12,
    },
    button: {
        borderRadius: 14,
        paddingVertical: 16,
        paddingHorizontal: 20,
        elevation: 2,
        flex: 1,
        alignItems: 'center',
    },
    buttonCancel: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
    },
    buttonStart: {
        backgroundColor: '#10B981',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    buttonCancelText: {
        fontWeight: '600',
        textAlign: 'center',
        fontSize: 16,
    },
    buttonStartText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
});
