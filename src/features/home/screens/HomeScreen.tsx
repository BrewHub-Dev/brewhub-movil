import React, { useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  useColorScheme,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { COFFEE } from '../../orders/constants/coffee';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, ShoppingCart, ClipboardList, Bell, Coffee, MapPin, Phone, ChevronRight } from 'lucide-react-native';
import { useSession } from '@/features/auth/hooks/useSession';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { getCountDashboard } from '../services/homeService';
import { useTenant } from '@/features/tenant/providers/TenantProvider';
import { getBranchesByShopId } from '@/features/orders/services/branchService';
import { useQuery } from '@tanstack/react-query';
import type { HomeScreenProps } from '@/navigation/types';
import type { Branch } from '@/shared/types/branches.types';
import {
  BottomSheetModal,
  BottomSheetFlatList,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';

export function HomeScreen({ navigation }: Readonly<HomeScreenProps>) {
  const { user } = useSession();
  const logout = useLogout();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { tenant } = useTenant();

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['50%', '80%'], []);

  const { data: branches, isLoading: branchesLoading } = useQuery({
    queryKey: ['branches', tenant?.tenantId],
    queryFn: () => getBranchesByShopId(tenant!.tenantId),
    enabled: !!tenant?.tenantId,
  });

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

  async function handleLogout() {
    await logout();
    navigation.replace('Login');
  }

  const handleOpenBranches = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const handleBranchPress = useCallback((branch: Branch) => {
    bottomSheetRef.current?.dismiss();
    navigation.navigate('Menu', { branchId: branch._id, branchName: branch.name });
  }, [navigation]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ),
    []
  );

  const cardBg = isDark ? '#18181b' : '#fff';
  const subtextColor = isDark ? '#a1a1aa' : COFFEE.mocha;
  const titleColor = isDark ? '#fafaf9' : COFFEE.darkRoast;
  const sheetBg = isDark ? '#18181b' : '#fff';
  const handleColor = isDark ? '#3f3f46' : '#d4d4d4';

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
                <Text className="text-xs" style={{ color: subtextColor }}>
                  Bienvenido de vuelta
                </Text>
                <Text className="text-base font-bold" style={{ color: titleColor }}>
                  {user?.name}
                </Text>
              </View>
            </View>
            <View
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: cardBg }}
            >
              <Bell size={20} color={subtextColor} />
            </View>
          </View>

          <Text
            className="text-3xl font-bold leading-tight mb-6"
            style={{ color: titleColor }}
          >
            Encuentra el mejor{'\n'}café para ti
          </Text>

          <TouchableOpacity
            onPress={handleOpenBranches}
            activeOpacity={0.85}
            className="flex-row items-center rounded-2xl px-4 py-4 mb-2"
            style={{ backgroundColor: cardBg }}
          >
            <Coffee size={18} color={subtextColor} />
            <Text className="ml-3 text-sm" style={{ color: subtextColor }}>
              Buscar productos, tiendas...
            </Text>
          </TouchableOpacity>
        </View>

        <View className="px-6 mt-4 mb-6">
          <Text
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: subtextColor }}
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
                style={{
                  backgroundColor: cardBg,
                  borderWidth: isDark ? 1 : 0,
                  borderColor: COFFEE.accent,
                }}
              >
                <Text style={{ color: COFFEE.accent, fontSize: 24, fontWeight: '700' }}>{stat.value}</Text>
                <Text className="text-xs mt-1" style={{ color: subtextColor }}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="px-6 mb-6">
          <Text
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: subtextColor }}
          >
            Operaciones
          </Text>

          <TouchableOpacity
            onPress={handleOpenBranches}
            activeOpacity={0.85}
            className="rounded-3xl mb-3"
            style={{
              backgroundColor: cardBg,
              borderWidth: isDark ? 1 : 0,
              borderColor: COFFEE.accent,
            }}
          >
            <View className="p-5 flex-row items-center">
              <View className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                style={{ backgroundColor: COFFEE.accent }}>
                <ShoppingCart size={24} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold" style={{ color: titleColor }}>
                  Realizar una orden
                </Text>
                <Text className="text-sm mt-0.5" style={{ color: subtextColor }}>
                  Ordena desde cualquier tienda
                </Text>
              </View>
              <Text style={{ fontSize: 24, color: isDark ? '#3f3f46' : COFFEE.tan }}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('MyOrders')}
            activeOpacity={0.85}
            className="rounded-3xl"
            style={{
              backgroundColor: cardBg,
              borderWidth: isDark ? 1 : 0,
              borderColor: isDark ? '#27272a' : 'transparent',
            }}
          >
            <View className="p-5 flex-row items-center">
              <View
                className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
                style={{ backgroundColor: isDark ? '#27272a' : '#f3f4f6' }}
              >
                <ClipboardList size={24} color={subtextColor} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold" style={{ color: titleColor }}>
                  Mis órdenes
                </Text>
                <Text className="text-sm mt-0.5" style={{ color: subtextColor }}>
                  Historial y órdenes activas
                </Text>
              </View>
              <Text style={{ fontSize: 24, color: isDark ? '#3f3f46' : COFFEE.tan }}>›</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity onPress={handleLogout} className="items-center pb-10">
        <Text className="text-sm" style={{ color: isDark ? '#52525b' : COFFEE.caramel }}>
          Cerrar Sesión
        </Text>
      </TouchableOpacity>

      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: sheetBg }}
        handleIndicatorStyle={{ backgroundColor: handleColor }}
      >
        <View className="px-6 pt-2 pb-4">
          <Text className="text-lg font-bold mb-1" style={{ color: titleColor }}>
            Selecciona una tienda
          </Text>
          <Text className="text-sm" style={{ color: subtextColor }}>
            Elige la sucursal desde donde quieres ordenar
          </Text>
        </View>

        {branchesLoading ? (
          <View className="flex-1 items-center justify-center pb-10">
            <ActivityIndicator size="large" color={COFFEE.accent} />
          </View>
        ) : (
          <BottomSheetFlatList
            data={branches ?? []}
            keyExtractor={(item: { _id: string }) => item._id}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            renderItem={({ item }: { item: Branch }) => (
              <TouchableOpacity
                onPress={() => handleBranchPress(item)}
                activeOpacity={0.85}
                style={{
                  backgroundColor: isDark ? '#27272a' : COFFEE.cream,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: isDark ? '#3f3f46' : COFFEE.tan,
                }}
              >
                <View style={{ height: 3, backgroundColor: COFFEE.accent, borderTopLeftRadius: 16, borderTopRightRadius: 16 }} />
                <View style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: titleColor, fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 }}>
                      {item.name}
                    </Text>
                    <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: COFFEE.accent, alignItems: 'center', justifyContent: 'center' }}>
                      <ChevronRight size={16} color="#fff" />
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <MapPin size={13} color={subtextColor} />
                    <Text style={{ color: subtextColor, fontSize: 13, marginLeft: 6, flex: 1 }} numberOfLines={1}>
                      {item.address.street}, {item.address.city}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Phone size={13} color={subtextColor} />
                    <Text style={{ color: subtextColor, fontSize: 13, marginLeft: 6 }}>
                      {item.phone}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </BottomSheetModal>
    </SafeAreaView>
  );
}
