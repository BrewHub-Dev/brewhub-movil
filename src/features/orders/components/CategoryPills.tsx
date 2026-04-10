import React, { forwardRef } from 'react';
import { ScrollView, TouchableOpacity, Text, View } from 'react-native';
import { COFFEE } from '../constants/coffee';

type CategoryPillsProps = {
  categories: string[];
  selectedCategory: string | null;
  isDark: boolean;
  searchText: string;
  onSelectCategory: (category: string) => void;
};

export const CategoryPills = forwardRef<ScrollView, CategoryPillsProps>(
  ({ categories, selectedCategory, isDark, searchText, onSelectCategory }, ref) => {
    if (categories.length === 0 || searchText) return null;

    return (
      <ScrollView
        ref={ref}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 12,
        }}
      >
        {categories.map((cat, index) => {
          const isActive = selectedCategory === cat;

          return (
            <TouchableOpacity
              key={cat}
              onPress={() => onSelectCategory(cat)}
              activeOpacity={0.8}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 20,
                backgroundColor: isActive
                  ? isDark
                    ? COFFEE.mocha
                    : COFFEE.caramel
                  : isDark
                    ? '#27272a'
                    : '#f5f5f4',
                borderWidth: isActive ? 0 : 1,
                borderColor: isDark ? '#3f3f46' : COFFEE.tan,
                marginRight: index === categories.length - 1 ? 20 : 12,
                minWidth: 70,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: isActive ? '600' : '500',
                    color: isActive ? '#fff' : isDark ? '#a1a1aa' : COFFEE.espresso,
                    textAlign: 'center',
                  }}
                >
                  {cat}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }
);
