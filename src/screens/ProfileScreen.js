import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Platform, ScrollView, ActivityIndicator, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export default function ProfileScreen({ navigation }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});

    const dateToBR = (dbDate) => {
        if (!dbDate) return '';
        const parts = dbDate.split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return dbDate;
    };

    const dateToDB = (brDate) => {
        if (!brDate) return null;
        const parts = brDate.split('/');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return brDate;
    };

    const fetchProfile = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const response = await api.get('/api/perfil/', {
                headers: { Authorization: `Token ${token}` }
            });
            const data = response.data;
            if (data.data_nascimento) {
                data.data_nascimento = dateToBR(data.data_nascimento);
            }
            setUser(data);
            setFormData(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    async function handleSave() {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('userToken');
            const payload = { ...formData };
            if (payload.data_nascimento) {
                payload.data_nascimento = dateToDB(payload.data_nascimento);
            }
            await api.patch('/api/perfil/me/', payload, {
                headers: { Authorization: `Token ${token}` }
            });
            Alert.alert('Sucesso', 'Perfil atualizado!');
            setEditing(false);
            fetchProfile();
        } catch (err) {
            Alert.alert('Erro', 'Não foi possível salvar as alterações.');
        } finally {
            setLoading(false);
        }
    }

    async function handleLogout() {
        await AsyncStorage.removeItem('userToken');
        navigation.replace('Welcome');
    }

    if (loading && !user) {
        return (
            <View style={{ flex: 1, backgroundColor: '#080C14', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#4D9EFF" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#020617', paddingTop: Platform.OS === 'ios' ? 50 : 30 }}>
            <ScrollView className="flex-1 p-6">
                <View className="items-center mb-8">
                    <View className="w-24 h-24 bg-blue-600 rounded-full items-center justify-center mb-4">
                        <Text className="text-white text-4xl font-bold">
                            {user?.nome ? user.nome[0].toUpperCase() : 'U'}
                        </Text>
                    </View>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>{user?.nome || 'Usuário'}</Text>
                    <Text style={{ color: '#94a3b8' }}>Plano: {user?.plano === 'START' ? 'Start (Grátis)' : 'Premium 🚀'}</Text>
                    {user?.plano === 'START' && (
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Plans')}
                            style={{ marginTop: 12, backgroundColor: '#4D9EFF', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 }}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>Fazer Upgrade Premium</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Text className="text-slate-300 font-bold uppercase text-xs tracking-widest">Informações Pessoais</Text>
                        <TouchableOpacity onPress={() => editing ? handleSave() : setEditing(true)}>
                            <Text style={{ color: '#4D9EFF', fontWeight: 'bold' }}>{editing ? 'SALVAR' : 'EDITAR'}</Text>
                        </TouchableOpacity>
                    </View>

                    <ProfileItem label="E-mail" value={user?.email} isEditing={false} />
                    <ProfileItem
                        label="WhatsApp"
                        value={editing ? formData.telefone : user?.telefone}
                        isEditing={editing}
                        onChange={(v) => setFormData({ ...formData, telefone: v })}
                    />
                    <ProfileItem
                        label="Nascimento"
                        value={editing ? formData.data_nascimento : user?.data_nascimento}
                        isEditing={editing}
                        onChange={(text) => {
                            let t = text.replace(/\D/g, '');
                            if (t.length > 2) t = t.replace(/^(\d{2})(\d)/, '$1/$2');
                            if (t.length > 5) t = t.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
                            setFormData({ ...formData, data_nascimento: t.slice(0, 10) });
                        }}
                        keyboardType="numeric"
                    />
                    <ProfileItem
                        label="Peso (kg)"
                        value={editing ? String(formData.peso) : `${user?.peso} kg`}
                        isEditing={editing}
                        onChange={(v) => setFormData({ ...formData, peso: v })}
                        keyboardType="numeric"
                    />
                    <ProfileItem
                        label="Altura (cm)"
                        value={editing ? String(formData.altura) : `${user?.altura} cm`}
                        isEditing={editing}
                        onChange={(v) => setFormData({ ...formData, altura: v })}
                        keyboardType="numeric"
                    />
                    <ProfileItem
                        label="Calçado (BR)"
                        value={editing ? String(formData.tamanho_calcado) : user?.tamanho_calcado}
                        isEditing={editing}
                        onChange={(v) => setFormData({ ...formData, tamanho_calcado: v })}
                        keyboardType="numeric"
                    />
                    <ProfileItem
                        label="Cidade"
                        value={editing ? (formData.cidade || '') : (user?.cidade || '--')}
                        isEditing={editing}
                        onChange={(v) => setFormData({ ...formData, cidade: v })}
                        placeholder="Ex: São Paulo"
                    />
                </View>

                {/* Consentimento B2B */}
                <View style={{ backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 16, padding: 20, marginBottom: 16 }}>
                    <Text style={{ color: '#94a3b8', fontWeight: 'bold', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Privacidade</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14, marginBottom: 4 }}>Ofertas personalizadas</Text>
                            <Text style={{ color: '#64748b', fontSize: 12, lineHeight: 18 }}>
                                Permite que lojistas parceiros vejam quando seu tênis está chegando ao fim da vida útil e te enviem ofertas via WhatsApp.
                            </Text>
                        </View>
                        <Switch
                            value={!!formData.aceita_marketing}
                            onValueChange={async (val) => {
                                const updated = { ...formData, aceita_marketing: val };
                                setFormData(updated);
                                try {
                                    const token = await AsyncStorage.getItem('userToken');
                                    await api.patch('/api/perfil/me/', { aceita_marketing: val }, {
                                        headers: { Authorization: `Token ${token}` }
                                    });
                                } catch {
                                    setFormData({ ...formData, aceita_marketing: !val });
                                }
                            }}
                            trackColor={{ false: '#1e293b', true: '#1d4ed8' }}
                            thumbColor={formData.aceita_marketing ? '#4D9EFF' : '#475569'}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleLogout}
                    className="bg-red-900/20 border border-red-900/40 p-4 rounded-xl items-center mb-10"
                >
                    <Text className="text-red-500 font-bold">Sair da Conta</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

import { TextInput, Alert } from 'react-native';

function ProfileItem({ label, value, isEditing, onChange, keyboardType = 'default', placeholder }) {
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', py: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b', paddingVertical: 12 }}>
            <Text style={{ color: '#94a3b8' }}>{label}</Text>
            {isEditing ? (
                <TextInput
                    value={value}
                    onChangeText={onChange}
                    keyboardType={keyboardType}
                    placeholder={placeholder}
                    placeholderTextColor="#475569"
                    style={{ color: 'white', fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#4D9EFF', minWidth: 100, textAlign: 'right' }}
                />
            ) : (
                <Text style={{ color: 'white', fontWeight: 'bold' }}>{value || '--'}</Text>
            )}
        </View>
    );
}
