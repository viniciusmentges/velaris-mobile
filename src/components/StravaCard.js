import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

const C = {
    surface: '#0F1520',
    border: 'rgba(255,255,255,0.06)',
    white: '#FFFFFF',
    white35: 'rgba(255,255,255,0.35)',
    white60: 'rgba(255,255,255,0.60)',
    strava: '#FC4C02',
};

export function StravaCard({ lastSync, onSync, stravaConnected }) {
    return (
        <View style={stravaS.card}>
            <View style={stravaS.left}>
                <View style={stravaS.icon}>
                    <Text style={stravaS.iconText}>↑</Text>
                </View>
                <View>
                    <Text style={stravaS.title}>{stravaConnected ? 'Strava Conectado' : 'Strava Desconectado'}</Text>
                    <Text style={stravaS.sync}>
                        {lastSync ? `Sync: ${lastSync}` : 'Aguardando sincronismo...'}
                    </Text>
                </View>
            </View>
            <TouchableOpacity style={stravaS.btn} onPress={onSync} activeOpacity={0.8}>
                <Text style={stravaS.btnText}>SINCRONIZAR</Text>
            </TouchableOpacity>
        </View>
    );
}

const stravaS = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginBottom: 10,
        backgroundColor: C.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: C.border,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    icon: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: 'rgba(252,76,2,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(252,76,2,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: {
        fontSize: 18,
        color: C.strava,
        fontWeight: '700',
    },
    title: {
        fontFamily: 'Inter_700Bold',
        fontSize: 14,
        color: C.white,
    },
    sync: {
        fontFamily: 'Inter_400Regular',
        fontSize: 11,
        color: C.white35,
        marginTop: 2,
    },
    btn: {
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 8,
    },
    btnText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 11,
        color: C.white60,
        letterSpacing: 0.8,
    },
});
