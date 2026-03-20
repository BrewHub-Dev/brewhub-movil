import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import { ShoppingBag } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../../auth/hooks/useSession';
import { useSocket } from '../../../hooks/useSocket';
import { getMyOrders } from '../services/orderService';
import type { MyOrdersScreenProps } from '../../../navigation/types';
import type { Order } from '../../../shared/types/orders.types';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'text-orange-500' },
  confirmed: { label: 'Confirmada', color: 'text-blue-500' },
  preparing: { label: 'En preparación', color: 'text-purple-500' },
  ready: { label: 'Lista', color: 'text-green-500' },
  completed: { label: 'Completada', color: 'text-zinc-400' },
  cancelled: { label: 'Cancelada', color: 'text-red-500' },
};

const LIMIT = 10;

function OrderCard({ order, onPress, isDark }: Readonly<{ order: Order; onPress: () => void; isDark: boolean }>) {
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

type ListItem =
  | { type: 'header'; title: string }
  | { type: 'order'; order: Order }
  | { type: 'loadMore' }
  | { type: 'empty' };

export function MyOrdersScreen({ navigation }: Readonly<MyOrdersScreenProps>) {
  const isDark = useColorScheme() === 'dark';
  const { user } = useSession();
  const { socket } = useSocket();

  const [historyPage, setHistoryPage] = useState(1);
  const [allHistory, setAllHistory] = useState<Order[]>([]);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['my-orders', user?._id],
    queryFn: async () => {
      const result = await getMyOrders(user!._id, 1, LIMIT);
      const completed = result.data.filter((o) => ['completed', 'cancelled'].includes(o.status));
      setAllHistory(completed);
      setHasMoreHistory(result.pagination.hasNext);
      setHistoryPage(1);
      return result;
    },
    enabled: !!user?._id,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!socket) return;
    const handleOrderUpdate = () => { refetch(); };
    socket.on('order:updated', handleOrderUpdate);
    return () => { socket.off('order:updated', handleOrderUpdate); };
  }, [socket, refetch]);

  const loadMoreHistory = useCallback(async () => {
    if (!user?._id || loadingMore || !hasMoreHistory) return;
    setLoadingMore(true);
    try {
      const next = await getMyOrders(user._id, historyPage + 1, LIMIT);
      const completed = next.data.filter((o) => ['completed', 'cancelled'].includes(o.status));
      setAllHistory((prev) => [...prev, ...completed]);
      setHasMoreHistory(next.pagination.hasNext);
      setHistoryPage((prev) => prev + 1);
    } finally {
      setLoadingMore(false);
    }
  }, [user?._id, historyPage, hasMoreHistory, loadingMore]);

  const activeOrders = data?.data.filter((o) => !['completed', 'cancelled'].includes(o.status)) ?? [];

  const listItems: ListItem[] = [];

  if (activeOrders.length > 0) {
    listItems.push({ type: 'header', title: 'Activas' });
    activeOrders.forEach((order) => listItems.push({ type: 'order', order }));
  }

  if (allHistory.length > 0) {
    listItems.push({ type: 'header', title: 'Historial' });
    allHistory.forEach((order) => listItems.push({ type: 'order', order }));
    if (hasMoreHistory) {
      listItems.push({ type: 'loadMore' });
    }
  }

  if (listItems.length === 0 && !isLoading) {
    listItems.push({ type: 'empty' });
  }

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === 'header') {
      return (
        <Text className={`text-xs font-semibold uppercase tracking-widest mb-3 mt-2 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
          {item.title}
        </Text>
      );
    }

    if (item.type === 'order') {
      return (
        <OrderCard
          order={item.order}
          isDark={isDark}
          onPress={() => navigation.navigate('OrderDetails', { orderId: item.order._id })}
        />
      );
    }

    if (item.type === 'loadMore') {
      return (
        <TouchableOpacity
          onPress={loadMoreHistory}
          disabled={loadingMore}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: isDark ? '#3f3f46' : '#e5e7eb',
            backgroundColor: isDark ? '#18181b' : '#f9fafb',
            marginBottom: 12,
          }}
        >
          {loadingMore ? (
            <ActivityIndicator size="small" color="#f59e0b" />
          ) : (
            <Text style={{ color: isDark ? '#a1a1aa' : '#6b7280', fontWeight: '600', fontSize: 14 }}>
              Cargar más historial
            </Text>
          )}
        </TouchableOpacity>
      );
    }

    return (
      <View className="flex-1 justify-center items-center py-20">
        <ShoppingBag color={isDark ? '#52525b' : '#9ca3af'} size={48} style={{ marginBottom: 16 }} />
        <Text className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Sin órdenes aún
        </Text>
        <Text className={`text-sm text-center ${isDark ? 'text-zinc-500' : 'text-gray-500'}`}>
          Realiza tu primera orden desde la pantalla principal
        </Text>
      </View>
    );
  };

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
      <FlatList
        data={listItems}
        keyExtractor={(item, index) => {
          if (item.type === 'order') return item.order._id;
          return `${item.type}-${index}`;
        }}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#f59e0b" />
        }
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
