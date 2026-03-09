import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import Constants, { ExecutionEnvironment } from 'expo-constants';

import { RootNavigator } from '../navigation/RootNavigator';
import { CartProvider } from '../features/orders/providers/CartProvider';
import { TenantProvider } from '../features/tenant/providers/TenantProvider';
import { RegisterProvider } from '../features/auth/context/RegisterContext';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function StripeWrapper({ children }: Readonly<{ children: React.ReactNode }>) {
  if (isExpoGo) return <>{children}</>;

  const { StripeProvider } = require('@stripe/stripe-react-native');
  return (
    <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""}>
      {children}
    </StripeProvider>
  );
}

export function AppProviders() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <RegisterProvider>
            <TenantProvider>
              <CartProvider>
                <StripeWrapper>
                  <BottomSheetModalProvider>
                    <RootNavigator />
                  </BottomSheetModalProvider>
                </StripeWrapper>
              </CartProvider>
            </TenantProvider>
          </RegisterProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
