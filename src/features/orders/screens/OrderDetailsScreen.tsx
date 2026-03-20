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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import QRCode from 'react-native-qrcode-svg';
import { getOrderById, cancelOrder } from '../services/orderService';
import { useSocket } from '../../../hooks/useSocket';
import type { OrderDetailsScreenProps } from '../../../navigation/types';

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
  const [cancelling, setCancelling] = useState(false);

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

  if (isLoading) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? 'bg-zinc-950' : 'bg-white'}`}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text className={`mt-4 ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>Cargando orden...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? 'bg-zinc-950' : 'bg-white'} px-6`}>
        <Text className="text-red-500 text-center text-lg">Error al cargar la orden</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 bg-amber-600 py-3 px-6 rounded-xl">
          <Text className="text-white font-bold">Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
  const statusClass = isDark ? statusInfo.darkClass : statusInfo.lightClass;
  const canCancel = CANCELLABLE.includes(order.status);

  return (
    <ScrollView
      className={`flex-1 ${isDark ? 'bg-zinc-900' : 'bg-gray-50'}`}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor="#f59e0b"
          colors={['#f59e0b']}
        />
      }
    >
      {/* Header */}
      <View className={`${isDark ? 'bg-zinc-950' : 'bg-white'} px-6 py-6 border-b ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
        <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-2`}>
          Orden #{order.orderNumber}
        </Text>
        <View className={`self-start px-4 py-2 rounded-full ${statusClass}`}>
          <Text className="font-semibold">{statusInfo.label}</Text>
        </View>
      </View>

      {/* QR Code */}
      {(order.qrTokenHash || order.qrToken) && (
        <View className={`mx-4 mt-4 p-5 rounded-xl border items-center ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
          <Text className={`font-bold text-base mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Código QR para recoger
          </Text>
          <View className="bg-white p-3 rounded-xl">
            <QRCode value={order.qrTokenHash ?? order.qrToken ?? ''} size={180} color="#000000" backgroundColor="#ffffff" />
          </View>
          <Text className={`text-xs text-center mt-4 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
            Presenta este código al recoger tu orden
          </Text>
        </View>
      )}

      {/* Products */}
      <View className={`${isDark ? 'bg-zinc-900' : 'bg-white'} mx-4 mt-4 rounded-xl p-4 border ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
        <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-3`}>Productos</Text>
        {order.items.map((item, index) => (
          <View
            key={item.itemId}
            className={`pb-3 mb-3 ${index < order.items.length - 1 ? `border-b ${isDark ? 'border-zinc-800' : 'border-gray-100'}` : ''}`}
          >
            <View className="flex-row justify-between items-start mb-1">
              <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-medium flex-1`}>
                {item.quantity}x {item.name}
              </Text>
              <Text className={`${isDark ? 'text-white' : 'text-gray-800'} font-medium`}>
                ${item.itemTotal.toFixed(2)}
              </Text>
            </View>
            {item.modifiers && item.modifiers.length > 0 && (
              <View className="ml-4 mt-1">
                {item.modifiers.map((mod) => (
                  <Text key={mod.name} className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>
                    • {mod.name}: {mod.optionName}
                    {(mod.extraPrice ?? 0) > 0 && ` (+$${(mod.extraPrice ?? 0).toFixed(2)})`}
                  </Text>
                ))}
              </View>
            )}
            {item.notes && (
              <Text className={`text-sm ${isDark ? 'text-zinc-500' : 'text-gray-500'} italic ml-4 mt-1`}>
                Nota: {item.notes}
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Customer notes */}
      {order.customerNotes && (
        <View className={`${isDark ? 'bg-zinc-900' : 'bg-white'} mx-4 mt-4 rounded-xl p-4 border ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
          <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-2`}>Notas del cliente</Text>
          <Text className={isDark ? 'text-zinc-400' : 'text-gray-600'}>{order.customerNotes}</Text>
        </View>
      )}

      {/* Summary */}
      <View className={`${isDark ? 'bg-zinc-900' : 'bg-white'} mx-4 mt-4 rounded-xl p-4 border ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
        <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-3`}>Resumen</Text>
        <View className="flex-row justify-between">
          <Text className={isDark ? 'text-zinc-400' : 'text-gray-600'}>Subtotal</Text>
          <Text className={isDark ? 'text-white' : 'text-gray-800'}>${order.subtotal.toFixed(2)}</Text>
        </View>
        {order.discount > 0 && (
          <View className="flex-row justify-between mt-2">
            <Text className={isDark ? 'text-zinc-400' : 'text-gray-600'}>Descuento</Text>
            <Text className="text-green-600">-${order.discount.toFixed(2)}</Text>
          </View>
        )}
        <View className={`flex-row justify-between pt-3 border-t ${isDark ? 'border-zinc-800' : 'border-gray-200'} mt-3`}>
          <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Total</Text>
          <Text className={`text-lg font-bold ${isDark ? 'text-amber-500' : 'text-amber-700'}`}>
            ${order.total.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Payment info */}
      <View className={`${isDark ? 'bg-zinc-900' : 'bg-white'} mx-4 mt-4 rounded-xl p-4 border ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
        <Text className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-3`}>Información de pago</Text>
        <View className="flex-row justify-between">
          <Text className={isDark ? 'text-zinc-400' : 'text-gray-600'}>Método</Text>
          <Text className={`${isDark ? 'text-white' : 'text-gray-800'} capitalize`}>{order.paymentMethod}</Text>
        </View>
        <View className="flex-row justify-between mt-2">
          <Text className={isDark ? 'text-zinc-400' : 'text-gray-600'}>Estado</Text>
          <Text className={`font-semibold ${order.paymentStatus === 'paid' ? (isDark ? 'text-green-500' : 'text-green-600') : (isDark ? 'text-yellow-500' : 'text-yellow-600')}`}>
            {order.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View className="px-4 mt-6 pb-8 gap-3">
        {canCancel && (
          <TouchableOpacity
            onPress={handleCancel}
            disabled={cancelling}
            activeOpacity={0.8}
            style={{
              backgroundColor: isDark ? '#3f1212' : '#fee2e2',
              borderWidth: 1,
              borderColor: isDark ? '#7f1d1d' : '#fca5a5',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            {cancelling ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <Text style={{ color: isDark ? '#f87171' : '#dc2626', fontWeight: '700', fontSize: 16 }}>
                Cancelar orden
              </Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          className="bg-amber-600 py-4 rounded-xl"
          activeOpacity={0.8}
        >
          <Text className="text-white text-center font-bold text-lg">Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
