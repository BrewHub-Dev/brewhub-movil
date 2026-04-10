import React, { useCallback, useReducer } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
  useColorScheme,
  RefreshControl,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesService, type FavoriteItem } from '../services/favoritesService';
import { COFFEE } from '../../orders/constants/coffee';
import { Heart, ArrowLeft, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import type { Item } from '../../../shared/types/items.types';
import type { FavoritesScreenProps } from '../../../navigation/types';

const CARD_GAP = 12;
const CARD_PADDING = 20;

type FavoritesState = {
  selectedItem: Item | null;
};

type FavoritesAction =
  | { type: 'SELECT_ITEM'; item: Item }
  | { type: 'CLEAR_SELECTION' };

function favoritesReducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  switch (action.type) {
    case 'SELECT_ITEM':
      return { ...state, selectedItem: action.item };
    case 'CLEAR_SELECTION':
      return { ...state, selectedItem: null };
    default:
      return state;
  }
}

type FavoriteItemData = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  images?: string[];
  rating?: number;
  ShopId?: string;
  active?: boolean;
  categoryId?: string;
  taxIncluded?: boolean;
  modifiers?: Array<{
    name: string;
    required: boolean;
    options: Array<{ name: string; extraPrice: number }>;
  }>;
};

function FavoriteCard({ 
  item, 
  isDark, 
  cardWidth, 
  onPress,
  onRemove 
}: { 
  item: FavoriteItemData;
  isDark: boolean;
  cardWidth: number;
  onPress: () => void;
  onRemove: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
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
            uri: item.images?.[0] ?? 'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
          }}
          style={{ width: '100%', height: '100%' }}
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
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600', marginLeft: 4 }}>
            {item.rating ?? '4.9'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onRemove}
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
        >
          <Heart size={18} color="#ef4444" fill="#ef4444" />
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
          <Text numberOfLines={1} style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>
            {item.name}
          </Text>
          <Text numberOfLines={1} style={{ color: '#e7e5e4', fontSize: 14, marginTop: 2 }}>
            {item.description ?? 'Delicious coffee'}
          </Text>
          <View style={{ flexDirection: 'row', marginTop: 12, justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800', marginLeft: 5 }}>
              ${item.price.toFixed(2)}
            </Text>
          </View>
        </BlurView>
      </View>
    </TouchableOpacity>
  );
}

function ItemDetailModal({ 
  item, 
  isDark, 
  onClose 
}: { 
  item: Item | null;
  isDark: boolean;
  onClose: () => void;
}) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  if (!item) return null;

  const colors = {
    bg: isDark ? '#09090b' : '#f5f5f4',
    sheet: isDark ? '#18181b' : '#ffffff',
    title: isDark ? '#fafaf9' : COFFEE.darkRoast,
    text: isDark ? '#e4e4e7' : '#44403c',
    muted: isDark ? '#a1a1aa' : '#78716c',
    icon: isDark ? '#fafaf9' : COFFEE.espresso,
  };

  return (
    <Modal visible={!!item} animationType="slide" transparent={false} statusBarTranslucent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={{ height: screenHeight * 0.42, position: 'relative' }}>
          {item.images?.length ? (
            <Image source={{ uri: item.images[0] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
          ) : (
            <View style={{ flex: 1, backgroundColor: isDark ? '#1c1917' : COFFEE.latte, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 80 }}>☕</Text>
            </View>
          )}

          <View style={{ position: 'absolute', top: 56, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={onClose} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: isDark ? 'rgba(24,24,27,0.7)' : 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowLeft size={20} color={colors.icon} />
            </TouchableOpacity>
            <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: isDark ? 'rgba(24,24,27,0.7)' : 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={20} color={colors.icon} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ flex: 1, marginTop: -28, borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, backgroundColor: colors.sheet }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={{ fontSize: 26, fontWeight: '800', color: colors.title }}>{item.name}</Text>
            {item.description && (
              <Text style={{ marginTop: 6, fontSize: 14, color: colors.muted }}>{item.description}</Text>
            )}

            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
              <Star size={18} color="#FFD43B" fill="#FFD43B" />
              <Text style={{ color: colors.text, fontWeight: '600', marginLeft: 6 }}>{item.rating ?? '4.9'}</Text>
              <Text style={{ color: colors.muted, marginLeft: 4 }}>• 145 reviews</Text>
            </View>

            {item.modifiers && item.modifiers.length > 0 && (
              <View style={{ marginTop: 28 }}>
                <Text style={{ fontSize: 17, fontWeight: '700', color: colors.title, marginBottom: 18 }}>Personaliza tu bebida</Text>
                {item.modifiers.map((modifier) => (
                  <View key={modifier.name} style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 10 }}>
                      {modifier.name}
                      {modifier.required && <Text style={{ color: '#ef4444' }}> *</Text>}
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {modifier.options.map((option) => (
                        <TouchableOpacity
                          key={option.name}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 12,
                            backgroundColor: isDark ? '#27272a' : '#f3f4f6',
                            borderWidth: 1,
                            borderColor: isDark ? '#3f3f46' : '#e5e7eb',
                          }}
                        >
                          <Text style={{ color: colors.text, fontWeight: '500' }}>{option.name}</Text>
                          {option.extraPrice > 0 && (
                            <Text style={{ color: colors.muted, fontSize: 12 }}>+${option.extraPrice.toFixed(2)}</Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={{ height: 100 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function FavoritesScreen({ navigation }: Readonly<FavoritesScreenProps>) {
  const { width: screenWidth } = useWindowDimensions();
  const CARD_WIDTH = (screenWidth - CARD_PADDING * 2 - CARD_GAP) / 2;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const queryClient = useQueryClient();
  const [state, dispatch] = useReducer(favoritesReducer, { selectedItem: null });

  const { data: favorites, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesService.getFavorites(),
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => favoritesService.removeFavorite(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  });

  const handleItemPress = useCallback((item: Item) => {
    dispatch({ type: 'SELECT_ITEM', item });
  }, []);

  const handleCloseModal = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  const handleRemoveFavorite = useCallback((itemId: string) => {
    removeMutation.mutate(itemId);
  }, [removeMutation]);

  const renderItem = useCallback(({ item }: { item: FavoriteItem }) => {
    const favoriteItem = item.item;
    if (!favoriteItem) return null;
    return (
      <FavoriteCard
        item={favoriteItem as FavoriteItemData}
        isDark={isDark}
        cardWidth={CARD_WIDTH}
        onPress={() => handleItemPress(favoriteItem as any)}
        onRemove={() => handleRemoveFavorite(favoriteItem._id)}
      />
    );
  }, [isDark, CARD_WIDTH, handleItemPress, handleRemoveFavorite]);

  const subtextColor = isDark ? '#a1a1aa' : COFFEE.mocha;
  const titleColor = isDark ? '#fafaf9' : COFFEE.darkRoast;

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: isDark ? '#09090b' : COFFEE.cream }}>
        <ActivityIndicator size="large" color={COFFEE.mocha} />
        <Text style={{ marginTop: 16, color: subtextColor }}>Cargando favoritos...</Text>
      </View>
    );
  }

  const favoriteItems = favorites ?? [];

  return (
    <View className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : COFFEE.cream }}>
      <FlatList
        data={favoriteItems}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={{ gap: CARD_GAP, paddingHorizontal: CARD_PADDING }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COFFEE.mocha} colors={[COFFEE.mocha]} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <View className="w-20 h-20 rounded-full items-center justify-center mb-4" style={{ backgroundColor: isDark ? '#27272a' : '#f3f4f6' }}>
              <Heart size={36} color={subtextColor} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '600', color: titleColor, marginBottom: 8 }}>Sin favoritos aún</Text>
            <Text style={{ fontSize: 14, color: subtextColor, textAlign: 'center' }}>Los productos que guardes aparecerán aquí</Text>
          </View>
        }
      />

      <ItemDetailModal item={state.selectedItem} isDark={isDark} onClose={handleCloseModal} />
    </View>
  );
}
