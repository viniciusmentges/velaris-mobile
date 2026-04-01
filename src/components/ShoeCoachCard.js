import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';

const COLORS = {
    surface: '#0F1520',
    border: 'rgba(255,255,255,0.06)',
    borderAccent: 'rgba(77,158,255,0.2)',
    white35: 'rgba(255,255,255,0.35)',
    white60: 'rgba(255,255,255,0.6)',
    accent: '#4D9EFF',
    accentGlow: 'rgba(77,158,255,0.15)',
};

export default function ShoeCoachCard({ message, onPress }) {
    if (!message) return null;

    const isLocked = !!message.includes('Upgrade');

    return (
        <TouchableOpacity
            activeOpacity={isLocked ? 0.7 : 1}
            onPress={isLocked ? onPress : null}
            style={coachStyles.container}
        >
            <View style={coachStyles.borderGlow} />
            <View style={coachStyles.content}>
                <View style={coachStyles.header}>
                    <View style={coachStyles.iconContainer}>
                        <Text style={coachStyles.iconText}>
                            {isLocked ? '🔒' : '⬡'}
                        </Text>
                    </View>
                    <View style={coachStyles.titleGroup}>
                        <Text style={coachStyles.label}>VELARIS COACH</Text>
                        <Text style={coachStyles.sublabel}>Inteligência Biomecânica</Text>
                    </View>
                    {!isLocked && (
                        <View style={coachStyles.aiBadge}>
                            <Text style={coachStyles.aiBadgeText}>AI</Text>
                        </View>
                    )}
                </View>

                <View style={coachStyles.divider} />

                <Text style={[
                    coachStyles.message,
                    isLocked && coachStyles.lockedMessage
                ]}>
                    "{message}"
                </Text>

                {isLocked && (
                    <Text style={coachStyles.tapToUnlock}>Toque para desbloquear</Text>
                )}
            </View>
        </TouchableOpacity>
    );
}

const coachStyles = StyleSheet.create({
    container: { // Renamed from card to container
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 20,
        position: 'relative',
    },
    borderGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.borderAccent,
    },
    content: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        padding: 18,
        gap: 14,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    iconWrapper: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: COLORS.accentGlow,
        borderWidth: 1,
        borderColor: COLORS.borderAccent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        fontSize: 16,
        color: COLORS.accent,
    },
    titleGroup: {
        flex: 1,
        gap: 1,
    },
    label: {
        fontFamily: 'Inter_700Bold',
        fontSize: 13,
        color: COLORS.accent,
        letterSpacing: 1.5,
    },
    sublabel: {
        fontFamily: 'Inter_400Regular',
        fontSize: 11,
        color: COLORS.white35,
        letterSpacing: 0.3,
    },
    aiBadge: {
        backgroundColor: COLORS.accentGlow,
        borderWidth: 1,
        borderColor: COLORS.borderAccent,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    aiBadgeText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 10,
        color: COLORS.accent,
        letterSpacing: 1,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
    },
    message: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: COLORS.white60,
        lineHeight: 22,
        fontStyle: 'italic',
        letterSpacing: 0.2,
    },
    lockedMessage: {
        color: COLORS.accent,
        fontStyle: 'normal',
        fontWeight: '600',
    },
    tapToUnlock: {
        fontFamily: 'Inter_700Bold',
        fontSize: 10,
        color: COLORS.accent,
        textAlign: 'center',
        marginTop: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    }
});
