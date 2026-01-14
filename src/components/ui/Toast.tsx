import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, Platform, TouchableOpacity } from 'react-native';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react-native';
import { useTheme } from '../../context/PreferencesContext';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    visible: boolean;
    onHide: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
    message,
    type,
    visible,
    onHide,
    duration = 3000
}) => {
    const theme = useTheme();
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Show animation
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();

            // Auto hide timer
            const timer = setTimeout(() => {
                hideToast();
            }, duration);

            return () => clearTimeout(timer);
        } else {
            hideToast();
        }
    }, [visible]);

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            })
        ]).start(() => {
            if (visible) onHide();
        });
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle size={24} color="#10B981" />;
            case 'error':
                return <AlertCircle size={24} color="#EF4444" />;
            case 'info':
            default:
                return <Info size={24} color="#3B82F6" />;
        }
    };

    const getBorderColor = () => {
        switch (type) {
            case 'success': return '#10B981';
            case 'error': return '#EF4444';
            case 'info': return '#3B82F6';
            default: return theme.border;
        }
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    borderLeftColor: getBorderColor(),
                    transform: [{ translateY: slideAnim }],
                    opacity: opacityAnim,
                    // Safe area padding for top notch
                    top: Platform.OS === 'ios' ? 60 : 40,
                }
            ]}
        >
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    {getIcon()}
                </View>
                <Text style={[styles.message, { color: theme.text }]}>
                    {message}
                </Text>
            </View>
            <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
                <X size={16} color={theme.textTertiary} />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 20,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        zIndex: 9999,
        borderLeftWidth: 4,
        borderWidth: 1,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        marginRight: 12,
    },
    message: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        flex: 1,
    },
    closeButton: {
        marginLeft: 12,
        padding: 4,
    }
});
