import React, { useReducer, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getItemsByShopId } from '../services/itemService';
import { getBranchById } from '../services/branchService';
import { favoritesService } from '../../favorites/services/favoritesService';
import { useCart } from '../providers/CartProvider';
import type { Item } from '../../../shared/types/items.types';
import type { MenuScreenProps } from '../../../navigation/types';
import { COFFEE } from '../constants/coffee';
import { ProductCard } from '../components/ProductCard';
import { CategoryPills } from '../components/CategoryPills';
import { SearchBar } from '../components/SearchBar';
import { FloatingCart } from '../components/FloatingCart';
import { DetailModal } from '../components/DetailModal';

const CARD_GAP = 12;
const CARD_PADDING = 20;

type MenuState = {
  selectedItem: Item | null;
  selectedModifiers: Record<string, string>;
  quantity: number;
  selectedCategory: string | null;
  searchText: string;
};

type MenuAction =
  | { type: 'SELECT_ITEM'; item: Item }
  | { type: 'SET_MODIFIER'; modifierName: string; optionName: string }
  | { type: 'SET_QUANTITY'; quantity: number }
  | { type: 'SET_CATEGORY'; category: string | null }
  | { type: 'SET_SEARCH'; text: string }
  | { type: 'CLEAR_SELECTION' };

function menuReducer(state: MenuState, action: MenuAction): MenuState {
  switch (action.type) {
    case 'SELECT_ITEM':
      return { ...state, selectedItem: action.item, selectedModifiers: {}, quantity: 1 };
    case 'SET_MODIFIER':
      return { ...state, selectedModifiers: { ...state.selectedModifiers, [action.modifierName]: action.optionName } };
    case 'SET_QUANTITY':
      return { ...state, quantity: action.quantity };
    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.category };
    case 'SET_SEARCH':
      return { ...state, searchText: action.text };
    case 'CLEAR_SELECTION':
      return { ...state, selectedItem: null, selectedModifiers: {}, quantity: 1 };
  }
}

export function MenuScreen({ navigation, route }: Readonly<MenuScreenProps>) {
  const { branchId } = route.params;
  const { width: screenWidth } = useWindowDimensions();
  const CARD_WIDTH = (screenWidth - CARD_PADDING * 2 - CARD_GAP) / 2;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [state, dispatch] = useReducer(menuReducer, {
    selectedItem: null,
    selectedModifiers: {},
    quantity: 1,
    selectedCategory: null,
    searchText: '',
  });

  const { selectedItem, selectedModifiers, quantity, selectedCategory, searchText } = state;
  const cart = useCart();
  const categoryPillsRef = useRef<ScrollView>(null);

  const { data: branch } = useQuery({
    queryKey: ['branch', branchId],
    queryFn: () => getBranchById(branchId),
  });

  const { data: items, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['items', branch?.ShopId],
    queryFn: () => getItemsByShopId(branch!.ShopId),
    enabled: !!branch?.ShopId,
  });

  const { data: favoriteItemIds } = useQuery({
    queryKey: ['favorites', branch?.ShopId],
    queryFn: () => favoritesService.getFavoritesByShopId(branch!.ShopId),
    enabled: !!branch?.ShopId,
  });

  const favoriteSet = new Set(favoriteItemIds || []);

  const activeItems = items?.filter((item) => item.active) || [];

  const groupedByCategory = activeItems.reduce(
    (acc, item) => {
      const cat = item.category?.name || 'Sin categoría';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    },
    {} as Record<string, Item[]>,
  );

  const categories = Object.keys(groupedByCategory);

  const allItemsByCategory = categories.flatMap(cat => groupedByCategory[cat]);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      dispatch({ type: 'SET_CATEGORY', category: categories[0] });
    }
  }, [categories.length, selectedCategory, categories]);

  useEffect(() => {
    if (selectedCategory && categories.length > 0 && categoryPillsRef.current) {
      const index = categories.indexOf(selectedCategory);
      if (index >= 0) {
        categoryPillsRef.current.scrollTo({ x: index * 100, animated: true });
      }
    }
  }, [selectedCategory, categories]);

  const onScroll = useCallback((event: any) => {
    if (searchText || categories.length === 0) return;
    
    const offsetY = event.nativeEvent.contentOffset.y;
    const visibleItems = Object.values(groupedByCategory).flatMap((items, catIndex) => 
      items.map((item, itemIndex) => ({ ...item, catIndex, itemIndex }))
    );
    
    let accumulatedHeight = 0;
    for (const cat of categories) {
      const catItems = groupedByCategory[cat];
      const catHeight = Math.ceil(catItems.length / 2) * (CARD_WIDTH * 1.25 + CARD_GAP);
      if (offsetY < accumulatedHeight + catHeight) {
        if (cat !== selectedCategory) {
          dispatch({ type: 'SET_CATEGORY', category: cat });
        }
        break;
      }
      accumulatedHeight += catHeight;
    }
  }, [searchText, categories, groupedByCategory, selectedCategory]);

  const displayedItems = useCallback(() => {
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      return activeItems.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q),
      );
    }
    return allItemsByCategory;
  }, [searchText, activeItems, allItemsByCategory]);

  const itemsList = searchText.trim() ? displayedItems() : allItemsByCategory;

  const handleItemPress = useCallback((item: Item) => {
    if (!item.active) return;
    dispatch({ type: 'SELECT_ITEM', item });
  }, []);

  const handleAddPress = useCallback((item: Item) => {
    if (!item.active) return;
    dispatch({ type: 'SELECT_ITEM', item });
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!selectedItem) return;
    const modifiers = Object.entries(selectedModifiers).map(([name, optionName]) => ({
      name,
      optionName,
    }));
    cart.addToCart(selectedItem, quantity, modifiers);
    dispatch({ type: 'CLEAR_SELECTION' });
  }, [selectedItem, selectedModifiers, quantity, cart]);

  const getModalTotal = useCallback(() => {
    if (!selectedItem) return 0;
    const extras = Object.entries(selectedModifiers).reduce((sum, [modName, optName]) => {
      const modifier = selectedItem.modifiers?.find((m) => m.name === modName);
      const option = modifier?.options.find((o) => o.name === optName);
      return sum + (option?.extraPrice ?? 0);
    }, 0);
    return (selectedItem.price + extras) * quantity;
  }, [selectedItem, selectedModifiers, quantity]);

  const renderItem = useCallback(({ item }: { item: Item }) => (
    <ProductCard 
      item={item} 
      isDark={isDark} 
      cardWidth={CARD_WIDTH} 
      onPress={handleItemPress}
      onAddPress={handleAddPress}
      isFavorite={favoriteSet.has(item._id)}
      shopId={branch?.ShopId}
    />
  ), [isDark, CARD_WIDTH, handleItemPress, handleAddPress, favoriteSet, branch?.ShopId]);

  if (isLoading) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: isDark ? '#09090b' : COFFEE.cream }}
      >
        <ActivityIndicator size="large" color={COFFEE.mocha} />
        <Text style={{ marginTop: 16, color: isDark ? '#a1a1aa' : COFFEE.mocha }}>
          Cargando menú...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        className="flex-1 justify-center items-center px-6"
        style={{ backgroundColor: isDark ? '#09090b' : COFFEE.cream }}
      >
        <Text className="text-red-500 text-center text-lg">Error al cargar el menú</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: isDark ? '#09090b' : COFFEE.cream }}>
      <SearchBar
        isDark={isDark}
        searchText={searchText}
        categories={categories}
        onChangeSearchText={(t) => {
          dispatch({ type: 'SET_SEARCH', text: t });
          if (t.trim()) dispatch({ type: 'SET_CATEGORY', category: null });
        }}
        onClearSearch={() => {
          dispatch({ type: 'SET_SEARCH', text: '' });
          if (categories.length > 0) dispatch({ type: 'SET_CATEGORY', category: categories[0] });
        }}
      />

      <CategoryPills
        ref={categoryPillsRef}
        categories={categories}
        selectedCategory={selectedCategory}
        isDark={isDark}
        searchText={searchText}
        onSelectCategory={(cat) => dispatch({ type: 'SET_CATEGORY', category: cat })}
      />

      <FlatList
        data={itemsList}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={{ gap: CARD_GAP, paddingHorizontal: CARD_PADDING }}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 130 }}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={COFFEE.mocha}
            colors={[COFFEE.mocha]}
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Text style={{ fontSize: 44, marginBottom: 12 }}>☕</Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: isDark ? '#71717a' : '#a8a29e',
              }}
            >
              {searchText ? 'Sin resultados' : 'No hay productos disponibles'}
            </Text>
          </View>
        }
      />

      <FloatingCart
        isDark={isDark}
        itemCount={cart.itemCount}
        subtotal={cart.subtotal}
        onPress={() => navigation.navigate('Cart', { branchId })}
      />

      <DetailModal
        selectedItem={selectedItem}
        selectedModifiers={selectedModifiers}
        quantity={quantity}
        isDark={isDark}
        onClose={() => dispatch({ type: 'CLEAR_SELECTION' })}
        onSelectModifier={(modifierName, optionName) =>
          dispatch({ type: 'SET_MODIFIER', modifierName, optionName })
        }
        onChangeQuantity={(delta) =>
          dispatch({ type: 'SET_QUANTITY', quantity: Math.max(1, quantity + delta) })
        }
        onAddToCart={handleAddToCart}
        getModalTotal={getModalTotal}
      />
    </View>
  );
}
