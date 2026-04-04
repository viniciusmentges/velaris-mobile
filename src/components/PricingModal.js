import React from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';

const C = {
    background: '#080C14',
    card: '#121826',
    cardPremium: '#161C2A',
    accent: '#4D9EFF',
    premium: '#F59E0B',
    premiumGlow: 'rgba(245,158,11,0.12)',
    premiumBorder: 'rgba(245,158,11,0.35)',
    white: '#FFFFFF',
    white60: 'rgba(255,255,255,0.6)',
    white40: 'rgba(255,255,255,0.4)',
    white15: 'rgba(255,255,255,0.07)',
    border: 'rgba(255,255,255,0.09)',
    red: 'rgba(255,80,80,0.85)',
    redBg: 'rgba(255,80,80,0.07)',
    redBorder: 'rgba(255,80,80,0.2)',
};

const CheckItem = ({ text }) => (
    <View style={s.featureRow}>
        <Text style={s.featureCheck}>✓</Text>
        <Text style={s.featureText}>{text}</Text>
    </View>
);

const DimItem = ({ text }) => (
    <View style={s.featureRow}>
        <Text style={[s.featureCheck, { color: C.white15, fontSize: 16 }]}>–</Text>
        <Text style={[s.featureText, { color: C.white40 }]}>{text}</Text>
    </View>
);

const BenefitItem = ({ text }) => (
    <View style={s.benefitRow}>
        <View style={s.benefitDot} />
        <Text style={s.benefitText}>{text}</Text>
    </View>
);

const RiskItem = ({ text }) => (
    <View style={s.riskRow}>
        <Text style={s.riskBullet}>·</Text>
        <Text style={s.riskText}>{text}</Text>
    </View>
);

export default function PricingModal({ visible, onClose, onUpgrade }) {
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={s.overlay}>
                <View style={s.modalContainer}>

                    {/* ── HEADER ── */}
                    <View style={s.header}>
                        <View style={{ flex: 1 }} />
                        <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                            <Text style={s.closeBtnIcon}>×</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={s.scrollContent}
                    >
                        {/* ── HEADLINE ── */}
                        <View style={s.headline}>
                            <Text style={s.headlineTitle}>Corra melhor.{'\n'}Use o tênis certo.</Text>
                            <Text style={s.headlineSub}>
                                O Velaris Premium te mostra exatamente quando usar, descansar e trocar cada tênis.
                            </Text>
                        </View>

                        {/* ── PLANO START ── */}
                        <View style={s.card}>
                            <Text style={s.planLabel}>START</Text>
                            <Text style={s.planTitle}>Essencial</Text>
                            <Text style={s.planPrice}>Grátis</Text>
                            <Text style={s.planDesc}>Para quem quer organizar sua corrida</Text>

                            <View style={s.divider} />

                            <CheckItem text="Até 4 tênis" />
                            <CheckItem text="Controle básico de uso" />
                            <CheckItem text="Status simples (Pronto / Descansando)" />
                            <DimItem text="Coach IA" />
                            <DimItem text="Horas exatas de descanso" />
                            <DimItem text="Insights de desgaste" />

                            <View style={s.currentLabel}>
                                <Text style={s.currentLabelText}>PLANO ATUAL</Text>
                            </View>
                        </View>

                        {/* ── PLANO PREMIUM ── */}
                        <View style={[s.card, s.premiumCard]}>
                            <View style={s.recommendedBadge}>
                                <Text style={s.recommendedBadgeText}>RECOMENDADO</Text>
                            </View>

                            <Text style={[s.planLabel, { color: C.premium }]}>PREMIUM</Text>
                            <Text style={[s.planTitle, { color: C.white }]}>Completo</Text>

                            <View style={s.priceRow}>
                                <Text style={s.premiumPrice}>R$ 19,90</Text>
                                <Text style={s.premiumPeriod}> / mês</Text>
                            </View>
                            <Text style={s.priceTagline}>Menos que um gel por treino</Text>

                            <Text style={s.planDesc}>
                                Para quem quer evoluir com estratégia e evitar desgaste errado
                            </Text>

                            <View style={s.divider} />

                            <CheckItem text="Tênis ilimitados" />
                            <CheckItem text="Inteligência de uso (PST)" />
                            <CheckItem text="Horas exatas de descanso" />
                            <CheckItem text="Bateria de recuperação" />
                            <CheckItem text="Velaris Coach (IA)" />
                            <CheckItem text="Insights de desgaste" />

                            <TouchableOpacity
                                style={s.upgradeBtn}
                                activeOpacity={0.8}
                                onPress={onUpgrade}
                            >
                                <Text style={s.upgradeBtnText}>Quero correr com inteligência</Text>
                            </TouchableOpacity>
                        </View>

                        {/* ── POR QUE PREMIUM ── */}
                        <View style={s.benefitsBox}>
                            <Text style={s.benefitsTitle}>Por que usar o Premium?</Text>
                            <BenefitItem text="Saiba qual tênis usar em cada treino" />
                            <BenefitItem text="Evite correr com o tênis ainda fatigado" />
                            <BenefitItem text="Aumente a vida útil dos seus tênis" />
                            <BenefitItem text="Tenha mais controle e consistência nos treinos" />
                        </View>

                        {/* ── GATILHO DE PERDA ── */}
                        <View style={s.riskBox}>
                            <Text style={s.riskTitle}>Sem o Premium, você pode estar:</Text>
                            <RiskItem text="Usando o tênis errado" />
                            <RiskItem text="Acelerando o desgaste" />
                            <RiskItem text="Correndo com ele ainda fatigado" />
                        </View>

                        <View style={{ height: 32 }} />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.88)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: C.background,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: '90%',
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 4,
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.06)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeBtnIcon: {
        fontSize: 24,
        color: C.white60,
        marginTop: -2,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },

    // ── HEADLINE ──
    headline: {
        marginBottom: 28,
        paddingHorizontal: 4,
    },
    headlineTitle: {
        fontFamily: 'Inter_900Black',
        fontSize: 28,
        color: C.white,
        lineHeight: 34,
        marginBottom: 10,
    },
    headlineSub: {
        fontFamily: 'Inter_400Regular',
        fontSize: 15,
        color: C.white60,
        lineHeight: 22,
    },

    // ── CARDS ──
    card: {
        backgroundColor: C.card,
        borderRadius: 24,
        padding: 24,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: C.border,
    },
    premiumCard: {
        borderColor: C.premiumBorder,
        borderWidth: 2,
        backgroundColor: C.cardPremium,
    },
    recommendedBadge: {
        position: 'absolute',
        top: -12,
        right: 24,
        backgroundColor: C.premium,
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 10,
    },
    recommendedBadgeText: {
        fontFamily: 'Inter_900Black',
        fontSize: 9,
        color: '#000',
        letterSpacing: 0.8,
    },
    planLabel: {
        fontFamily: 'Inter_700Bold',
        fontSize: 11,
        color: C.white40,
        letterSpacing: 2,
        marginBottom: 4,
    },
    planTitle: {
        fontFamily: 'Inter_900Black',
        fontSize: 22,
        color: C.white60,
        marginBottom: 6,
    },
    planPrice: {
        fontFamily: 'Inter_900Black',
        fontSize: 26,
        color: C.white,
        marginBottom: 4,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 2,
    },
    premiumPrice: {
        fontFamily: 'Inter_900Black',
        fontSize: 30,
        color: C.premium,
    },
    premiumPeriod: {
        fontFamily: 'Inter_400Regular',
        fontSize: 15,
        color: C.white40,
        marginBottom: 4,
    },
    priceTagline: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: C.white40,
        fontStyle: 'italic',
        marginBottom: 8,
    },
    planDesc: {
        fontFamily: 'Inter_400Regular',
        fontSize: 13,
        color: C.white40,
        marginBottom: 16,
        lineHeight: 18,
    },
    divider: {
        height: 1,
        backgroundColor: C.border,
        marginBottom: 16,
    },

    // ── FEATURES ──
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 11,
    },
    featureCheck: {
        color: C.accent,
        fontSize: 15,
        fontWeight: 'bold',
        marginRight: 10,
        width: 16,
        textAlign: 'center',
    },
    featureText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: C.white,
        flex: 1,
    },
    currentLabel: {
        backgroundColor: C.white15,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    currentLabelText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 11,
        color: C.white40,
        letterSpacing: 1,
    },

    // ── CTA ──
    upgradeBtn: {
        backgroundColor: C.premium,
        paddingVertical: 17,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: C.premium,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
    upgradeBtnText: {
        fontFamily: 'Inter_900Black',
        fontSize: 15,
        color: '#000',
        letterSpacing: 0.3,
    },

    // ── POR QUE PREMIUM ──
    benefitsBox: {
        backgroundColor: C.card,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: C.border,
    },
    benefitsTitle: {
        fontFamily: 'Inter_700Bold',
        fontSize: 13,
        color: C.white60,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 14,
    },
    benefitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 10,
    },
    benefitDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: C.accent,
    },
    benefitText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: C.white,
        flex: 1,
        lineHeight: 20,
    },

    // ── GATILHO DE PERDA ──
    riskBox: {
        backgroundColor: C.redBg,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: C.redBorder,
    },
    riskTitle: {
        fontFamily: 'Inter_700Bold',
        fontSize: 13,
        color: C.red,
        marginBottom: 12,
        lineHeight: 18,
    },
    riskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    riskBullet: {
        fontSize: 20,
        color: C.red,
        marginTop: -4,
        lineHeight: 20,
    },
    riskText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: 'rgba(255,120,120,0.9)',
        flex: 1,
    },
});
