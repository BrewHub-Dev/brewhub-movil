import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Platform,
  TextInput,
  useColorScheme,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { X, QrCode } from 'lucide-react-native';
import { useTenant } from '../providers/TenantProvider';
import { apiClient } from '@/shared/services/apiClient';
import { showAlert } from '@/shared/services/alert';

export const QRScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanProcessed, setScanProcessed] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const isProcessingRef = useRef(false);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { setTenant } = useTenant();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const fromRegister = route.params?.fromRegister || false;
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    if (!isWeb) {
      requestCameraPermission();
    }
  }, []);

  const extractInviteCode = (rawData: string) => {
    const value = rawData.trim();
    if (!value) {
      throw new Error('Código QR vacío');
    }
    return value;
  };

  const requestCameraPermission = async () => {
    const { Camera } = await import('expo-camera');
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');

    if (status !== 'granted') {
      showAlert(
        'Permiso Requerido',
        'Necesitamos acceso a la cámara para escanear códigos QR.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Abrir Configuración',
            onPress: () => Linking.openSettings(),
          },
        ]
      );
    }
  };

  const handleValidateCode = async (data: string) => {
    if (isProcessingRef.current || scanProcessed) return;

    isProcessingRef.current = true;
    setIsValidating(true);

    try {
      const inviteCode = extractInviteCode(data);

      const response = await apiClient.post('/invitations/validate', {
        inviteCode,
      });

      const { tenant } = response.data;

      setScanProcessed(true);

      if (fromRegister) {
        showAlert(
          'Código Válido',
          `Tienda: ${tenant.name}`,
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.navigate('Register', { inviteCode });
              },
            },
          ]
        );
        return;
      }

      await setTenant({
        tenantId: tenant.tenantId,
        shopName: tenant.name,
        shopLogo: tenant.logo,
        branchId: tenant.branchId,
      });

      navigation.replace('Home');
    } catch (error: any) {
      isProcessingRef.current = false;
      const isNetworkError = error?.code === 'ERR_NETWORK' || !error?.response;
      const errorMessage = isNetworkError
        ? `No se pudo conectar con el backend (${apiClient.defaults.baseURL}).`
        : error.response?.data?.error || 'Código QR inválido. Por favor, intenta de nuevo.';

      showAlert('Error', errorMessage, [
        {
          text: 'Reintentar',
          onPress: () => {
            isProcessingRef.current = false;
            setScanProcessed(false);
          },
        },
      ]);
    } finally {
      setIsValidating(false);
    }
  };

  if (isWeb) {
    return (
      <View className={`flex-1 justify-center items-center px-6 ${isDark ? 'bg-zinc-950' : 'bg-white'}`}>
        <TouchableOpacity
          style={{ position: 'absolute', top: 60, left: 20 }}
          onPress={() => navigation.goBack()}
        >
          <X size={24} color={isDark ? '#fff' : '#18181b'} />
        </TouchableOpacity>

        <View className={`w-20 h-20 rounded-2xl bg-amber-500 items-center justify-center mb-6`}>
          <QrCode size={40} color="#18181b" />
        </View>

        <Text className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Ingresa el código
        </Text>
        <Text className={`text-center mb-8 ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>
          La cámara no está disponible en web.{'\n'}Ingresa el código de invitación manualmente.
        </Text>

        <TextInput
          className={`w-full border rounded-xl px-4 py-4 text-center text-lg font-bold mb-4 ${
            isDark ? 'border-zinc-700 text-white bg-zinc-900' : 'border-zinc-300 text-gray-900 bg-white'
          }`}
          placeholder="CAFE-ABC-2024"
          placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
          value={manualCode}
          onChangeText={setManualCode}
          autoCapitalize="characters"
        />

        <TouchableOpacity
          className={`w-full py-4 rounded-xl items-center ${
            isValidating || !manualCode.trim() ? 'bg-amber-700 opacity-60' : 'bg-amber-500'
          }`}
          onPress={() => handleValidateCode(manualCode)}
          disabled={isValidating || !manualCode.trim()}
        >
          {isValidating ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-bold text-base">Validar código</Text>
          )}
        </TouchableOpacity>

        <Text className={`text-center text-sm mt-6 ${isDark ? 'text-zinc-500' : 'text-gray-400'}`}>
          {fromRegister
            ? 'Pide el código de invitación al personal de la tienda'
            : 'Ingresa el código para vincular tu cuenta a una tienda'}
        </Text>
      </View>
    );
  }

  const NativeCameraScanner = React.lazy(() =>
    import('../components/NativeCameraScanner').then((mod) => ({ default: mod.NativeCameraScanner }))
  );

  if (hasPermission === null) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Solicitando permiso de cámara...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No hay acceso a la cámara</Text>
        <TouchableOpacity style={styles.button} onPress={requestCameraPermission}>
          <Text style={styles.buttonText}>Solicitar Permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <React.Suspense fallback={
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    }>
      <NativeCameraScanner
        fromRegister={fromRegister}
        scanProcessed={scanProcessed}
        onScan={handleValidateCode}
        onClose={() => navigation.goBack()}
      />
    </React.Suspense>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
