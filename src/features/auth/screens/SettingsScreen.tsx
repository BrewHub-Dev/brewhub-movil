import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  useColorScheme,
  Alert,
} from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { Lock, Bell, Save, ChevronRight } from 'lucide-react-native';
import { useSession } from '../hooks/useSession';
import { apiClient } from '../../../shared/services/apiClient';
import { showAlert } from '../../../shared/services/alert';

export function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user, refetch } = useSession();

  const [name, setName] = useState(user?.name ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [notifications, setNotifications] = useState(user?.notifications ?? true);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      const response = await apiClient.patch('/users/me', data);
      return response.data;
    },
    onSuccess: (updatedUser) => {
      showAlert('Perfil actualizado', 'Tu información ha sido guardada.');
      setIsEditing(false);
      refetch();
    },
    onError: (error: Error) => {
      showAlert('Error', error.message);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await apiClient.patch('/users/me/password', data);
      return response.data;
    },
    onSuccess: () => {
      showAlert('Contraseña actualizada', 'Tu contraseña ha sido cambiada correctamente.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
    },
    onError: (error: Error) => {
      showAlert('Error', error.message);
    },
  });

  const notificationsMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const response = await apiClient.patch('/users/me/notifications', { enabled });
      return response.data;
    },
    onSuccess: () => {
      setNotifications(!notifications);
    },
    onError: (error: Error) => {
      showAlert('Error', error.message);
    },
  });

  const handleSaveProfile = () => {
    if (!name.trim()) {
      showAlert('Error', 'El nombre no puede estar vacío');
      return;
    }
    updateProfileMutation.mutate({ name: name.trim() });
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showAlert('Error', 'Todos los campos son requeridos');
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert('Error', 'Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      showAlert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const bgColor = isDark ? '#09090b' : '#ffffff';
  const cardBg = isDark ? '#18181b' : '#f9fafb';
  const borderColor = isDark ? '#27272a' : '#e5e7eb';
  const textColor = isDark ? '#fafafa' : '#111827';
  const mutedColor = isDark ? '#a1a1aa' : '#6b7280';

  return (
    <View className="flex-1" style={{ backgroundColor: bgColor }}>
      <View className={`px-6 py-8 ${isDark ? 'bg-zinc-900' : 'bg-gray-50'} border-b ${isDark ? 'border-zinc-800' : 'border-gray-200'}`}>
        <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Configuración
        </Text>
      </View>

      <View className="flex-1 px-6 py-6">
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: mutedColor, marginBottom: 12, textTransform: 'uppercase' }}>
            Cuenta
          </Text>

          <View style={{ backgroundColor: cardBg, borderRadius: 16, borderWidth: 1, borderColor }}>
            <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: borderColor }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: mutedColor, marginBottom: 12 }}>
                Información Personal
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                editable={isEditing}
                placeholder="Tu nombre"
                placeholderTextColor={mutedColor}
                style={{
                  backgroundColor: isDark ? '#09090b' : '#ffffff',
                  borderRadius: 12,
                  padding: 14,
                  color: textColor,
                  borderWidth: 1,
                  borderColor: isEditing ? (isDark ? '#3f3f46' : '#d1d5db') : borderColor,
                }}
              />
              {isEditing ? (
                <TouchableOpacity
                  onPress={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f59e0b',
                    paddingVertical: 12,
                    borderRadius: 12,
                    marginTop: 12,
                  }}
                >
                  {updateProfileMutation.isPending ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Save size={18} color="white" />
                      <Text className="text-white font-bold ml-2">Guardar</Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => setIsEditing(true)}
                  style={{
                    marginTop: 12,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#f59e0b', fontWeight: '600' }}>Editar</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={() => setIsChangingPassword(!isChangingPassword)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Lock size={20} color={mutedColor} />
                <Text style={{ color: textColor, fontWeight: '500', marginLeft: 12 }}>Cambiar contraseña</Text>
              </View>
              <ChevronRight size={20} color={mutedColor} />
            </TouchableOpacity>
          </View>

          {isChangingPassword && (
            <View style={{ 
              backgroundColor: cardBg, 
              borderRadius: 16, 
              borderWidth: 1, 
              borderColor,
              marginTop: 12,
              padding: 16,
            }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: textColor, marginBottom: 12 }}>
                Nueva Contraseña
              </Text>
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                placeholder="Contraseña actual"
                placeholderTextColor={mutedColor}
                style={{
                  backgroundColor: isDark ? '#09090b' : '#ffffff',
                  borderRadius: 12,
                  padding: 14,
                  color: textColor,
                  borderWidth: 1,
                  borderColor,
                  marginBottom: 12,
                }}
              />
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholder="Nueva contraseña"
                placeholderTextColor={mutedColor}
                style={{
                  backgroundColor: isDark ? '#09090b' : '#ffffff',
                  borderRadius: 12,
                  padding: 14,
                  color: textColor,
                  borderWidth: 1,
                  borderColor,
                  marginBottom: 12,
                }}
              />
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholder="Confirmar contraseña"
                placeholderTextColor={mutedColor}
                style={{
                  backgroundColor: isDark ? '#09090b' : '#ffffff',
                  borderRadius: 12,
                  padding: 14,
                  color: textColor,
                  borderWidth: 1,
                  borderColor,
                  marginBottom: 12,
                }}
              />
              <TouchableOpacity
                onPress={handleChangePassword}
                disabled={changePasswordMutation.isPending}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f59e0b',
                  paddingVertical: 12,
                  borderRadius: 12,
                }}
              >
                {changePasswordMutation.isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold">Actualizar contraseña</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: mutedColor, marginBottom: 12, textTransform: 'uppercase' }}>
            Preferencias
          </Text>

          <View style={{ backgroundColor: cardBg, borderRadius: 16, borderWidth: 1, borderColor }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Bell size={20} color={mutedColor} />
                <Text style={{ color: textColor, fontWeight: '500', marginLeft: 12 }}>Notificaciones</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={() => notificationsMutation.mutate(!notifications)}
                trackColor={{ false: '#3f3f46', true: '#f59e0b' }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
