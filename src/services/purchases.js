import Purchases from 'react-native-purchases';
import { initRevenueCat } from './revenuecat';

// Chamado no login — inicializa o SDK com o ID do usuário autenticado.
export async function configurePurchases(userId) {
    try {
        await initRevenueCat(userId?.toString());
    } catch (e) {
        console.warn('[RC] configurePurchases error:', e.message);
    }
}

// Retorna offerings.current ou null em caso de falha.
export async function getOfferings() {
    try {
        const offerings = await Purchases.getOfferings();

        console.log('[RC] getOfferings result', {
            current: offerings.current?.identifier,
            packages: offerings.current?.availablePackages?.map(p => ({
                identifier: p.identifier,
                productId:  p.product.identifier,
                price:      p.product.priceString,
            })),
        });

        return offerings.current ?? null;
    } catch (e) {
        console.warn('[RC] getOfferings error:', e.message);
        return null;
    }
}

// Retorna { success, isPremium, customerInfo, cancelled, error }
export async function purchasePackage(pkg) {
    try {
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        const isPremium = Boolean(customerInfo.entitlements.active['premium']);

        console.log('[RC] purchasePackage success', { isPremium });
        return { success: true, isPremium, customerInfo, cancelled: false, error: null };
    } catch (e) {
        if (e.userCancelled) {
            return { success: false, isPremium: false, customerInfo: null, cancelled: true, error: null };
        }
        console.warn('[RC] purchasePackage error:', e.message);
        return { success: false, isPremium: false, customerInfo: null, cancelled: false, error: e.message ?? 'Erro desconhecido' };
    }
}

// Retorna customerInfo ou null em caso de falha.
export async function restorePurchases() {
    try {
        const customerInfo = await Purchases.restorePurchases();
        console.log('[RC] restorePurchases', { activeEntitlements: Object.keys(customerInfo.entitlements.active) });
        return customerInfo;
    } catch (e) {
        console.warn('[RC] restorePurchases error:', e.message);
        return null;
    }
}

// Retorna customerInfo ou null em caso de falha.
export async function getCustomerInfo() {
    try {
        const info = await Purchases.getCustomerInfo();
        console.log('[RC] getCustomerInfo', { activeEntitlements: Object.keys(info.entitlements.active) });
        return info;
    } catch (e) {
        console.warn('[RC] getCustomerInfo error:', e.message);
        return null;
    }
}

export function hasPremium(customerInfo) {
    if (!customerInfo) return false;
    return Boolean(customerInfo.entitlements?.active?.['premium']);
}
