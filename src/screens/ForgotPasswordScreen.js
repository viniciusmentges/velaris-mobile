import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import api from '../services/api';

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    async function handleSubmit() {
        if (!email.trim()) {
            Alert.alert('Campo obrigatório', 'Por favor, informe seu e-mail.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/api/password_reset/', { email: email.trim() });
        } catch (err) {
            // Engole erros intencionalmente — não revelamos se o email existe
        } finally {
            setLoading(false);
            setSent(true);
        }
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#080C14', paddingTop: Platform.OS === 'ios' ? 60 : 40 }}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={{ padding: 24 }}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{ alignSelf: 'flex-start', marginBottom: 32 }}
                    >
                        <Text style={{ color: '#4D9EFF', fontFamily: 'Inter_700Bold' }}>← Voltar</Text>
                    </TouchableOpacity>

                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 24, fontFamily: 'Inter_700Bold', color: '#FFFFFF', marginBottom: 8 }}>
                            Recuperar senha
                        </Text>
                        <Text style={{ fontSize: 14, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.4)', marginBottom: 40, lineHeight: 22 }}>
                            Informe o e-mail cadastrado na sua conta e enviaremos as instruções de recuperação.
                        </Text>

                        {sent ? (
                            <View style={{
                                backgroundColor: 'rgba(77,158,255,0.08)',
                                borderWidth: 1,
                                borderColor: 'rgba(77,158,255,0.2)',
                                borderRadius: 16,
                                padding: 24,
                                alignItems: 'center'
                            }}>
                                <Text style={{ fontSize: 32, marginBottom: 12 }}>📬</Text>
                                <Text style={{ color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 16, textAlign: 'center', marginBottom: 8 }}>
                                    Instruções enviadas
                                </Text>
                                <Text style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Inter_400Regular', fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
                                    Se esse e-mail estiver cadastrado, enviaremos as instruções de recuperação em breve.
                                </Text>
                                <TouchableOpacity
                                    onPress={() => navigation.goBack()}
                                    style={{ marginTop: 24 }}
                                >
                                    <Text style={{ color: '#4D9EFF', fontFamily: 'Inter_700Bold', fontSize: 14 }}>Voltar para o login</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={{ gap: 16 }}>
                                <View>
                                    <Text style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 8, fontSize: 13, fontFamily: 'Inter_500Medium' }}>E-mail</Text>
                                    <TextInput
                                        placeholder="seu@email.com"
                                        placeholderTextColor="rgba(255,255,255,0.2)"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        keyboardType="email-address"
                                        value={email}
                                        onChangeText={setEmail}
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

                                <TouchableOpacity
                                    onPress={handleSubmit}
                                    disabled={loading}
                                    style={{
                                        backgroundColor: '#4D9EFF',
                                        padding: 18,
                                        borderRadius: 16,
                                        marginTop: 8,
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
                                        <Text style={{ color: '#FFFFFF', textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 16 }}>
                                            Enviar instruções
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
