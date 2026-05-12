import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const configureNotifications = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
};

const requestNotificationPermissionsAsync = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    return true;
  } catch (error) {
    console.warn('Error requesting notification permissions:', error);
    return false;
  }
};

const setupNotificationChannelAsync = async () => {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    } catch (error) {
      console.warn('Error creating notification channel:', error);
    }
  }
};

export const registerForPushNotificationsAsync = async (): Promise<string | undefined> => {
  try {
    await setupNotificationChannelAsync();

    const permissionGranted = await requestNotificationPermissionsAsync();
    if (!permissionGranted) {
      return undefined;
    }

    if (!Device.isDevice) {
      console.log('Must use a physical device for push notifications');
      return undefined;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ||
      Constants.easConfig?.projectId ||
      Constants.expoConfig?.extra?.projectId;

    if (!projectId) {
      console.warn('No Expo projectId found. Local notifications still work, but Expo push token registration is disabled.');
      return undefined;
    }

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('Push token:', token);
    return token;
  } catch (error) {
    console.warn('Error getting push token:', error);
    return undefined;
  }
};

export const sendLocalNotification = (
  title: string,
  body: string,
  data?: Record<string, string>
) => {
  Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data || {},
      sound: 'default',
      badge: 1,
    },
    trigger: null,
  }).catch((error: any) => {
    console.warn('Error scheduling notification:', error);
  });
};

export const sendOrderNotification = (
  orderId: string | number,
  status: string,
  message?: string
) => {
  const title = 'Order Status Updated';
  const body = message || `Your order #${orderId} status is ${status}`;

  sendLocalNotification(title, body, {
    orderId: orderId.toString(),
    status,
    type: 'order',
  });
};

export const sendDietPlanNotification = (
  dietPlanId: string | number,
  status: string,
  message?: string
) => {
  const title = 'Diet Plan Updated';
  const body = message || `Your diet plan #${dietPlanId} is now ${status}`;

  sendLocalNotification(title, body, {
    dietPlanId: dietPlanId.toString(),
    status,
    type: 'diet_plan',
  });
};

export const sendWorkoutNotification = (
  workoutId: string | number,
  status: string,
  message?: string
) => {
  const title = 'Workout Updated';
  const body = message || `Your workout #${workoutId} is now ${status}`;

  sendLocalNotification(title, body, {
    workoutId: workoutId.toString(),
    status,
    type: 'workout',
  });
};

export const sendSessionTrackerNotification = (
  sessionId: string | number,
  status: string,
  message?: string
) => {
  const title = 'Session Tracker Updated';
  const body = message || `Your session tracker #${sessionId} is now ${status}`;

  sendLocalNotification(title, body, {
    sessionId: sessionId.toString(),
    status,
    type: 'session_tracker',
  });
};

export const sendPTFormNotification = (
  formId: string | number,
  status: string,
  message?: string
) => {
  const title = 'PT Form Updated';
  const body = message || `Your PT form #${formId} is now ${status}`;

  sendLocalNotification(title, body, {
    formId: formId.toString(),
    status,
    type: 'pt_form',
  });
};

