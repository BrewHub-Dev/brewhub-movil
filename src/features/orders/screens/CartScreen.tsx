import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { showAlert } from '@/shared/services/alert';
import {
  CreditCard,
  Banknote,
  Smartphone,
  ShoppingCart,
  Trash2,
  Check,
  Minus,
  Plus,
  ChevronRight,
} from 'lucide-react-native';
import { COFFEE } from '../constants/coffee';
import { useMutation } from '@tanstack/react-query';
import { useCart } from '../providers/CartProvider';
import { createOrder } from '../services/orderService';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import type { CartScreenProps } from '../../../navigation/types';
import type { PaymentMethod } from '../../../shared/types/orders.types';
import { useSession } from '../../auth/hooks/useSession';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const stripeModule = isExpoGo
  ? null
  : require('@stripe/stripe-react-native');

const createPaymentIntentFn = isExpoGo
  ? null
  : (require('../../stripe/services/stripeService').createPaymentIntent as (
      orderId: string,
      currency?: string,
    ) => Promise<{ clientSecret: string }>);

const noopStripe = {
  initPaymentSheet: async (_opts: any) => ({ error: { message: 'Stripe no disponible en Expo Go' } as any }),
  presentPaymentSheet: async () => ({ error: { message: 'Stripe no disponible en Expo Go' } as any }),
};

function useStripeSafe() {
  if (!stripeModule) return noopStripe;
  return stripeModule.useStripe();
}

const PAYMENT_METHODS: {
  value: PaymentMethod;
  label: string;
  icon: React.ReactElement;
}[] = [
    { value: 'card', label: 'Tarjeta', icon: <CreditCard size={22} /> },
    { value: 'cash', label: 'Efectivo', icon: <Banknote size={22} /> },
    { value: 'wallet', label: 'Wallet', icon: <Smartphone size={22} /> },
  ];

type CartHeaderProps = {
  isDark: boolean;
  itemCount: number;
};

type CartFooterProps = {
  isDark: boolean;
  paymentMethod: PaymentMethod;
  subtotal: number;
  onSelectPaymentMethod: (method: PaymentMethod) => void;
};

function CartFooter({ isDark, paymentMethod, subtotal, onSelectPaymentMethod }: Readonly<CartFooterProps>) {
  return (
    <View className="px-4 pb-8 mt-2">
      <View
        style={{
          backgroundColor: isDark ? '#18181b' : '#fff',
          borderColor: isDark ? COFFEE.accent : '#e5e7eb',
        }}
        className="rounded-3xl p-5 mb-4 border"
      >
        <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Método de pago
        </Text>
        <View className="flex-col gap-y-3">
          {PAYMENT_METHODS.map((method) => {
            const isSelected = paymentMethod === method.value;
            return (
              <TouchableOpacity
                key={method.value}
                onPress={() => onSelectPaymentMethod(method.value)}
                activeOpacity={0.7}
                className={`flex-row items-center p-4 rounded-2xl border ${isSelected
                    ? `border-amber-500 ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`
                    : `${isDark ? 'border-zinc-800 bg-zinc-800/50' : 'border-gray-200 bg-gray-50'}`
                  }`}
              >
                <View className={`p-2 rounded-full mr-4 ${isSelected ? (isDark ? 'bg-amber-500/20' : 'bg-amber-100') : (isDark ? 'bg-zinc-700' : 'bg-white shadow-sm')}`}>
                  {React.cloneElement(method.icon as React.ReactElement<any>, {
                    color: isSelected ? '#f59e0b' : isDark ? '#a1a1aa' : '#6b7280',
                  })}
                </View>
                <Text className={`font-semibold text-base flex-1 ${isSelected ? (isDark ? 'text-amber-400' : 'text-amber-700') : (isDark ? 'text-zinc-300' : 'text-gray-700')}`}>
                  {method.label}
                </Text>
                {isSelected && (
                  <View className="bg-amber-500 rounded-full p-1">
                    <Check size={14} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View
        style={{
          backgroundColor: isDark ? '#18181b' : '#fff',
          borderColor: isDark ? COFFEE.accent : '#e5e7eb',
        }}
        className="rounded-3xl p-5 border"
      >
        <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Resumen de compra
        </Text>
        <View className="flex-row justify-between mb-3">
          <Text className={`text-base ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>Subtotal</Text>
          <Text className={`text-base font-medium ${isDark ? 'text-zinc-300' : 'text-gray-700'}`}>
            ${subtotal.toFixed(2)}
          </Text>
        </View>
        <View className={`flex-row justify-between pt-4 border-t ${isDark ? 'border-zinc-800' : 'border-gray-100'}`}>
          <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Total</Text>
          <Text className={`text-xl font-black ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
            ${subtotal.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function CartHeader({ isDark, itemCount }: Readonly<CartHeaderProps>) {
  return (
    <View className="px-6 py-6">
      <Text
        style={{ color: isDark ? '#fafaf9' : COFFEE.darkRoast }}
        className="text-3xl font-extrabold"
      >
        Tu carrito
      </Text>
      <Text
        style={{ color: isDark ? '#a1a1aa' : COFFEE.mocha }}
        className="text-base mt-1"
      >
        Tienes {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
      </Text>
    </View>
  );
}

export function CartScreen({ navigation, route }: Readonly<CartScreenProps>) {
  const { branchId } = route.params;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const cart = useCart();
  const { user } = useSession();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');

  const { initPaymentSheet, presentPaymentSheet } = useStripeSafe();

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: async (order) => {
      if (paymentMethod === 'card' && createPaymentIntentFn) {
        try {
          const { clientSecret } = await createPaymentIntentFn(order._id, 'mxn');

          const { error: initError } = await initPaymentSheet({
            paymentIntentClientSecret: clientSecret,
            merchantDisplayName: (Constants.expoConfig?.extra?.brand?.shopName as string) || 'BrewHub',
            ...(user?.emailAddress && { customerEmail: user.emailAddress }),
          });

          if (initError) {
            showAlert('Error', 'No se pudo iniciar el pago seguro');
            return;
          }

          const { error: paymentError } = await presentPaymentSheet();

          if (paymentError) {
            showAlert(
              'Pago no completado',
              'La orden ha sido creada pero el pago no se completó. Podrás intentarlo luego.'
            );
            cart.clearCart();
            navigation.navigate('OrderDetails', { orderId: order._id });
            return;
          }

          showAlert('¡Pago exitoso!', `Tu orden #${order.orderNumber} ha sido pagada y confirmada.`);
          cart.clearCart();
          navigation.navigate('OrderDetails', { orderId: order._id });
          return;
        } catch (err: any) {
          showAlert('Error de pago', err.message);
          return;
        }
      }

      showAlert(
        '¡Orden creada!',
        `Tu orden #${order.orderNumber} ha sido procesada con éxito.`,
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
      showAlert('Error', error.message);
    },
  });

  const handleCheckout = () => {
    if (cart.cartItems.length === 0) return;

    showAlert(
      'Confirmar orden',
      `El total es $${cart.subtotal.toFixed(2)}\n¿Deseas confirmar tu orden ahora?`,
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


  const renderCartItem = useCallback(({ item: cartItem, index }: { item: typeof cart.cartItems[0]; index: number }) => (
    <View
      className="mx-4 mb-4 rounded-3xl p-5 border"
      style={{
        backgroundColor: isDark ? '#18181b' : '#fff',
        borderColor: isDark ? COFFEE.accent : '#e5e7eb',
      }}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 pr-4">
          <Text className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {cartItem.item.name}
          </Text>
          {cartItem.selectedModifiers.length > 0 && (
            <View className="flex-row flex-wrap gap-1 mt-1 mb-2">
              {cartItem.selectedModifiers.map((mod) => (
                <View key={mod.optionName} className={`${isDark ? 'bg-zinc-800' : 'bg-gray-100'} px-2 py-1 rounded-md`}>
                  <Text className={`text-xs ${isDark ? 'text-zinc-300' : 'text-gray-600'}`}>
                    {mod.optionName}
                  </Text>
                </View>
              ))}
            </View>
          )}
          {cartItem.notes && (
            <Text className={`text-sm ${isDark ? 'text-amber-400/80' : 'text-amber-600'} italic`}>
              "{cartItem.notes}"
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => cart.removeFromCart(index)}
          className={`p-2 rounded-full ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Trash2 size={20} color={isDark ? '#f87171' : '#ef4444'} />
        </TouchableOpacity>
      </View>

      <View className={`flex-row justify-between items-center pt-4 mt-2 border-t ${isDark ? 'border-zinc-800' : 'border-gray-100'}`}>
        <View className={`flex-row items-center rounded-2xl border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-gray-50 border-gray-200'}`}>
          <TouchableOpacity
            onPress={() => cart.updateQuantity(index, cartItem.quantity - 1)}
            className="p-3"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Minus size={18} color={isDark ? '#a1a1aa' : '#4b5563'} />
          </TouchableOpacity>
          <Text className={`w-8 text-center font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {cartItem.quantity}
          </Text>
          <TouchableOpacity
            onPress={() => cart.updateQuantity(index, cartItem.quantity + 1)}
            className="p-3"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Plus size={18} color={isDark ? '#a1a1aa' : '#4b5563'} />
          </TouchableOpacity>
        </View>
        <Text className={`text-xl font-black ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
          ${cart.calculateItemTotal(cartItem).toFixed(2)}
        </Text>
      </View>
    </View>
  ), [cart, isDark]);

  if (cart.cartItems.length === 0) {
    return (
      <View
        className="flex-1 justify-center items-center px-6"
        style={{ backgroundColor: isDark ? '#09090b' : COFFEE.cream }}
      >
        <View
          className="p-6 rounded-full mb-6"
          style={{ backgroundColor: isDark ? '#18181b' : '#fff' }}
        >
          <ShoppingCart
            size={80}
            color={isDark ? '#a1a1aa' : '#9ca3af'}
          />
        </View>
        <Text
          className="text-2xl font-bold mb-2"
          style={{ color: isDark ? '#fafaf9' : COFFEE.darkRoast }}
        >
          Tu carrito está vacío
        </Text>
        <Text
          className="text-center text-base mb-8"
          style={{ color: isDark ? '#a1a1aa' : COFFEE.mocha }}
        >
          Parece que aún no has agregado nada. ¡Descubre nuestro menú!
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
          style={{
            backgroundColor: COFFEE.mocha,
            paddingVertical: 16,
            paddingHorizontal: 32,
            borderRadius: 24,
            flexDirection: 'row',
            alignItems: 'center',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          }}
        >
          <Text className="text-white font-bold text-lg mr-2">
            Explorar menú
          </Text>
          <ChevronRight size={20} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: isDark ? '#09090b' : COFFEE.cream }}
    >
      <FlatList
        data={cart.cartItems}
        keyExtractor={(item) => `${item.item._id}-${item.selectedModifiers.map(m => m.optionName).join('|')}`}
        ListHeaderComponent={<CartHeader isDark={isDark} itemCount={cart.itemCount} />}
        ListFooterComponent={
          <CartFooter
            isDark={isDark}
            paymentMethod={paymentMethod}
            subtotal={cart.subtotal}
            onSelectPaymentMethod={setPaymentMethod}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={renderCartItem}
      />

      <View
        className="absolute bottom-0 w-full px-4 pt-4 pb-8"
        style={{
          backgroundColor: isDark ? '#09090bcc' : COFFEE.cream + 'cc',
          borderTopWidth: 1,
          borderColor: isDark ? '#27272a' : '#f3f4f6',
        }}
      >
        <TouchableOpacity
          onPress={handleCheckout}
          disabled={createOrderMutation.isPending}
          activeOpacity={0.9}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
            borderRadius: 24,
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            backgroundColor: createOrderMutation.isPending
              ? (isDark ? '#27272a' : COFFEE.latte)
              : COFFEE.mocha,
          }}
        >
          {createOrderMutation.isPending ? (
            <ActivityIndicator color="white" className="flex-1" />
          ) : (
            <>
              <Text className="text-white font-bold text-lg">Confirmar orden</Text>
              <View className="flex-row items-center bg-white/20 px-3 py-1.5 rounded-xl">
                <Text className="text-white font-black text-lg">
                  ${cart.subtotal.toFixed(2)}
                </Text>
                <ChevronRight size={20} color="white" style={{ marginLeft: 4 }} />
              </View>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
