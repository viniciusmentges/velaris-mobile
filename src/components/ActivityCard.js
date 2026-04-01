import React from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';

const C = {
    surface: '#0F1520',
    border: 'rgba(255,255,255,0.06)',
    white: '#FFFFFF',
    white35: 'rgba(255,255,255,0.35)',
    white60: 'rgba(255,255,255,0.60)',
    accent: '#4D9EFF',
};

export function ActivityCard({ activity }) {
    // Expected activity object shape: { id, month, day, km, name, surface, shoe, pts, rest }
    return (
        <View style={actS.card}>
            <View style={actS.dateBox}>
                <Text style={actS.dateMonth}>{activity.month}</Text>
                <Text style={actS.dateDay}>{activity.day}</Text>
            </View>
            <View style={actS.info}>
                <View style={actS.infoTop}>
                    <Text style={actS.km}>{activity.km} km</Text>
                    <Text style={actS.actName} numberOfLines={1}>{activity.name}</Text>
                </View>
                <Text style={actS.meta}>{activity.surface} · {activity.shoe}</Text>
            </View>
            <View style={actS.right}>
                <Text style={actS.pts}>+{activity.pts} pts</Text>
                <Text style={actS.rest}>{activity.rest}h descanso</Text>
            </View>
        </View>
    );
}

const actS = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginBottom: 8,
        backgroundColor: C.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: C.border,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    dateBox: {
        width: 42,
        alignItems: 'center',
        gap: 1,
    },
    dateMonth: {
        fontFamily: 'Inter_500Medium',
        fontSize: 10,
        color: C.white35,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    dateDay: {
        fontFamily: 'Inter_900Black',
        fontSize: 22,
        color: C.white,
        lineHeight: 26,
    },
    info: { flex: 1, gap: 3 },
    infoTop: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
    km: {
        fontFamily: 'Inter_700Bold',
        fontSize: 15,
        color: C.white,
    },
    actName: {
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        color: C.white60,
        flex: 1,
    },
    meta: {
        fontFamily: 'Inter_400Regular',
        fontSize: 11,
        color: C.white35,
        letterSpacing: 0.3,
    },
    right: { alignItems: 'flex-end', gap: 3 },
    pts: {
        fontFamily: 'Inter_700Bold',
        fontSize: 13,
        color: C.accent,
    },
    rest: {
        fontFamily: 'DM_Sans_400Regular',
        fontSize: 11,
        color: C.white35,
    },
});
