import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QrCode } from 'lucide-react-native';
import type { RegisterScreenProps } from '../../../navigation/types';
import { registerWithInviteCode } from '../services/authService';
import { useRegisterForm } from '../context/RegisterContext';
import { showAlert } from '@/shared/services/alert';
import { COFFEE } from '../../orders/constants/coffee';

export function RegisterScreen({ navigation, route }: Readonly<RegisterScreenProps>) {
  const { formData, setFormData, clearFormData } = useRegisterForm();
  const [name, setName] = useState(formData.name);
  const [emailAddress, setEmailAddress] = useState(formData.emailAddress);
  const [password, setPassword] = useState(formData.password);
  const [inviteCode, setInviteCode] = useState(
    route.params?.inviteCode || formData.inviteCode || ''
  );
  const [isLoading, setIsLoading] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    setFormData({ name, emailAddress, password, inviteCode });
  }, [name, emailAddress, password, inviteCode]);

  useEffect(() => {
    if (route.params?.inviteCode) {
      setInviteCode(route.params.inviteCode);
    }
  }, [route.params?.inviteCode]);

  const handleRegister = async () => {
    if (!name.trim() || !emailAddress.trim() || !password.trim() || !inviteCode.trim()) {
      showAlert('Error', 'Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    try {
      await registerWithInviteCode({
        name,
        emailAddress,
        password,
        inviteCode,
      });

      clearFormData();

      showAlert(
        'Registro Exitoso',
        'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: unknown) {
      showAlert('Error', (error as any)?.message || 'No se pudo completar el registro');
    } finally {
      setIsLoading(false);
    }
  };

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
              <View className="w-24 h-24 rounded-3xl bg-amber-500 items-center justify-center mb-5 shadow-2xl">
                <Image
                  source={require('@assets/Subject.png')}
                  style={{ width: 48, height: 48 }}
                />
              </View>
              <Text
                className="text-4xl font-bold tracking-tight"
                style={{ color: isDark ? '#fafaf9' : COFFEE.darkRoast }}
              >
                Brewsy
              </Text>
              <Text
                className="text-base mt-2"
                style={{ color: isDark ? COFFEE.latte : COFFEE.mocha }}
              >
                Crea tu cuenta y comienza a ordenar
              </Text>
            </View>

            <View
              className="w-full rounded-2xl p-6 border"
              style={{
                backgroundColor: isDark ? COFFEE.darkRoast : '#fff',
                borderColor: COFFEE.accent,
              }}
            >
              <Text
                className="text-xl font-bold mb-1"
                style={{ color: isDark ? '#fafaf9' : COFFEE.darkRoast }}
              >
                Registro
              </Text>
              <Text
                className="text-sm mb-6"
                style={{ color: isDark ? COFFEE.latte : COFFEE.mocha }}
              >
                Completa tus datos para crear una cuenta
              </Text>

              <View className="mb-4">
                <Text
                  className="text-sm font-medium mb-2"
                  style={{ color: isDark ? COFFEE.latte : COFFEE.darkRoast }}
                >
                  Nombre completo
                </Text>
                <TextInput
                  className={`border rounded-xl px-4 py-3 ${isDark ? 'text-white bg-zinc-900' : 'text-gray-900 bg-white'}`}
                  style={{ borderColor: COFFEE.accent }}
                  placeholder="Juan Pérez"
                  placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View className="mb-4">
                <Text
                  className="text-sm font-medium mb-2"
                  style={{ color: isDark ? COFFEE.latte : COFFEE.darkRoast }}
                >
                  Correo electrónico
                </Text>
                <TextInput
                  className={`border rounded-xl px-4 py-3 ${isDark ? 'text-white bg-zinc-900' : 'text-gray-900 bg-white'}`}
                  style={{ borderColor: COFFEE.accent }}
                  placeholder="tu@email.com"
                  placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
                  value={emailAddress}
                  onChangeText={setEmailAddress}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View className="mb-4">
                <Text
                  className="text-sm font-medium mb-2"
                  style={{ color: isDark ? COFFEE.latte : COFFEE.darkRoast }}
                >
                  Contraseña
                </Text>
                <TextInput
                  className={`border rounded-xl px-4 py-3 ${isDark ? 'text-white bg-zinc-900' : 'text-gray-900 bg-white'}`}
                  style={{ borderColor: COFFEE.accent }}
                  placeholder="••••••••"
                  placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <View className="mb-6">
                <View className="flex-row justify-between items-center mb-2">
                  <Text
                    className="text-sm font-medium"
                    style={{ color: isDark ? COFFEE.latte : COFFEE.darkRoast }}
                  >
                    Código de invitación
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('QRScanner', { fromRegister: true })}
                    className="flex-row items-center"
                  >
                    <QrCode size={16} color={COFFEE.accent} />
                    <Text className="text-sm font-medium ml-1" style={{ color: COFFEE.accent }}>
                      Escanear QR
                    </Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  className={`border rounded-xl px-4 py-3 ${isDark ? 'text-white bg-zinc-900' : 'text-gray-900 bg-white'}`}
                  style={{ borderColor: COFFEE.accent }}
                  placeholder="CAFE-ABC-2024"
                  placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
                  value={inviteCode}
                  onChangeText={setInviteCode}
                  autoCapitalize="characters"
                />
              </View>

              <TouchableOpacity
                className="bg-amber-500 rounded-xl py-4 items-center mb-4"
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white font-bold text-base">
                    Crear cuenta
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                className="items-center"
              >
                <Text
                  className="text-sm"
                  style={{ color: isDark ? COFFEE.latte : COFFEE.mocha }}
                >
                  ¿Ya tienes cuenta?{' '}
                  <Text className="font-medium" style={{ color: COFFEE.accent }}>
                    Inicia sesión
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
