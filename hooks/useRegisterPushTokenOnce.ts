import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';

export const useRegisterPushTokenOnce = () => {
  const hasRegistered = useRef(false);

  useEffect(() => {
    const register = async () => {
      if (hasRegistered.current) return;

      try {
        const accessToken = await SecureStore.getItemAsync('accessToken');
        if (!accessToken) return;

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.warn('📵 Push notification permission not granted');
          return;
        }

        if (!Device.isDevice) {
          console.warn('📵 Push notifications require a physical device');
          return;
        }

        const token = (await Notifications.getExpoPushTokenAsync()).data;

        if (token) {
          await fetch('https://api-livetakeoff.herokuapp.com/api/users/push-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `JWT ${accessToken}`,
            },
            body: JSON.stringify({ expo_push_token: token }),
          });
        }

        hasRegistered.current = true; // prevent future runs

      } catch (error) {
        console.warn('📵 Failed to register for push notifications:', error);
      }
    };

    register();
  }, []);
};