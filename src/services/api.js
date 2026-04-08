import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// App apontando para o servidor de produção no Render
const BASE_URL = 'https://api.velarisapp.com.br';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    }
});

export default api;

export const exchangeStravaCode = async (code, redirectUri) => {
    const token = await AsyncStorage.getItem('userToken');
    console.log('[API] Iniciando troca de Token Strava. Auth Token presente?', !!token);

    const response = await api.post('/api/strava/exchange/', { code, redirect_uri: redirectUri }, {
        headers: { Authorization: `Token ${token}` }
    });
    return response.data;
};

export const triggerStravaSync = async () => {
    const token = await AsyncStorage.getItem('userToken');
    const response = await api.post('/api/strava/sync/', {}, {
        headers: { Authorization: `Token ${token}` }
    });
    return response.data;
};

export const disconnectStrava = async () => {
    const token = await AsyncStorage.getItem('userToken');
    const response = await api.post('/api/strava/disconnect/', {}, {
        headers: { Authorization: `Token ${token}` }
    });
    return response.data;
};

export const activateShoeByUUID = async (uuid) => {
    const token = await AsyncStorage.getItem('userToken');
    const response = await api.post('/api/shoes/activate_by_uuid/', { uuid }, {
        headers: { Authorization: `Token ${token}` }
    });
    return response.data;
};

export const updateExpoPushToken = async (expoPushToken) => {
    const token = await AsyncStorage.getItem('userToken');
    const response = await api.patch('/api/perfil/me/', { expo_push_token: expoPushToken }, {
        headers: { Authorization: `Token ${token}` }
    });
    return response.data;
};
