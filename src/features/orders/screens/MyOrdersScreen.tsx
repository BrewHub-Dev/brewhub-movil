import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../../auth/hooks/useSession';
import { getMyOrders } from '../services/orderService';
import type { MyOrdersScreenProps } from '../../../navigation/types';
import type { Order } from '../../../shared/types/orders.types';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Pendiente',       color: 'text-orange-500' },
  confirmed: { label: 'Confirmada',      color: 'text-blue-500'   },
  preparing: { label: 'En preparación',  color: 'text-purple-500' },
  ready:     { label: 'Lista',           color: 'text-green-500'  },
  completed: { label: 'Completada',      color: 'text-zinc-400'   },
  cancelled: { label: 'Cancelada',       color: 'text-red-500'    },
};

function OrderCard({ order, onPress }: Readonly<{ order: Order; onPress: () => void }>) {
  const isDark = useColorScheme() === 'dark';
  const status = STATUS_LABELS[order.status] ?? STATUS_LABELS.pending;
  const date = new Date(order.createdAt).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`rounded-2xl p-4 border mb-3 ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className={`font-bold text-m ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {order.orderNumber}
        </Text>
        <Text className={`text-sm font-semibold ${status.color}`}>
          {status.label}
        </Text>
      </View>

      <View className="flex-row items-center justify-between">
        <Text className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
          {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
        </Text>
        <Text className={`font-bold ${isDark ? 'text-amber-500' : 'text-amber-600'}`}>
          ${order.total.toFixed(2)}
        </Text>
      </View>

      <Text className={`text-sm mt-1 ${isDark ? 'text-zinc-600' : 'text-gray-400'}`}>
        {date}
      </Text>
    </TouchableOpacity>
  );
}

export function MyOrdersScreen({ navigation }: Readonly<MyOrdersScreenProps>) {
  const isDark = useColorScheme() === 'dark';
  const { user } = useSession();

  const { data: orders, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['my-orders', user?._id],
    queryFn: () => getMyOrders(user!._id),
    enabled: !!user?._id,
    refetchInterval: 30_000,
  });

  const pending = orders?.filter((o) => !['completed', 'cancelled'].includes(o.status)) ?? [];
  const history = orders?.filter((o) => ['completed', 'cancelled'].includes(o.status)) ?? [];

  if (isLoading) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? 'bg-zinc-950' : 'bg-gray-50'}`}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text className={`mt-4 text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
          Cargando órdenes...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className={`flex-1 justify-center items-center px-6 ${isDark ? 'bg-zinc-950' : 'bg-gray-50'}`}>
        <Text className="text-red-500 text-center mb-4">No se pudieron cargar tus órdenes</Text>
        <TouchableOpacity onPress={() => refetch()} className="bg-amber-500 px-6 py-3 rounded-xl">
          <Text className="text-white font-bold">Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-950' : 'bg-gray-50'}`} edges={['bottom']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#f59e0b" />}
        contentContainerStyle={{ padding: 16 }}
      >
        {pending.length > 0 && (
          <>
            <Text className={`text-xs font-semibold uppercase tracking-widest mb-3 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
              Activas
            </Text>
            {pending.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onPress={() => navigation.navigate('OrderDetails', { orderId: order._id })}
              />
            ))}
          </>
        )}

        {history.length > 0 && (
          <>
            <Text className={`text-xs font-semibold uppercase tracking-widest mb-3 mt-2 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
              Historial
            </Text>
            {history.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onPress={() => navigation.navigate('OrderDetails', { orderId: order._id })}
              />
            ))}
          </>
        )}

        {!orders?.length && (
          <View className="flex-1 justify-center items-center py-20">
            <Text className={`text-4xl mb-4`}>🛒</Text>
            <Text className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Sin órdenes aún
            </Text>
            <Text className={`text-sm text-center ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>
              Realiza tu primera orden desde la pantalla principal
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
