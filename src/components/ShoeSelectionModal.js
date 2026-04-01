import React from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    SafeAreaView
} from 'react-native';

const C = {
    bg: '#0D1117',
    surface: '#161B26',
    surfaceHigh: '#1E2535',
    border: 'rgba(255,255,255,0.07)',
    white: '#FFFFFF',
    white70: 'rgba(255,255,255,0.70)',
    white40: 'rgba(255,255,255,0.40)',
    accent: '#4D9EFF',
    accentGlow: 'rgba(77,158,255,0.12)',
};

export default function ShoeSelectionModal({ visible, onClose, shoes, onSelect, activityName }) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <SafeAreaView style={s.overlay}>
                <View style={s.container}>
                    <View style={s.header}>
                        <View style={s.handle} />
                        <Text style={s.title}>Vincular Tênis</Text>
                        <Text style={s.subtitle}>Para a atividade: {activityName}</Text>
                    </View>

                    <FlatList
                        data={shoes}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={s.list}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={s.item}
                                activeOpacity={0.7}
                                onPress={() => onSelect(item.id)}
                            >
                                <View style={s.itemInfo}>
                                    <Text style={s.itemName}>{item.nome.toUpperCase()}</Text>
                                    <Text style={s.itemMeta}>{item.marca} · {item.modelo}</Text>
                                </View>
                                <View style={s.arrow}>
                                    <Text style={s.arrowText}>→</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <View style={s.empty}>
                                <Text style={s.emptyText}>Nenhum tênis encontrado na garagem.</Text>
                            </View>
                        }
                    />

                    <TouchableOpacity style={s.btnClose} onPress={onClose}>
                        <Text style={s.btnCloseText}>CANCELAR</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const s = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.75)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: C.surface,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        maxHeight: '80%',
        paddingBottom: 20,
    },
    header: {
        padding: 24,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: C.border,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: C.white40,
        borderRadius: 2,
        marginBottom: 16,
    },
    title: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 20,
        color: C.white,
        marginBottom: 4,
    },
    subtitle: {
        fontFamily: 'DM_Sans_400Regular',
        fontSize: 13,
        color: C.white40,
        textAlign: 'center',
    },
    list: {
        padding: 20,
        gap: 12,
    },
    item: {
        backgroundColor: C.surfaceHigh,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: C.border,
    },
    itemInfo: {
        flex: 1,
        gap: 2,
    },
    itemName: {
        fontFamily: 'SpaceGrotesk_500Medium',
        fontSize: 15,
        color: C.white,
    },
    itemMeta: {
        fontFamily: 'DM_Sans_400Regular',
        fontSize: 12,
        color: C.white40,
    },
    arrow: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: C.accentGlow,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrowText: {
        color: C.accent,
        fontSize: 16,
        fontWeight: 'bold',
    },
    empty: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: C.white40,
        fontSize: 14,
    },
    btnClose: {
        marginHorizontal: 24,
        marginTop: 8,
        padding: 16,
        alignItems: 'center',
    },
    btnCloseText: {
        fontFamily: 'SpaceGrotesk_700Bold',
        fontSize: 12,
        color: C.white40,
        letterSpacing: 1,
    }
});
