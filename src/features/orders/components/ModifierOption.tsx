import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import type { ItemModifierOption } from '../../../shared/types/items.types';
import { COFFEE } from '../constants/coffee';

type ModifierOptionProps = {
  option: ItemModifierOption;
  isSelected: boolean;
  isDark: boolean;
  onSelect: () => void;
};

export function ModifierOption({ option, isSelected, isDark, onSelect }: Readonly<ModifierOptionProps>) {
  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.75}
      className={`px-5 py-2.5 rounded-2xl border ${
        isSelected
          ? 'border-transparent'
          : isDark
            ? 'border-zinc-700'
            : 'border-stone-200'
      }`}
      style={
        isSelected
          ? { backgroundColor: isDark ? COFFEE.mocha : COFFEE.caramel }
          : { backgroundColor: isDark ? 'rgba(63,63,70,0.5)' : 'rgba(255,255,255,0.7)' }
      }
    >
      <Text
        className={`text-sm font-semibold ${
          isSelected ? 'text-white' : isDark ? 'text-zinc-300' : 'text-stone-600'
        }`}
      >
        {option.name}
        {option.extraPrice > 0 ? ` +$${option.extraPrice.toFixed(2)}` : ''}
      </Text>
    </TouchableOpacity>
  );
}
