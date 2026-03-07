import React from 'react';
import { View, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { COFFEE } from '../constants/coffee';

type SearchBarProps = {
  isDark: boolean;
  searchText: string;
  categories: string[];
  onChangeSearchText: (text: string) => void;
  onClearSearch: () => void;
};

export function SearchBar({ isDark, searchText, onChangeSearchText, onClearSearch }: Readonly<SearchBarProps>) {
  const handleChangeText = (t: string) => {
    onChangeSearchText(t);
  };

  const handleClear = () => {
    onClearSearch();
  };

  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: isDark ? 'rgba(39,39,42,0.6)' : '#fff',
          borderRadius: 16,
          paddingHorizontal: 14,
          paddingVertical: Platform.OS === 'ios' ? 12 : 4,
          borderWidth: 1,
          borderColor: isDark ? '#3f3f46' : COFFEE.tan,
        }}
      >
        <Search size={18} color={isDark ? '#71717a' : COFFEE.caramel} />
        <TextInput
          placeholder="Buscar productos..."
          placeholderTextColor={isDark ? '#52525b' : '#c4b5a4'}
          value={searchText}
          onChangeText={handleChangeText}
          style={{
            flex: 1,
            marginLeft: 10,
            fontSize: 15,
            color: isDark ? '#fafaf9' : COFFEE.darkRoast,
          }}
        />
        {searchText ? (
          <TouchableOpacity onPress={handleClear}>
            <X size={18} color={isDark ? '#71717a' : '#a8a29e'} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
