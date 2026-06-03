import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import Constants from 'expo-constants';

let _configured = false;

export async function initRevenueCat(appUserID) {
    if (_configured) {
        console.log('[RC] Already configured — skipping');
        return;
    }

    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    const extra = Constants.expoConfig?.extra ?? {};

    // EXPO_PUBLIC_ vars (local/.env.local) têm prioridade; app.json extra é fallback para EAS
    const apiKey = Platform.OS === 'android'
        ? (process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY || extra.REVENUECAT_GOOGLE_KEY)
        : (process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY  || extra.REVENUECAT_APPLE_KEY);

    console.log('[RC] Initializing', {
        platform:  Platform.OS,
        hasApiKey: Boolean(apiKey),
        appUserID: appUserID || '(anonymous)',
    });

    if (!apiKey || apiKey.includes('SUBSTITUA')) {
        throw new Error(`[RC] RevenueCat API key ausente ou placeholder para: ${Platform.OS}`);
    }

    Purchases.configure({ apiKey, appUserID: appUserID || undefined });

    _configured = true;
    console.log('[RC] Configured successfully');
}
