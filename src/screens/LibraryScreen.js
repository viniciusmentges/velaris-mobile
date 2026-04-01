import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Modal,
    ScrollView,
    Dimensions
} from 'react-native';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const C = {
    bg: '#0D1117',
    surface: '#161B26',
    surfaceHigh: '#1E2535',
    border: 'rgba(255,255,255,0.07)',
    borderAccent: 'rgba(77,158,255,0.22)',
    white: '#FFFFFF',
    white70: 'rgba(255,255,255,0.70)',
    white40: 'rgba(255,255,255,0.40)',
    accent: '#4D9EFF',
    accentGlow: 'rgba(77,158,255,0.12)',
    green: '#00E096',
    yellow: '#FFB800',
};

export default function LibraryScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [models, setModels] = useState([]);
    const [filteredModels, setFilteredModels] = useState([]);
    const [search, setSearch] = useState('');

    const [selectedModel, setSelectedModel] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [modelDetail, setModelDetail] = useState(null);

    useEffect(() => {
        fetchModels();
    }, []);

    const fetchModels = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await api.get('/api/shoes/library/', {
                headers: { Authorization: `Token ${token}` }
            });
            setModels(res.data);
            setFilteredModels(res.data);
        } catch (error) {
            console.error('Error fetching library:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (text) => {
        setSearch(text);
        if (!text) {
            setFilteredModels(models);
            return;
        }
        const filtered = models.filter(m =>
            m.marca.toLowerCase().includes(text.toLowerCase()) ||
            m.modelo.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredModels(filtered);
    };

    const openDetail = async (marca, modelo) => {
        setSelectedModel({ marca, modelo });
        setDetailLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const res = await api.get(`/api/shoes/library/?marca=${marca}&modelo=${modelo}`, {
                headers: { Authorization: `Token ${token}` }
            });
            setModelDetail(res.data);
        } catch (error) {
            console.error('Error fetching model detail:', error);
        } finally {
            setDetailLoading(false);
        }
    };

    const renderModelItem = ({ item }) => (
        <TouchableOpacity
            style={s.card}
            onPress={() => openDetail(item.marca, item.modelo)}
        >
            <View>
                <Text style={s.cardMarca}>{item.marca.toUpperCase()}</Text>
                <Text style={s.cardModelo}>{item.modelo}</Text>
            </View>
            <View style={s.cardBadge}>
                <Text style={s.cardBadgeText}>{item.total} PARES</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={s.safe}>
            <View style={s.header}>
                <Text style={s.title}>Biblioteca</Text>
                <Text style={s.subtitle}>Telemetria Coletiva Velaris</Text>
            </View>

            <View style={s.searchContainer}>
                <TextInput
                    placeholder="Buscar marca ou modelo..."
                    placeholderTextColor={C.white40}
                    style={s.searchInput}
                    value={search}
                    onChangeText={handleSearch}
                />
            </View>

            {loading ? (
                <View style={s.center}>
                    <ActivityIndicator size="large" color={C.accent} />
                </View>
            ) : (
                <FlatList
                    data={filteredModels}
                    renderItem={renderModelItem}
                    keyExtractor={(item) => `${item.marca}-${item.modelo}`}
                    contentContainerStyle={s.list}
                    ListEmptyComponent={
                        <Text style={s.emptyText}>Nenhum modelo encontrado.</Text>
                    }
                />
            )}

            {/* MODAL DE DETALHES */}
            <Modal
                visible={!!selectedModel}
                transparent
                animationType="slide"
                onRequestClose={() => setSelectedModel(null)}
            >
                <View style={s.modalOverlay}>
                    <View style={s.modalContainer}>
                        <View style={s.modalHeader}>
                            <TouchableOpacity onPress={() => setSelectedModel(null)}>
                                <Text style={s.closeText}>Fechar</Text>
                            </TouchableOpacity>
                            <Text style={s.modalTitle}>{selectedModel?.modelo}</Text>
                            <View style={{ width: 40 }} />
                        </View>

                        {detailLoading ? (
                            <View style={s.modalCenter}>
                                <ActivityIndicator color={C.accent} />
                            </View>
                        ) : modelDetail?.calibrado ? (
                            <ScrollView style={s.modalScroll}>
                                <View style={s.statRow}>
                                    <View style={s.statBox}>
                                        <Text style={s.statLabel}>CCI</Text>
                                        <Text style={[s.statValue, { color: C.green }]}>{modelDetail.cci}</Text>
                                    </View>
                                    <View style={s.statBox}>
                                        <Text style={s.statLabel}>KM TOTAL</Text>
                                        <Text style={s.statValue}>{modelDetail.total_km}</Text>
                                    </View>
                                </View>

                                <View style={s.insightBox}>
                                    <Text style={s.insightText}>{modelDetail.insight_firmeza}</Text>
                                </View>

                                <Text style={s.sectionTitle}>Curva de Degradacao</Text>
                                {modelDetail.curva.map((point, i) => (
                                    <View key={i} style={s.curveRow}>
                                        <Text style={s.curveKm}>{point.km}km</Text>
                                        <View style={s.curveTrack}>
                                            <View style={[s.curveFill, { width: `${point.integridade}%`, backgroundColor: point.integridade > 70 ? C.green : C.yellow }]} />
                                        </View>
                                        <Text style={s.curveValue}>{point.integridade}%</Text>
                                    </View>
                                ))}
                                <View style={{ height: 40 }} />
                            </ScrollView>
                        ) : (
                            <View style={s.modalCenter}>
                                <Text style={s.uncalibratedText}>{modelDetail?.mensagem}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: C.bg },
    header: { padding: 20, paddingTop: 10 },
    title: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 28, color: C.white },
    subtitle: { fontFamily: 'DM_Sans_400Regular', fontSize: 13, color: C.white40, marginTop: 2 },
    searchContainer: { paddingHorizontal: 20, marginBottom: 16 },
    searchInput: {
        backgroundColor: C.surface,
        borderRadius: 12,
        padding: 12,
        color: C.white,
        fontFamily: 'DM_Sans_400Regular',
        borderWidth: 1,
        borderColor: C.border
    },
    list: { padding: 20, paddingTop: 0 },
    card: {
        backgroundColor: C.surface,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: C.border
    },
    cardMarca: { fontFamily: 'SpaceGrotesk_500Medium', fontSize: 10, color: C.accent, letterSpacing: 1 },
    cardModelo: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: C.white, marginTop: 2 },
    cardBadge: { backgroundColor: C.accentGlow, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    cardBadgeText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 10, color: C.accent },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: C.white40, textAlign: 'center', marginTop: 40, fontFamily: 'DM_Sans_400Regular' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
    modalContainer: { backgroundColor: C.bg, borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '80%', borderTopWidth: 1, borderTopColor: C.borderAccent },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: C.border },
    closeText: { color: C.accent, fontFamily: 'DM_Sans_700Bold' },
    modalTitle: { color: C.white, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18 },
    modalCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    modalScroll: { padding: 20 },
    statRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    statBox: { flex: 1, backgroundColor: C.surface, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: C.border },
    statLabel: { fontFamily: 'SpaceGrotesk_500Medium', fontSize: 10, color: C.white40, marginBottom: 4 },
    statValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, color: C.white },
    insightBox: { backgroundColor: C.accentGlow, borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: C.borderAccent },
    insightText: { color: C.white, fontFamily: 'DM_Sans_500Medium', fontSize: 13, textAlign: 'center' },
    sectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', color: C.white40, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
    curveRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
    curveKm: { width: 45, color: C.white40, fontSize: 11, fontFamily: 'SpaceGrotesk_500Medium' },
    curveTrack: { flex: 1, height: 4, backgroundColor: C.white15, borderRadius: 2 },
    curveFill: { height: '100%', borderRadius: 2 },
    curveValue: { width: 35, textAlign: 'right', color: C.white, fontSize: 12, fontFamily: 'SpaceGrotesk_700Bold' },
    uncalibratedText: { color: C.white70, textAlign: 'center', fontFamily: 'DM_Sans_400Regular', lineHeight: 20 }
});
