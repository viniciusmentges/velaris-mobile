import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import { configurePurchases } from '../services/purchases';

export default function LoginScreen({ navigation }) {
    const [username, setUsername] = useState(''); // DRF obtain_auth_token expects 'username'
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/api/auth-token/', {
                username: username,
                password: password,
            });

            const { token } = response.data;
            await AsyncStorage.setItem('userToken', token);

            // Verificar se o perfil está completo
            try {
                const profileRes = await api.get('/api/perfil/', {
                    headers: { Authorization: `Token ${token}` }
                });

                const p = profileRes.data;

                // Persiste userId para uso em sessões futuras (RevenueCat + startup)
                if (p.id) {
                    await AsyncStorage.setItem('userId', String(p.id));
                    configurePurchases(p.id).catch(() => {});
                }

                const isComplete = p.nome && p.peso && p.telefone && p.data_nascimento;

                if (!isComplete) {
                    navigation.replace('Onboarding');
                } else {
                    navigation.replace('Home');
                }
            } catch (err) {
                // Se der erro ao pegar perfil, vai para Home por segurança
                navigation.replace('Home');
            }
        } catch (error) {
            console.error('Login error:', error);
            let message = 'Ocorreu um erro ao tentar fazer login.';

            if (error.response) {
                // Erro vindo do servidor (ex: 400 Bad Request)
                message = 'Usuário ou senha inválidos.';
            } else if (error.request) {
                // Erro de rede (não conseguiu conectar ao servidor)
                message = 'Não foi possível conectar ao servidor. Verifique sua conexão e se o backend está rodando.';
            }

            Alert.alert('Erro de Autenticação', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#080C14', paddingTop: Platform.OS === 'ios' ? 60 : 40 }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ padding: 24 }}>
                    {/* Botão Voltar */}
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{ alignSelf: 'flex-start', marginBottom: 16 }}
                    >
                        <Text style={{ color: '#4D9EFF', fontFamily: 'Inter_700Bold' }}>← Voltar</Text>
                    </TouchableOpacity>

                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        {/* Header */}
                        <View style={{ alignItems: 'center', marginBottom: 40 }}>
                            <Image
                                source={require('../../assets/logo.png')}
                                style={{ width: 280, height: 280, marginBottom: -40 }}
                                resizeMode="contain"
                            />
                            <Text style={{ fontSize: 14, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>Ciência aplicada à sua performance.</Text>
                        </View>

                        {/* Form */}
                        <View style={{ width: '100%', gap: 16 }}>
                            <View>
                                <Text style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 8, fontSize: 13, fontFamily: 'Inter_500Medium' }}>Usuário</Text>
                                <TextInput
                                    placeholder="seu_usuario"
                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                    autoCapitalize="none"
                                    value={username}
                                    onChangeText={setUsername}
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

                            <View>
                                <Text style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 8, fontSize: 13, fontFamily: 'Inter_500Medium' }}>Senha</Text>
                                <TextInput
                                    placeholder="••••••••"
                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                    secureTextEntry={true}
                                    value={password}
                                    onChangeText={setPassword}
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

                            <TouchableOpacity style={{ alignItems: 'flex-end' }} onPress={() => navigation.navigate('ForgotPassword')}>
                                <Text style={{ color: '#4D9EFF', fontSize: 13, fontFamily: 'Inter_500Medium' }}>Esqueceu a senha?</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleLogin}
                                disabled={loading}
                                style={{
                                    backgroundColor: '#4D9EFF',
                                    padding: 18,
                                    borderRadius: 16,
                                    marginTop: 32,
                                    shadowColor: '#4D9EFF',
                                    shadowOffset: { width: 0, height: 8 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 16,
                                    elevation: 10,
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={{ color: '#FFFFFF', textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 16 }}>Entrar</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Footer */}
                        <View style={{ flexDirection: 'row', marginTop: 40 }}>
                            <Text style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'Inter_400Regular' }}>Não tem uma conta? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={{ color: '#4D9EFF', fontFamily: 'Inter_700Bold' }}>Cadastre-se</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
