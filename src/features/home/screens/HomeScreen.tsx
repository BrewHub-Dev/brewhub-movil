import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, ShoppingCart, ClipboardList } from "lucide-react-native";
import { useSession } from '@/features/auth/hooks/useSession';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { getCountDashboard } from '../services/homeService';
import type { HomeScreenProps } from '@/navigation/types';

export function HomeScreen({ navigation }: Readonly<HomeScreenProps>) {
  const { user } = useSession();
  const logout = useLogout();

  async function handleLogout() {
    await logout();
    navigation.replace('Login');
  }
  const [dashboardCounts, setDashboardCounts] = React.useState<{ total: number; inProduction: number; completed: number }>({
    total: 0,
    inProduction: 0,
    completed: 0,
  });

  React.useEffect(() => {
    async function fetchDashboardCounts() {
      if (user?._id) {
        const counts = await getCountDashboard(user._id);
        setDashboardCounts({
          total: counts.total ?? 0,
          inProduction: counts.inProduction ?? 0,
          completed: counts.completed ?? 0,
        });
      }
    }
    fetchDashboardCounts();
  }, [user?._id]);

  return (
    <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#09090b" />

      <View className="flex-1 px-6 py-8">
        <View className="flex-row items-center justify-between mb-8">
          <View>
            <Text className="text-zinc-400 text-sm">Bienvenido de vuelta</Text>
            <Text className="text-dark text-2xl font-bold">{user?.name}</Text>
          </View>
          <View className="w-12 h-12 rounded-2xl bg-amber-500 items-center justify-center">
            <User className="text-dark" size={22} />
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row gap-3 mb-6">
          {/* <View className="flex-1 bg-zinc-900 rounded-2xl p-4 border border-zinc-800"></View> */}
          <View className="flex-1 rounded-2xl p-4 border border-zinc-800">
            <Text className="text-amber-500 text-2xl font-bold">{dashboardCounts.total || 0}</Text>
            <Text className="text-zinc-400 text-xs mt-1">Ordenes Activos</Text>
          </View>
          <View className="flex-1 rounded-2xl p-4 border border-zinc-800">
            <Text className="text-amber-500 text-2xl font-bold">{dashboardCounts.inProduction || 0}</Text>
            <Text className="text-zinc-400 text-xs mt-1">En producción</Text>
          </View>
          <View className="flex-1 rounded-2xl p-4 border border-zinc-800">
            <Text className="text-amber-500 text-2xl font-bold">{dashboardCounts.completed || 0}</Text>
            <Text className="text-zinc-400 text-xs mt-1">Lotes listos</Text>
          </View>
        </View>

        <Text className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3">
          Listado de Operaciones
        </Text>
        <View className="gap-3">
          <TouchableOpacity
            onPress={() => navigation.navigate('BranchList')}
            activeOpacity={0.7}
            className="flex-row items-center rounded-2xl p-4 border border-zinc-800"
          >
            <View className="w-10 h-10 rounded-xl items-center justify-center mr-3">
              <ShoppingCart size={20} />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-sm">Realizar una orden</Text>
              <Text className="text-zinc-500 text-xs">Ordena desde cualquier tienda</Text>
            </View>
            <Text className="text-zinc-600">›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('MyOrders')}
            activeOpacity={0.7}
            className="flex-row items-center rounded-2xl p-4 border border-zinc-800"
          >
            <View className="w-10 h-10 rounded-xl items-center justify-center mr-3">
              <ClipboardList size={20} />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-sm">Mis órdenes</Text>
              <Text className="text-zinc-500 text-xs">Historial y órdenes activas</Text>
            </View>
            <Text className="text-zinc-600">›</Text>
          </TouchableOpacity>

        </View>

        <TouchableOpacity
          onPress={handleLogout}
          className="mt-auto pt-6 items-center"
        >
          <Text className="text-zinc-600 text-sm">Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
