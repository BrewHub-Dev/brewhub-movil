import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  type TextInputProps,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  showPasswordToggle?: boolean;
}

export function Input({
  label,
  error,
  showPasswordToggle = false,
  secureTextEntry,
  ...props
}: Readonly<InputProps>) {
  const [visible, setVisible] = useState(false);
  const isPassword = showPasswordToggle || secureTextEntry;

  return (
    <View className="w-full mb-5">
      {label && (
        <Text className="text-sm font-medium text-zinc-700 mb-2">
          {label}
        </Text>
      )}

      <View
        className={`flex-row items-center rounded-2xl border bg-white px-4 ${
          error ? 'border-red-500' : 'border-zinc-300'
        }`}
      >
        <TextInput
          className="flex-1 py-4 text-base text-black"
          placeholderTextColor="#9ca3af"
          secureTextEntry={isPassword ? !visible : false}
          autoCapitalize="none"
          {...props}
        />

        {showPasswordToggle && (
          <TouchableOpacity
            onPress={() => setVisible((v) => !v)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text className="text-sm font-medium text-zinc-500">
              {visible ? 'Ocultar' : 'Ver'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text className="text-red-500 text-xs mt-2">
          {error}
        </Text>
      )}
    </View>
  );
}
