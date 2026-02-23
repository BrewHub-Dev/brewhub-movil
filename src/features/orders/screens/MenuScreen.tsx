import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  Modal,
  useColorScheme,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getItemsByShopId } from '../services/itemService';
import { getBranchById } from '../services/branchService';
import { useCart } from '../providers/CartProvider';
import type { Item } from '../../../shared/types/items.types';
import type { MenuScreenProps } from '../../../navigation/types';

export function MenuScreen({ navigation, route }: Readonly<MenuScreenProps>) {
  const { branchId, branchName } = route.params;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, string>>({});
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

  const handleAddToCart = () => {
    if (!selectedItem) return;

    const modifiers = Object.entries(selectedModifiers).map(([name, optionName]) => ({
      name,
      optionName,
    }));

    cart.addToCart(selectedItem, 1, modifiers);
    setSelectedItem(null);
    setSelectedModifiers({});
  };

  const handleItemPress = (item: Item) => {
    if (!item.active) return;
    setSelectedItem(item);
  };

  const renderItemCard = ({ item }: { item: Item }) => (
    <TouchableOpacity
      onPress={() => handleItemPress(item)}
      disabled={!item.active}
      className={`${isDark ? 'bg-zinc-900' : 'bg-white'} mx-4 mb-4 rounded-xl border ${isDark ? 'border-zinc-800' : 'border-gray-200'} ${item?.active ? '' : 'opacity-50'}`}
      activeOpacity={0.7}
    >
      <View className="flex-row p-4">
        {item.images && item.images.length > 0 ? (
          <Image
            source={{ uri: item.images[0] }}
            className="w-20 h-20 rounded-lg mr-4"
            resizeMode="cover"
          />
        ) : (
          <View className={`w-20 h-20 rounded-lg mr-4 ${isDark ? 'bg-zinc-800' : 'bg-gray-200'} justify-center items-center`}>
            <Text className="text-4xl">☕</Text>
          </View>
        )}

        <View className="flex-1">
          <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {item.name}
          </Text>
          {item.description && (
            <Text className={`${isDark ? 'text-zinc-400' : 'text-gray-600'} text-sm mt-1`} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          <Text className={`${isDark ? 'text-amber-500' : 'text-amber-700'} font-bold text-lg mt-2`}>
            ${item.price.toFixed(2)}
          </Text>
          {!item.active && (
            <Text className="text-red-500 text-sm mt-1">No disponible</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderModifierModal = () => {
    if (!selectedItem) return null;

    return (
      <Modal
        visible={!!selectedItem}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedItem(null)}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <View className={`${isDark ? 'bg-zinc-900' : 'bg-white'} rounded-t-3xl max-h-[80%]`}>
            <ScrollView>
              <View className="p-6">
                <View className="flex-row justify-between items-start mb-4">
                  <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} flex-1`}>
                    {selectedItem.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSelectedItem(null)}
                    className="ml-4"
                  >
                    <Text className={`${isDark ? 'text-zinc-500' : 'text-gray-500'} text-2xl`}>✕</Text>
                  </TouchableOpacity>
                </View>

                {selectedItem.description && (
                  <Text className={`${isDark ? 'text-zinc-400' : 'text-gray-600'} mb-4`}>
                    {selectedItem.description}
                  </Text>
                )}

                <Text className={`${isDark ? 'text-amber-500' : 'text-amber-700'} font-bold text-xl mb-6`}>
                  ${selectedItem.price.toFixed(2)}
                </Text>

                {selectedItem.modifiers && selectedItem.modifiers.length > 0 && (
                  <View className="mb-6">
                    {selectedItem.modifiers.map((modifier) => (
                      <View key={modifier.name} className="mb-6">
                        <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-3`}>
                          {modifier.name}
                          {modifier.required && (
                            <Text className="text-red-500"> *</Text>
                          )}
                        </Text>

                        {modifier.options.map((option) => {
                          const isSelected = selectedModifiers[modifier.name] === option.name;
                          return (
                            <TouchableOpacity
                              key={option.name}
                              onPress={() =>
                                setSelectedModifiers((prev) => ({
                                  ...prev,
                                  [modifier.name]: option.name,
                                }))
                              }
                              className={`flex-row justify-between items-center p-4 mb-2 rounded-lg border-2 ${
                                isSelected
                                  ? `border-amber-500 ${isDark ? 'bg-amber-950' : 'bg-amber-50'}`
                                  : `${isDark ? 'border-zinc-700 bg-zinc-800' : 'border-gray-200 bg-white'}`
                              }`}
                            >
                              <Text
                                className={`font-medium ${
                                  isSelected
                                    ? `${isDark ? 'text-amber-200' : 'text-amber-800'}`
                                    : `${isDark ? 'text-white' : 'text-gray-800'}`
                                }`}
                              >
                                {option.name}
                              </Text>
                              {option.extraPrice > 0 && (
                                <Text className={isDark ? 'text-zinc-400' : 'text-gray-600'}>
                                  +${option.extraPrice.toFixed(2)}
                                </Text>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  onPress={handleAddToCart}
                  className="bg-amber-600 py-4 rounded-xl"
                  activeOpacity={0.8}
                >
                  <Text className="text-white text-center font-bold text-lg">
                    Agregar al carrito
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  if (isLoading) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? 'bg-zinc-950' : 'bg-white'}`}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text className={`mt-4 ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>Cargando menú...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? 'bg-zinc-950' : 'bg-white'} px-6`}>
        <Text className="text-red-500 text-center text-lg">
          Error al cargar el menú
        </Text>
      </View>
    );
  }

  const activeItems = items?.filter((item) => item.active) || [];
  const groupedByCategory = activeItems.reduce((acc, item) => {
    const categoryName = item.category?.name || 'Sin categoría';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {} as Record<string, Item[]>);

  return (
    <View className={`flex-1 ${isDark ? 'bg-zinc-900' : 'bg-gray-50'}`}>
      <View className={`${isDark ? 'bg-zinc-950' : 'bg-white'} px-6 py-4 border-b ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
        <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{branchName}</Text>
        <Text className={`${isDark ? 'text-zinc-400' : 'text-gray-600'} mt-1`}>Selecciona tus productos</Text>
      </View>

      <FlatList
        data={Object.entries(groupedByCategory)}
        keyExtractor={([category]) => category}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        renderItem={({ item: [categoryName, categoryItems] }) => (
          <View>
            <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} px-4 mb-3`}>
              {categoryName}
            </Text>
            {categoryItems.map((item) => (
              <View key={item._id}>{renderItemCard({ item })}</View>
            ))}
          </View>
        )}
      />

      {cart.itemCount > 0 && (
        <View className={`absolute bottom-0 left-0 right-0 ${isDark ? 'bg-zinc-900' : 'bg-white'} border-t ${isDark ? 'border-zinc-800' : 'border-gray-200'} p-4`}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Cart', { branchId })}
            className="bg-amber-600 py-4 rounded-xl flex-row justify-between items-center px-6"
            activeOpacity={0.8}
          >
            <View className="bg-white px-3 py-1 rounded-full">
              <Text className="text-amber-800 font-bold">{cart.itemCount}</Text>
            </View>
            <Text className="text-white font-bold text-lg">Ver carrito</Text>
            <Text className="text-white font-bold text-lg">
              ${cart.subtotal.toFixed(2)}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {renderModifierModal()}
    </View>
  );
}
