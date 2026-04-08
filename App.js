import "./global.css";
import React from 'react';
import { StatusBar, View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import * as Notifications from 'expo-notifications';

import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AddShoeScreen from './src/screens/AddShoeScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import PlansScreen from './src/screens/PlansScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import ActivityFeedbackScreen from './src/screens/ActivityFeedbackScreen';

import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_900Black
} from '@expo-google-fonts/inter';
import {
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold
} from '@expo-google-fonts/space-grotesk';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold
} from '@expo-google-fonts/dm-sans';
import { PremiumTabBar } from './src/components/PremiumTabBar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configurePurchases } from './src/services/purchases';

export default function App() {
  console.log('[Velaris] App Iniciando...');
  const [currentRoute, setCurrentRoute] = React.useState('Loading');
  const [routeParams, setRouteParams]   = React.useState({});
  const [timedOut, setTimedOut]         = React.useState(false);

  React.useEffect(() => {
    async function checkLogin() {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          setCurrentRoute('Welcome');
          return;
        }
        // Token existe → vai para Home independentemente do RevenueCat
        setCurrentRoute('Home');
        // Inicializa RevenueCat em background; qualquer falha é silenciosa
        try {
          const userId = await AsyncStorage.getItem('userId');
          if (userId) configurePurchases(userId).catch(() => {});
        } catch (_) {}
      } catch (e) {
        setCurrentRoute('Welcome');
      }
    }
    checkLogin();
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      console.log('[Velaris] Timeout de fontes atingido. Prosseguindo...');
      setTimedOut(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_900Black,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold
  });

  React.useEffect(() => {
    if (fontError) {
      console.error('[Velaris] Erro ao carregar fontes:', fontError);
    }
  }, [fontError]);

  if ((!fontsLoaded && !fontError && !timedOut) || currentRoute === 'Loading') {
    return (
      <View style={{ flex: 1, backgroundColor: '#080C14', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#4D9EFF" />
        <Text style={{ color: '#FFFFFF', marginTop: 20, opacity: 0.5 }}>Iniciando Velaris...</Text>
      </View>
    );
  }

  const navigate = (route, params = {}) => {
    setRouteParams(params);
    setCurrentRoute(route);
  };
  const goBack = () => {
    if (currentRoute === 'ActivityFeedback') navigate('Home');
    else if (currentRoute === 'AddShoe') navigate('Home');
    else if (currentRoute === 'Plans') navigate('Home');
    else if (currentRoute === 'Profile') navigate('Home');
    else if (currentRoute === 'Library') navigate('Home');
    else if (currentRoute === 'Home') navigate('Welcome');
    else navigate('Welcome');
  };

  // Listener de toque em push notification — intercepta qualquer resposta
  React.useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data ?? {};
      console.log('[Push] Notificação tocada:', data);
      if (data.route === 'activity_feedback' && data.activity_id) {
        navigate('ActivityFeedback', { activityId: data.activity_id });
      }
    });
    return () => subscription.remove();
  }, []);

  const renderScreen = () => {
    const nav = { navigate, replace: navigate, goBack };
    switch (currentRoute) {
      case 'Login':              return <LoginScreen navigation={nav} />;
      case 'Home':               return <HomeScreen navigation={nav} />;
      case 'Profile':            return <ProfileScreen navigation={nav} />;
      case 'Library':            return <LibraryScreen navigation={nav} />;
      case 'AddShoe':            return <AddShoeScreen navigation={nav} />;
      case 'Register':           return <RegisterScreen navigation={nav} />;
      case 'Onboarding':         return <OnboardingScreen navigation={nav} />;
      case 'Plans':              return <PlansScreen navigation={nav} />;
      case 'ActivityFeedback':   return <ActivityFeedbackScreen navigation={nav} route={{ params: routeParams }} />;
      default:                   return <WelcomeScreen navigation={nav} />;
    }
  };

  const showTabs = ['Home', 'Profile', 'Library'].includes(currentRoute);

  return (
    <View style={{ flex: 1, backgroundColor: '#080C14' }}>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1 }}>
        {renderScreen()}
      </View>

      {showTabs && (
        <PremiumTabBar
          currentRoute={currentRoute}
          onNavigate={navigate}
        />
      )}
    </View>
  );
}
