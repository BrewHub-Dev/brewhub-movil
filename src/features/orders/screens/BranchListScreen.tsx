import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { MapPin, Phone, ChevronRight } from 'lucide-react-native';
import { COFFEE } from '../constants/coffee';
import { useQuery } from '@tanstack/react-query';
import { getBranches } from '../services/branchService';
import { useTenant } from '@/features/tenant/providers/TenantProvider';
import type { Branch } from '@/shared/types/branches.types';
import type { BranchListScreenProps } from '@/navigation/types';

function Separator() {
  return <View style={{ height: 12 }} />;
}

function BranchCard({
  item,
  isDark,
  onPress,
}: Readonly<{ item: Branch; isDark: boolean; onPress: () => void }>) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}
      className="rounded-3xl overflow-hidden"
      style={{
        backgroundColor: isDark ? '#18181b' : '#fff',
        borderWidth: isDark ? 1 : 0,
        borderColor: COFFEE.accent,
      }}
    >
      <View className="h-1.5" style={{ backgroundColor: COFFEE.accent }} />
      <View className="p-5">
        <View className="flex-row items-start justify-between mb-3">
          <Text
            className="text-lg font-bold flex-1 mr-3"
            style={{ color: isDark ? '#fafaf9' : COFFEE.darkRoast }}
          >
            {item.name}
          </Text>
          <View
            className="w-9 h-9 rounded-2xl items-center justify-center"
            style={{ backgroundColor: COFFEE.accent }}
          >
            <ChevronRight size={18} color="#fff" />
          </View>
        </View>
        <View className="flex-row items-center mb-2">
          <MapPin size={14} color={isDark ? '#a1a1aa' : COFFEE.mocha} />
          <Text
            className="text-sm ml-2 flex-1"
            numberOfLines={1}
            style={{ color: isDark ? '#a1a1aa' : COFFEE.mocha }}
          >
            {item.address.street}, {item.address.city}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Phone size={14} color={isDark ? '#a1a1aa' : COFFEE.mocha} />
          <Text
            className="text-sm ml-2"
            style={{ color: isDark ? '#a1a1aa' : COFFEE.mocha }}
          >
            {item.phone}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function BranchListScreen({ navigation }: Readonly<BranchListScreenProps>) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { tenant } = useTenant();

  const { data: branches, isLoading, error } = useQuery({
    queryKey: ['branches', tenant?.tenantId],
    queryFn: getBranches,
  });

  const handleBranchPress = (branch: Branch) => {
    navigation.navigate('Menu', { branchId: branch._id, branchName: branch.name });
  };

  if (isLoading) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: isDark ? '#09090b' : COFFEE.cream }}
      >
        <ActivityIndicator size="large" color={COFFEE.accent} />
        <Text
          className="mt-4 text-sm"
          style={{ color: isDark ? '#a1a1aa' : COFFEE.mocha }}
        >
          Cargando tiendas...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        className="flex-1 justify-center items-center px-6"
        style={{ backgroundColor: isDark ? '#09090b' : COFFEE.cream }}
      >
        <Text
          style={{ color: isDark ? '#f87171' : '#ef4444' }}
          className="text-center text-lg"
        >
          Error al cargar las tiendas
        </Text>
        <Text
          className="text-center mt-2 text-sm"
          style={{ color: isDark ? '#a1a1aa' : COFFEE.mocha }}
        >
          {error instanceof Error ? error.message : 'Ocurrió un error'}
        </Text>
      </View>
    );
  }

  if (!branches || branches.length === 0) {
    return (
      <View
        className="flex-1 justify-center items-center px-6"
        style={{ backgroundColor: isDark ? '#09090b' : COFFEE.cream }}
      >
        <Text
          className="text-center text-lg"
          style={{ color: isDark ? '#a1a1aa' : COFFEE.mocha }}
        >
          No hay tiendas disponibles
        </Text>
      </View>
    );
  }

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: isDark ? '#09090b' : COFFEE.cream }}
    >
      <FlatList
        data={branches}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 }}
        ItemSeparatorComponent={Separator}
        renderItem={({ item }) => (
          <BranchCard item={item} isDark={isDark} onPress={() => handleBranchPress(item)} />
        )}
      />
    </View>
  );
}
