import { isRunningInExpoGo } from 'expo';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

export const useNotifications = () => {
  const router = useRouter();
  const subscriptions = useRef<{ remove: () => void }[]>([]);

  useEffect(() => {
    if (Platform.OS === 'android' && isRunningInExpoGo()) {
      return;
    }

    let active = true;
    import('expo-notifications')
      .then((Notifications) => {
        if (!active) return;

        subscriptions.current = [
          Notifications.addNotificationReceivedListener((notification) => {
            console.log('Notification received:', notification);
          }),
          Notifications.addNotificationResponseReceivedListener((response) => {
            const { notification } = response;
            const data = notification.request.content.data;

            console.log('Notification response:', data);

            switch (data?.type) {
              case 'order_status':
              case 'order':
                router.push('/(tabs)/shop');
                break;
              case 'diet_plan_added':
              case 'diet_plan_status':
              case 'diet_plan':
                router.push('/(tabs)/diet');
                break;
              case 'workout_added':
              case 'workout_status':
              case 'workout':
                router.push('/(tabs)/workouts');
                break;
              case 'new_message':
                router.push('/(trainers)/messages');
                break;
              case 'session_tracker_update':
              case 'session_completed':
              case 'session_tracker':
              case 'pt_form_status':
              case 'pt_form':
                router.push('/(tabs)/more');
                break;
              case 'trainer_new_assignment':
              case 'trainer_assignment_updated':
                router.push('/(trainers)/dashboard');
                break;
              case 'user_updated_pt_form':
              case 'user_session_tracker_update':
                router.push('/(trainers)/session-tracking');
                break;
              case 'admin_new_order':
              case 'admin_user_updated':
              case 'admin_trainer_assignment':
              case 'admin_new_user':
                router.push('/(tabs)');
                break;
              default:
                console.log('Unknown notification type:', data?.type);
            }
          }),
        ];
      })
      .catch((error) => {
        console.error('Failed to initialize notification listeners:', error);
      });

    return () => {
      active = false;
      subscriptions.current.forEach((subscription) => subscription.remove());
      subscriptions.current = [];
    };
  }, [router]);
};
