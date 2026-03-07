import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Plus, Star } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import type { Item } from '../../../shared/types/items.types';
import { COFFEE } from '../constants/coffee';

type ProductCardProps = {
  item: Item;
  isDark: boolean;
  cardWidth: number;
  onPress: (item: Item) => void;
};

export function ProductCard({ item, cardWidth, onPress }: Readonly<ProductCardProps>) {
  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      activeOpacity={0.9}
      style={{
        width: cardWidth,
        marginBottom: 18,
        borderRadius: 26,
        overflow: 'hidden',
      }}
    >
      <View style={{ height: cardWidth * 1.25 }}>

        <Image
          source={{
            uri:
              item.images?.[0] ??
              'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
          }}
          style={{
            width: '100%',
            height: '100%',
          }}
          resizeMode="cover"
        />

        <View
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.45)',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 20,
          }}
        >
          <Star size={12} color="#FFD43B" fill="#FFD43B" />
          <Text
            style={{
              color: '#fff',
              fontSize: 13,
              fontWeight: '600',
              marginLeft: 4,
            }}
          >
            {item.rating ?? '4.9'}
          </Text>
        </View>

        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.75)']}
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            height: '55%',
          }}
        />

        <BlurView
          intensity={25}
          tint="dark"
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            padding: 5,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              color: '#fff',
              fontSize: 20,
              fontWeight: '700',
            }}
          >
            {item.name}
          </Text>

          <Text
            numberOfLines={1}
            style={{
              color: '#e7e5e4',
              fontSize: 14,
              marginTop: 2,
            }}
          >
            {item.description ?? 'Delicious coffee'}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              marginTop: 6,
              alignItems: 'center',
            }}
          >
          </View>

          <View
            style={{
              marginTop: 12,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontSize: 18,
                fontWeight: '800',
              }}
            >
              ${item.price.toFixed(2)}
            </Text>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COFFEE.caramel,
                paddingHorizontal: 18,
                paddingVertical: 10,
                borderRadius: 18,
              }}
            >
              <Plus size={16} color="#fff" />
              <Text
                style={{
                  color: '#fff',
                  fontWeight: '700',
                  marginLeft: 6,
                }}
              >
                Add
              </Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </TouchableOpacity>
  );
}
