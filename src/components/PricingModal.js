import React from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const COLORS = {
    background: '#080C14',
    card: '#121826',
    accent: '#4D9EFF',
    premium: '#F59E0B',
    white: '#FFFFFF',
    white60: 'rgba(255,255,255,0.6)',
    white40: 'rgba(255,255,255,0.4)',
    border: 'rgba(255,255,255,0.1)',
};

const Feature = ({ text, included = true }) => (
    <View style={s.featureRow}>
        <Text style={[s.featureIcon, !included && { opacity: 0.3 }]}>
            {included ? '✓' : '×'}
        </Text>
        <Text style={[s.featureText, !included && { color: COLORS.white40 }]}>
            {text}
        </Text>
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
                    <View style={s.header}>
                        <Text style={s.headerTitle}>Escolha seu Plano</Text>
                        <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                            <Text style={s.closeBtnIcon}>×</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>
                        {/* PLANO START */}
                        <View style={s.card}>
                            <View style={s.planHeader}>
                                <Text style={s.planName}>Start</Text>
                                <Text style={s.planPrice}>Grátis</Text>
                            </View>
                            <Text style={s.planDesc}>Essencial para começar no corre.</Text>

                            <View style={s.featureList}>
                                <Feature text="Limite de 2 tênis ativos" />
                                <Feature text="Cálculo de KM Linear (Básico)" />
                                <Feature text="Vínculo Manual de Treinos" />
                                <Feature text="Insights via IA" included={false} />
                                <Feature text="Desgaste Inteligente (Peso/Temp)" included={false} />
                                <Feature text="NFC & Automação" included={false} />
                            </View>

                            <View style={s.currentLabel}>
                                <Text style={s.currentLabelText}>PLANO ATUAL</Text>
                            </View>
                        </View>

                        {/* PLANO PREMIUM */}
                        <View style={[s.card, s.premiumCard]}>
                            <View style={s.popularBadge}>
                                <Text style={s.popularBadgeText}>MAIS POPULAR</Text>
                            </View>

                            <View style={s.planHeader}>
                                <View>
                                    <Text style={[s.planName, { color: COLORS.premium }]}>Premium 🚀</Text>
                                    <Text style={s.planPrice}>R$ 19,90 <Text style={s.period}>/mês</Text></Text>
                                </View>
                            </View>
                            <Text style={s.planDesc}>Inteligência total para performance e durabilidade.</Text>

                            <View style={s.featureList}>
                                <Feature text="Tênis Ilimitados" />
                                <Feature text="VELARIS COACH (IA Biomecânica)" />
                                <Feature text="Desgaste Inteligente (PST Real)" />
                                <Feature text="Recovery Time (Tempo de Descanso)" />
                                <Feature text="Automação NFC (Touch & Run)" />
                                <Feature text="Alertas Proativos de Troca" />
                            </View>

                            <TouchableOpacity
                                style={s.upgradeBtn}
                                activeOpacity={0.8}
                                onPress={onUpgrade}
                            >
                                <Text style={s.upgradeBtnText}>QUERO SER PREMIUM</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: '85%',
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        paddingBottom: 16,
    },
    headerTitle: {
        fontFamily: 'Inter_900Black',
        fontSize: 20,
        color: COLORS.white,
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeBtnIcon: {
        fontSize: 24,
        color: COLORS.white60,
        marginTop: -2,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    card: {
        backgroundColor: COLORS.card,
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    premiumCard: {
        borderColor: 'rgba(245,158,11,0.3)',
        borderWidth: 2,
        backgroundColor: '#161C2A',
    },
    popularBadge: {
        position: 'absolute',
        top: -10,
        right: 24,
        backgroundColor: COLORS.premium,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    popularBadgeText: {
        fontFamily: 'Inter_900Black',
        fontSize: 9,
        color: '#000',
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    planName: {
        fontFamily: 'Inter_700Bold',
        fontSize: 14,
        color: COLORS.white60,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    planPrice: {
        fontFamily: 'Inter_900Black',
        fontSize: 28,
        color: COLORS.white,
        marginTop: 4,
    },
    period: {
        fontSize: 14,
        color: COLORS.white40,
        fontFamily: 'Inter_400Regular',
    },
    planDesc: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: COLORS.white40,
        marginBottom: 20,
    },
    featureList: {
        marginBottom: 24,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    featureIcon: {
        color: COLORS.accent,
        fontSize: 18,
        marginRight: 10,
        fontWeight: 'bold',
    },
    featureText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: COLORS.white,
    },
    currentLabel: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    currentLabelText: {
        fontFamily: 'Inter_700Bold',
        fontSize: 12,
        color: COLORS.white40,
    },
    upgradeBtn: {
        backgroundColor: COLORS.premium,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: COLORS.premium,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    upgradeBtnText: {
        fontFamily: 'Inter_900Black',
        fontSize: 14,
        color: '#000',
    }
});
