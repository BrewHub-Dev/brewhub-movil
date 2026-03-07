import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="w-full mb-5">
      {label && (
        <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
          {label}
        </Text>
      )}

      <View
        className={`flex-row items-center rounded-2xl border px-4 ${
          isDark ? 'bg-zinc-900' : 'bg-white'
        } ${error ? 'border-red-500' : isDark ? 'border-zinc-700' : 'border-zinc-300'}`}
      >
        <TextInput
          className={`flex-1 py-4 text-base ${isDark ? 'text-white' : 'text-black'}`}
          placeholderTextColor={isDark ? '#71717a' : '#9ca3af'}
          secureTextEntry={isPassword ? !visible : false}
          autoCapitalize="none"
          {...props}
        />

        {showPasswordToggle && (
          <TouchableOpacity
            onPress={() => setVisible((v) => !v)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text className={`text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
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
