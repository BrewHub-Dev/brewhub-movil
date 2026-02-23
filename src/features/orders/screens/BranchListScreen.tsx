import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { Phone } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { getBranches } from '../services/branchService';
import type { Branch } from '@/shared/types/branches.types';
import type { BranchListScreenProps } from '@/navigation/types';

export function BranchListScreen({ navigation }: Readonly<BranchListScreenProps>) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { data: branches, isLoading, error } = useQuery({
    queryKey: ['branches'],
    queryFn: getBranches,
  });

  const handleBranchPress = (branch: Branch) => {
    navigation.navigate('Menu', { branchId: branch._id, branchName: branch.name });
  };

  if (isLoading) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? 'bg-zinc-950' : 'bg-white'}`}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text className={`mt-4 ${isDark ? 'text-zinc-400' : 'text-gray-600'}`}>
          Cargando tiendas...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? 'bg-zinc-950' : 'bg-white'} px-6`}>
        <Text className="text-red-500 text-center text-lg">
          Error al cargar las tiendas
        </Text>
        <Text className={`${isDark ? 'text-zinc-400' : 'text-gray-600'} text-center mt-2`}>
          {error instanceof Error ? error.message : 'Ocurrió un error'}
        </Text>
      </View>
    );
  }

  if (!branches || branches.length === 0) {
    return (
      <View className={`flex-1 justify-center items-center ${isDark ? 'bg-zinc-950' : 'bg-white'} px-6`}>
        <Text className={`${isDark ? 'text-zinc-400' : 'text-gray-600'} text-center text-lg`}>
          No hay tiendas disponibles
        </Text>
      </View>
    );
  }

  return (

    <View className={`flex-1 ${isDark ? 'bg-zinc-900' : 'bg-gray-50'}`}>
      <View className={`${isDark ? 'bg-zinc-950' : 'bg-white'} px-6 py-4 border-b ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
        <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Selecciona una tienda
        </Text>
        <Text className={`${isDark ? 'text-zinc-400' : 'text-gray-600'} mt-1`}>
          Elige la sucursal donde quieres ordenar
        </Text>
      </View>

      <FlatList
        data={branches}
        keyExtractor={(item) => item._id}
        contentContainerClassName="pt-4 pb-4"
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleBranchPress(item)}
            className={`${isDark ? 'bg-zinc-900' : 'bg-white'} mx-4 mb-4 rounded-xl border ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}
            activeOpacity={0.7}
          >
            <View className="p-4">
              <Text className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-2`}>
                {item.name}
              </Text>

              <View>
                <Text className={isDark ? 'text-zinc-400' : 'text-gray-600'}>
                  {item.address.street}
                </Text>
                <Text className={isDark ? 'text-zinc-400' : 'text-gray-600'}>
                  {item.address.city}, {item.address.state} {item.address.zip}
                </Text>
                <Text className="flex-row items-center mt-2">
                  <Phone size={10} color={isDark ? "#a1a1aa" : "#6b7280"} />{' '}
                  <Text className={isDark ? 'text-zinc-400' : 'text-gray-600'}>
                  {item.phone}
                  </Text>
                </Text>
              </View>

              <View className="mt-4 flex-row justify-end">
                <View className={`${isDark ? 'bg-amber-950' : 'bg-amber-100'} px-4 py-2 rounded-lg`}>
                  <Text className={`${isDark ? 'text-amber-200' : 'text-amber-800'} font-semibold`}>
                    Ver menú →
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
