import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    ScrollView, ActivityIndicator, Platform, Alert,
} from 'react-native';
import { previewInvite, acceptInvite } from '../services/api';

// ─── Mensagens de erro do backend → texto amigável ───────────────────────────
function friendlyError(err) {
    const msg = err?.response?.data?.error || err?.message || '';
    if (msg.includes('expirado') || msg.includes('Expirado'))
        return 'Este convite expirou. Peça um novo código à sua assessoria.';
    if (msg.includes('revogado') || msg.includes('Revogado'))
        return 'Este convite foi revogado. Entre em contato com sua assessoria.';
    if (msg.includes('já utilizado') || msg.includes('accepted'))
        return 'Este convite já foi utilizado.';
    if (msg.includes('inativa') || msg.includes('Organização'))
        return 'A assessoria deste convite está temporariamente inativa.';
    if (msg.includes('consent'))
        return 'É necessário aceitar o compartilhamento de dados.';
    if (msg.includes('Convite inválido') || msg.includes('não encontrado'))
        return 'Código inválido. Verifique o código e tente novamente.';
    return 'Código inválido ou expirado. Verifique e tente novamente.';
}

export default function JoinOrgScreen({ navigation }) {
    const [code, setCode]           = useState('');
    const [step, setStep]           = useState('input');   // input | preview | success
    const [loading, setLoading]     = useState(false);
    const [orgName, setOrgName]     = useState('');
    const [orgRole, setOrgRole]     = useState('');
    const [consent, setConsent]     = useState(false);
    const [errorMsg, setErrorMsg]   = useState('');

    const token = code.trim();

    // ── Passo 1: validar código ───────────────────────────────────────────────
    async function handlePreview() {
        if (!token) {
            setErrorMsg('Cole o código enviado pela sua assessoria.');
            return;
        }
        setErrorMsg('');
        setLoading(true);
        try {
            const data = await previewInvite(token);
            if (!data.valid) {
                const statusMsg = {
                    accepted: 'Este convite já foi utilizado.',
                    expired:  'Este convite expirou. Peça um novo código à sua assessoria.',
                    revoked:  'Este convite foi revogado. Entre em contato com sua assessoria.',
                };
                setErrorMsg(statusMsg[data.status] || 'Código inválido ou expirado.');
                return;
            }
            setOrgName(data.organization_name || '');
            setOrgRole(data.role || 'athlete');
            setStep('preview');
        } catch (err) {
            setErrorMsg(friendlyError(err));
        } finally {
            setLoading(false);
        }
    }

    // ── Passo 2: aceitar convite ──────────────────────────────────────────────
    async function handleAccept() {
        if (!consent) {
            setErrorMsg('Você precisa autorizar o compartilhamento de dados para continuar.');
            return;
        }
        setErrorMsg('');
        setLoading(true);
        try {
            await acceptInvite(token);
            setStep('success');
        } catch (err) {
            setErrorMsg(friendlyError(err));
        } finally {
            setLoading(false);
        }
    }

    // ─── Layout base ──────────────────────────────────────────────────────────
    return (
        <View style={{ flex: 1, backgroundColor: '#020617', paddingTop: Platform.OS === 'ios' ? 50 : 30 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1e293b' }}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
                    <Text style={{ color: '#4D9EFF', fontSize: 16 }}>← Voltar</Text>
                </TouchableOpacity>
                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>
                    Entrar em uma Assessoria
                </Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>

                {/* ── INPUT: cole o código ─────────────────────────────────── */}
                {step === 'input' && (
                    <>
                        <Text style={{ color: '#94a3b8', fontSize: 14, lineHeight: 22, marginBottom: 28 }}>
                            Sua assessoria pode acompanhar informações relacionadas aos seus treinos,
                            recuperação e desgaste dos seus tênis.{'\n\n'}
                            Cole abaixo o código de convite que você recebeu.
                        </Text>

                        <Text style={{ color: '#64748b', fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>
                            Código do convite
                        </Text>
                        <TextInput
                            value={code}
                            onChangeText={v => { setCode(v); setErrorMsg(''); }}
                            placeholder="Cole o código aqui..."
                            placeholderTextColor="#334155"
                            autoCapitalize="none"
                            autoCorrect={false}
                            multiline={false}
                            style={{
                                backgroundColor: '#0f172a',
                                borderWidth: 1,
                                borderColor: errorMsg ? '#ef4444' : '#1e293b',
                                borderRadius: 12,
                                padding: 16,
                                color: 'white',
                                fontSize: 13,
                                fontFamily: 'monospace',
                                marginBottom: 8,
                            }}
                        />

                        {errorMsg ? (
                            <Text style={{ color: '#ef4444', fontSize: 13, marginBottom: 16 }}>{errorMsg}</Text>
                        ) : null}

                        <TouchableOpacity
                            onPress={handlePreview}
                            disabled={loading}
                            style={{
                                backgroundColor: token ? '#4D9EFF' : '#1e293b',
                                borderRadius: 12,
                                padding: 16,
                                alignItems: 'center',
                                marginTop: 8,
                            }}
                        >
                            {loading
                                ? <ActivityIndicator color="white" />
                                : <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>Verificar código</Text>
                            }
                        </TouchableOpacity>
                    </>
                )}

                {/* ── PREVIEW: assessoria encontrada ───────────────────────── */}
                {step === 'preview' && (
                    <>
                        {/* Card da assessoria */}
                        <View style={{ backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e3a5f', borderRadius: 16, padding: 20, marginBottom: 28 }}>
                            <Text style={{ color: '#4D9EFF', fontSize: 11, fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
                                Assessoria encontrada
                            </Text>
                            <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold', marginBottom: 4 }}>
                                {orgName}
                            </Text>
                            <Text style={{ color: '#64748b', fontSize: 13 }}>
                                Você entrará como: {orgRole === 'athlete' ? 'Atleta' : orgRole}
                            </Text>
                        </View>

                        {/* Termos de compartilhamento */}
                        <View style={{ backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 16, padding: 20, marginBottom: 24 }}>
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15, marginBottom: 10 }}>
                                Compartilhamento de dados
                            </Text>
                            <Text style={{ color: '#94a3b8', fontSize: 13, lineHeight: 20, marginBottom: 16 }}>
                                Ao entrar nesta assessoria, você autoriza que{' '}
                                <Text style={{ color: 'white', fontWeight: '600' }}>{orgName}</Text>{' '}
                                visualize seus treinos, desgaste dos tênis e informações de recuperação
                                cadastrados no Velaris.
                            </Text>

                            {/* Checkbox de consentimento */}
                            <TouchableOpacity
                                onPress={() => { setConsent(!consent); setErrorMsg(''); }}
                                style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}
                                activeOpacity={0.8}
                            >
                                <View style={{
                                    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
                                    borderColor: consent ? '#4D9EFF' : '#475569',
                                    backgroundColor: consent ? '#4D9EFF' : 'transparent',
                                    alignItems: 'center', justifyContent: 'center',
                                    marginTop: 1, flexShrink: 0,
                                }}>
                                    {consent && <Text style={{ color: 'white', fontSize: 13, fontWeight: 'bold' }}>✓</Text>}
                                </View>
                                <Text style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 20, flex: 1 }}>
                                    Autorizo o compartilhamento dos meus dados com a assessoria.
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {errorMsg ? (
                            <Text style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>{errorMsg}</Text>
                        ) : null}

                        <TouchableOpacity
                            onPress={handleAccept}
                            disabled={loading}
                            style={{
                                backgroundColor: consent ? '#4D9EFF' : '#1e293b',
                                borderRadius: 12,
                                padding: 16,
                                alignItems: 'center',
                                marginBottom: 12,
                            }}
                        >
                            {loading
                                ? <ActivityIndicator color="white" />
                                : <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>Entrar na Assessoria</Text>
                            }
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => { setStep('input'); setConsent(false); setErrorMsg(''); }} style={{ alignItems: 'center', padding: 12 }}>
                            <Text style={{ color: '#475569', fontSize: 13 }}>Usar outro código</Text>
                        </TouchableOpacity>
                    </>
                )}

                {/* ── SUCCESS ──────────────────────────────────────────────── */}
                {step === 'success' && (
                    <View style={{ alignItems: 'center', paddingTop: 24 }}>
                        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(77,158,255,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                            <Text style={{ fontSize: 32 }}>✓</Text>
                        </View>

                        <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 }}>
                            Bem-vindo!
                        </Text>
                        <Text style={{ color: '#94a3b8', fontSize: 14, textAlign: 'center', marginBottom: 4 }}>
                            Você agora faz parte da assessoria:
                        </Text>
                        <Text style={{ color: '#4D9EFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 }}>
                            {orgName}
                        </Text>

                        <View style={{ backgroundColor: 'rgba(77,158,255,0.08)', borderWidth: 1, borderColor: 'rgba(77,158,255,0.2)', borderRadius: 12, padding: 16, width: '100%', marginBottom: 32 }}>
                            <Text style={{ color: '#4D9EFF', fontSize: 13, textAlign: 'center', fontWeight: '600' }}>
                                🚀 Premium liberado pela assessoria
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={{ backgroundColor: '#4D9EFF', borderRadius: 12, padding: 16, width: '100%', alignItems: 'center' }}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>Voltar ao Perfil</Text>
                        </TouchableOpacity>
                    </View>
                )}

            </ScrollView>
        </View>
    );
}
