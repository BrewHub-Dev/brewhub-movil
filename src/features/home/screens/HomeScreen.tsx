import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { COFFEE } from '../../orders/constants/coffee';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, ShoppingCart, ClipboardList, Bell, Coffee } from 'lucide-react-native';
import { useSession } from '@/features/auth/hooks/useSession';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { getCountDashboard } from '../services/homeService';
import type { HomeScreenProps } from '@/navigation/types';

export function HomeScreen({ navigation }: Readonly<HomeScreenProps>) {
  const { user } = useSession();
  const logout = useLogout();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  async function handleLogout() {
    await logout();
    navigation.replace('Login');
  }

  const [dashboardCounts, setDashboardCounts] = React.useState<{
    total: number;
    inProduction: number;
    completed: number;
  }>({ total: 0, inProduction: 0, completed: 0 });

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
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: isDark ? '#09090b' : COFFEE.cream }}
      edges={['top', 'bottom']}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={isDark ? '#09090b' : COFFEE.cream}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-4 pb-2">
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
                style={{ backgroundColor: COFFEE.accent }}>
                <User color="#fff" size={22} />
              </View>
              <View>
                <Text
                  className="text-xs"
                  style={{ color: isDark ? COFFEE.latte : COFFEE.mocha }}
                >
                  Bienvenido de vuelta
                </Text>
                <Text
                  className="text-base font-bold"
                  style={{ color: isDark ? '#fafaf9' : COFFEE.darkRoast }}
                >
                  {user?.name}
                </Text>
              </View>
            </View>
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: isDark ? COFFEE.darkRoast : '#fff' }}
            >
              <Bell size={20} color={isDark ? COFFEE.latte : COFFEE.mocha} />
            </View>
          </View>

          <Text
            className="text-3xl font-bold leading-tight mb-6"
            style={{ color: isDark ? '#fafaf9' : COFFEE.darkRoast }}
          >
            Encuentra el mejor{'\n'}café para ti
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('BranchList')}
            activeOpacity={0.85}
            className="flex-row items-center rounded-2xl px-4 py-4 mb-2"
            style={{ backgroundColor: isDark ? COFFEE.darkRoast : '#fff' }}
          >
            <Coffee size={18} color={isDark ? COFFEE.latte : COFFEE.mocha} />
            <Text
              className="ml-3 text-sm"
              style={{ color: isDark ? COFFEE.latte : COFFEE.mocha }}
            >
              Buscar productos, tiendas...
            </Text>
          </TouchableOpacity>
        </View>

        <View className="px-6 mt-4 mb-6">
          <Text
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: isDark ? COFFEE.latte : COFFEE.mocha }}
          >
            Resumen de hoy
          </Text>
          <View className="flex-row gap-3">
            {[
              { value: dashboardCounts.total, label: 'Activas' },
              { value: dashboardCounts.inProduction, label: 'En proceso' },
              { value: dashboardCounts.completed, label: 'Listos' },
            ].map((stat) => (
              <View
                key={stat.label}
                className="flex-1 rounded-2xl p-4"
                style={{ backgroundColor: isDark ? COFFEE.darkRoast : '#fff' }}
              >
                <Text className="text-amber-500 text-2xl font-bold">{stat.value}</Text>
                <Text
                  className="text-xs mt-1"
                  style={{ color: isDark ? COFFEE.latte : COFFEE.mocha }}
                >
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="px-6 mb-6">
          <Text
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: isDark ? COFFEE.latte : COFFEE.mocha }}
          >
            Operaciones
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('BranchList')}
            activeOpacity={0.85}
            className="rounded-3xl mb-3"
            style={{ backgroundColor: isDark ? COFFEE.darkRoast : '#fff' }}
          >
            <View className="p-5 flex-row items-center">
              <View className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                style={{ backgroundColor: COFFEE.accent }}>
                <ShoppingCart size={24} color="#fff" />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-bold"
                  style={{ color: isDark ? '#fafaf9' : COFFEE.darkRoast }}
                >
                  Realizar una orden
                </Text>
                <Text
                  className="text-sm mt-0.5"
                  style={{ color: isDark ? COFFEE.latte : COFFEE.mocha }}
                >
                  Ordena desde cualquier tienda
                </Text>
              </View>
              <Text className={`text-2xl ${isDark ? 'text-zinc-700' : 'text-stone-200'}`}>
                ›
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('MyOrders')}
            activeOpacity={0.85}
            className="rounded-3xl"
            style={{ backgroundColor: isDark ? COFFEE.darkRoast : '#fff' }}
          >
            <View className="p-5 flex-row items-center">
              <View
                className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                style={{ backgroundColor: isDark ? COFFEE.darkRoast : '#f3f4f6' }}
              >
                <ClipboardList size={24} color={isDark ? COFFEE.latte : COFFEE.mocha} />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-bold"
                  style={{ color: isDark ? '#fafaf9' : COFFEE.darkRoast }}
                >
                  Mis órdenes
                </Text>
                <Text
                  className="text-sm mt-0.5"
                  style={{ color: isDark ? COFFEE.latte : COFFEE.mocha }}
                >
                  Historial y órdenes activas
                </Text>
              </View>
              <Text className={`text-2xl ${isDark ? 'text-zinc-700' : 'text-stone-200'}`}>
                ›
              </Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <TouchableOpacity onPress={handleLogout} className="items-center pb-10">
        <Text
          className="text-sm"
          style={{ color: isDark ? COFFEE.latte : COFFEE.mocha }}
        >
          Cerrar Sesión
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
