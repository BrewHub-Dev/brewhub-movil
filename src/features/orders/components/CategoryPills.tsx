import React from 'react';
import { ScrollView, TouchableOpacity, Text } from 'react-native';
import { COFFEE } from '../constants/coffee';

type CategoryPillsProps = {
  categories: string[];
  selectedCategory: string | null;
  isDark: boolean;
  searchText: string;
  onSelectCategory: (category: string) => void;
};

export function CategoryPills({ categories, selectedCategory, isDark, searchText, onSelectCategory }: Readonly<CategoryPillsProps>) {
  if (categories.length === 0 || searchText) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 6,
        gap: 8,
      }}
    >
      {categories.map((cat) => {
        const isActive = selectedCategory === cat;

        return (
          <TouchableOpacity
            key={cat}
            onPress={() => onSelectCategory(cat)}
            activeOpacity={0.8}
            style={{
              minWidth: 80,
              paddingHorizontal: 18,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: isActive
                ? isDark
                  ? COFFEE.mocha
                  : COFFEE.caramel
                : isDark
                  ? 'rgba(39,39,42,0.5)'
                  : '#fff',
              borderWidth: isActive ? 0 : 1,
              borderColor: isDark ? '#3f3f46' : COFFEE.tan,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: isActive ? '700' : '500',
                color: isActive
                  ? '#fff'
                  : isDark
                    ? '#a1a1aa'
                    : COFFEE.espresso,
              }}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
