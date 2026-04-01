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
    ActivityIndicator,
    Image
} from 'react-native';
import api from '../services/api';

export default function RegisterScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [nome, setNome] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!username || !password || !email || !nome) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/api/perfil/registro/', {
                username,
                password,
                email,
                nome
            });

            Alert.alert('Sucesso', 'Conta criada com sucesso! Faça login para continuar.');
            navigation.navigate('Login');
        } catch (error) {
            console.error('Registration error:', error);
            const message = error.response?.data?.error || 'Ocorreu um erro ao criar sua conta.';
            Alert.alert('Erro no Cadastro', message);
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
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{ alignSelf: 'flex-start', marginBottom: 16 }}
                    >
                        <Text style={{ color: '#4D9EFF', fontFamily: 'Inter_700Bold' }}>← Voltar</Text>
                    </TouchableOpacity>

                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ alignItems: 'center', marginBottom: 32 }}>
                            <Image
                                source={require('../../assets/logo.png')}
                                style={{ width: 120, height: 120, marginBottom: 8 }}
                                resizeMode="contain"
                            />
                            <Text style={{ fontSize: 32, fontFamily: 'Inter_900Black', color: '#FFFFFF', letterSpacing: -1 }}>Criar Conta</Text>
                            <Text style={{ fontSize: 14, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>Ciência aplicada à sua performance.</Text>
                        </View>

                        <View style={{ width: '100%', gap: 16 }}>
                            <View>
                                <Text style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 8, fontSize: 13, fontFamily: 'Inter_500Medium' }}>Nome Completo</Text>
                                <TextInput
                                    placeholder="Ex: João Silva"
                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                    value={nome}
                                    onChangeText={setNome}
                                    style={inputStyle}
                                />
                            </View>

                            <View>
                                <Text style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 8, fontSize: 13, fontFamily: 'Inter_500Medium' }}>Usuário (Login)</Text>
                                <TextInput
                                    placeholder="seu_usuario"
                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                    autoCapitalize="none"
                                    value={username}
                                    onChangeText={setUsername}
                                    style={inputStyle}
                                />
                            </View>

                            <View>
                                <Text style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 8, fontSize: 13, fontFamily: 'Inter_500Medium' }}>E-mail</Text>
                                <TextInput
                                    placeholder="seu@email.com"
                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                    style={inputStyle}
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
                                    style={inputStyle}
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleRegister}
                                disabled={loading}
                                style={{
                                    backgroundColor: '#4D9EFF',
                                    padding: 18,
                                    borderRadius: 16,
                                    marginTop: 20,
                                    opacity: loading ? 0.7 : 1
                                }}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={{ color: '#FFFFFF', textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 16 }}>Criar Minha Conta</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const inputStyle = {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    color: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    fontFamily: 'Inter_400Regular'
};
