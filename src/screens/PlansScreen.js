import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Platform, SafeAreaView, ActivityIndicator, Alert,
} from 'react-native';
import { getOfferings, purchasePackage, restorePurchases, getCustomerInfo, hasPremium } from '../services/purchases';
import { ativarPremium } from '../services/api';

const C = {
    bg: '#080C14',
    surface: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.06)',
    white: '#FFFFFF',
    white70: 'rgba(255,255,255,0.7)',
    white40: 'rgba(255,255,255,0.4)',
    accent: '#4D9EFF',
    accentGlow: 'rgba(77,158,255,0.15)',
    borderAccent: 'rgba(77,158,255,0.3)',
    green: '#4ADE80',
};

export default function PlansScreen({ navigation }) {
    const [offering, setOffering]         = useState(null);
    const [loadingOffer, setLoadingOffer] = useState(true);
    const [purchasing, setPurchasing]     = useState(false);
    const [restoring, setRestoring]       = useState(false);
    const [isPremium, setIsPremium]       = useState(false);

    useEffect(() => {
        (async () => {
            // Verifica status atual do usuário
            const info = await getCustomerInfo();
            if (hasPremium(info)) {
                setIsPremium(true);
            }

            // Carrega offerings
            const current = await getOfferings();
            setOffering(current);
            setLoadingOffer(false);
        })();
    }, []);

    const handleSubscribe = async () => {
        if (!offering) {
            Alert.alert('Indisponível', 'Não foi possível carregar os planos. Tente novamente.');
            return;
        }

        // Usa o primeiro package do offering atual (monthly)
        const pkg = offering.availablePackages?.[0];
        if (!pkg) {
            Alert.alert('Indisponível', 'Nenhum plano disponível no momento.');
            return;
        }

        setPurchasing(true);
        const result = await purchasePackage(pkg);
        setPurchasing(false);

        if (result.cancelled) return; // usuário cancelou — sem Alert

        if (result.success) {
            try { await ativarPremium(); } catch (_) {}
            setIsPremium(true);
            Alert.alert('🚀 Bem-vindo ao Premium!', 'Sua assinatura está ativa. Aproveite todos os recursos.', [
                { text: 'OK', onPress: () => navigation.goBack() },
            ]);
        } else {
            // Cobre error !== null e edge case onde SDK não retorna entitlement pós-compra
            Alert.alert('Erro na compra', result.error ?? 'Não foi possível concluir a compra. Tente novamente.');
        }
    };

    const handleRestore = async () => {
        setRestoring(true);
        let info = null;
        try {
            info = await restorePurchases();
        } finally {
            setRestoring(false);
        }

        // null = falha na chamada (rede, SDK indisponível) — não confundir com "sem compras"
        if (info === null) {
            Alert.alert('Erro', 'Não foi possível restaurar as compras. Verifique sua conexão e tente novamente.');
            return;
        }

        if (hasPremium(info)) {
            try { await ativarPremium(); } catch (_) {}
            setIsPremium(true);
            Alert.alert('Compras restauradas', 'Seu plano Premium foi reativado.');
        } else {
            Alert.alert('Nenhuma compra encontrada', 'Não encontramos uma assinatura ativa associada a este Apple ID / Google Account.');
        }
    };

    // Preço dinâmico vindo da loja (obrigatório Apple) ou fallback
    const priceString = offering?.availablePackages?.[0]?.product?.priceString ?? 'R$ 19,90/mês';

    return (
        <SafeAreaView style={s.safe}>
            <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Text style={s.backText}>← Voltar</Text>
                </TouchableOpacity>

                <View style={s.header}>
                    <Text style={s.title}>Escolha seu Laboratório</Text>
                    <Text style={s.subtitle}>
                        Evolua sua performance com dados biomecânicos precisos sobre seu equipamento.
                    </Text>
                </View>

                {/* PLANO START */}
                <View style={s.card}>
                    <View style={s.cardHeader}>
                        <Text style={s.planName}>START</Text>
                        <Text style={s.planPrice}>Grátis</Text>
                    </View>
                    <View style={s.divider} />
                    <View style={s.features}>
                        <Feature label="Garagem Limitada (Máx 4 Tênis)" />
                        <Feature label="Desgaste Base (Somente KM Linear)" />
                        <Feature label="Integração Básica com Strava" />
                        <Feature label="Tempo de Descanso (Desativado)" crossed />
                        <Feature label="Insights Biomecânicos de IA" crossed />
                    </View>
                </View>

                {/* PLANO PREMIUM */}
                <View style={[s.card, s.cardPremium]}>
                    <View style={s.recommendedBadge}>
                        <Text style={s.recommendedText}>RECOMENDADO</Text>
                    </View>
                    <View style={s.cardHeader}>
                        <View>
                            <Text style={[s.planName, { color: C.accent }]}>PREMIUM</Text>
                            {loadingOffer
                                ? <ActivityIndicator size="small" color={C.accent} style={{ marginTop: 4 }} />
                                : <Text style={s.planPrice}>{priceString}</Text>
                            }
                        </View>
                        <Text style={s.icon}>🚀</Text>
                    </View>
                    <View style={[s.divider, { backgroundColor: C.borderAccent }]} />
                    <View style={s.features}>
                        <Feature label="Garagem Ilimitada" premium />
                        <Feature label="Desgaste Biomecânico (Temperatura, Elevação, Peso)" premium />
                        <Feature label="Post-Stress Time (Recuperação Real da Espuma)" premium />
                        <Feature label="Velaris Coach (Inteligência Artificial)" premium />
                        <Feature label="Sincronização Avançada Strava" premium />
                    </View>

                    {isPremium ? (
                        <View style={s.activeBadge}>
                            <Text style={s.activeBadgeText}>✓ Plano Premium ativo</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[s.subscribeBtn, (purchasing || loadingOffer) && s.subscribeBtnDisabled]}
                            activeOpacity={0.8}
                            onPress={handleSubscribe}
                            disabled={purchasing || loadingOffer}
                        >
                            {purchasing
                                ? <ActivityIndicator color={C.bg} />
                                : <Text style={s.subscribeText}>Assinar Premium</Text>
                            }
                        </TouchableOpacity>
                    )}
                </View>

                {/* RESTAURAR COMPRAS (obrigatório Apple) */}
                {!isPremium && (
                    <TouchableOpacity
                        style={s.restoreBtn}
                        onPress={handleRestore}
                        disabled={restoring}
                    >
                        {restoring
                            ? <ActivityIndicator size="small" color={C.white40} />
                            : <Text style={s.restoreText}>Restaurar compras</Text>
                        }
                    </TouchableOpacity>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

function Feature({ label, premium, crossed }) {
    return (
        <View style={s.featureRow}>
            {crossed ? (
                <Text style={[s.featureIcon, { opacity: 0.3 }]}>✕</Text>
            ) : (
                <Text style={[s.featureIcon, premium && { color: C.accent }]}>✓</Text>
            )}
            <Text style={[s.featureText, crossed && s.featureCrossed, premium && s.featureTextPremium]}>
                {label}
            </Text>
        </View>
    );
}

const s = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: C.bg,
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
    },
    content: {
        padding: 24,
        paddingBottom: 60,
    },
    backBtn: {
        marginBottom: 20,
        alignSelf: 'flex-start',
    },
    backText: {
        color: C.white70,
        fontFamily: 'Inter_700Bold',
        fontSize: 14,
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontFamily: 'Inter_900Black',
        fontSize: 28,
        color: C.white,
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: C.white70,
        lineHeight: 22,
    },
    card: {
        backgroundColor: C.surface,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        position: 'relative',
    },
    cardPremium: {
        backgroundColor: C.accentGlow,
        borderColor: C.borderAccent,
        borderWidth: 2,
    },
    recommendedBadge: {
        position: 'absolute',
        top: -12,
        right: 24,
        backgroundColor: C.accent,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    recommendedText: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 10,
        color: C.bg,
        letterSpacing: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    planName: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 16,
        color: C.white70,
        letterSpacing: 1,
        marginBottom: 4,
    },
    planPrice: {
        fontFamily: 'Inter_900Black',
        fontSize: 24,
        color: C.white,
    },
    icon: {
        fontSize: 32,
    },
    divider: {
        height: 1,
        backgroundColor: C.border,
        marginBottom: 20,
    },
    features: {
        gap: 12,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    featureIcon: {
        fontFamily: 'Inter_700Bold',
        fontSize: 14,
        color: C.white70,
        width: 16,
    },
    featureText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 14,
        color: C.white70,
        flex: 1,
        lineHeight: 20,
    },
    featureTextPremium: {
        color: C.white,
    },
    featureCrossed: {
        color: C.white40,
        textDecorationLine: 'line-through',
    },
    subscribeBtn: {
        backgroundColor: C.accent,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
    },
    subscribeBtnDisabled: {
        opacity: 0.5,
    },
    subscribeText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 16,
        color: C.bg,
    },
    activeBadge: {
        marginTop: 24,
        backgroundColor: 'rgba(74,222,128,0.12)',
        borderWidth: 1,
        borderColor: 'rgba(74,222,128,0.3)',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    activeBadgeText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 14,
        color: C.green,
    },
    restoreBtn: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    restoreText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 13,
        color: C.white40,
    },
});
