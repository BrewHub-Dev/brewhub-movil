import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useNavigation, useRoute } from '@react-navigation/native';
import { X } from 'lucide-react-native';
import { useTenant } from '../providers/TenantProvider';
import { useScan } from '../hooks/useScan';
import { apiClient } from '@/shared/services/apiClient';

export const QRScannerScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanProcessed, setScanProcessed] = useState(false);
  const isProcessingRef = useRef(false);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { setTenant } = useTenant();

  const fromRegister = route.params?.fromRegister || false;

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const extractInviteCode = (rawData: string) => {
    const value = rawData.trim();
    if (!value) {
      throw new Error('Código QR vacío');
    }
    let inviteCode = value;
    if (!inviteCode) {
      throw new Error('Código QR inválido');
    }

    return inviteCode;
  };

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');

    if (status !== 'granted') {
      Alert.alert(
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

  const handleScan = async (data: string) => {
    if (isProcessingRef.current || scanProcessed) return;

    isProcessingRef.current = true;

    try {
      const inviteCode = extractInviteCode(data);

      console.log('Validating invite code:', inviteCode);

      const response = await apiClient.post('/invitations/validate', {
        inviteCode,
      });

      const { tenant } = response.data;

      setScanProcessed(true);

      if (fromRegister) {
        Alert.alert(
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

      console.log('Tenant info received:', tenant);

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

      Alert.alert('Error', errorMessage, [
        {
          text: 'Reintentar',
          onPress: () => {
            isProcessingRef.current = false;
            setScanProcessed(false);
            resume();
          },
        },
      ]);
    }
  };

  const { onBarCodeScanned, isProcessing, resume } = useScan({
    onScan: handleScan,
    cooldownMs: 10000,
    sameCodeCooldownMs: 15000,
    enabled: !scanProcessed,
  });

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
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={isProcessing ? undefined : onBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />

      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => navigation.goBack()}
          >
            <X size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.scanArea}>
          <View style={styles.scanFrame} />
          <Text style={styles.instructionText}>
            Escanea el código QR de tu tienda
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {fromRegister
              ? 'Pide el código QR al personal de la tienda'
              : 'Escanea el QR para vincular tu cuenta a una tienda'}
          </Text>
        </View>
      </View>

      {isProcessing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingOverlayText}>Validando...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  instructionText: {
    marginTop: 20,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  footerText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlayText: {
    marginTop: 12,
    color: '#fff',
    fontSize: 16,
  },
});
