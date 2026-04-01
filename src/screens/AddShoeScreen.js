import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform, ScrollView, Alert, ActivityIndicator, Modal, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const CATEGORIAS = [
    { label: 'Treino Diário', value: 'DAILY' },
    { label: 'Leve / Tempo Run', value: 'TEMPO' },
    { label: 'Prova / Racing', value: 'RACING' },
    { label: 'Trilha', value: 'TRAIL' },
];

const ESPUMAS = [
    { label: 'EVA Tradicional (Padrão)', value: 'EVA', suggest: '600' },
    { label: 'EVA Supercritical (SC EVA)', value: 'SC_EVA', suggest: '500' },
    { label: 'EVA + TPU Blend', value: 'BLEND', suggest: '600' },
    { label: 'TPU Expandido (Boost-like)', value: 'TPU', suggest: '800' },
    { label: 'PEBA', value: 'PEBA', suggest: '400' },
];

function translateFoam(foamValue) {
    const found = ESPUMAS.find(e => e.value === foamValue);
    return found ? found.label : foamValue;
}

function Selector({ label, value, options, onSelect, placeholder, disabled }) {
    const [visible, setVisible] = useState(false);
    const selectedOption = options.find(o => o.value === value);

    return (
        <View className="mt-4">
            <Text className="text-slate-400 mb-2 text-xs font-bold uppercase">{label}</Text>
            <TouchableOpacity
                onPress={() => !disabled && setVisible(true)}
                activeOpacity={disabled ? 1 : 0.7}
                className={`bg-slate-900 border border-slate-800 p-4 rounded-xl flex-row justify-between items-center ${disabled ? 'opacity-50' : ''}`}
            >
                <Text style={{ color: value ? '#FFFFFF' : '#475569' }}>
                    {selectedOption ? selectedOption.label : placeholder}
                </Text>
                <Text style={{ color: '#4D9EFF', fontSize: 12 }}>▼</Text>
            </TouchableOpacity>

            <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setVisible(false)}
                    style={s.modalOverlay}
                >
                    <View style={s.modalContent}>
                        <Text style={s.modalTitle}>{label}</Text>
                        <ScrollView>
                            {options.map((opt) => (
                                <TouchableOpacity
                                    key={opt.value}
                                    onPress={() => { onSelect(opt.value); setVisible(false); }}
                                    style={[s.modalItem, value === opt.value && s.modalItemSelected]}
                                >
                                    <Text style={[s.modalItemText, value === opt.value && s.modalItemTextSelected]}>
                                        {opt.label}
                                    </Text>
                                    {value === opt.value && <Text style={{ color: '#4D9EFF' }}>✓</Text>}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

export default function AddShoeScreen({ navigation }) {
    const [nome, setNome] = useState('');
    const [marca, setMarca] = useState('');
    const [modelo, setModelo] = useState('');
    const [categoria, setCategoria] = useState('DAILY');
    const [espuma, setEspuma] = useState('EVA');
    const [vidaUtil, setVidaUtil] = useState('600');
    const [kmInicial, setKmInicial] = useState('0');
    const [loading, setLoading] = useState(false);

    // Dynamic Database State
    const [shoeCatalog, setShoeCatalog] = useState({});
    const [brandsList, setBrandsList] = useState([]);
    const [modelsList, setModelsList] = useState([]);
    const [loadingCatalog, setLoadingCatalog] = useState(true);

    useEffect(() => {
        const fetchCatalog = async () => {
            try {
                const response = await api.get('/api/shoes/predefined/');
                setShoeCatalog(response.data.catalog);

                // Formata as marcas para o Selector
                const brands = Object.keys(response.data.catalog).map(b => ({ label: b, value: b }));
                setBrandsList(brands);
            } catch (error) {
                console.error("Erro ao carregar catálogo de tênis:", error);
            } finally {
                setLoadingCatalog(false);
            }
        };
        fetchCatalog();
    }, []);

    const handleSelectMarca = (selectedMarca) => {
        setMarca(selectedMarca);
        setModelo(''); // reseta modelo

        const modelsForBrand = shoeCatalog[selectedMarca] || [];
        const formattedModels = modelsForBrand.map(m => ({
            label: m.model,
            value: m.model,
            foam: m.foam
        }));
        setModelsList(formattedModels);
    };

    const handleSelectModelo = (selectedModelo) => {
        setModelo(selectedModelo);

        // Auto-preencher espuma baseado no modelo do catálogo
        const selectedModelData = modelsList.find(m => m.value === selectedModelo);
        if (selectedModelData && selectedModelData.foam) {
            handleSelectEspuma(selectedModelData.foam);
            // Default nome para o nome real completo
            if (!nome) {
                setNome(`${marca} ${selectedModelo}`.toUpperCase());
            }
        }
    };

    // Lógica de sugestão de vida útil
    const handleSelectEspuma = (val) => {
        setEspuma(val);
        const opt = ESPUMAS.find(o => o.value === val);
        if (opt) setVidaUtil(opt.suggest);
    };

    const handleAdd = async () => {
        if (!nome || !marca || !modelo) {
            Alert.alert('Erro', 'Por favor, preencha nome, marca e modelo.');
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');

            await api.post('/api/shoes/', {
                nome: nome.toUpperCase(),
                marca,
                modelo,
                categoria,
                espuma,
                vida_util_km: parseFloat(vidaUtil) || 600,
                km_inicial: parseFloat(kmInicial) || 0,
                ativo: true
            }, {
                headers: { Authorization: `Token ${token}` }
            });

            Alert.alert('Sucesso', 'Tênis adicionado com sucesso!');
            navigation.goBack();
        } catch (error) {
            console.error('Error adding shoe:', error);
            const message = error.response?.data?.[0] || error.response?.data?.error || 'Não foi possível adicionar o tênis.';
            Alert.alert('Limite Atingido', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#020617', paddingTop: Platform.OS === 'ios' ? 50 : 30 }}>
            <ScrollView className="p-6">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mb-6">
                    <Text className="text-blue-500 font-bold">← Voltar</Text>
                </TouchableOpacity>

                <Text className="text-white text-3xl font-bold mb-8">Novo Tênis</Text>

                <View className="space-y-4">
                    <View>
                        <Text className="text-slate-400 mb-2 text-xs font-bold uppercase">Apelido do Tênis</Text>
                        <TextInput
                            placeholder="Ex: Meu Tênis de Treino"
                            placeholderTextColor="#475569"
                            value={nome}
                            onChangeText={(val) => setNome(val.toUpperCase())}
                            className="bg-slate-900 border border-slate-800 text-white p-4 rounded-xl"
                            autoCapitalize="characters"
                        />
                    </View>

                    <Selector
                        label="Marca"
                        value={marca}
                        options={brandsList}
                        onSelect={handleSelectMarca}
                        placeholder={loadingCatalog ? "Carregando..." : "Selecione a marca"}
                        disabled={loadingCatalog}
                    />

                    <Selector
                        label="Modelo"
                        value={modelo}
                        options={modelsList}
                        onSelect={handleSelectModelo}
                        placeholder={!marca ? "Selecione uma marca primeiro" : "Selecione o modelo"}
                        disabled={!marca || modelsList.length === 0}
                    />

                    <Selector
                        label="Categoria"
                        value={categoria}
                        options={CATEGORIAS}
                        onSelect={setCategoria}
                        placeholder="Selecione a categoria"
                    />

                    <View className="mt-4">
                        <Text className="text-slate-400 mb-2 text-xs font-bold uppercase">Tipo de Entressola (Espuma)</Text>
                        <View className="bg-slate-900 border border-slate-800 p-4 rounded-xl opacity-50 relative overflow-hidden">
                            <Text className="text-white">{translateFoam(espuma)}</Text>
                            <View className="absolute top-0 right-0 bg-blue-600/20 px-3 py-1 rounded-bl-xl border-b border-l border-blue-500/20">
                                <Text className="text-blue-400 text-[10px] font-bold">AUTO</Text>
                            </View>
                        </View>
                        <Text className="text-slate-500 text-[10px] mt-1 italic">
                            * Definido automaticamente com base no modelo selecionado para manter os cálculos precisos.
                        </Text>
                    </View>

                    <View className="mt-4">
                        <Text className="text-slate-400 mb-2 text-xs font-bold uppercase">Vida Útil Estimada (Km)</Text>
                        <TextInput
                            placeholder="Ex: 600"
                            placeholderTextColor="#475569"
                            keyboardType="numeric"
                            value={vidaUtil}
                            onChangeText={setVidaUtil}
                            className="bg-slate-900 border border-slate-800 text-white p-4 rounded-xl"
                        />
                        <Text className="text-slate-500 text-[10px] mt-1 italic">
                            * Sugerido baseado no tipo de espuma selecionado.
                        </Text>
                    </View>

                    <View className="mt-4">
                        <Text className="text-slate-400 mb-2 text-xs font-bold uppercase">Km Rodados Atuais (Km Inicial)</Text>
                        <TextInput
                            placeholder="Ex: 100"
                            placeholderTextColor="#475569"
                            keyboardType="numeric"
                            value={kmInicial}
                            onChangeText={setKmInicial}
                            className="bg-slate-900 border border-slate-800 text-white p-4 rounded-xl"
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleAdd}
                        disabled={loading}
                        className={`bg-blue-600 p-4 rounded-xl mt-10 mb-10 ${loading ? 'opacity-50' : ''}`}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-center font-bold text-lg">Cadastrar Tênis</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#0F172A',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '70%',
    },
    modalTitle: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalItem: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalItemSelected: {
        backgroundColor: 'rgba(77,158,255,0.05)',
    },
    modalItemText: {
        color: '#94A3B8',
        fontSize: 16,
    },
    modalItemTextSelected: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    }
});
