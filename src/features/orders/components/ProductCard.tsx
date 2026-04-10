import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Star, Heart } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import type { Item } from '../../../shared/types/items.types';
import { COFFEE } from '../constants/coffee';
import { favoritesService } from '../../favorites/services/favoritesService';

type ProductCardProps = {
  item: Item;
  isDark: boolean;
  cardWidth: number;
  onPress: (item: Item) => void;
  onAddPress?: (item: Item) => void;
  isFavorite?: boolean;
  shopId?: string;
};

export function ProductCard({ item, cardWidth, onPress, onAddPress, isFavorite: initialFavorite = false, shopId }: Readonly<ProductCardProps>) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsFavorite(initialFavorite);
  }, [initialFavorite]);

  const handleFavoriteToggle = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (isFavorite) {
        await favoritesService.removeFavorite(item._id);
      } else {
        await favoritesService.addFavorite(item._id);
      }
      setIsFavorite(!isFavorite);
      if (shopId) {
        queryClient.invalidateQueries({ queryKey: ['favorites', shopId] });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };
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

        <TouchableOpacity
          onPress={handleFavoriteToggle}
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: 'rgba(0,0,0,0.45)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          disabled={isLoading}
        >
          <Heart
            size={18}
            color={isFavorite ? '#ef4444' : '#fff'}
            fill={isFavorite ? '#ef4444' : 'transparent'}
          />
        </TouchableOpacity>

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
                fontSize: 14,
                fontWeight: '800',
                marginLeft: 5,
              }}
            >
              ${item.price.toFixed(2)}
            </Text>

            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                if (onAddPress) {
                  onAddPress(item);
                } else {
                  onPress(item);
                }
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: COFFEE.caramel,
                paddingHorizontal: 10,
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
