import { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { apiClient } from '../shared/services/apiClient';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export function usePushNotifications(isAuthenticated: boolean) {
    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(
        undefined
    );
    const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
    const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

    useEffect(() => {
        if (!isAuthenticated) return;

        registerForPushNotificationsAsync()
            .then(token => {
                if (token) {
                    setExpoPushToken(token);
                    // Send token to backend
                    apiClient.post('/users/push-token', { pushToken: token })
                        .catch((err: any) => console.error('[Push Hook] Error saving push token:', err));
                }
            })
            .catch((err: any) => console.error('[Push Hook] Registration error:', err));

        // Ensure token is passed if needed according to previous log, but since these are listeners, no args are needed if we just track subscriptions
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log(response);
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, [isAuthenticated]);

    return { expoPushToken, notification };
}

async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }
        try {
            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
            if (!projectId) {
                console.warn('EAS Project ID not found. Ensure app.json is configured.');
            }
            token = (
                await Notifications.getExpoPushTokenAsync({
                    projectId,
                })
            ).data;
        } catch (e) {
            console.error('Failed to get push token:', e);
            return null;
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}
