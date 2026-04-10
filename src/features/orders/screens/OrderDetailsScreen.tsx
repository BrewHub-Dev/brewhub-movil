import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
  useColorScheme,
} from 'react-native';
import { RotateCcw } from 'lucide-react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import QRCode from 'react-native-qrcode-svg';
import { getOrderById, cancelOrder, reorder } from '../services/orderService';
import { useSocket } from '../../../hooks/useSocket';
import { useCart } from '../providers/CartProvider';
import type { OrderDetailsScreenProps } from '../../../navigation/types';
import type { Item } from '../../../shared/types/items.types';
import { COFFEE } from '../constants/coffee';

const STATUS_LABELS: Record<string, { label: string; lightClass: string; darkClass: string }> = {
  pending: { label: 'Pendiente', lightClass: 'bg-yellow-100 text-yellow-800', darkClass: 'bg-yellow-950 text-yellow-200' },
  confirmed: { label: 'Confirmada', lightClass: 'bg-blue-100 text-blue-800', darkClass: 'bg-blue-950 text-blue-200' },
  preparing: { label: 'En preparación', lightClass: 'bg-purple-100 text-purple-800', darkClass: 'bg-purple-950 text-purple-200' },
  ready: { label: 'Lista', lightClass: 'bg-green-100 text-green-800', darkClass: 'bg-green-950 text-green-200' },
  completed: { label: 'Completada', lightClass: 'bg-gray-100 text-gray-800', darkClass: 'bg-gray-800 text-gray-200' },
  cancelled: { label: 'Cancelada', lightClass: 'bg-red-100 text-red-800', darkClass: 'bg-red-950 text-red-200' },
};

const CANCELLABLE = ['pending', 'confirmed'];

export function OrderDetailsScreen({ navigation, route }: Readonly<OrderDetailsScreenProps>) {
  const { orderId } = route.params;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const cart = useCart();
  const [cancelling, setCancelling] = useState(false);
  const [reordering, setReordering] = useState(false);

  const { data: order, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderById(orderId),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!socket) return;
    const handler = (data: any) => {
      if (data?.orderId === orderId || data?._id === orderId) {
        queryClient.invalidateQueries({ queryKey: ['order', orderId] });
        queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      }
    };
    socket.on('order:updated', handler);
    return () => { socket.off('order:updated', handler); };
  }, [socket, orderId, queryClient]);

  function handleCancel() {
    Alert.alert(
      'Cancelar orden',
      '¿Estás seguro de que deseas cancelar esta orden?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              await cancelOrder(orderId);
              queryClient.invalidateQueries({ queryKey: ['order', orderId] });
              queryClient.invalidateQueries({ queryKey: ['my-orders'] });
            } catch (e: any) {
              Alert.alert('Error', e.message ?? 'No se pudo cancelar la orden');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  }

  async function handleReorder() {
    setReordering(true);
    try {
      const { items: reorderItems, BranchId } = await reorder(orderId);
      const cartItems = reorderItems.map((orderItem: any) => ({
        item: {
          _id: orderItem.itemId,
          name: orderItem.itemData?.name || '',
          price: orderItem.itemData?.price || 0,
          description: orderItem.itemData?.description,
          image: orderItem.itemData?.image,
          modifiers: orderItem.itemData?.modifiers || [],
          categoryId: orderItem.itemData?.categoryId,
        } as unknown as Item,
        quantity: orderItem.quantity,
        selectedModifiers: orderItem.modifiers || [],
        notes: orderItem.notes,
      }));
      cart.setCartFromReorder(cartItems);
      Alert.alert('Éxito', 'Los items se agregaron al carrito', [
        { text: 'OK', onPress: () => navigation.navigate('Cart', { branchId: BranchId }) },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'No se pudo reordenar');
    } finally {
      setReordering(false);
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: isDark ? '#09090b' : COFFEE.cream }}>
        <ActivityIndicator size="large" color={COFFEE.accent} />
        <Text className="mt-4" style={{ color: isDark ? '#a1a1aa' : COFFEE.mocha }}>Cargando orden...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View className="flex-1 justify-center items-center px-6" style={{ backgroundColor: isDark ? '#09090b' : COFFEE.cream }}>
        <Text className="text-red-500 text-center text-lg">Error al cargar la orden</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ backgroundColor: COFFEE.accent, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, marginTop: 16 }}>
          <Text className="text-white font-bold">Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
  const statusClass = isDark ? statusInfo.darkClass : statusInfo.lightClass;
  const canCancel = CANCELLABLE.includes(order.status);

  const bgColor = isDark ? '#09090b' : COFFEE.cream;
  const cardBg = isDark ? '#18181b' : '#fff';
  const cardBorder = isDark ? '#3f3f46' : COFFEE.tan;
  const titleColor = isDark ? '#fafafa' : COFFEE.darkRoast;
  const subtextColor = isDark ? '#a1a1aa' : COFFEE.mocha;
  const accentColor = isDark ? '#f59e0b' : COFFEE.accent;

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: bgColor }}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={COFFEE.accent}
          colors={[COFFEE.accent]}
        />
      }
    >
      {/* Header */}
      <View className="px-6 py-6 border-b" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
        <Text className="text-2xl font-bold mb-2" style={{ color: titleColor }}>
          Orden #{order.orderNumber}
        </Text>
        <View className="self-start px-4 py-2 rounded-full" style={{ backgroundColor: isDark ? '#27272a' : COFFEE.latte }}>
          <Text className="font-semibold" style={{ color: isDark ? '#fafafa' : COFFEE.espresso }}>{statusInfo.label}</Text>
        </View>
      </View>

      {/* QR Code */}
      {(order.qrTokenHash || order.qrToken) && (
        <View className="mx-4 mt-4 p-5 rounded-xl border items-center" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
          <Text className="font-bold text-base mb-4" style={{ color: titleColor }}>
            Código QR para recoger
          </Text>
          <View className="bg-white p-3 rounded-xl">
            <QRCode value={order.qrTokenHash ?? order.qrToken ?? ''} size={180} color="#000000" backgroundColor="#ffffff" />
          </View>
          <Text className="text-xs text-center mt-4" style={{ color: subtextColor }}>
            Presenta este código al recoger tu orden
          </Text>
        </View>
      )}

      {/* Products */}
      <View className="mx-4 mt-4 rounded-xl p-4 border" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
        <Text className="text-lg font-bold mb-3" style={{ color: titleColor }}>Productos</Text>
        {order.items.map((item, index) => (
          <View
            key={item.itemId}
            className={`pb-3 mb-3 ${index < order.items.length - 1 ? 'border-b' : ''}`}
            style={{ borderColor: cardBorder }}
          >
            <View className="flex-row justify-between items-start mb-1">
              <Text className="font-medium flex-1" style={{ color: titleColor }}>
                {item.quantity}x {item.name}
              </Text>
              <Text className="font-medium" style={{ color: titleColor }}>
                ${item.itemTotal.toFixed(2)}
              </Text>
            </View>
            {item.modifiers && item.modifiers.length > 0 && (
              <View className="ml-4 mt-1">
                {item.modifiers.map((mod) => (
                  <Text key={mod.name} className="text-sm" style={{ color: subtextColor }}>
                    • {mod.name}: {mod.optionName}
                    {(mod.extraPrice ?? 0) > 0 && ` (+$${(mod.extraPrice ?? 0).toFixed(2)})`}
                  </Text>
                ))}
              </View>
            )}
            {item.notes && (
              <Text className="text-sm italic ml-4 mt-1" style={{ color: subtextColor }}>
                Nota: {item.notes}
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Customer notes */}
      {order.customerNotes && (
        <View className="mx-4 mt-4 rounded-xl p-4 border" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
          <Text className="text-lg font-bold mb-2" style={{ color: titleColor }}>Notas del cliente</Text>
          <Text style={{ color: subtextColor }}>{order.customerNotes}</Text>
        </View>
      )}

      {/* Summary */}
      <View className="mx-4 mt-4 rounded-xl p-4 border" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
        <Text className="text-lg font-bold mb-3" style={{ color: titleColor }}>Resumen</Text>
        <View className="flex-row justify-between">
          <Text style={{ color: subtextColor }}>Subtotal</Text>
          <Text style={{ color: titleColor }}>${order.subtotal.toFixed(2)}</Text>
        </View>
        {order.discount > 0 && (
          <View className="flex-row justify-between mt-2">
            <Text style={{ color: subtextColor }}>Descuento</Text>
            <Text className="text-green-600">-${order.discount.toFixed(2)}</Text>
          </View>
        )}
        <View className="flex-row justify-between pt-3 border-t mt-3" style={{ borderColor: cardBorder }}>
          <Text className="text-lg font-bold" style={{ color: titleColor }}>Total</Text>
          <Text className="text-lg font-bold" style={{ color: accentColor }}>
            ${order.total.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Payment info */}
      <View className="mx-4 mt-4 rounded-xl p-4 border" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
        <Text className="text-lg font-bold mb-3" style={{ color: titleColor }}>Información de pago</Text>
        <View className="flex-row justify-between">
          <Text style={{ color: subtextColor }}>Método</Text>
          <Text className="capitalize" style={{ color: titleColor }}>{order.paymentMethod}</Text>
        </View>
        <View className="flex-row justify-between mt-2">
          <Text style={{ color: subtextColor }}>Estado</Text>
          <Text className={`font-semibold ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
            {order.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View className="px-4 mt-6 pb-8 gap-3">
        <TouchableOpacity
          onPress={handleReorder}
          disabled={reordering}
          activeOpacity={0.8}
          style={{
            backgroundColor: isDark ? '#451a03' : COFFEE.latte,
            borderWidth: 1,
            borderColor: COFFEE.accent,
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          {reordering ? (
            <ActivityIndicator size="small" color={COFFEE.accent} />
          ) : (
            <>
              <RotateCcw size={20} color={COFFEE.accent} />
              <Text style={{ color: COFFEE.accent, fontWeight: '700', fontSize: 16, marginLeft: 8 }}>
                Pedir de nuevo
              </Text>
            </>
          )}
        </TouchableOpacity>

        {canCancel && (
          <TouchableOpacity
            onPress={handleCancel}
            disabled={cancelling}
            activeOpacity={0.8}
            style={{
              backgroundColor: isDark ? '#3f1212' : '#fee2e2',
              borderWidth: 1,
              borderColor: '#ef4444',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            {cancelling ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 16 }}>
                Cancelar orden
              </Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={{ backgroundColor: COFFEE.accent, paddingVertical: 16, borderRadius: 12 }}
          activeOpacity={0.8}
        >
          <Text className="text-white text-center font-bold text-lg">Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
