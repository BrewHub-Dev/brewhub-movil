import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getItemsByShopId } from '../services/itemService';
import { getBranchById } from '../services/branchService';
import { useCart } from '../providers/CartProvider';
import type { Item } from '../../../shared/types/items.types';
import type { MenuScreenProps } from '../../../navigation/types';
import { COFFEE } from '../constants/coffee';
import { ProductCard } from '../components/ProductCard';
import { CategoryPills } from '../components/CategoryPills';
import { SearchBar } from '../components/SearchBar';
import { FloatingCart } from '../components/FloatingCart';
import { DetailModal } from '../components/DetailModal';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = 12;
const CARD_PADDING = 20;
const CARD_WIDTH = (SCREEN_WIDTH - CARD_PADDING * 2 - CARD_GAP) / 2;

export function MenuScreen({ navigation, route }: Readonly<MenuScreenProps>) {
  const { branchId } = route.params;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const cart = useCart();

  const { data: branch } = useQuery({
    queryKey: ['branch', branchId],
    queryFn: () => getBranchById(branchId),
  });

  const { data: items, isLoading, error } = useQuery({
    queryKey: ['items', branch?.ShopId],
    queryFn: () => getItemsByShopId(branch!.ShopId),
    enabled: !!branch?.ShopId,
  });

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

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
  }, [categories.length]);

  const getDisplayedItems = useCallback(() => {
    let pool = selectedCategory ? groupedByCategory[selectedCategory] ?? [] : activeItems;
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      pool = activeItems.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q),
      );
    }
    return pool;
  }, [selectedCategory, searchText, activeItems, groupedByCategory]);

  const displayedItems = getDisplayedItems();

  const handleSelectModifier = (modifierName: string, optionName: string) => {
    setSelectedModifiers((prev) => ({ ...prev, [modifierName]: optionName }));
  };

  const handleItemPress = (item: Item) => {
    if (!item.active) return;
    setSelectedItem(item);
    setSelectedModifiers({});
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!selectedItem) return;
    const modifiers = Object.entries(selectedModifiers).map(([name, optionName]) => ({
      name,
      optionName,
    }));
    cart.addToCart(selectedItem, quantity, modifiers);
    setSelectedItem(null);
    setSelectedModifiers({});
    setQuantity(1);
  };

  const getModalTotal = () => {
    if (!selectedItem) return 0;
    const extras = Object.entries(selectedModifiers).reduce((sum, [modName, optName]) => {
      const modifier = selectedItem.modifiers?.find((m) => m.name === modName);
      const option = modifier?.options.find((o) => o.name === optName);
      return sum + (option?.extraPrice ?? 0);
    }, 0);
    return (selectedItem.price + extras) * quantity;
  };

  if (isLoading) {
    return (
      <View
        className={`flex-1 justify-center items-center`}
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
          setSearchText(t);
          if (t.trim()) setSelectedCategory(null);
        }}
        onClearSearch={() => {
          setSearchText('');
          if (categories.length > 0) setSelectedCategory(categories[0]);
        }}
      />

      <CategoryPills
        categories={categories}
        selectedCategory={selectedCategory}
        isDark={isDark}
        searchText={searchText}
        onSelectCategory={setSelectedCategory}
      />

      <FlatList
        data={displayedItems}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={{ gap: CARD_GAP, paddingHorizontal: CARD_PADDING }}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 130 }}
        renderItem={({ item }) => <ProductCard item={item} isDark={isDark} cardWidth={CARD_WIDTH} onPress={handleItemPress} />}
        showsVerticalScrollIndicator={false}
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
        onClose={() => setSelectedItem(null)}
        onSelectModifier={handleSelectModifier}
        onChangeQuantity={(delta) => setQuantity(q => Math.max(1, q + delta))}
        onAddToCart={handleAddToCart}
        getModalTotal={getModalTotal}
      />
    </View>
  );
}
