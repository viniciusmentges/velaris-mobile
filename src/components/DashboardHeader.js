import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

const COLORS = {
    white: '#FFFFFF',
    white35: 'rgba(255,255,255,0.35)',
    surfaceHigh: '#161E2E',
    border: 'rgba(255,255,255,0.06)',
};

export function DashboardHeader({ userName = 'Vinicius', onLogout }) {
    return (
        <View style={headerStyles.container}>
            <View style={headerStyles.textGroup}>
                <Text style={headerStyles.greeting}>
                    {getGreeting()}, {userName}
                </Text>
                <Text style={headerStyles.title}>Dashboard</Text>
            </View>

            <TouchableOpacity
                style={headerStyles.exitBtn}
                activeOpacity={0.7}
                onPress={onLogout}
            >
                <Text style={headerStyles.exitIcon}>⎋</Text>
            </TouchableOpacity>
        </View>
    );
}

function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
}

const headerStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    textGroup: {
        gap: 2,
    },
    greeting: {
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        color: COLORS.white35,
        letterSpacing: 0.2,
    },
    title: {
        fontFamily: 'Inter_700Bold',
        fontSize: 32,
        color: COLORS.white,
        letterSpacing: -0.5,
        lineHeight: 36,
    },
    exitBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: COLORS.surfaceHigh,
        borderWidth: 1,
        borderColor: COLORS.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    exitIcon: {
        fontSize: 16,
        color: COLORS.white35,
    },
});
