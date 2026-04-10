import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  Image,
  ScrollView,
  Switch,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { User, Camera, Save, Bell, Shield } from 'lucide-react-native';
import { useSession, useSetSession } from '../hooks/useSession';
import { apiClient } from '../../../shared/services/apiClient';
import { showAlert } from '../../../shared/services/alert';
import { COFFEE } from '../../orders/constants/coffee';
import type { ProfileScreenProps } from '../../../navigation/types';

export function ProfileScreen({ navigation }: Readonly<ProfileScreenProps>) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, refetch } = useSession();
  const setSession = useSetSession();
  const [name, setName] = useState(user?.name ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [isEditing, setIsEditing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const bgColor = isDark ? '#09090b' : COFFEE.cream;
  const cardBg = isDark ? '#18181b' : '#fff';
  const cardBorder = isDark ? '#3f3f46' : COFFEE.tan;
  const titleColor = isDark ? '#fafafa' : COFFEE.darkRoast;
  const subtextColor = isDark ? '#a1a1aa' : COFFEE.mocha;
  const inputBg = isDark ? '#18181b' : '#fff';
  const inputBorder = isDark ? '#3f3f46' : COFFEE.tan;

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string; lastName?: string; phone?: string }) => {
      const response = await apiClient.patch('/users/me', data);
      return response.data;
    },
    onSuccess: async (updatedUser) => {
      showAlert('Perfil actualizado', 'Tu información ha sido guardada.');
      setIsEditing(false);
      if (user) {
        await setSession(user._id, { ...user, ...updatedUser });
      }
      refetch();
    },
    onError: (error: Error) => {
      showAlert('Error', error.message);
    },
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const response = await apiClient.patch('/users/me/notifications', { enabled });
      return response.data;
    },
    onSuccess: () => {
      setNotificationsEnabled(!notificationsEnabled);
    },
    onError: (error: Error) => {
      showAlert('Error', error.message);
    },
  });

  const handleSave = () => {
    if (!name.trim()) {
      showAlert('Error', 'El nombre no puede estar vacío');
      return;
    }
    updateProfileMutation.mutate({ 
      name: name.trim(), 
      lastName: lastName.trim() || undefined,
      phone: phone.trim() || undefined,
    });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bgColor }}>
      <View className="px-6 py-6 border-b" style={{ backgroundColor: cardBg, borderColor: cardBorder }}>
        <Text className="text-2xl font-bold" style={{ color: titleColor }}>
          Mi Perfil
        </Text>
      </View>

      <View className="items-center py-6">
        <View className="relative">
          <View
            className="w-28 h-28 rounded-full items-center justify-center"
            style={{ backgroundColor: isDark ? '#27272a' : COFFEE.latte }}
          >
            {user?.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                className="w-28 h-28 rounded-full"
              />
            ) : (
              <User size={56} color={subtextColor} />
            )}
          </View>
          <TouchableOpacity
            className="absolute bottom-0 right-0 p-2 rounded-full"
            style={{ backgroundColor: COFFEE.accent }}
            activeOpacity={0.8}
          >
            <Camera size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-6 pb-6">
        <View className="mb-4">
          <Text className="text-sm font-medium mb-2" style={{ color: subtextColor }}>
            Nombre
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            editable={isEditing}
            className="w-full p-4 rounded-xl border"
            style={{ 
              backgroundColor: isEditing ? inputBg : inputBg + '80', 
              borderColor: inputBorder,
              color: titleColor,
            }}
            placeholder="Tu nombre"
            placeholderTextColor={subtextColor}
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium mb-2" style={{ color: subtextColor }}>
            Apellido
          </Text>
          <TextInput
            value={lastName}
            onChangeText={setLastName}
            editable={isEditing}
            className="w-full p-4 rounded-xl border"
            style={{ 
              backgroundColor: isEditing ? inputBg : inputBg + '80', 
              borderColor: inputBorder,
              color: titleColor,
            }}
            placeholder="Tu apellido"
            placeholderTextColor={subtextColor}
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium mb-2" style={{ color: subtextColor }}>
            Teléfono
          </Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            editable={isEditing}
            keyboardType="phone-pad"
            className="w-full p-4 rounded-xl border"
            style={{ 
              backgroundColor: isEditing ? inputBg : inputBg + '80', 
              borderColor: inputBorder,
              color: titleColor,
            }}
            placeholder="Tu teléfono"
            placeholderTextColor={subtextColor}
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium mb-2" style={{ color: subtextColor }}>
            Correo electrónico
          </Text>
          <View
            className="w-full p-4 rounded-xl border"
            style={{ backgroundColor: inputBg + '80', borderColor: inputBorder }}
          >
            <Text style={{ color: subtextColor }}>
              {user?.emailAddress}
            </Text>
          </View>
        </View>

        {isEditing ? (
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              onPress={() => {
                setIsEditing(false);
                setName(user?.name ?? '');
                setLastName(user?.lastName ?? '');
                setPhone(user?.phone ?? '');
              }}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: cardBorder,
                backgroundColor: cardBg,
              }}
              activeOpacity={0.8}
            >
              <Text className="font-bold" style={{ color: titleColor }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={updateProfileMutation.isPending}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: 'center',
                backgroundColor: COFFEE.accent,
              }}
              activeOpacity={0.8}
            >
              {updateProfileMutation.isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Save size={18} color="white" />
                  <Text className="text-white font-bold mt-1">Guardar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            style={{
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: 'center',
              backgroundColor: isDark ? '#27272a' : COFFEE.latte,
            }}
            activeOpacity={0.8}
          >
            <Text className="font-bold" style={{ color: COFFEE.accent }}>Editar perfil</Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="px-6 py-4 border-t" style={{ borderColor: cardBorder }}>
        <Text className="text-lg font-bold mb-4" style={{ color: titleColor }}>Configuración</Text>
        
        <View className="flex-row items-center justify-between p-4 rounded-xl mb-3" style={{ backgroundColor: cardBg }}>
          <View className="flex-row items-center">
            <View className="p-2 rounded-lg mr-3" style={{ backgroundColor: isDark ? '#27272a' : COFFEE.latte }}>
              <Bell size={20} color={COFFEE.accent} />
            </View>
            <View>
              <Text className="font-medium" style={{ color: titleColor }}>Notificaciones</Text>
              <Text className="text-sm" style={{ color: subtextColor }}>Recibir alertas de órdenes</Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={() => updateNotificationsMutation.mutate(!notificationsEnabled)}
            trackColor={{ false: '#3f3f46', true: COFFEE.accent }}
            thumbColor="#fff"
          />
        </View>

        <TouchableOpacity
          className="flex-row items-center p-4 rounded-xl"
          style={{ backgroundColor: cardBg }}
          activeOpacity={0.8}
        >
          <View className="p-2 rounded-lg mr-3" style={{ backgroundColor: isDark ? '#27272a' : COFFEE.latte }}>
            <Shield size={20} color={COFFEE.accent} />
          </View>
          <View className="flex-1">
            <Text className="font-medium" style={{ color: titleColor }}>Cambiar contraseña</Text>
            <Text className="text-sm" style={{ color: subtextColor }}>Actualiza tu seguridad</Text>
          </View>
          <Text style={{ color: subtextColor }}>›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}