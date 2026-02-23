import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  useColorScheme,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useCart } from '../providers/CartProvider';
import { createOrder } from '../services/orderService';
import type { CartScreenProps } from '../../../navigation/types';
import type { PaymentMethod } from '../../../shared/types/orders.types';

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'card', label: 'Tarjeta', icon: '💳' },
  { value: 'cash', label: 'Efectivo', icon: '💵' },
  { value: 'wallet', label: 'Wallet', icon: '📱' },
];

export function CartScreen({ navigation, route }: CartScreenProps) {
  const { branchId } = route.params;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const cart = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: (order) => {
      Alert.alert(
        '¡Orden creada!',
        `Tu orden #${order.orderNumber} ha sido creada exitosamente`,
        [
          {
            text: 'Ver orden',
            onPress: () => {
              cart.clearCart();
              navigation.navigate('OrderDetails', { orderId: order._id });
            },
          },
        ]
      );
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleCheckout = () => {
    if (cart.cartItems.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega productos antes de continuar');
      return;
    }

    Alert.alert(
      'Confirmar orden',
      `Total: $${cart.subtotal.toFixed(2)}\n¿Deseas confirmar tu orden?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            createOrderMutation.mutate({
              BranchId: branchId,
              items: cart.toOrderItems(),
              paymentMethod,
            });
          },
        },
      ]
    );
  };

  if (cart.cartItems.length === 0) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? 'bg-zinc-950' : 'bg-white'} px-6`}>
        <Text className="text-6xl mb-4">🛒</Text>
        <Text className={`${isDark ? 'text-zinc-400' : 'text-gray-600'} text-center text-lg mb-6`}>
          Tu carrito está vacío
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-amber-600 py-3 px-6 rounded-xl"
        >
          <Text className="text-white font-bold">Explorar menú</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? 'bg-zinc-900' : 'bg-gray-50'}`}>
      <ScrollView className="flex-1">
        <View className={`${isDark ? 'bg-zinc-950' : 'bg-white'} px-6 py-4 border-b ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Tu carrito</Text>
          <Text className={`${isDark ? 'text-zinc-400' : 'text-gray-600'} mt-1`}>
            {cart.itemCount} {cart.itemCount === 1 ? 'producto' : 'productos'}
          </Text>
        </View>

        <View className="mt-4">
          <FlatList
            data={cart.cartItems}
            scrollEnabled={false}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item: cartItem, index }) => (
              <View className={`${isDark ? 'bg-zinc-900' : 'bg-white'} mx-4 mb-3 rounded-xl p-4 border ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {cartItem.item.name}
                    </Text>
                    {cartItem.selectedModifiers.length > 0 && (
                      <View className="mt-1">
                        {cartItem.selectedModifiers.map((mod, idx) => (
                          <Text key={idx} className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>
                            • {mod.name}: {mod.optionName}
                          </Text>
                        ))}
                      </View>
                    )}
                    {cartItem.notes && (
                      <Text className={`text-sm ${isDark ? 'text-zinc-500' : 'text-gray-500'} italic mt-1`}>
                        Nota: {cartItem.notes}
                      </Text>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => cart.removeFromCart(index)}
                    className="ml-2"
                  >
                    <Text className="text-red-500 text-lg">🗑️</Text>
                  </TouchableOpacity>
                </View>

                <View className={`flex-row justify-between items-center mt-3 pt-3 border-t ${isDark ? 'border-zinc-800' : 'border-gray-100'}`}>
                  <View className={`flex-row items-center ${isDark ? 'bg-zinc-800' : 'bg-gray-100'} rounded-lg`}>
                    <TouchableOpacity
                      onPress={() =>
                        cart.updateQuantity(index, cartItem.quantity - 1)
                      }
                      className="px-4 py-2"
                    >
                      <Text className={`text-xl font-bold ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}>-</Text>
                    </TouchableOpacity>
                    <Text className={`px-4 font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {cartItem.quantity}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        cart.updateQuantity(index, cartItem.quantity + 1)
                      }
                      className="px-4 py-2"
                    >
                      <Text className={`text-xl font-bold ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <Text className={`text-lg font-bold ${isDark ? 'text-amber-500' : 'text-amber-700'}`}>
                    ${cart.calculateItemTotal(cartItem).toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
          />
        </View>

        <View className={`${isDark ? 'bg-zinc-900' : 'bg-white'} mx-4 mt-4 rounded-xl p-4 border ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
          <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-3`}>
            Método de pago
          </Text>
          <View>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.value}
                onPress={() => setPaymentMethod(method.value)}
                className={`flex-row items-center p-4 rounded-lg border-2 mb-2 ${
                  paymentMethod === method.value
                    ? `border-amber-500 ${isDark ? 'bg-amber-950' : 'bg-amber-50'}`
                    : `${isDark ? 'border-zinc-700 bg-zinc-800' : 'border-gray-200 bg-white'}`
                }`}
              >
                <Text className="text-2xl mr-3">{method.icon}</Text>
                <Text
                  className={`font-medium flex-1 ${
                    paymentMethod === method.value
                      ? `${isDark ? 'text-amber-200' : 'text-amber-800'}`
                      : `${isDark ? 'text-white' : 'text-gray-800'}`
                  }`}
                >
                  {method.label}
                </Text>
                {paymentMethod === method.value && (
                  <Text className="text-amber-600 text-xl">✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className={`${isDark ? 'bg-zinc-900' : 'bg-white'} mx-4 mt-4 mb-4 rounded-xl p-4 border ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
          <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-3`}>Resumen</Text>
          <View>
            <View className="flex-row justify-between">
              <Text className={isDark ? 'text-zinc-400' : 'text-gray-600'}>Subtotal</Text>
              <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-medium`}>
                ${cart.subtotal.toFixed(2)}
              </Text>
            </View>
            <View className={`flex-row justify-between pt-3 border-t ${isDark ? 'border-zinc-800' : 'border-gray-200'} mt-3`}>
              <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Total</Text>
              <Text className={`text-lg font-bold ${isDark ? 'text-amber-500' : 'text-amber-700'}`}>
                ${cart.subtotal.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className={`${isDark ? 'bg-zinc-900' : 'bg-white'} border-t ${isDark ? 'border-zinc-800' : 'border-gray-200'} p-4`}>
        <TouchableOpacity
          onPress={handleCheckout}
          disabled={createOrderMutation.isPending}
          className={`py-4 rounded-xl ${
            createOrderMutation.isPending ? 'bg-gray-400' : 'bg-amber-600'
          }`}
          activeOpacity={0.8}
        >
          {createOrderMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-center font-bold text-lg">
              Confirmar orden • ${cart.subtotal.toFixed(2)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
