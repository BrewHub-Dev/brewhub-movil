import React, { useState } from 'react';
import { View, Text } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { useLogin } from '../hooks/useLogin';
import type { RootStackParamList } from '../../../navigation/types';

interface LoginFormProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
}

export function LoginForm({ navigation }: Readonly<LoginFormProps>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { mutate: login, isPending, error } = useLogin();

  function handleSubmit() {
    if (!email.trim() || !password) return;
    login(
      { emailAddress: email.trim(), password },
      {
        onSuccess: () => {
          navigation.replace('Home');
        },
      },
    );
  }

  return (
    <View className="w-full">
      <Input
        label="Correo electrónico"
        placeholder="enter emailAddress"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoComplete="email"
      />

      <Input
        label="Contraseña"
        placeholder="••••••••"
        secureTextEntry
        showPasswordToggle
        value={password}
        onChangeText={setPassword}
        autoComplete="password"
      />

      {error && (
        <View className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <Text className="text-red-400 text-sm text-center">
            {(error).message}
          </Text>
        </View>
      )}

      <Button
        label="Iniciar sesión"
        onPress={handleSubmit}
        loading={isPending}
        disabled={!email.trim() || !password}
      />
    </View>
  );
}
