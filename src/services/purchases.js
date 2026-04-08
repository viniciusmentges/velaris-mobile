/**
 * purchases.js — Serviço RevenueCat para Velaris
 *
 * Instalação necessária antes do build:
 *   npx expo install react-native-purchases
 *
 * Variáveis de ambiente necessárias em app.json > extra:
 *   REVENUECAT_APPLE_KEY   — chave de API da App Store
 *   REVENUECAT_GOOGLE_KEY  — chave de API do Google Play
 *
 * Entitlement configurado no dashboard RevenueCat: "premium"
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Guard: evita crash se o pacote ainda não foi instalado
let Purchases = null;
try {
    Purchases = require('react-native-purchases').default;
} catch (_) {
    console.warn('[Purchases] react-native-purchases não instalado. Execute: npx expo install react-native-purchases');
}

const ENTITLEMENT_ID = 'premium';

const getApiKey = () => {
    const extra = Constants.expoConfig?.extra ?? {};
    return Platform.OS === 'ios'
        ? extra.REVENUECAT_APPLE_KEY
        : extra.REVENUECAT_GOOGLE_KEY;
};

/**
 * Inicializa o RevenueCat com o ID do usuário logado.
 * Chamar logo após o login.
 */
export async function configurePurchases(appUserId) {
    if (!Purchases) return;
    try {
        const apiKey = getApiKey();
        if (!apiKey) {
            console.warn('[Purchases] API key não configurada em app.json > extra');
            return;
        }
        await Purchases.configure({ apiKey, appUserID: String(appUserId) });
        console.log('[Purchases] RevenueCat configurado para userId:', appUserId);
    } catch (e) {
        console.error('[Purchases] Erro ao configurar:', e?.message);
    }
}

/**
 * Retorna os offerings disponíveis ou null se falhar.
 */
export async function getOfferings() {
    if (!Purchases) return null;
    try {
        const offerings = await Purchases.getOfferings();
        if (!offerings?.current) {
            console.warn('[Purchases] Nenhum offering configurado no dashboard RevenueCat');
            return null;
        }
        return offerings.current;
    } catch (e) {
        console.error('[Purchases] Erro ao buscar offerings:', e?.message);
        return null;
    }
}

/**
 * Executa a compra de um package.
 * Retorna { success, customerInfo, cancelled, error }.
 */
export async function purchasePackage(pkg) {
    if (!Purchases) return { success: false, error: 'SDK não disponível' };
    try {
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        const success = hasPremium(customerInfo);
        return { success, customerInfo, cancelled: false, error: null };
    } catch (e) {
        // Usuário cancelou — não é erro, não exibe Alert
        if (e?.userCancelled) {
            return { success: false, customerInfo: null, cancelled: true, error: null };
        }
        console.error('[Purchases] Erro na compra:', e?.message);
        return { success: false, customerInfo: null, cancelled: false, error: e?.message ?? 'Erro desconhecido' };
    }
}

/**
 * Restaura compras anteriores (obrigatório na App Store).
 * Retorna customerInfo ou null.
 */
export async function restorePurchases() {
    if (!Purchases) return null;
    try {
        const customerInfo = await Purchases.restorePurchases();
        return customerInfo;
    } catch (e) {
        console.error('[Purchases] Erro ao restaurar:', e?.message);
        return null;
    }
}

/**
 * Retorna as informações do cliente atual.
 */
export async function getCustomerInfo() {
    if (!Purchases) return null;
    try {
        return await Purchases.getCustomerInfo();
    } catch (e) {
        console.error('[Purchases] Erro ao buscar customerInfo:', e?.message);
        return null;
    }
}

/**
 * Verifica se o customerInfo contém o entitlement "premium" ativo.
 */
export function hasPremium(customerInfo) {
    if (!customerInfo) return false;
    return customerInfo.entitlements?.active?.[ENTITLEMENT_ID] != null;
}
