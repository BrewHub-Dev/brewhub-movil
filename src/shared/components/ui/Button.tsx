import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  loading?: boolean;
  variant?: 'primary' | 'outline';
}

export function Button({
  label,
  loading,
  variant = 'primary',
  disabled,
  ...props
}: Readonly<ButtonProps>) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      disabled={isDisabled}
      activeOpacity={0.8}
      className={`w-full flex-row items-center justify-center py-4 rounded-xl ${
        variant === 'primary'
          ? isDisabled
            ? 'bg-amber-700 opacity-60'
            : 'bg-amber-500'
          : 'border border-amber-500'
      }`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#18181b' : '#f59e0b'}
          size="small"
        />
      ) : (
        <Text
          className={`text-base font-bold ${
            variant === 'primary' ? 'text-zinc-900' : 'text-amber-500'
          }`}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
