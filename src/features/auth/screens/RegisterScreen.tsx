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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QrCode } from 'lucide-react-native';
import type { RegisterScreenProps } from '../../../navigation/types';
import { registerWithInviteCode } from '../services/authService';
import { useRegisterForm } from '../context/RegisterContext';

export function RegisterScreen({ navigation, route }: Readonly<RegisterScreenProps>) {
  const { formData, setFormData, clearFormData } = useRegisterForm();
  const [name, setName] = useState(formData.name);
  const [emailAddress, setEmailAddress] = useState(formData.emailAddress);
  const [password, setPassword] = useState(formData.password);
  const [inviteCode, setInviteCode] = useState(
    route.params?.inviteCode || formData.inviteCode || ''
  );
  const [isLoading, setIsLoading] = useState(false);

  // Sincronizar cambios de formulario con el contexto
  useEffect(() => {
    setFormData({ name, emailAddress, password, inviteCode });
  }, [name, emailAddress, password, inviteCode]);

  // Actualizar inviteCode cuando viene desde QR scanner
  useEffect(() => {
    if (route.params?.inviteCode) {
      setInviteCode(route.params.inviteCode);
    }
  }, [route.params?.inviteCode]);

  const handleRegister = async () => {
    if (!name.trim() || !emailAddress.trim() || !password.trim() || !inviteCode.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
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

      Alert.alert(
        'Registro Exitoso',
        'Tu cuenta ha sido creada. Ahora puedes iniciar sesión.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error: unknown) {
      Alert.alert('Error', (error as any)?.message || 'No se pudo completar el registro');
    } finally {
      setIsLoading(false);
    }
  };

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
                Crea tu cuenta y comienza a ordenar
              </Text>
            </View>

            <View className="w-full rounded-2xl p-6 border border-zinc-300">
              <Text className="text-dark text-xl font-bold mb-1">
                Registro
              </Text>
              <Text className="text-zinc-500 text-sm mb-6">
                Completa tus datos para crear una cuenta
              </Text>

              <View className="mb-4">
                <Text className="text-zinc-700 text-sm font-medium mb-2">
                  Nombre completo
                </Text>
                <TextInput
                  className="border border-zinc-300 rounded-xl px-4 py-3 text-dark"
                  placeholder="Juan Pérez"
                  placeholderTextColor="#a1a1aa"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>

              <View className="mb-4">
                <Text className="text-zinc-700 text-sm font-medium mb-2">
                  Correo electrónico
                </Text>
                <TextInput
                  className="border border-zinc-300 rounded-xl px-4 py-3 text-dark"
                  placeholder="tu@email.com"
                  placeholderTextColor="#a1a1aa"
                  value={emailAddress}
                  onChangeText={setEmailAddress}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View className="mb-4">
                <Text className="text-zinc-700 text-sm font-medium mb-2">
                  Contraseña
                </Text>
                <TextInput
                  className="border border-zinc-300 rounded-xl px-4 py-3 text-dark"
                  placeholder="••••••••"
                  placeholderTextColor="#a1a1aa"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <View className="mb-6">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-zinc-700 text-sm font-medium">
                    Código de invitación
                  </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('QRScanner', { fromRegister: true })}
                    className="flex-row items-center"
                  >
                    <QrCode size={16} color="#f59e0b" />
                    <Text className="text-amber-500 text-sm font-medium ml-1">
                      Escanear QR
                    </Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  className="border border-zinc-300 rounded-xl px-4 py-3 text-dark"
                  placeholder="CAFE-ABC-2024"
                  placeholderTextColor="#a1a1aa"
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
                <Text className="text-zinc-600 text-sm">
                  ¿Ya tienes cuenta?{' '}
                  <Text className="text-amber-500 font-medium">
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
