import React, { useReducer, useEffect } from 'react';
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

type FormState = {
  name: string;
  emailAddress: string;
  password: string;
  inviteCode: string;
  isLoading: boolean;
};

type FormAction =
  | { type: 'SET_FIELD'; field: keyof Omit<FormState, 'isLoading'>; value: string }
  | { type: 'SET_LOADING'; value: boolean };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_LOADING':
      return { ...state, isLoading: action.value };
  }
}

export function RegisterScreen({ navigation, route }: Readonly<RegisterScreenProps>) {
  const { formData, setFormData, clearFormData } = useRegisterForm();
  const [state, dispatch] = useReducer(formReducer, {
    name: formData.name,
    emailAddress: formData.emailAddress,
    password: formData.password,
    inviteCode: route.params?.inviteCode || formData.inviteCode || '',
    isLoading: false,
  });
  const { name, emailAddress, password, inviteCode, isLoading } = state;

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const setField = (field: keyof Omit<FormState, 'isLoading'>, value: string) => {
    dispatch({ type: 'SET_FIELD', field, value });
    setFormData({ ...state, [field]: value });
  };

  useEffect(() => {
    if (route.params?.inviteCode) {
      dispatch({ type: 'SET_FIELD', field: 'inviteCode', value: route.params.inviteCode });
    }
  }, [route.params?.inviteCode]);

  const handleRegister = async () => {
    if (!name.trim() || !emailAddress.trim() || !password.trim() || !inviteCode.trim()) {
      showAlert('Error', 'Por favor completa todos los campos');
      return;
    }

    dispatch({ type: 'SET_LOADING', value: true });
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
      dispatch({ type: 'SET_LOADING', value: false });
    }
  };

  const inputBg = isDark ? '#1c1917' : '#fff';
  const inputBorder = isDark ? COFFEE.accent : COFFEE.tan;
  const inputText = isDark ? '#fafaf9' : COFFEE.darkRoast;
  const labelColor = isDark ? '#d4d4d8' : COFFEE.darkRoast;
  const subtextColor = isDark ? '#a1a1aa' : COFFEE.mocha;

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
              <View className="w-24 h-24 rounded-3xl items-center justify-center mb-5 shadow-2xl"
                style={{ backgroundColor: COFFEE.accent }}>
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
                style={{ color: subtextColor }}
              >
                Crea tu cuenta y comienza a ordenar
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
                Registro
              </Text>
              <Text
                className="text-sm mb-6"
                style={{ color: subtextColor }}
              >
                Completa tus datos para crear una cuenta
              </Text>

              <View className="mb-4">
                <Text className="text-sm font-medium mb-2" style={{ color: labelColor }}>
                  Nombre completo
                </Text>
                <TextInput
                  className="rounded-xl px-4 py-3"
                  style={{ backgroundColor: inputBg, borderWidth: 1, borderColor: inputBorder, color: inputText }}
                  placeholder="Juan Pérez"
                  placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
                  value={name}
                  onChangeText={(v) => setField('name', v)}
                  autoCapitalize="words"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium mb-2" style={{ color: labelColor }}>
                  Correo electrónico
                </Text>
                <TextInput
                  className="rounded-xl px-4 py-3"
                  style={{ backgroundColor: inputBg, borderWidth: 1, borderColor: inputBorder, color: inputText }}
                  placeholder="tu@email.com"
                  placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
                  value={emailAddress}
                  onChangeText={(v) => setField('emailAddress', v)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium mb-2" style={{ color: labelColor }}>
                  Contraseña
                </Text>
                <TextInput
                  className="rounded-xl px-4 py-3"
                  style={{ backgroundColor: inputBg, borderWidth: 1, borderColor: inputBorder, color: inputText }}
                  placeholder="••••••••"
                  placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
                  value={password}
                  onChangeText={(v) => setField('password', v)}
                  secureTextEntry
                />
              </View>

              <View className="mb-6">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-sm font-medium" style={{ color: labelColor }}>
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
                  className="rounded-xl px-4 py-3"
                  style={{ backgroundColor: inputBg, borderWidth: 1, borderColor: inputBorder, color: inputText }}
                  placeholder="CAFE-ABC-2024"
                  placeholderTextColor={isDark ? '#52525b' : '#a1a1aa'}
                  value={inviteCode}
                  onChangeText={(v) => setField('inviteCode', v)}
                  autoCapitalize="characters"
                />
              </View>

              <TouchableOpacity
                className="rounded-xl py-4 items-center mb-4"
                style={{ backgroundColor: COFFEE.accent }}
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
                <Text className="text-sm" style={{ color: subtextColor }}>
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
