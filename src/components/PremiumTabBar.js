import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';

const COLORS = {
    border: 'rgba(255,255,255,0.06)',
    white35: 'rgba(255,255,255,0.35)',
    accent: '#4D9EFF',
};

export function PremiumTabBar({ currentRoute, onNavigate }) {
    const tabs = [
        { key: 'Home', label: 'Home', icon: '◈' },
        { key: 'Library', label: 'Biblioteca', icon: '◰' },
        { key: 'Profile', label: 'Perfil', icon: '◉' },
    ];

    return (
        <View style={tabStyles.wrapper}>
            <BlurView intensity={40} tint="dark" style={tabStyles.blur}>
                <View style={tabStyles.container}>
                    {tabs.map((tab) => {
                        const isFocused = currentRoute === tab.key;

                        return (
                            <TouchableOpacity
                                key={tab.key}
                                style={tabStyles.tab}
                                onPress={() => onNavigate(tab.key)}
                                activeOpacity={0.7}
                            >
                                {/* Indicador ativo */}
                                {isFocused && <View style={tabStyles.activeIndicator} />}

                                <Text style={[tabStyles.icon, isFocused && tabStyles.iconActive]}>
                                    {tab.icon}
                                </Text>
                                <Text style={[tabStyles.label, isFocused && tabStyles.labelActive]}>
                                    {tab.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </BlurView>
        </View>
    );
}

const tabStyles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    blur: {
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        overflow: 'hidden',
    },
    container: {
        flexDirection: 'row',
        paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        paddingTop: 12,
        paddingHorizontal: 24,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
        position: 'relative',
    },
    activeIndicator: {
        position: 'absolute',
        top: -12,
        width: 24,
        height: 2,
        backgroundColor: COLORS.accent,
        borderRadius: 999,
    },
    icon: {
        fontSize: 20,
        color: COLORS.white35,
    },
    iconActive: {
        color: COLORS.accent,
    },
    label: {
        fontFamily: 'DM_Sans_500Medium',
        fontSize: 11,
        color: COLORS.white35,
        letterSpacing: 0.5,
    },
    labelActive: {
        fontFamily: 'DM_Sans_700Bold',
        color: COLORS.accent,
    },
});
