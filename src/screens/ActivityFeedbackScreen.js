import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const C = {
    bg: '#0D1117',
    surface: '#161B26',
    surfaceHigh: '#1E2535',
    border: 'rgba(255,255,255,0.07)',
    white: '#FFFFFF',
    white70: 'rgba(255,255,255,0.70)',
    white40: 'rgba(255,255,255,0.40)',
    accent: '#4D9EFF',
    green: '#00E096',
    yellow: '#FFB800',
    red: '#FF4D4D',
};

const OPTIONS = [
    { val: 1, label: 'Muito confortável', emoji: '😊', color: C.green },
    { val: 2, label: 'Normal',            emoji: '👍', color: C.accent },
    { val: 3, label: 'Mais firme',        emoji: '😐', color: C.yellow },
    { val: 4, label: 'Desconfortável',    emoji: '😣', color: C.red },
];

export default function ActivityFeedbackScreen({ navigation, route }) {
    const { activityId } = route?.params ?? {};

    const [selected, setSelected]   = useState(null);
    const [saved, setSaved]         = useState(false);
    const [loading, setLoading]     = useState(false);
    const [alreadySet, setAlreadySet] = useState(false);

    // Carrega feedback já existente (se houver)
    useEffect(() => {
        if (!activityId) return;
        (async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const res = await api.get(`/api/activities/${activityId}/`, {
                    headers: { Authorization: `Token ${token}` },
                });
                const existing = res.data?.cushioning_perception;
                if (existing != null) {
                    setSelected(existing);
                    setAlreadySet(true);
                    setSaved(true);
                }
            } catch (e) {
                console.log('[Feedback] Erro ao carregar activity:', e?.message);
            }
        })();
    }, [activityId]);

    const handleSelect = async (val) => {
        if (alreadySet) return; // já respondido — bloqueia re-envio
        setSelected(val);
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            await api.patch(
                `/api/activities/${activityId}/`,
                { cushioning_perception: val },
                { headers: { Authorization: `Token ${token}` } },
            );
            console.log('[Feedback] feedback_submitted', { activityId, val });
            setSaved(true);
            setAlreadySet(true);
            // Volta automaticamente após 1.2s
            setTimeout(() => navigation.goBack(), 1200);
        } catch (e) {
            console.log('[Feedback] Erro ao salvar:', e?.message);
            setSelected(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={s.safe}>
            <View style={s.container}>

                {/* Header */}
                <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={s.backText}>← Voltar</Text>
                </TouchableOpacity>

                <Text style={s.title}>Como estava o conforto{'\n'}do seu tênis?</Text>
                <Text style={s.subtitle}>
                    {alreadySet
                        ? 'Você já avaliou este treino.'
                        : 'Toque em uma opção — 1 clique, sem mais passos.'}
                </Text>

                {/* Opções */}
                <View style={s.options}>
                    {OPTIONS.map(opt => {
                        const isSelected = selected === opt.val;
                        return (
                            <TouchableOpacity
                                key={opt.val}
                                style={[
                                    s.optionBtn,
                                    isSelected && { borderColor: opt.color, backgroundColor: opt.color + '18' },
                                    alreadySet && !isSelected && s.optionDimmed,
                                ]}
                                onPress={() => handleSelect(opt.val)}
                                activeOpacity={alreadySet ? 1 : 0.7}
                            >
                                <Text style={s.optionEmoji}>{opt.emoji}</Text>
                                <Text style={[s.optionLabel, isSelected && { color: opt.color }]}>
                                    {opt.label}
                                </Text>
                                {isSelected && <Text style={[s.checkMark, { color: opt.color }]}>✓</Text>}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Feedback visual pós-salvamento */}
                {saved && (
                    <View style={s.savedBanner}>
                        {loading
                            ? <ActivityIndicator size="small" color={C.accent} />
                            : <Text style={s.savedText}>✓ Avaliação salva</Text>
                        }
                    </View>
                )}

            </View>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: C.bg,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    backBtn: {
        marginBottom: 24,
    },
    backText: {
        color: C.accent,
        fontSize: 14,
        fontWeight: '600',
    },
    title: {
        color: C.white,
        fontSize: 22,
        fontWeight: '800',
        lineHeight: 30,
        marginBottom: 8,
    },
    subtitle: {
        color: C.white40,
        fontSize: 13,
        marginBottom: 32,
    },
    options: {
        gap: 12,
    },
    optionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.surface,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 14,
        paddingVertical: 18,
        paddingHorizontal: 20,
        gap: 14,
    },
    optionDimmed: {
        opacity: 0.4,
    },
    optionEmoji: {
        fontSize: 22,
    },
    optionLabel: {
        flex: 1,
        color: C.white70,
        fontSize: 16,
        fontWeight: '600',
    },
    checkMark: {
        fontSize: 18,
        fontWeight: '800',
    },
    savedBanner: {
        marginTop: 32,
        alignItems: 'center',
    },
    savedText: {
        color: C.green,
        fontSize: 15,
        fontWeight: '700',
    },
});
