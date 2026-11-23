import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';

// Configure how notifications appear when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPushNotificationsAsync = async () => {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('carequeue-alerts', {
      name: 'CareQueue Urgent Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00796B',
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
      console.warn('[Notifications] Push notification permission not granted');
      return null;
    }

    try {
      const pushTokenData = await Notifications.getExpoPushTokenAsync();
      token = pushTokenData.data;
      console.log('[Notifications] Expo Push Token:', token);

      // Sync push token with backend server
      await api.put('/users/push-token', { pushToken: token });
    } catch (err) {
      console.warn('[Notifications] Error fetching Expo push token:', err.message);
    }
  } else {
    console.log('[Notifications] Physical device required for remote push tokens');
  }

  return token;
};

export default {
  registerForPushNotificationsAsync,
};
