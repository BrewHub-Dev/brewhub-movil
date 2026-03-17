import React from 'react';
import { View, ActivityIndicator, Platform, useColorScheme } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Constants from 'expo-constants';

import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { RegisterScreen } from '../features/auth/screens/RegisterScreen';
import { HomeScreen } from '../features/home/screens/HomeScreen';
import { BranchListScreen } from '../features/orders/screens/BranchListScreen';
import { MenuScreen } from '../features/orders/screens/MenuScreen';
import { CartScreen } from '../features/orders/screens/CartScreen';
import { MyOrdersScreen } from '../features/orders/screens/MyOrdersScreen';
import { OrderDetailsScreen } from '../features/orders/screens/OrderDetailsScreen';
import { useSession } from '../features/auth/hooks/useSession';
import { useTenant } from '../features/tenant/providers/TenantProvider';
import { usePushNotifications } from '../hooks/usePushNotifications';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const scheme = Constants.expoConfig?.scheme ?? 'brewhub';
const appName = Constants.expoConfig?.extra?.brand?.appName ?? 'BrewHub';

const linking = {
  prefixes: [`${scheme}://`, 'http://localhost:8081'],
  config: {
    screens: {
      Login: 'login',
      Register: 'register',
      Home: 'home',
      BranchList: 'branches',
      Menu: 'menu/:branchId',
      Cart: 'cart/:branchId',
      MyOrders: 'my-orders',
      OrderDetails: 'order/:orderId',
    },
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#f59e0b',
    background: '#09090b',
    card: '#18181b',
    text: '#fafafa',
    border: '#27272a',
  },
};

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#f59e0b',
    background: '#ffffff',
    card: '#ffffff',
    text: '#18181b',
    border: '#e5e7eb',
  },
};

export function RootNavigator() {
  const { isAuthenticated, isLoading } = useSession();
  const { isLoading: isTenantLoading } = useTenant();
  usePushNotifications(isAuthenticated);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getInitialRoute = (): keyof RootStackParamList => {
    if (!isAuthenticated) return 'Login';
    return 'Home';
  };

  if (isLoading || isTenantLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isDark ? '#09090b' : '#ffffff'
      }}>
        <ActivityIndicator color="#f59e0b" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={isDark ? CustomDarkTheme : CustomLightTheme}
      linking={Platform.OS === 'web' ? linking : undefined}
      documentTitle={{ formatter: () => appName }}
    >
      <Stack.Navigator
        initialRouteName={getInitialRoute()}
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          headerStyle: {
            backgroundColor: isDark ? '#18181b' : '#ffffff',
          },
          headerTintColor: isDark ? '#fafafa' : '#18181b',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="BranchList"
          component={BranchListScreen}
          options={{ headerShown: true, title: 'Tiendas' }}
        />
        <Stack.Screen
          name="Menu"
          component={MenuScreen}
          options={{ headerShown: true, title: 'Menú' }}
        />
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{ headerShown: true, title: 'Carrito' }}
        />
        <Stack.Screen
          name="MyOrders"
          component={MyOrdersScreen}
          options={{ headerShown: true, title: 'Mis Órdenes' }}
        />
        <Stack.Screen
          name="OrderDetails"
          component={OrderDetailsScreen}
          options={{ headerShown: true, title: 'Detalles de orden' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
