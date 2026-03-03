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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoginForm } from '../components/LoginForm';
import type { LoginScreenProps } from '../../../navigation/types';

export function LoginScreen({ navigation }: Readonly<LoginScreenProps>) {
  return (
    <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#09090b" />

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
              <View className="w-24 h-24 rounded-3xl bg-amber-500 items-center justify-center mb-5 shadow-2xl">
              <Image
                source={require('@assets/Subject.png')}
                style={{ width: 48, height: 48 }}
              />
              </View>
              <Text className="text-dark text-4xl font-bold tracking-tight">
                Brewsy
              </Text>
              <Text className="text-zinc-400 text-base mt-2">
                Crea tus ordenes y monitorea su progreso en tiempo real
              </Text>
            </View>

            <View className="w-full rounded-2xl p-6 border border-zinc-300">
              <Text className="text-dark text-xl font-bold mb-1">
                Bienvenido
              </Text>
              <Text className="text-zinc-500 text-sm mb-6">
                Ingresa tus credenciales para continuar
              </Text>

              <LoginForm navigation={navigation} />

              <TouchableOpacity
                onPress={() => navigation.navigate('Register')}
                className="items-center mt-4"
              >
                <Text className="text-zinc-600 text-sm">
                  ¿No tienes cuenta?{' '}
                  <Text className="text-amber-500 font-medium">
                    Regístrate
                  </Text>
                </Text>
              </TouchableOpacity>

              <Text className="text-zinc-600 text-xs text-center mt-5">
                version 1.0.0
              </Text>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
