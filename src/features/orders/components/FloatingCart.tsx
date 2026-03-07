import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { ShoppingBag } from 'lucide-react-native';
import { Glass } from './Glass';
import { COFFEE } from '../constants/coffee';

type FloatingCartProps = {
  isDark: boolean;
  itemCount: number;
  subtotal: number;
  onPress: () => void;
};

export function FloatingCart({ isDark, itemCount, subtotal, onPress }: Readonly<FloatingCartProps>) {
  if (itemCount <= 0) return null;

  return (
    <View className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-2">
      <Glass isDark={isDark} style={{ borderRadius: 22, overflow: 'hidden' }}>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.88}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 16,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <View
              style={{
                backgroundColor: isDark ? COFFEE.mocha : COFFEE.caramel,
                width: 34,
                height: 34,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingBag size={16} color="#fff" />
            </View>
            <Text
              style={{
                color: isDark ? '#fafaf9' : COFFEE.darkRoast,
                fontWeight: '700',
                fontSize: 15,
              }}
            >
              Ver carrito
            </Text>
            <View
              style={{
                backgroundColor: isDark ? 'rgba(200,149,108,0.25)' : 'rgba(200,168,130,0.3)',
                borderRadius: 10,
                paddingHorizontal: 8,
                paddingVertical: 2,
              }}
            >
              <Text
                style={{
                  color: isDark ? COFFEE.accentDark : COFFEE.espresso,
                  fontWeight: '700',
                  fontSize: 13,
                }}
              >
                {itemCount}
              </Text>
            </View>
          </View>
          <Text
            style={{
              color: isDark ? COFFEE.accentDark : COFFEE.espresso,
              fontWeight: '800',
              fontSize: 17,
            }}
          >
            ${subtotal.toFixed(2)}
          </Text>
        </TouchableOpacity>
      </Glass>
    </View>
  );
}
