import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Heart } from 'lucide-react-native';

interface TipSelectorProps {
  isDark: boolean;
  selectedTip: number;
  onSelectTip: (tip: number) => void;
  subtotal: number;
}

const TIP_OPTIONS = [
  { value: 0, label: '0%' },
  { value: 5, label: '5%' },
  { value: 10, label: '10%' },
  { value: 15, label: '15%' },
  { value: 20, label: '20%' },
];

export function TipSelector({ isDark, selectedTip, onSelectTip, subtotal }: Readonly<TipSelectorProps>) {
  const tipAmount = (subtotal * selectedTip) / 100;

  return (
    <View
      style={{
        backgroundColor: isDark ? '#18181b' : '#fff',
        borderColor: isDark ? '#f59e0b' : '#e5e7eb',
      }}
      className="rounded-3xl p-5 mb-4 border"
    >
      <View className="flex-row items-center mb-4">
        <Heart size={20} color={isDark ? '#f59e0b' : '#f59e0b'} fill="#f59e0b" />
        <Text className={`text-lg font-bold ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Propina
        </Text>
      </View>

      <View className="flex-row gap-2 mb-4">
        {TIP_OPTIONS.map((option) => {
          const isSelected = selectedTip === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onSelectTip(option.value)}
              activeOpacity={0.7}
              className={`flex-1 py-3 rounded-2xl items-center border ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10'
                  : isDark
                  ? 'border-zinc-800 bg-zinc-800/50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <Text
                className={`font-semibold text-base ${
                  isSelected
                    ? isDark
                      ? 'text-amber-400'
                      : 'text-amber-700'
                    : isDark
                    ? 'text-zinc-300'
                    : 'text-gray-700'
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {selectedTip > 0 && (
        <View className={`flex-row justify-between pt-3 border-t ${isDark ? 'border-zinc-800' : 'border-gray-100'}`}>
          <Text className={`text-base ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
            Monto de propina
          </Text>
          <Text className={`text-base font-medium ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
            ${tipAmount.toFixed(2)}
          </Text>
        </View>
      )}
    </View>
  );
}
