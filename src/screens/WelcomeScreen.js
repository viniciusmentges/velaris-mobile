import { View, Text, TouchableOpacity, Platform, Image } from 'react-native';

export default function WelcomeScreen({ navigation }) {
    return (
        <View style={{ flex: 1, backgroundColor: '#080C14', paddingTop: Platform.OS === 'ios' ? 60 : 40 }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <Image
                    source={require('../../assets/logo.png')}
                    style={{ width: 280, height: 280, marginBottom: 24 }}
                    resizeMode="contain"
                />
                <Text style={{
                    fontSize: 22,
                    fontFamily: 'Inter_700Bold',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    marginBottom: 16
                }}>
                    Ciência aplicada à sua performance.
                </Text>

                <View style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    padding: 24,
                    borderRadius: 24,
                    width: '100%',
                    marginBottom: 40,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.06)'
                }}>
                    <Text style={{
                        color: 'rgba(255,255,255,0.6)',
                        lineHeight: 24,
                        textAlign: 'center',
                        fontSize: 15,
                        fontFamily: 'Inter_400Regular'
                    }}>
                        Seus dados de corrida. Nossa inteligência para calcular a fadiga real dos seus tênis.
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    style={{
                        backgroundColor: '#4D9EFF',
                        paddingVertical: 18,
                        borderRadius: 16,
                        width: '100%',
                        shadowColor: '#4D9EFF',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.3,
                        shadowRadius: 16,
                        elevation: 10
                    }}
                    activeOpacity={0.8}
                >
                    <Text style={{
                        color: '#FFFFFF',
                        fontSize: 16,
                        fontFamily: 'Inter_700Bold',
                        textAlign: 'center'
                    }}>
                        Começar agora
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
