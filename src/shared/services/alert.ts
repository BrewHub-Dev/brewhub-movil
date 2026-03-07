import { Alert, Platform } from 'react-native';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
): void {
  if (Platform.OS === 'web') {
    const hasCancel = buttons?.some((b) => b.style === 'cancel');
    const confirmButton = buttons?.find((b) => b.style !== 'cancel');

    if (hasCancel && confirmButton) {
      const result = window.confirm(`${title}\n\n${message ?? ''}`);
      if (result) {
        confirmButton.onPress?.();
      } else {
        buttons?.find((b) => b.style === 'cancel')?.onPress?.();
      }
    } else if (buttons && buttons.length === 1) {
      window.alert(`${title}\n\n${message ?? ''}`);
      buttons[0].onPress?.();
    } else {
      window.alert(`${title}\n\n${message ?? ''}`);
      buttons?.[0]?.onPress?.();
    }
  } else {
    Alert.alert(title, message, buttons);
  }
}
