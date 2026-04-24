import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Platform,
    SafeAreaView,
    Modal,
    ActivityIndicator,
    RefreshControl,
    Alert,
    Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import api, { exchangeStravaCode, activateShoeByUUID, triggerStravaSync, disconnectStrava, updateExpoPushToken } from '../services/api';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import * as Linking from 'expo-linking';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';

WebBrowser.maybeCompleteAuthSession();

const stravaDiscovery = {
    authorizationEndpoint: 'https://www.strava.com/oauth/mobile/authorize',
    tokenEndpoint: 'https://www.strava.com/oauth/token',
    revocationEndpoint: 'https://www.strava.com/oauth/deauthorize',
};

// Configuração de Notificações em Primeiro Plano
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

import PricingModal from '../components/PricingModal';
import ShoeSelectionModal from '../components/ShoeSelectionModal';

// ─── TOKENS DE COR ───────────────────────────────────────────
const C = {
    bg: '#0D1117',
    surface: '#161B26',
    surfaceHigh: '#1E2535',
    border: 'rgba(255,255,255,0.07)',
    borderAccent: 'rgba(77,158,255,0.22)',
    borderGreen: 'rgba(0,224,150,0.22)',
    borderYellow: 'rgba(255,184,0,0.22)',

    white: '#FFFFFF',
    white70: 'rgba(255,255,255,0.70)',
    white40: 'rgba(255,255,255,0.40)',
    white15: 'rgba(255,255,255,0.10)',

    accent: '#4D9EFF',
    accentGlow: 'rgba(77,158,255,0.12)',

    green: '#00E096',
    greenGlow: 'rgba(0,224,150,0.10)',
    greenBg: 'rgba(0,224,150,0.06)',

    yellow: '#FFB800',
    yellowGlow: 'rgba(255,184,0,0.10)',
    yellowBg: 'rgba(255,184,0,0.06)',

    red: '#FF4D4D',
    redGlow: 'rgba(255,77,77,0.10)',
    redBg: 'rgba(255,77,77,0.06)',

    strava: '#FC4C02',
};

// ─── HELPERS ─────────────────────────────────────────────────
function getGreeting() {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return 'Bom dia';
    if (h >= 12 && h < 18) return 'Boa tarde';
    return 'Boa noite';
}

function getLifeColor(pct) {
    if (pct > 60) return C.green;
    if (pct > 30) return C.yellow;
    return C.red;
}

function getStatusBg(readyCount, attentionCount, recoveringCount) {
    if (recoveringCount > 0) return C.redBg;
    if (attentionCount > 0) return C.yellowBg;
    return C.greenBg;
}

// ─── 1. STATUS DO DIA (ROTAÇÃO) ─────────────────────────────────
function StatusBarChip({ status, activeFilter, onFilter }) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={statusS.scrollContent}
            style={statusS.scroll}
        >
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => onFilter('ALL')}
                style={[statusS.chip, { borderColor: activeFilter === 'ALL' ? C.white : C.border }]}
            >
                <Text style={statusS.icon}>👟</Text>
                <Text style={statusS.chipText}>
                    <Text style={statusS.bold}>{status.total}</Text> na rotação
                </Text>
            </TouchableOpacity>

            {status.ready > 0 && (
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => onFilter('READY')}
                    style={[statusS.chip, { borderColor: activeFilter === 'READY' ? C.green : C.borderGreen, backgroundColor: C.greenBg }]}
                >
                    <Text style={statusS.icon}>⚡</Text>
                    <Text style={[statusS.chipText, { color: C.green }]}>
                        <Text style={statusS.bold}>{status.ready}</Text> {status.ready === 1 ? 'pronto' : 'prontos'}
                    </Text>
                </TouchableOpacity>
            )}

            {status.recovering > 0 && (
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => onFilter('RECOVERING')}
                    style={[statusS.chip, { borderColor: activeFilter === 'RECOVERING' ? C.yellow : C.borderYellow, backgroundColor: C.yellowBg }]}
                >
                    <Text style={statusS.icon}>⏳</Text>
                    <Text style={[statusS.chipText, { color: C.yellow }]}>
                        <Text style={statusS.bold}>{status.recovering}</Text> {status.recovering === 1 ? 'recuperando' : 'recuperando'}
                    </Text>
                </TouchableOpacity>
            )}

            {status.attention > 0 && (
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => onFilter('ALERT')}
                    style={[statusS.chip, { borderColor: activeFilter === 'ALERT' ? C.red : C.red, backgroundColor: C.redBg }]}
                >
                    <Text style={statusS.icon}>⚠️</Text>
                    <Text style={[statusS.chipText, { color: C.red }]}>
                        <Text style={statusS.bold}>{status.attention}</Text> em alerta
                    </Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}

const statusS = StyleSheet.create({
    scroll: {
        marginBottom: 12,
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        backgroundColor: C.surface,
    },
    icon: {
        fontSize: 12,
    },
    chipText: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 12,
        color: C.white70,
        letterSpacing: 0.2,
    },
    bold: {
        fontFamily: 'SpaceGrotesk_700Bold',
    }
});

// ─── 2. HERO CARD (tênis ativo) ───────────────────────────────
function HeroShoeCardV2({ shoe, onTogglePause, isPaused }) {
    const lifeColor = getLifeColor(shoe.vida_util_percentual);
    const isReady = shoe.descanso_info?.status === 'Pronto para uso' || shoe.descanso_info?.horas <= 0;
    const kmLeft = Math.max(0, (shoe.vida_util_km - shoe.km_total_real).toFixed(0));
    const isStartPlan = !!shoe.descanso_info?.premium_locked;

    return (
        <View style={heroS.card}>
            <View style={[heroS.bgGlow, { backgroundColor: C.accentGlow }]} />

            <View style={heroS.topRow}>
                <View style={heroS.badge}>
                    <View style={heroS.badgeDot} />
                    <Text style={heroS.badgeText}>TÊNIS ATIVO</Text>
                </View>
                <TouchableOpacity onPress={() => onTogglePause(shoe.id, true)} activeOpacity={0.7}>
                    <Text style={heroS.pauseText}>
                        {isPaused ? 'Retomar' : 'Pausar'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View style={heroS.nameRow}>
                <View style={heroS.nameGroup}>
                    <Text style={heroS.name}>{shoe.nome?.toUpperCase()}</Text>
                    <Text style={heroS.subtitle}>{shoe.marca} · {shoe.modelo}</Text>
                </View>
            </View>

            <View style={heroS.structuralSection}>
                <View style={heroS.structuralTitleRow}>
                    <View style={heroS.structuralTitleGroup}>
                        <Text style={heroS.structuralTitle}>INTEGRIDADE ESTRUTURAL</Text>
                        <Text style={[heroS.structuralLabel, { color: shoe.integridade_estrutural_info?.cor }]}>
                            {shoe.integridade_estrutural_info?.label?.toUpperCase()}
                        </Text>
                    </View>
                    <Text style={[heroS.structuralPercent, { color: shoe.integridade_estrutural_info?.cor }]}>
                        {shoe.integridade_estrutural_info?.percentual}%
                    </Text>
                </View>
                <View style={heroS.track}>
                    <View style={[heroS.fill, {
                        width: `${shoe.integridade_estrutural_info?.percentual}% `,
                        backgroundColor: shoe.integridade_estrutural_info?.cor,
                    }]} />
                </View>
            </View>

            <View style={heroS.kmDetailRow}>
                <View style={heroS.kmDetailItem}>
                    <Text style={[heroS.kmDetailLabel, { color: C.accent }]}>DESGASTE EQUIVALENTE</Text>
                    <Text style={[heroS.kmDetailValue, { color: C.white }]}>{shoe.km_total_equivalente?.toFixed(1)} km</Text>
                </View>
                <View style={heroS.kmDetailItem}>
                    <Text style={heroS.kmDetailLabel}>DISTÂNCIA REAL</Text>
                    <Text style={heroS.kmDetailValue}>{shoe.km_total_real.toFixed(1)} km</Text>
                </View>
            </View>

            <Text style={heroS.structuralDesc}>
                {shoe.integridade_estrutural_info?.status}
            </Text>

            {shoe.percepcao_amortecimento_info && (
                <View style={[heroS.perceptionBox, shoe.percepcao_amortecimento_info.alerta && heroS.perceptionAlert]}>
                    <Text style={[heroS.perceptionLabel, shoe.percepcao_amortecimento_info.alerta && { color: C.accent }]}>
                        {shoe.percepcao_amortecimento_info.alerta ? '⚠️ DIVERGÊNCIA DETECTADA' : 'PERCEPÇÃO DO USUÁRIO'}
                    </Text>
                    <Text style={heroS.perceptionValue}>
                        Sua percepção média: <Text style={{ fontFamily: 'SpaceGrotesk_700Bold' }}>{shoe.percepcao_amortecimento_info.label}</Text>
                    </Text>
                    {shoe.percepcao_amortecimento_info.alerta && (
                        <Text style={heroS.perceptionInsight}>
                            {shoe.percepcao_amortecimento_info.insight}
                        </Text>
                    )}
                </View>
            )}

            <View style={[heroS.recoveryPill, {
                backgroundColor: isReady ? C.greenBg : C.yellowBg,
                borderColor: isReady ? C.borderGreen : C.borderYellow,
                flexDirection: 'column',
                alignItems: 'stretch',
                gap: 8,
                paddingVertical: 12
            }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontSize: 14 }}>{isReady ? '✅' : '🔋'}</Text>
                        <Text style={[heroS.recoveryText, { color: isReady ? C.green : C.yellow }]}>
                            {isReady ? 'Pronto' : 'Descansando'}
                        </Text>
                    </View>
                    {!isStartPlan && !isReady && shoe.descanso_info?.horas > 0 && (
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 10, color: C.yellow, opacity: 0.8 }}>
                            {shoe.descanso_info?.horas}h restantes
                        </Text>
                    )}
                </View>

                {/* Barra de Bateria Visual — apenas PREMIUM */}
                {!isStartPlan && !isReady && (
                    <View style={{ flexDirection: 'row', gap: 2, height: 6 }}>
                        {[...Array(10)].map((_, i) => (
                            <View key={i} style={{
                                flex: 1,
                                borderRadius: 2,
                                backgroundColor: (i * 10) < shoe.descanso_info?.percentual ? C.yellow : 'rgba(255,255,255,0.1)'
                            }} />
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
}

const heroS = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginBottom: 8,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: C.borderAccent,
        backgroundColor: C.surface,
        padding: 22,
        gap: 16,
        overflow: 'hidden',
        position: 'relative',
    },
    bgGlow: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 180,
        height: 180,
        borderRadius: 999,
        opacity: 0.4,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    badge: {
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
    badgeDot: {
        width: 7,
        height: 7,
        borderRadius: 999,
        backgroundColor: C.accent,
    },
    badgeText: {
        fontFamily: 'SpaceGrotesk_500Medium',
        fontSize: 11,
        color: C.accent,
        letterSpacing: 1.2,
    },
    pauseText: {
        fontFamily: 'DMSans_500Medium',
        fontSize: 13,
        color: C.white40,
    },
    nameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    nameGroup: { flex: 1, gap: 4 },
    name: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 24,
        color: C.white,
        letterSpacing: -0.3,
        lineHeight: 28,
    },
    subtitle: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 12,
        color: C.white40,
    },
    kmDetailRow: {
        marginTop: 12,
        gap: 6,
    },
    kmDetailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 2,
    },
    kmDetailLabel: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 10,
        color: C.white40,
        letterSpacing: 1.2,
    },
    kmDetailValue: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 14,
        color: C.white,
    },
    lifeLabel: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 11,
        color: C.white40,
        letterSpacing: 1.5,
    },
    lifeSection: { gap: 7 },
    track: {
        height: 6,
        backgroundColor: C.white15,
        borderRadius: 999,
        overflow: 'hidden',
    },
    fill: { height: '100%', borderRadius: 999 },
    lifeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    lifeLeft: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 12,
        letterSpacing: 0.2,
    },
    lifeKmLeft: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 12,
        color: C.white40,
    },
    structuralSection: {
        marginTop: 12,
        gap: 8,
    },
    structuralTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    structuralTitleGroup: {
        flexDirection: 'column',
    },
    structuralTitle: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 10,
        color: C.white40,
        letterSpacing: 1.2,
    },
    structuralLabel: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 16,
        letterSpacing: -0.2,
        marginTop: -2,
    },
    structuralPercent: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 22,
        letterSpacing: -0.5,
    },
    structuralDesc: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 11,
        color: C.white40,
        lineHeight: 15,
        fontStyle: 'italic',
        marginTop: 4,
    },
    recoveryPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    dot: { width: 8, height: 8, borderRadius: 999 },
    recoveryText: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 13,
        letterSpacing: 0.2,
    },
    perceptionBox: {
        marginTop: 12,
        padding: 14,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    perceptionAlert: {
        backgroundColor: 'rgba(255,184,0,0.05)',
        borderColor: 'rgba(255,184,0,0.2)',
    },
    perceptionLabel: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 10,
        color: C.white40,
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    perceptionValue: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 14,
        color: C.white,
    },
    perceptionInsight: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 11,
        color: C.accent,
        fontStyle: 'italic',
        marginTop: 6,
        lineHeight: 16,
    },
});

// ─── 3. ÚLTIMO TREINO (colapsável) ───────────────────────────
function LastActivityV2({ activity, onAssign, onUpdate, userPlan }) {
    const isPremium = userPlan === 'PREMIUM';
    const [expanded, setExpanded] = useState(false);
    const dateObj = new Date(activity.data);
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const month = months[dateObj.getMonth()];
    const day = dateObj.getDate().toString().padStart(2, '0');

    const noShoe = !activity.shoe;

    return (
        <TouchableOpacity
            style={[actS.card, noShoe && actS.cardNoShoe]}
            onPress={() => setExpanded(e => !e)}
            activeOpacity={0.85}
        >
            <View style={actS.row}>
                <View style={actS.dateBox}>
                    <Text style={actS.month}>{month}</Text>
                    <Text style={actS.day}>{day}</Text>
                </View>
                <View style={actS.info}>
                    <Text style={actS.km}>{activity.distancia.toFixed(1)} km</Text>
                    <Text style={actS.name}>{activity.nome}</Text>
                </View>
                <View style={actS.right}>
                    <Text style={actS.chevron}>{expanded ? '▲' : '▼'}</Text>
                </View>
            </View>

            {expanded && (
                <View style={actS.expanded}>
                    <View style={actS.divider} />
                    <View style={actS.expandRow}>
                        <Text style={actS.expandLabel}>Superfície</Text>
                        <Text style={actS.expandValue}>{activity.terreno || 'ASFALTO'}</Text>
                    </View>
                    <View style={actS.expandRow}>
                        <Text style={actS.expandLabel}>Tênis usado</Text>
                        <TouchableOpacity onPress={() => onAssign(activity)}>
                            <Text style={[actS.expandValue, actS.link]}>
                                {activity.shoe_nome || '⚠️ Selecionar Tênis'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={actS.expandRow}>
                        <Text style={actS.expandLabel}>Descanso</Text>
                        <Text style={actS.expandValue}>
                            {activity.descanso_horas != null ? `${activity.descanso_horas.toFixed(1)}h` : '—'}
                        </Text>
                    </View>

                    {/* Feedback de Amortecimento (Opcional) */}
                    <View style={actS.feedbackBox}>
                        <Text style={actS.feedbackLabel}>Como sentiu o amortecimento?</Text>
                        <View style={actS.feedbackOptions}>
                            {[
                                { val: 1, label: 'Exc', color: C.green },
                                { val: 2, label: 'Norm', color: C.accent },
                                { val: 3, label: 'Firme', color: C.yellow },
                                { val: 4, label: 'Ruim', color: C.red },
                            ].map(opt => (
                                <TouchableOpacity
                                    key={opt.val}
                                    style={[
                                        actS.feedbackItem,
                                        activity.cushioning_perception === opt.val && { borderColor: opt.color, backgroundColor: opt.color + '1A' }
                                    ]}
                                    onPress={() => onUpdate(activity.id, { cushioning_perception: opt.val })}
                                >
                                    <Text style={[
                                        actS.feedbackText,
                                        activity.cushioning_perception === opt.val && { color: opt.color }
                                    ]}>{opt.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Configurações da Sessão (Analytics) */}
                    {(() => {
                        const isIndoor = activity.terreno === 'TREADMILL' || activity.temperature_source === 'indoor';
                        return (
                        <View style={actS.sessionSettings}>
                            <View style={actS.settingItem}>
                                <Text style={actS.settingLabel}>TERRENO</Text>
                                <View style={actS.tagRow}>
                                    {isIndoor ? (
                                        /* Esteira: botão fixo, sem edição */
                                        <View style={[actS.tag, actS.tagActive]}>
                                            <Text style={[actS.tagText, actS.tagTextActive]}>ESTEIRA</Text>
                                        </View>
                                    ) : (
                                        /* Ao ar livre: ASFALTO / TRILHA / MISTO — editável */
                                        ['Road', 'Trail', 'Mixed'].map(t => (
                                            <TouchableOpacity
                                                key={t}
                                                onPress={() => onUpdate(activity.id, { terrain_category: t })}
                                                style={[actS.tag, activity.terrain_category === t && actS.tagActive]}
                                            >
                                                <Text style={[actS.tagText, activity.terrain_category === t && actS.tagTextActive]}>
                                                    {t === 'Road' ? 'ASFALTO' : t === 'Trail' ? 'TRILHA' : 'MISTO'}
                                                </Text>
                                            </TouchableOpacity>
                                        ))
                                    )}
                                </View>
                            </View>
                            <View style={actS.settingItem}>
                                <Text style={actS.settingLabel}>TEMPERATURA</Text>
                                <View style={actS.tempDisplayRow}>
                                    {isIndoor ? (
                                        <Text style={[actS.tempSource, { color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }]}>
                                            Indoor / ambiente controlado
                                        </Text>
                                    ) : (
                                        <>
                                            <Text style={actS.tempValue}>
                                                {activity.temperatura != null ? `${activity.temperatura.toFixed(1)}°C` : '—'}
                                            </Text>
                                            <Text style={actS.tempSource}>
                                                {activity.temperature_source === 'measured'
                                                    ? 'sensor Strava'
                                                    : (activity.temperature_source === 'estimated' || activity.temperature_source === 'open_meteo' || activity.temperature_source === 'weatherapi')
                                                    ? 'via clima 📡'
                                                    : 'indisponível'}
                                            </Text>
                                        </>
                                    )}
                                </View>
                            </View>
                        </View>
                        );
                    })()}

                    {/* Insights Biomecânicos — apenas PREMIUM */}
                    {isPremium && (
                    <View style={actS.insightsBox}>
                        <View style={actS.insightsHeader}>
                            <Text style={actS.insightsTitle}>IMPACTO BIOMECÂNICO</Text>
                            <View style={actS.riskBadge}>
                                <Text style={[actS.riskText, { color: activity.risco_lesao > 70 ? C.red : (activity.risco_lesao > 40 ? C.yellow : C.green) }]}>
                                    RISCO: {activity.risco_lesao}%
                                </Text>
                            </View>
                        </View>
                        {activity.top_insights_data && activity.top_insights_data.length > 0 ? (
                            <View style={actS.insightsList}>
                                {activity.top_insights_data.map((insight, idx) => (
                                    <View key={idx} style={actS.insightItem}>
                                        <Text style={actS.insightFactor}>{insight.fator}</Text>
                                        <Text style={actS.insightValor}>{insight.label}</Text>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            <Text style={actS.insightsEmpty}>Nenhum fator de risco crítico detectado.</Text>
                        )}
                    </View>
                    )}

                    {/* IMPACTO ESTRUTURAL NO TÊNIS */}
                    <View style={actS.structuralBox}>
                        <View style={actS.structuralHeader}>
                            <Text style={actS.structuralTitle}>IMPACTO ESTRUTURAL NO TÊNIS</Text>
                            <Text style={actS.structuralPercent}>
                                +{activity.impacto_estrutural_percentual}%
                            </Text>
                        </View>

                        <View style={actS.kmBreakdown}>
                            <View style={actS.kmItem}>
                                <Text style={actS.kmLabel}>KM REAL</Text>
                                <Text style={actS.kmValue}>{activity.distancia.toFixed(1)} km</Text>
                            </View>
                            <View style={actS.kmItem}>
                                <Text style={[actS.kmLabel, { color: C.accent }]}>KM EQUIVALENTE</Text>
                                <Text style={[actS.kmValue, { color: C.accent }]}>{activity.desgaste_calculado.toFixed(1)} km</Text>
                            </View>
                        </View>

                        <Text style={actS.structuralDesc}>
                            Este treino consumiu {activity.impacto_estrutural_percentual}% da capacidade total da espuma (foi como se o tênis tivesse corrido {activity.desgaste_calculado.toFixed(1)}km em condições ideais).
                        </Text>
                    </View>
                </View>
            )}
        </TouchableOpacity>
    );
}

const actS = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginBottom: 8,
        backgroundColor: C.surface,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: C.border,
        padding: 16,
    },
    cardNoShoe: {
        borderColor: 'rgba(255,184,0,0.3)',
        backgroundColor: 'rgba(255,184,0,0.02)',
    },
    link: {
        color: C.accent,
        textDecorationLine: 'underline',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    dateBox: {
        width: 40,
        alignItems: 'center',
    },
    month: {
        fontFamily: 'DMSans_500Medium',
        fontSize: 10,
        color: C.white40,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    day: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 22,
        color: C.white,
        lineHeight: 26,
    },
    info: { flex: 1, gap: 2 },
    km: {
        fontFamily: 'SpaceGrotesk_500Medium',
        fontSize: 15,
        color: C.white,
    },
    name: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 12,
        color: C.white40,
    },
    right: { alignItems: 'flex-end', gap: 4 },
    pts: {
        fontFamily: 'SpaceGrotesk_500Medium',
        fontSize: 13,
        color: C.accent,
    },
    chevron: {
        fontSize: 10,
        color: C.white40,
    },
    expanded: { gap: 8, marginTop: 4 },
    divider: {
        height: 1,
        backgroundColor: C.border,
        marginBottom: 4,
    },
    expandRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    expandLabel: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 12,
        color: C.white40,
    },
    expandValue: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 12,
        color: C.white70,
    },
    insightsBox: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: C.border,
        gap: 8,
    },
    insightsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    insightsTitle: {
        fontFamily: 'SpaceGrotesk_500Medium',
        fontSize: 10,
        color: C.white40,
        letterSpacing: 1,
    },
    insightsBadge: {
        fontFamily: 'SpaceGrotesk_500Medium',
        fontSize: 9,
        color: C.accent,
        letterSpacing: 0.5,
        backgroundColor: C.accentGlow,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    riskBadge: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    riskText: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 10,
    },
    insightsList: {
        gap: 4,
    },
    insightItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.02)',
        padding: 6,
        borderRadius: 6,
    },
    insightFactor: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 11,
        color: C.white70,
    },
    insightValor: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 11,
        color: C.white,
    },
    insightsEmpty: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 11,
        color: C.white40,
        fontStyle: 'italic',
    },
    // Analytics & Feedback
    feedbackBox: {
        marginTop: 12,
        gap: 8,
    },
    feedbackLabel: {
        fontFamily: 'DMSans_500Medium',
        fontSize: 11,
        color: C.white40,
    },
    feedbackOptions: {
        flexDirection: 'row',
        gap: 8,
    },
    feedbackItem: {
        flex: 1,
        height: 32,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: C.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    feedbackText: {
        fontFamily: 'SpaceGrotesk_500Medium',
        fontSize: 10,
        color: C.white70,
    },
    sessionSettings: {
        marginTop: 12,
        padding: 12,
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderRadius: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.03)',
    },
    settingItem: {
        gap: 8,
    },
    settingLabel: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 9,
        color: C.accent,
        letterSpacing: 1.2,
        marginBottom: 2,
    },
    tagRow: {
        flexDirection: 'row',
        gap: 8,
    },
    tag: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tagActive: {
        backgroundColor: C.accentGlow,
        borderColor: C.accent,
    },
    tagText: {
        fontFamily: 'DMSans_500Medium',
        fontSize: 11,
        color: C.white40,
    },
    tagTextActive: {
        color: C.accent,
        fontFamily: 'DMSans_700Bold',
    },
    tempDisplayRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
        marginTop: 2,
    },
    tempValue: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 20,
        color: C.white,
    },
    tempSource: {
        fontFamily: 'DMSans_500Medium',
        fontSize: 11,
        color: C.white40,
    },
    structuralBox: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: C.border,
        gap: 8,
    },
    kmBreakdown: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.02)',
        padding: 10,
        borderRadius: 12,
        marginBottom: 4,
    },
    kmItem: {
        gap: 2,
    },
    kmLabel: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 8,
        color: C.white40,
        letterSpacing: 1,
    },
    kmValue: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 12,
        color: C.white,
    },
    structuralHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
    },
    structuralTitle: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 9,
        color: C.white40,
        letterSpacing: 1.2,
    },
    structuralPercent: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 16,
        color: C.accent,
        letterSpacing: -0.5,
    },
    structuralDesc: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 10,
        color: C.white40,
        fontStyle: 'italic',
        lineHeight: 14,
    },
});

// ─── 4. CARD DE TÊNIS SECUNDÁRIO ─────────────────────────────
function ShoeCardV2({ shoe, onActivate, onNFC, onDelete }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const lifeColor = getLifeColor(shoe.vida_util_percentual);
    const isReady = shoe.descanso_info?.status === 'Pronto para uso' || shoe.descanso_info?.horas <= 0;
    const isStartPlan = !!shoe.descanso_info?.premium_locked;

    return (
        <View style={cardS.card} >
            <View style={cardS.header}>
                <View style={cardS.nameGroup}>
                    <Text style={cardS.name}>{shoe.nome?.toUpperCase()}</Text>
                    <Text style={cardS.subtitle}>{shoe.marca} · {shoe.modelo}</Text>
                </View>
            </View>

            <View style={cardS.lifeSection}>
                <View style={cardS.structuralTitleRow}>
                    <View style={cardS.structuralTitleGroup}>
                        <Text style={cardS.structuralTitle}>INTEGRIDADE</Text>
                        <Text style={[cardS.structuralLabel, { color: shoe.integridade_estrutural_info?.cor }]}>
                            {shoe.integridade_estrutural_info?.label?.toUpperCase()}
                        </Text>
                    </View>
                    <Text style={[cardS.structuralPercent, { color: shoe.integridade_estrutural_info?.cor }]}>
                        {shoe.integridade_estrutural_info?.percentual}%
                    </Text>
                </View>

                <View style={cardS.track}>
                    <View style={[cardS.fill, {
                        width: `${shoe.integridade_estrutural_info?.percentual}% `,
                        backgroundColor: shoe.integridade_estrutural_info?.cor,
                    }]} />
                </View>

                <View style={cardS.kmDetailStack}>
                    <View style={cardS.kmDetailMain}>
                        <Text style={[cardS.kmDetailLabel, { color: C.accent }]}>EQUIVALENTE</Text>
                        <Text style={[cardS.kmDetailValue, { color: C.white }]}>{shoe.km_total_equivalente?.toFixed(1)} km</Text>
                    </View>
                    <View style={cardS.kmDetailMain}>
                        <Text style={cardS.kmDetailLabel}>REAL</Text>
                        <Text style={cardS.kmDetailValue}>{shoe.km_total_real.toFixed(1)} km</Text>
                    </View>
                </View>

                <Text style={cardS.structuralDesc}>
                    {shoe.integridade_estrutural_info?.status}
                </Text>

                {shoe.percepcao_amortecimento_info && (
                    <View style={[cardS.perceptionBox, shoe.percepcao_amortecimento_info.alerta && cardS.perceptionAlert]}>
                        <Text style={[cardS.perceptionLabel, shoe.percepcao_amortecimento_info.alerta && { color: C.accent }]}>
                            {shoe.percepcao_amortecimento_info.alerta ? '⚠️ DIVERGÊNCIA' : 'PERCEPÇÃO'}
                        </Text>
                        <Text style={cardS.perceptionValue}>{shoe.percepcao_amortecimento_info.label}</Text>
                    </View>
                )}
            </View>

            <View style={[cardS.footer, { flexDirection: 'column', alignItems: 'stretch', gap: 12 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={cardS.recoveryGroup}>
                        <Text style={{ fontSize: 12 }}>{isReady ? '✅' : '🔋'}</Text>
                        <Text style={[cardS.recoveryText, { color: isReady ? C.green : C.yellow }]}>
                            {isReady ? 'Pronto' : 'Descansando'}
                        </Text>
                    </View>
                    {!isStartPlan && !isReady && shoe.descanso_info?.horas > 0 && (
                        <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 9, color: C.yellow, opacity: 0.8 }}>
                            {shoe.descanso_info?.horas}h restantes
                        </Text>
                    )}
                </View>

                {/* Barra de Bateria Visual — apenas PREMIUM */}
                {!isStartPlan && !isReady && (
                    <View style={{ flexDirection: 'row', gap: 2, height: 4, marginBottom: 4 }}>
                        {[...Array(10)].map((_, i) => (
                            <View key={i} style={{
                                flex: 1,
                                borderRadius: 2,
                                backgroundColor: (i * 10) < shoe.descanso_info?.percentual ? C.yellow : 'rgba(255,255,255,0.05)'
                            }} />
                        ))}
                    </View>
                )}

                <View style={[cardS.actions, { marginTop: 0 }]}>
                    <TouchableOpacity
                        style={cardS.btnActivate}
                        onPress={() => onActivate(shoe.id, shoe.ativo)}
                        activeOpacity={0.8}
                    >
                        <Text style={cardS.btnActivateText}>ATIVAR</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={cardS.btnMenu}
                        onPress={() => setMenuOpen(true)}
                        activeOpacity={0.7}
                    >
                        <Text style={cardS.btnMenuText}>⋯</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal
                visible={menuOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setMenuOpen(false)}
            >
                <TouchableOpacity
                    style={menuS.overlay}
                    activeOpacity={1}
                    onPress={() => setMenuOpen(false)}
                >
                    <View style={menuS.sheet}>
                        <Text style={menuS.sheetTitle}>{shoe.nome?.toUpperCase()}</Text>

                        <TouchableOpacity
                            style={menuS.item}
                            onPress={() => { setMenuOpen(false); onNFC(shoe.nfc_url, shoe.nome); }}
                        >
                            <Text style={menuS.itemIcon}>⟐</Text>
                            <Text style={menuS.itemText}>Gravar Tag NFC</Text>
                        </TouchableOpacity>

                        <View style={menuS.divider} />

                        <TouchableOpacity
                            style={menuS.item}
                            onPress={() => { setMenuOpen(false); onDelete(shoe.id); }}
                        >
                            <Text style={[menuS.itemIcon, { color: C.red }]}>✕</Text>
                            <Text style={[menuS.itemText, { color: C.red }]}>Excluir tênis</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View >
    );
}

const cardS = StyleSheet.create({
    card: {
        backgroundColor: C.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: C.border,
        padding: 18,
        marginHorizontal: 16,
        marginBottom: 10,
        gap: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    nameGroup: { flex: 1, gap: 3, paddingRight: 10 },
    name: {
        fontFamily: 'SpaceGrotesk_500Medium',
        fontSize: 17,
        color: C.white,
        letterSpacing: 0.1,
        textTransform: 'capitalize',
    },
    subtitle: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 12,
        color: C.white40,
    },
    lifeLabel: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 10,
        color: C.white40,
        letterSpacing: 1.2,
    },
    kmDetailStack: {
        marginTop: 8,
        gap: 4,
    },
    kmDetailMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    kmDetailLabel: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 9,
        color: C.white40,
        letterSpacing: 1,
    },
    kmDetailValue: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 12,
        color: C.white,
    },
    lifeSection: { gap: 6 },
    track: {
        height: 5,
        backgroundColor: C.white15,
        borderRadius: 999,
        overflow: 'hidden',
    },
    fill: { height: '100%', borderRadius: 999 },
    lifeDetail: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 11,
    },
    structuralSection: {
        marginTop: 10,
        gap: 6,
    },
    structuralTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    structuralTitleGroup: {
        flexDirection: 'column',
    },
    structuralTitle: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 9,
        color: C.white40,
        letterSpacing: 1,
    },
    structuralLabel: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 14,
        letterSpacing: -0.1,
        marginTop: -1,
    },
    structuralPercent: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 18,
        letterSpacing: -0.4,
    },
    structuralDesc: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 10,
        color: C.white40,
        lineHeight: 14,
        fontStyle: 'italic',
        marginTop: 2,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    recoveryGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    dot: { width: 7, height: 7, borderRadius: 999 },
    recoveryText: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 12,
        letterSpacing: 0.1,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    btnActivate: {
        backgroundColor: C.accent,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
    },
    btnActivateText: {
        fontFamily: 'SpaceGrotesk_500Medium',
        fontSize: 11,
        color: C.white,
        letterSpacing: 0.9,
    },
    btnMenu: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: C.surfaceHigh,
        borderWidth: 1,
        borderColor: C.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnMenuText: {
        fontSize: 16,
        color: C.white40,
        letterSpacing: 2,
    },
    perceptionBox: {
        marginTop: 10,
        padding: 10,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    perceptionAlert: {
        backgroundColor: 'rgba(255,184,0,0.05)',
        borderColor: 'rgba(255,184,0,0.2)',
    },
    perceptionLabel: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 8,
        color: C.white40,
        letterSpacing: 1.2,
        marginBottom: 2,
    },
    perceptionValue: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 12,
        color: C.white,
    },
});

const menuS = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: C.surfaceHigh,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        borderColor: C.border,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        gap: 4,
    },
    sheetTitle: {
        fontFamily: 'SpaceGrotesk_500Medium',
        fontSize: 15,
        color: C.white40,
        letterSpacing: 0.5,
        marginBottom: 12,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 14,
    },
    itemIcon: {
        fontSize: 18,
        color: C.white70,
        width: 22,
        textAlign: 'center',
    },
    itemText: {
        fontFamily: 'DMSans_500Medium',
        fontSize: 15,
        color: C.white70,
    },
    divider: {
        height: 1,
        backgroundColor: C.border,
    },
});

// ─── 5. STRAVA (compacto) ─────────────────────────────────────
function StravaCardV2({ lastSync, onSync, onDisconnect, connected, syncing }) {
    return (
        <View style={stravaS.card}>
            <View style={stravaS.left}>
                <View style={[stravaS.icon, { borderColor: connected ? C.strava : C.border }]}>
                    <Text style={[stravaS.iconText, { color: connected ? C.strava : C.white40 }]}>↑</Text>
                </View>
                <View>
                    <Text style={stravaS.title}>{connected ? 'Strava Conectado' : 'Conectar Strava'}</Text>
                    <Text style={stravaS.sync}>{connected ? `Sync: ${lastSync} ` : 'Sincronize suas atividades'}</Text>
                </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={stravaS.btn} onPress={onSync} activeOpacity={0.8} disabled={syncing}>
                    <Text style={stravaS.btnText}>{syncing ? '...' : connected ? 'SINCRONIZAR' : 'CONECTAR'}</Text>
                </TouchableOpacity>
                {connected && (
                    <TouchableOpacity style={[stravaS.btn, { borderColor: 'rgba(239,68,68,0.3)' }]} onPress={onDisconnect} activeOpacity={0.8}>
                        <Text style={[stravaS.btnText, { color: 'rgba(239,68,68,0.7)' }]}>SAIR</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const stravaS = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginBottom: 8,
        backgroundColor: C.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: C.border,
        padding: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    icon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(252,76,2,0.12)',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: { fontSize: 17, fontWeight: '700' },
    title: {
        fontFamily: 'DMSans_700Bold',
        fontSize: 13,
        color: C.white,
    },
    sync: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 11,
        color: C.white40,
        marginTop: 1,
    },
    btn: {
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    btnText: {
        fontFamily: 'SpaceGrotesk_500Medium',
        fontSize: 10,
        color: C.white40,
        letterSpacing: 0.8,
    },
});

// ─── 6. VELARIS COACH (colapsável) ────────────────────────────────
function ShoeCoachCardV2({ message, onUnlock }) {
    const [expanded, setExpanded] = useState(false);
    const isLocked = message && message.includes('Upgrade');

    if (isLocked) {
        return (
            <TouchableOpacity style={coachS.card} activeOpacity={0.8} onPress={onUnlock}>
                <View style={coachS.header}>
                    <View style={coachS.iconWrapper}>
                        <Text style={coachS.iconText}>🔒</Text>
                    </View>
                    <View style={coachS.titleGroup}>
                        <Text style={coachS.label}>VELARIS COACH</Text>
                        <Text style={coachS.sublabel}>Inteligência Biomecânica</Text>
                    </View>
                    <View style={[coachS.aiBadge, { borderColor: 'rgba(255,184,0,0.3)', backgroundColor: 'rgba(255,184,0,0.08)' }]}>
                        <Text style={[coachS.aiBadgeText, { color: C.yellow }]}>PREMIUM</Text>
                    </View>
                </View>
                <View style={coachS.divider} />
                <Text style={[coachS.message, { color: C.white40, fontStyle: 'italic' }]}>
                    Análises biomecânicas personalizadas disponíveis no plano Premium.
                </Text>
                <Text style={[coachS.toggle, { color: C.yellow, marginTop: 4 }]}>Toque para desbloquear ▲</Text>
            </TouchableOpacity>
        );
    }

    const preview = message.length > 60 ? message.slice(0, 60) + '...' : message;

    return (
        <View style={coachS.card}>
            <View style={coachS.header}>
                <View style={coachS.iconWrapper}>
                    <Text style={coachS.iconText}>⬡</Text>
                </View>
                <View style={coachS.titleGroup}>
                    <Text style={coachS.label}>VELARIS COACH</Text>
                    <Text style={coachS.sublabel}>Inteligência Biomecânica</Text>
                </View>
                <View style={coachS.aiBadge}>
                    <Text style={coachS.aiBadgeText}>AI</Text>
                </View>
            </View>

            <View style={coachS.divider} />

            <Text style={coachS.message}>
                "{expanded ? message : preview}"
            </Text>

            {message.length > 60 && (
                <TouchableOpacity onPress={() => setExpanded(e => !e)} activeOpacity={0.7}>
                    <Text style={coachS.toggle}>
                        {expanded ? 'Ver menos ▲' : 'Ver mais ▼'}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const coachS = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginBottom: 8,
        backgroundColor: C.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: C.borderAccent,
        padding: 16,
        gap: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    iconWrapper: {
        width: 34,
        height: 34,
        borderRadius: 9,
        backgroundColor: C.accentGlow,
        borderWidth: 1,
        borderColor: C.borderAccent,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconText: { fontSize: 15, color: C.accent },
    titleGroup: { flex: 1, gap: 1 },
    label: {
        fontFamily: 'SpaceGrotesk_500Medium',
        fontSize: 12,
        color: C.accent,
        letterSpacing: 1.4,
    },
    sublabel: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 11,
        color: C.white40,
    },
    aiBadge: {
        backgroundColor: C.accentGlow,
        borderWidth: 1,
        borderColor: C.borderAccent,
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    aiBadgeText: {
        fontFamily: 'SpaceGrotesk_500Medium',
        fontSize: 10,
        color: C.accent,
        letterSpacing: 1,
    },
    divider: { height: 1, backgroundColor: C.border },
    message: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 13,
        color: C.white70,
        lineHeight: 20,
        fontStyle: 'italic',
    },
    toggle: {
        fontFamily: 'DMSans_500Medium',
        fontSize: 12,
        color: C.accent,
        letterSpacing: 0.3,
    },
});

// ─── SEÇÃO LABEL ─────────────────────────────────────────────
function SectionLabel({ title, action, onAction }) {
    return (
        <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>{title}</Text>
            {action && (
                <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
                    <Text style={s.sectionAction}>{action}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

// ─── TELA PRINCIPAL ───────────────────────────────────────────
export default function HomeScreen({ navigation }) {
    const [shoes, setShoes] = useState([]);
    const [insights, setInsights] = useState('Carregando insights...');
    const [stravaConnected, setStravaConnected] = useState(false);
    const [lastSync, setLastSync] = useState(null);
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [userPlan, setUserPlan] = useState('START');
    const [userName, setUserName] = useState('Usuário');
    const [pricingVisible, setPricingVisible] = useState(false);
    const [activeFilter, setActiveFilter] = useState('ALL');

    const [selectionVisible, setSelectionVisible] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);

    // Insight Velaris do Treino
    const [insightVisible, setInsightVisible] = useState(false);
    const [insightData, setInsightData] = useState(null);

    // Deep Linking Listener para NFC
    const url = Linking.useURL();

    const redirectUri = makeRedirectUri({ scheme: 'velaris' });
    console.log('[AuthSession] Redirect URI:', redirectUri);

    const [request, responseAuth, promptAsync] = useAuthRequest(
        {
            clientId: '204263',
            extraParams: {
                scope: 'read,activity:read_all'
            },
            redirectUri: redirectUri,
        },
        stravaDiscovery
    );

    const exchangingCode = useRef(false);

    useEffect(() => {
        if (responseAuth?.type === 'success' && !exchangingCode.current) {
            const { code } = responseAuth.params;
            exchangingCode.current = true;
            handleStravaExchange(code, redirectUri);
        } else if (responseAuth?.type === 'error') {
            Alert.alert('Erro', 'Não foi possível autorizar o Strava.');
        }
    }, [responseAuth]);

    const handleStravaExchange = async (code, uri) => {
        try {
            setLoading(true);
            await exchangeStravaCode(code, uri);
            Alert.alert('Sucesso', 'Strava conectado e sincronizado com sucesso!');
            fetchDashboard(); // Recarrega o app
        } catch (error) {
            console.log('Erro detalhado no Strava Exchange:', error.response?.data);
            const detailMsg = JSON.stringify(error.response?.data?.details || error.response?.data || {}, null, 2);
            Alert.alert('Erro no Strava', detailMsg);
            exchangingCode.current = false; // Permite tentar de novo se falhar
            setLoading(false);
        }
    };

    const fetchDashboard = async () => {
        setFetchError(false);
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (!token) {
                navigation.replace('Welcome');
                return;
            }
            const authHeader = { Authorization: `Token ${token}` };

            const response = await api.get('/api/shoes/', { headers: authHeader });
            const {
                shoes,
                insights: coachInsights,
                strava_connected,
                strava_last_sync,
                recent_activities,
                user_plan,
                new_activity_insight,
            } = response.data ?? {};

            setShoes(shoes ?? []);
            setInsights(coachInsights || 'Bora correr hoje? Seus equipamentos estão prontos.');
            setStravaConnected(!!strava_connected);
            setLastSync(strava_last_sync ?? null);
            setRecentActivities(recent_activities ?? []);
            setUserPlan(user_plan || 'START');

            // Perfil em paralelo — falha silenciosa não quebra o dashboard
            try {
                const profileRes = await api.get('/api/perfil/', { headers: authHeader });
                setUserName(profileRes.data?.nome || 'Atleta');
            } catch {
                setUserName('Atleta');
            }

            if (new_activity_insight && !insightData) {
                setInsightData(new_activity_insight);
                setInsightVisible(true);
            }
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            setFetchError(true);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboard();

        // Solicita permissão e registra token de push
        (async () => {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                console.log('[Push] Permissão de notificação negada');
                return;
            }
            try {
                const projectId = '433e1ef0-0362-49bc-bd74-7808a3e3fa10';
                const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });
                await updateExpoPushToken(expoPushToken);
                console.log('[Push] Token salvo no backend com sucesso');
            } catch (e) {
                console.log('[Push] Erro ao registrar token:', e?.message);
            }
        })();
    }, []);

    // ─── LÓGICA DE DEEP LINK (NFC) ─────────────────────────────
    useEffect(() => {
        if (url) {
            handleDeepLink(url);
        }
    }, [url]);

    const handleDeepLink = async (initialUrl) => {
        const { hostname, path, queryParams } = Linking.parse(initialUrl);
        console.log('[DeepLink] Abrindo via link:', hostname, path);

        // Formato esperado: velaris://activate/UUID
        if (path && path.includes('activate/')) {
            const shoeUuid = path.split('activate/')[1];
            if (shoeUuid) {
                try {
                    setLoading(true);
                    const result = await activateShoeByUUID(shoeUuid);

                    // 1. Feedback Tátil (Vibração de Sucesso)
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                    // 2. Notificação Local
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: "👟 Tênis Ativado!",
                            body: `${result.nome} está pronto para o treino.`,
                            sound: true,
                        },
                        trigger: null, // Imediato
                    });

                    // 3. Atualizar Dashboard
                    fetchDashboard();
                } catch (error) {
                    console.error('[DeepLink] Erro ao ativar via link:', error);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    Alert.alert('Erro', 'Não foi possível ativar o tênis via NFC.');
                } finally {
                    setLoading(false);
                }
            }
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboard();
    };

    const [syncing, setSyncing] = useState(false);

    const handleStravaSync = async () => {
        setSyncing(true);
        try {
            const result = await triggerStravaSync();
            if (result?.success) {
                Alert.alert('Sincronização iniciada', 'Seus treinos serão importados em instantes.');
            } else {
                Alert.alert('Aviso', result?.message || 'Sincronização já em andamento.');
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível sincronizar. Verifique sua conexão.');
        } finally {
            setSyncing(false);
            fetchDashboard();
        }
    };

    const handleStravaDisconnect = () => {
        Alert.alert(
            'Desconectar Strava',
            'Seus treinos existentes serão mantidos, mas novos treinos não serão importados automaticamente.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Desconectar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await disconnectStrava();
                            setStravaConnected(false);
                            Alert.alert('Strava desconectado', 'Você pode reconectar a qualquer momento.');
                        } catch {
                            Alert.alert('Erro', 'Não foi possível desconectar. Tente novamente.');
                        }
                    },
                },
            ]
        );
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            await api.patch(`/api/shoes/${id}/`, { ativo: !currentStatus }, {
                headers: { Authorization: `Token ${token}` }
            });
            fetchDashboard();
        } catch (error) {
            console.error('Error toggling status:', error);
            Alert.alert('Erro', 'Não foi possível alterar o status do tênis.');
        }
    };

    const handleNFCPress = async (url, shoeName) => {
        if (!url) {
            Alert.alert('Funcionalidade Premium', 'A ativação via NFC está disponível apenas para membros Premium.');
            return;
        }

        // Feedback tátil ao clicar para copiar
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        await Clipboard.setStringAsync(url);
        Alert.alert(
            'Link de Ativação Copiado!',
            `O código do ${shoeName} está na sua área de transferência.\n\n` +
            `🔗 ${url}\n\n` +
            `Use um app de gravação NFC (como 'NFC Tools') para gravar este link na sua Tag!`
        );
    };

    const deleteShoe = (id) => {
        Alert.alert('Excluir', 'Confirmar exclusão?', [
            { text: 'Não' },
            {
                text: 'Sim', onPress: async () => {
                    const token = await AsyncStorage.getItem('userToken');
                    await api.delete(`/api/shoes/${id}/`, { headers: { Authorization: `Token ${token}` } });
                    fetchDashboard();
                }
            }
        ]);
    };

    const handleUpdateActivity = async (activityId, data) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await api.patch(`/api/activities/${activityId}/`, data, {
                headers: { Authorization: `Token ${token}` }
            });
            // Atualiza a lista local e força a atualização do Painel B2B/Tênis (Gauges de Percepção)
            setRecentActivities(prev => prev.map(a => a.id === activityId ? res.data : a));
            fetchDashboard();
        } catch (err) {
            console.error("Erro ao atualizar atividade:", err);
            Alert.alert("Erro", "Não foi possível salvar as alterações da sessão. Verifique sua rede.");
        }
    };

    const handleAssignShoe = async (shoeId) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            await api.patch(`/api/activities/${selectedActivity.id}/`, { shoe: shoeId }, {
                headers: { Authorization: `Token ${token}` }
            });
            setSelectionVisible(false);
            fetchDashboard();
            Alert.alert('Sucesso', 'Tênis vinculado com sucesso!');
        } catch (error) {
            console.error('Error assigning shoe:', error);
            Alert.alert('Erro', 'Não foi possível vincular o tênis.');
        }
    };

    const formatDateCompact = (dateString) => {
        if (!dateString) return 'Nunca';
        const date = new Date(dateString);
        return `${date.getDate()}/${date.getMonth() + 1} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={C.accent} />
            </View>
        );
    }

    if (fetchError) {
        return (
            <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
                <Text style={{ fontSize: 40, marginBottom: 16 }}>⚠️</Text>
                <Text style={{ color: C.white, fontSize: 18, fontFamily: 'Inter_700Bold', textAlign: 'center', marginBottom: 8 }}>
                    Não foi possível carregar
                </Text>
                <Text style={{ color: C.white40, fontSize: 14, textAlign: 'center', marginBottom: 32 }}>
                    Verifique sua conexão e tente novamente.
                </Text>
                <TouchableOpacity
                    onPress={() => { setLoading(true); fetchDashboard(); }}
                    style={{ backgroundColor: C.accent, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 }}
                >
                    <Text style={{ color: C.white, fontFamily: 'Inter_700Bold', fontSize: 15 }}>Tentar novamente</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const activeShoe = shoes.find(s => s.ativo);

    // Lista Base (na garagem, os não ativos)
    let otherShoes = shoes.filter(s => !s.ativo);

    // Lógica de Filtro dos Status Chips
    if (activeFilter === 'READY') {
        otherShoes = otherShoes.filter(s => s.descanso_info?.status === 'Pronto para uso' || s.descanso_info?.horas <= 0);
    } else if (activeFilter === 'RECOVERING') {
        otherShoes = otherShoes.filter(s => s.descanso_info?.horas > 0);
    } else if (activeFilter === 'ALERT') {
        otherShoes = otherShoes.filter(s => s.vida_util_percentual < 30);
    }

    // Lógica de Ordenação: 
    // 1. Prontos sempre lideram a lista.
    // 2. Desempate: Quem tem MAIOR % de vida util vem primeiro.
    otherShoes.sort((a, b) => {
        const aReady = a.descanso_info?.status === 'Pronto para uso' || a.descanso_info?.horas <= 0;
        const bReady = b.descanso_info?.status === 'Pronto para uso' || b.descanso_info?.horas <= 0;

        if (aReady && !bReady) return -1;
        if (!aReady && bReady) return 1;

        // Se a classe de prontidão for idêntica, a prioridade absoluta é do que tem mais durabilidade
        return b.vida_util_percentual - a.vida_util_percentual;
    });

    const dayStatus = {
        total: shoes.length,
        activeCount: shoes.filter(s => s.ativo).length,
        ready: shoes.filter(s => s.descanso_info?.status === 'Pronto para uso' || s.descanso_info?.horas <= 0).length,
        attention: shoes.filter(s => s.vida_util_percentual < 30).length,
        recovering: shoes.filter(s => s.descanso_info?.horas > 0).length,
    };

    return (
        <SafeAreaView style={s.safe}>
            <ScrollView
                style={s.scroll}
                contentContainerStyle={s.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
            >
                <View style={s.header}>
                    <View>
                        <Text style={s.greeting}>{getGreeting()}, {userName}!</Text>
                        <Text style={s.title}>Velaris</Text>
                    </View>
                    <TouchableOpacity
                        style={s.exitBtn}
                        activeOpacity={0.7}
                        onPress={async () => {
                            await AsyncStorage.removeItem('userToken');
                            navigation.replace('Welcome');
                        }}
                    >
                        <Text style={s.exitIcon}>✕</Text>
                    </TouchableOpacity>
                </View>

                {/* 1. STATUS DO DIA (Pills Actionable) */}
                <StatusBarChip
                    status={dayStatus}
                    activeFilter={activeFilter}
                    onFilter={setActiveFilter}
                />

                {/* 2. TÊNIS ATIVO */}
                <SectionLabel title="Tênis Ativo" />
                {activeShoe ? (
                    <HeroShoeCardV2
                        shoe={activeShoe}
                        onTogglePause={toggleActive}
                        isPaused={false} // Backend status handles active field
                    />
                ) : (
                    <TouchableOpacity
                        onPress={() => {
                            if (otherShoes.length > 0) {
                                Alert.alert('Ativar Tênis', 'Selecione um tênis na lista abaixo e clique em ATIVAR.');
                            } else {
                                navigation.navigate('AddShoe');
                            }
                        }}
                        style={s.emptyHero}
                    >
                        <Text style={s.emptyText}>
                            {otherShoes.length > 0 ? 'Toque para selecionar um tênis' : 'Toque para cadastrar um tênis'}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* 3. ÚLTIMO TREINO */}
                <SectionLabel title="Último Treino" action="Ver histórico" />
                {recentActivities.length > 0 ? (
                    <LastActivityV2
                        activity={recentActivities[0]}
                        userPlan={userPlan}
                        onAssign={(act) => {
                            setSelectedActivity(act);
                            setSelectionVisible(true);
                        }}
                        onUpdate={handleUpdateActivity}
                    />
                ) : (
                    <Text style={[s.emptyText, { marginLeft: 20 }]}>Nenhuma atividade recente</Text>
                )}

                {/* PREMIUM CTA (Only for START plan) */}
                {userPlan === 'START' && (
                    <TouchableOpacity
                        style={[s.premiumCta, { marginTop: 16 }]}
                        activeOpacity={0.8}
                        onPress={() => navigation.navigate('Plans')}
                    >
                        <View style={s.premiumCtaContent}>
                            <Text style={s.premiumCtaIcon}>🚀</Text>
                            <View style={s.premiumCtaTextGroup}>
                                <Text style={s.premiumCtaTitle}>Vá além com o Premium</Text>
                                <Text style={s.premiumCtaDesc}>Acesse os Insights Biomecânicos.</Text>
                            </View>
                        </View>
                        <Text style={s.premiumCtaBtn}>Assinar</Text>
                    </TouchableOpacity>
                )}

                {/* 4. MEUS TÊNIS */}
                <SectionLabel title="Meus Tênis" />
                {otherShoes.map(shoe => (
                    <ShoeCardV2
                        key={shoe.id}
                        shoe={shoe}
                        onActivate={toggleActive}
                        onNFC={handleNFCPress}
                        onDelete={deleteShoe}
                    />
                ))}

                {/* 5. STRAVA */}
                <StravaCardV2
                    lastSync={formatDateCompact(lastSync)}
                    onSync={() => {
                        if (stravaConnected) {
                            handleStravaSync();
                        } else {
                            promptAsync();
                        }
                    }}
                    onDisconnect={handleStravaDisconnect}
                    connected={stravaConnected}
                    syncing={syncing}
                />

                {/* 6. COACH */}
                <SectionLabel title="Velaris Coach AI" />
                <ShoeCoachCardV2
                    message={insights}
                    onUnlock={() => setPricingVisible(true)}
                />

                <View style={{ height: 120 }} />
            </ScrollView>

            <TouchableOpacity
                style={s.fab}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('AddShoe')}
            >
                <Text style={s.fabIcon}>+</Text>
            </TouchableOpacity>

            <PricingModal
                visible={pricingVisible}
                onClose={() => setPricingVisible(false)}
                onUpgrade={() => setPricingVisible(false)}
            />

            <ShoeSelectionModal
                visible={selectionVisible}
                onClose={() => setSelectionVisible(false)}
                shoes={shoes}
                activityName={selectedActivity?.nome}
                onSelect={handleAssignShoe}
            />

            {/* MODAL INSIGHT VELARIS DO TREINO */}
            <Modal
                visible={insightVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setInsightVisible(false)}
            >
                <View style={modalS.overlay}>
                    <View style={modalS.container}>
                        <View style={modalS.header}>
                            <Text style={modalS.headerIcon}>💡</Text>
                            <TouchableOpacity onPress={() => setInsightVisible(false)} style={modalS.closeBtn}>
                                <Text style={modalS.closeText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={modalS.content}>
                            <Text style={modalS.label}>INSIGHT VELARIS DO TREINO</Text>
                            <Text style={modalS.impactTitle}>IMPACTO: {insightData?.impacto?.toUpperCase()}</Text>

                            <Text style={modalS.insightText}>
                                "{insightData?.texto}"
                            </Text>

                            <View style={modalS.metricBox}>
                                <View style={modalS.metricHeader}>
                                    <Text style={modalS.metricLabel}>CONSUMO ESTRUTURAL</Text>
                                    <Text style={modalS.metricValue}>+{insightData?.consumo}%</Text>
                                </View>
                                <View style={modalS.track}>
                                    <View style={[modalS.fill, { width: `${insightData?.consumo}%` }]} />
                                </View>
                            </View>

                            <TouchableOpacity
                                style={modalS.mainBtn}
                                onPress={() => setInsightVisible(false)}
                            >
                                <Text style={modalS.mainBtnText}>ENTENDIDO</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    scroll: { flex: 1 },
    content: { paddingTop: 8 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 16,
    },
    greeting: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 13,
        color: C.white40,
        marginBottom: 2,
    },
    title: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 32,
        color: C.white,
        letterSpacing: -0.5,
        lineHeight: 36,
    },
    exitBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: C.surfaceHigh,
        borderWidth: 1,
        borderColor: C.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    exitIcon: { fontSize: 16, color: C.white40 },
    sectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
        marginTop: 6,
    },
    sectionTitle: {
        fontFamily: 'SpaceGrotesk_500Medium',
        fontSize: 11,
        color: C.white40,
        letterSpacing: 1.6,
        textTransform: 'uppercase',
    },
    sectionAction: {
        fontFamily: 'DMSans_500Medium',
        fontSize: 13,
        color: C.accent,
    },
    emptyHero: {
        marginHorizontal: 16,
        padding: 40,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: C.border,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyText: {
        fontFamily: 'DMSans_400Regular',
        color: C.white40,
        fontSize: 13,
    },
    fab: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 100 : 80,
        right: 20,
        width: 50,
        height: 50,
        borderRadius: 999,
        backgroundColor: C.accent,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: C.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    fabIcon: {
        fontSize: 26,
        color: C.white,
        lineHeight: 30,
        fontWeight: '300',
    },
    premiumCta: {
        marginTop: 12,
        marginHorizontal: 16,
        marginBottom: 24,
        backgroundColor: C.accentGlow,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: C.borderAccent,
    },
    premiumCtaContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    premiumCtaIcon: {
        fontSize: 24,
    },
    premiumCtaTextGroup: {
        flex: 1,
    },
    premiumCtaTitle: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 13,
        color: C.accent,
        marginBottom: 2,
    },
    premiumCtaDesc: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 11,
        color: C.white70,
    },
    premiumCtaBtn: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 12,
        color: C.bg,
        backgroundColor: C.accent,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 8,
        overflow: 'hidden',
    }
});

const modalS = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    container: {
        width: '100%',
        backgroundColor: C.surface,
        borderRadius: 32,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: C.borderAccent,
        shadowColor: C.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    header: {
        height: 100,
        backgroundColor: C.accentGlow,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    headerIcon: {
        fontSize: 48,
    },
    closeBtn: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeText: {
        color: C.white,
        fontSize: 14,
    },
    content: {
        padding: 24,
        alignItems: 'center',
    },
    label: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 10,
        color: C.accent,
        letterSpacing: 2,
        marginBottom: 8,
    },
    impactTitle: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 22,
        color: C.white,
        fontStyle: 'italic',
        marginBottom: 20,
    },
    insightText: {
        fontFamily: 'DMSans_400Regular',
        fontSize: 15,
        color: C.white70,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    metricBox: {
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 20,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: C.border,
    },
    metricHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    metricLabel: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 9,
        color: C.white40,
        letterSpacing: 1,
    },
    metricValue: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 12,
        color: C.yellow,
    },
    track: {
        height: 4,
        backgroundColor: C.white15,
        borderRadius: 2,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        backgroundColor: C.yellow,
        borderRadius: 2,
    },
    mainBtn: {
        width: '100%',
        height: 56,
        backgroundColor: C.accent,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: C.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    mainBtnText: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 14,
        color: C.bg,
        letterSpacing: 1.5,
    }
});
