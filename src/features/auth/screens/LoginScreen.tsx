import React from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Image,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

import { LoginForm } from '../components/LoginForm';
import { COFFEE } from '../../orders/constants/coffee';
import { useTenant } from '@/features/tenant/providers/TenantProvider';
import type { LoginScreenProps } from '../../../navigation/types';

const brandName =
  (Constants.expoConfig?.extra?.brand?.shopName as string) ||
  (Constants.expoConfig?.extra?.brand?.appName as string) ||
  'BrewHub';

export function LoginScreen({ navigation }: Readonly<LoginScreenProps>) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { tenant } = useTenant();

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: isDark ? '#09090b' : COFFEE.cream }}
      edges={['top', 'bottom']}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#09090b' : COFFEE.cream}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 items-center justify-center px-6 py-12">

            <View className="items-center mb-10">
              <View className="w-24 h-24 rounded-3xl items-center justify-center mb-5 shadow-2xl overflow-hidden"
                style={{ backgroundColor: COFFEE.accent }}>
              {tenant?.shopLogo ? (
                <Image
                  source={{ uri: tenant.shopLogo }}
                  style={{ width: 96, height: 96 }}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require('@assets/Subject.png')}
                  style={{ width: 48, height: 48 }}
                />
              )}
              </View>
              <Text
                className="text-4xl font-bold tracking-tight"
                style={{ color: isDark ? '#fafaf9' : COFFEE.darkRoast }}
              >
                {tenant?.shopName ?? brandName}
              </Text>
              <Text
                className="text-base mt-2"
                style={{ color: isDark ? '#a1a1aa' : COFFEE.mocha }}
              >
                Crea tus ordenes y monitorea su progreso en tiempo real
              </Text>
            </View>

            <View
              className="w-full rounded-2xl p-6 border"
              style={{
                backgroundColor: isDark ? '#18181b' : '#fff',
                borderColor: isDark ? COFFEE.accent : COFFEE.tan,
              }}
            >
              <Text
                className="text-xl font-bold mb-1"
                style={{ color: isDark ? '#fafaf9' : COFFEE.darkRoast }}
              >
                Bienvenido
              </Text>
              <Text
                className="text-sm mb-6"
                style={{ color: isDark ? '#a1a1aa' : COFFEE.mocha }}
              >
                Ingresa tus credenciales para continuar
              </Text>

              <LoginForm navigation={navigation} />

              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                className="items-center mt-4"
              >
                <Text
                  className="text-sm"
                  style={{ color: isDark ? '#a1a1aa' : COFFEE.mocha }}
                >
                  ¿No tienes cuenta?{' '}
                  <Text className="font-medium" style={{ color: COFFEE.accent }}>
                    Regístrate
                  </Text>
                </Text>
              </TouchableOpacity>

              <Text
                className="text-xs text-center mt-5"
                style={{ color: isDark ? '#52525b' : COFFEE.caramel }}
              >
                version 1.0.0
              </Text>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
