import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

export const useNotifications = () => {
  const router = useRouter();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener((notification: any) => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response: any) => {
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
          router.push('/(admin)');
          break;
        default:
          console.log('Unknown notification type:', data?.type);
      }
    });

    return () => {
      notificationListener.current?.remove?.();
      responseListener.current?.remove?.();
    };
  }, [router]);
};
