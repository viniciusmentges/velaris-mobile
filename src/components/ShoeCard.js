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
    borderAccent: 'rgba(77,158,255,0.20)',
    white: '#FFFFFF',
    white35: 'rgba(255,255,255,0.35)',
    white15: 'rgba(255,255,255,0.10)',
    accent: '#4D9EFF',
    accentGlow: 'rgba(77,158,255,0.12)',
    green: '#00E096',
    greenGlow: 'rgba(0,224,150,0.12)',
    yellow: '#FFB800',
    yellowGlow: 'rgba(255,184,0,0.12)',
    red: '#FF4D4D',
    redSubtle: 'rgba(255,77,77,0.10)',
    redBorder: 'rgba(255,77,77,0.28)',
};

function getLifeColor(pct) {
    if (pct > 60) return C.green;
    if (pct > 30) return C.yellow;
    return C.red;
}

function getLifeGlow(pct) {
    if (pct > 60) return C.greenGlow;
    if (pct > 30) return C.yellowGlow;
    return C.redSubtle;
}

// ─── HERO CARD (Tênis Ativo) ──────────────────────────────
export function HeroShoeCard({ shoe, onDeactivate, onNFCPress }) {
    const lifePercent = 100 - (shoe.desgaste_percentual || 0);
    const lifeColor = getLifeColor(lifePercent);
    const lifeGlow = getLifeGlow(lifePercent);
    const descanso = shoe.descanso_info || { status: 'Pronto para uso', cor: 'green' };
    const isRecovered = descanso.cor === 'green';

    return (
        <View style={heroStyles.card}>
            <View style={[heroStyles.bgGlow, { backgroundColor: C.accentGlow }]} />

            <View style={heroStyles.topRow}>
                <View style={heroStyles.activeBadge}>
                    <View style={heroStyles.activePulse} />
                    <Text style={heroStyles.activeBadgeText}>TÊNIS ATIVO</Text>
                </View>
                <TouchableOpacity onPress={() => onDeactivate(shoe.id, true)} activeOpacity={0.7}>
                    <Text style={heroStyles.deactivateText}>Pausar</Text>
                </TouchableOpacity>
            </View>

            <View style={heroStyles.nameRow}>
                <View style={heroStyles.nameGroup}>
                    <Text style={heroStyles.name}>{shoe.nome}</Text>
                    <Text style={heroStyles.subtitle}>{shoe.marca} · {shoe.modelo}</Text>
                </View>
                <View style={heroStyles.kmGroup}>
                    <Text style={heroStyles.kmValue}>
                        {(shoe.km_total_real || 0).toFixed(1)}
                        <Text style={heroStyles.kmUnit}> km</Text>
                    </Text>
                    <Text style={heroStyles.kmLabel}>RODADOS</Text>
                </View>
            </View>

            <View style={heroStyles.lifeSection}>
                <View style={heroStyles.lifeRow}>
                    <Text style={heroStyles.lifeLabel}>VIDA ÚTIL</Text>
                    <Text style={[heroStyles.lifeValue, { color: lifeColor }]}>
                        {lifePercent.toFixed(0)}% restante · {Math.max(0, (shoe.km_limite || 600) - (shoe.km_total_real || 0)).toFixed(0)} km disponíveis
                    </Text>
                </View>
                <View style={heroStyles.track}>
                    <View style={[heroStyles.fill, {
                        width: `${lifePercent}%`,
                        backgroundColor: lifeColor,
                    }]} />
                </View>
            </View>

            {!!shoe.nfc_url && (
                <TouchableOpacity
                    onPress={() => onNFCPress(shoe.nfc_url, shoe.nome)}
                    style={heroStyles.nfcContainer}
                >
                    <Text style={heroStyles.nfcIcon}>🔗</Text>
                    <Text style={heroStyles.nfcText}>GRAVAR TAG NFC</Text>
                </TouchableOpacity>
            )}

            <View style={[heroStyles.recoveryPill, { backgroundColor: lifeGlow }]}>
                <View style={[heroStyles.dot, {
                    backgroundColor: isRecovered ? C.green : C.yellow,
                }]} />
                <Text style={heroStyles.recoveryLabel}>RECUPERAÇÃO</Text>
                <Text style={[heroStyles.recoveryStatus, {
                    color: isRecovered ? C.green : C.yellow,
                }]}>
                    {descanso.status}
                </Text>
            </View>
        </View>
    );
}

// ─── SHOE CARD (Tênis Secundário) ─────────────────────────
export function ShoeCard({ shoe, onActivate, onDelete, onNFCPress }) {
    const lifePercent = 100 - (shoe.desgaste_percentual || 0);
    const lifeColor = getLifeColor(lifePercent);
    const descanso = shoe.descanso_info || { status: 'Pronto para uso', cor: 'green' };
    const isRecovered = descanso.cor === 'green';

    return (
        <View style={cardS.card}>
            <View style={cardS.header}>
                <View style={cardS.nameGroup}>
                    <Text style={cardS.name}>{shoe.nome}</Text>
                    <Text style={cardS.subtitle}>{shoe.marca} · {shoe.modelo}</Text>
                </View>
                <View style={cardS.kmGroup}>
                    <Text style={cardS.kmValue}>
                        {(shoe.km_total_real || 0).toFixed(1)}<Text style={cardS.kmUnit}> km</Text>
                    </Text>
                    <Text style={cardS.kmLabel}>RODADOS</Text>
                </View>
            </View>

            <View style={cardS.lifeSection}>
                <View style={cardS.lifeRow}>
                    <Text style={cardS.lifeLabel}>VIDA ÚTIL</Text>
                    <Text style={[cardS.lifeValue, { color: lifeColor }]}>
                        {lifePercent.toFixed(0)}% restante
                    </Text>
                </View>
                <View style={cardS.track}>
                    <View style={[cardS.fill, {
                        width: `${lifePercent}%`,
                        backgroundColor: lifeColor,
                    }]} />
                </View>
            </View>

            <View style={cardS.footer}>
                <View style={cardS.recoveryGroup}>
                    <View style={[cardS.dot, {
                        backgroundColor: isRecovered ? C.green : C.yellow,
                    }]} />
                    <View>
                        <Text style={cardS.recoveryLabel}>RECUPERAÇÃO</Text>
                        <Text style={[cardS.recoveryStatus, {
                            color: isRecovered ? C.green : C.yellow,
                        }]}>
                            {descanso.status}
                        </Text>
                    </View>
                </View>
                <View style={cardS.btnGroup}>
                    <TouchableOpacity style={cardS.btnActivate} onPress={() => onActivate(shoe.id, false)} activeOpacity={0.8}>
                        <Text style={cardS.btnActivateText}>ATIVAR</Text>
                    </TouchableOpacity>
                    {!!shoe.nfc_url && (
                        <TouchableOpacity
                            onPress={() => onNFCPress(shoe.nfc_url, shoe.nome)}
                            style={cardS.btnNfc}
                        >
                            <Text style={cardS.btnNfcText}>NFC</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={cardS.btnDelete} onPress={() => onDelete(shoe.id)} activeOpacity={0.8}>
                        <Text style={cardS.btnDeleteText}>×</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const heroStyles = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: C.borderAccent,
        backgroundColor: C.surface,
        padding: 22,
        gap: 18,
        overflow: 'hidden',
        position: 'relative',
    },
    bgGlow: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 160,
        height: 160,
        borderRadius: 999,
        opacity: 0.5,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    activeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: C.accentGlow,
        borderWidth: 1,
        borderColor: C.borderAccent,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    activePulse: {
        width: 7,
        height: 7,
        borderRadius: 999,
        backgroundColor: C.accent,
    },
    activeBadgeText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 11,
        color: C.accent,
        letterSpacing: 1.2,
    },
    deactivateText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 13,
        color: C.white35,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    nameGroup: {
        flex: 1,
        gap: 4,
    },
    name: {
        fontFamily: 'Inter_900Black',
        fontSize: 26,
        color: C.white,
        letterSpacing: -0.3,
        lineHeight: 30,
    },
    subtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        color: C.white35,
    },
    kmGroup: {
        alignItems: 'flex-end',
        paddingLeft: 12,
    },
    kmValue: {
        fontFamily: 'Inter_900Black',
        fontSize: 34,
        color: C.white,
        lineHeight: 38,
    },
    kmUnit: {
        fontFamily: 'Inter_700Bold',
        fontSize: 15,
        color: C.accent,
    },
    kmLabel: {
        fontFamily: 'Inter_500Medium',
        fontSize: 10,
        color: C.white35,
        letterSpacing: 1.5,
        textAlign: 'right',
        marginTop: 2,
    },
    lifeSection: {
        gap: 9,
    },
    lifeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 4,
    },
    lifeLabel: {
        fontFamily: 'Inter_500Medium',
        fontSize: 10,
        color: C.white35,
        letterSpacing: 1.5,
    },
    lifeValue: {
        fontFamily: 'Inter_700Bold',
        fontSize: 11,
        letterSpacing: 0.2,
    },
    track: {
        height: 6,
        backgroundColor: C.white15,
        borderRadius: 999,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: 999,
    },
    nfcContainer: {
        backgroundColor: 'rgba(255,184,0,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,184,0,0.15)',
        borderRadius: 14,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    nfcIcon: { fontSize: 14 },
    nfcText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 11,
        color: C.yellow,
        letterSpacing: 1,
    },
    recoveryPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 999,
    },
    recoveryLabel: {
        fontFamily: 'Inter_500Medium',
        fontSize: 10,
        color: C.white35,
        letterSpacing: 1.2,
    },
    recoveryStatus: {
        fontFamily: 'Inter_700Bold',
        fontSize: 13,
        letterSpacing: 0.2,
    },
});

const cardS = StyleSheet.create({
    card: {
        backgroundColor: C.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: C.border,
        padding: 18,
        marginHorizontal: 16,
        marginBottom: 10,
        gap: 14,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    nameGroup: { flex: 1, gap: 3, paddingRight: 10 },
    name: {
        fontFamily: 'Inter_700Bold',
        fontSize: 17,
        color: C.white,
        letterSpacing: 0.1,
    },
    subtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: C.white35,
    },
    kmGroup: { alignItems: 'flex-end' },
    kmValue: {
        fontFamily: 'Inter_900Black',
        fontSize: 26,
        color: C.white,
        lineHeight: 30,
    },
    kmUnit: {
        fontFamily: 'Inter_700Bold',
        fontSize: 13,
        color: C.accent,
    },
    kmLabel: {
        fontFamily: 'DM_Sans_500Medium',
        fontSize: 10,
        color: C.white35,
        letterSpacing: 1.4,
        textAlign: 'right',
        marginTop: 2,
    },
    lifeSection: { gap: 7 },
    lifeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    lifeLabel: {
        fontFamily: 'DM_Sans_500Medium',
        fontSize: 10,
        color: C.white35,
        letterSpacing: 1.4,
    },
    lifeValue: {
        fontFamily: 'Inter_700Bold',
        fontSize: 11,
        letterSpacing: 0.2,
    },
    track: {
        height: 5,
        backgroundColor: C.white15,
        borderRadius: 999,
        overflow: 'hidden',
    },
    fill: { height: '100%', borderRadius: 999 },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    recoveryGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
    },
    dot: { width: 8, height: 8, borderRadius: 999 },
    recoveryLabel: {
        fontFamily: 'DM_Sans_500Medium',
        fontSize: 10,
        color: C.white35,
        letterSpacing: 1.1,
    },
    recoveryStatus: {
        fontFamily: 'Inter_700Bold',
        fontSize: 12,
        letterSpacing: 0.2,
    },
    btnGroup: { flexDirection: 'row', gap: 6 },
    btnActivate: {
        backgroundColor: C.accent,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
    },
    btnActivateText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 10,
        color: C.white,
        letterSpacing: 0.9,
    },
    btnNfc: {
        borderWidth: 1,
        borderColor: 'rgba(255,184,0,0.3)',
        backgroundColor: 'rgba(255,184,0,0.1)',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 10,
    },
    btnNfcText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 10,
        color: C.yellow,
    },
    btnDelete: {
        borderWidth: 1,
        borderColor: C.redBorder,
        backgroundColor: 'rgba(255,77,77,0.05)',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 10,
    },
    btnDeleteText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 12,
        color: C.red,
        lineHeight: 14,
    },
});
