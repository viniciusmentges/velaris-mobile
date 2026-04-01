import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function OnboardingScreen({ navigation }) {
    const [nome, setNome] = useState('');
    const [peso, setPeso] = useState('');
    const [altura, setAltura] = useState('');
    const [tamanho, setTamanho] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [nascimento, setNascimento] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!nome || !peso || !altura || !tamanho || !whatsapp || !nascimento) {
            Alert.alert('Quase lá!', 'Por favor, preencha todos os campos para uma melhor experiência.');
            return;
        }

        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');

            // Convert DD/MM/YYYY (BR Format) to YYYY-MM-DD (ISO 8601 for Django)
            const partesData = nascimento.split('/');
            let dataFormatada = nascimento;
            if (partesData.length === 3) {
                dataFormatada = `${partesData[2]}-${partesData[1]}-${partesData[0]}`;
            }

            await api.patch('/api/perfil/me/', {
                nome,
                peso: parseFloat(peso.replace(',', '.')),
                altura: parseFloat(altura),
                tamanho_calcado: parseFloat(tamanho),
                telefone: whatsapp,
                data_nascimento: dataFormatada,
                aceita_termos: true
            }, {
                headers: { Authorization: `Token ${token}` }
            });

            Alert.alert('Bem-vindo!', 'Seu perfil foi configurado com sucesso.');
            navigation.replace('Home');
        } catch (error) {
            console.error('Onboarding save error:', error);
            Alert.alert('Erro', 'Não foi possível salvar seu perfil. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#080C14', paddingTop: Platform.OS === 'ios' ? 60 : 40 }}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ padding: 24 }}>
                    <Text style={{ fontSize: 32, fontFamily: 'Inter_900Black', color: '#FFFFFF', marginBottom: 8 }}>Olá! 👋</Text>
                    <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', marginBottom: 32 }}>Vamos configurar seu laboratório de corrida.</Text>

                    <View style={{ gap: 20 }}>
                        <InputField label="Como devemos te chamar?" value={nome} onChange={setNome} placeholder="Seu nome ou apelido" />
                        <InputField label="Qual seu peso atual? (kg)" value={peso} onChange={setPeso} placeholder="Ex: 75.5" keyboardType="numeric" />
                        <InputField label="Sua altura (cm)" value={altura} onChange={setAltura} placeholder="Ex: 175" keyboardType="numeric" />
                        <InputField label="Tamanho do tênis (BR)" value={tamanho} onChange={setTamanho} placeholder="Ex: 41" keyboardType="numeric" />
                        <InputField label="WhatsApp (com DDD)" value={whatsapp} onChange={setWhatsapp} placeholder="Ex: 11999999999" keyboardType="phone-pad" />
                        <InputField
                            label="Data de Nascimento (DD/MM/AAAA)"
                            value={nascimento}
                            onChange={(text) => {
                                // Máscara automática DD/MM/YYYY
                                let t = text.replace(/\D/g, '');
                                if (t.length > 2) {
                                    t = t.replace(/^(\d{2})(\d)/, '$1/$2');
                                }
                                if (t.length > 5) {
                                    t = t.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
                                }
                                setNascimento(t.slice(0, 10));
                            }}
                            placeholder="Ex: 20/05/1995"
                            keyboardType="numeric"
                        />

                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={loading}
                            style={{
                                backgroundColor: '#4D9EFF',
                                padding: 18,
                                borderRadius: 16,
                                marginTop: 24,
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: '#FFFFFF', textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 16 }}>Começar a Correr</Text>}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

function InputField({ label, value, onChange, placeholder, keyboardType = 'default' }) {
    return (
        <View>
            <Text style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 8, fontSize: 13, fontFamily: 'Inter_500Medium' }}>{label}</Text>
            <TextInput
                placeholder={placeholder}
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={value}
                onChangeText={onChange}
                keyboardType={keyboardType}
                style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.06)',
                    color: '#FFFFFF',
                    padding: 16,
                    borderRadius: 16,
                    fontFamily: 'Inter_400Regular'
                }}
            />
        </View>
    );
}
