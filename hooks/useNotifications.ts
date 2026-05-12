import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

// Check if running in Expo Go
const isExpoGo = (): boolean => {
  return Constants.appOwnership === 'expo';
};

export const useNotifications = () => {
  const router = useRouter();

  useEffect(() => {
    // Skip notification listeners in Expo Go on Android (SDK 53+)
    // Remote notifications are not supported in Expo Go for Android
    if (isExpoGo() && Platform.OS === 'android') {
      console.log('Expo Go detected on Android - notification listeners skipped (SDK 53+ limitation)');
      return;
    }

    try {
      // Handle notification when app is open (foreground)
      const subscription = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received (app in foreground):', notification);
        // The notification will be displayed automatically due to our handler configuration
      });

      // Handle notification tap (when user taps on the notification)
      const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
        const data = response.notification.request.content.data;
        console.log('Notification tapped:', data);

        // Navigate based on notification type
        switch (data.type) {
          case 'order_status':
            router.push('/(tabs)/shop');
            break;
          case 'diet_plan_added':
          case 'diet_plan_status':
            router.push('/(tabs)/diet');
            break;
          case 'workout_added':
          case 'workout_status':
            router.push('/(tabs)/workouts');
            break;
          case 'new_message':
            router.push('/(trainers)/messages');
            break;
          case 'session_tracker_update':
          case 'session_completed':
          case 'pt_form_status':
            router.push('/(tabs)/more');
            break;
          case 'user_assigned':
            router.push('/(trainers)/dashboard');
            break;
          case 'user_updated_pt_form':
          case 'user_session_tracker_update':
            router.push('/(trainers)/session-tracking');
            break;
          case 'admin_new_order':
            router.push('/(admin)/index');
            break;
          case 'admin_user_updated':
          case 'admin_trainer_assignment':
            router.push('/(admin)/index');
            break;
          case 'admin_new_user':
            router.push('/(admin)/index');
            break;
          default:
            console.log('Unknown notification type:', data.type);
        }
      });

      return () => {
        subscription.remove();
        responseSubscription.remove();
      };
    } catch (error) {
      console.warn('Error setting up notification listeners:', error);
      // Continue without notification listeners on error
    }
  }, [router]);
};
