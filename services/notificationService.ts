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

// Trigger push notification from backend server
export const triggerServerPushNotification = async (
  trainerId: number,
  title: string,
  body: string,
  notificationData: Record<string, string>
) => {
  const endpoints = [
    { url: `${BASE_URL}/trainers/${trainerId}/send-notification`, name: 'send-notification' },
    { url: `${BASE_URL}/notifications/send`, name: 'generic-send' },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`📤 Triggering push notification via ${endpoint.name}:`, endpoint.url);
      const res = await fetch(endpoint.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trainerId,
          title,
          body,
          data: notificationData,
          timestamp: new Date().toISOString(),
        }),
      });

      const responseData = await res.json().catch(() => ({}));
      
      if (res.ok) {
        console.log(`✅ Push notification triggered successfully via ${endpoint.name}`);
        return true;
      } else {
        console.warn(`⚠️ Endpoint ${endpoint.name} responded with status ${res.status}:`, responseData);
      }
    } catch (error) {
      console.warn(`❌ Failed to trigger notification via ${endpoint.name}:`, error);
    }
  }
  
  console.warn('⚠️ Failed to trigger push notification from all endpoints');
  return false;
};

// Send local notification
export const sendLocalNotification = (
  title: string,
  body: string,
  data?: Record<string, string>
) => {
  try {
    const Notifications = getNotificationsModule();
    if (!Notifications) {
      console.warn('Notifications module not available, skipping local notification');
      return;
    }

    Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
        badge: 1,
      },
      trigger: null, // Immediate notification
    }).catch((error: any) => {
      console.warn('Error scheduling notification:', error);
    });
  } catch (error) {
    console.warn('Error sending local notification:', error);
  }
};

// ============================================
// USER NOTIFICATIONS (Member/Client)
// ============================================

// Order status notification
export const sendOrderStatusNotification = (
  orderId: string | number,
  status: string,
  message?: string
) => {
  const title = 'Order Status Updated';
  const body = message || `Your order #${orderId} is now ${status}`;

  sendLocalNotification(title, body, {
    orderId: orderId.toString(),
    status,
    type: 'order_status',
  });
};

// Diet plan added notification
export const sendDietPlanAddedNotification = (
  dietPlanId: string | number,
  trainerName: string,
  message?: string
) => {
  const title = 'New Diet Plan Added';
  const body = message || `${trainerName} added a new diet plan for you`;

  sendLocalNotification(title, body, {
    dietPlanId: dietPlanId.toString(),
    trainerName,
    type: 'diet_plan_added',
  });
};

// Workout added notification
export const sendWorkoutAddedNotification = (
  workoutId: string | number,
  trainerName: string,
  message?: string
) => {
  const title = 'New Workout Added';
  const body = message || `${trainerName} added a new workout for you`;

  sendLocalNotification(title, body, {
    workoutId: workoutId.toString(),
    trainerName,
    type: 'workout_added',
  });
};

// Message from trainer notification
export const sendMessageNotification = (
  senderId: string | number,
  senderName: string,
  messagePreview: string,
  conversationId?: string | number
) => {
  const title = 'New Message';
  const body = `${senderName}: ${messagePreview.substring(0, 50)}${messagePreview.length > 50 ? '...' : ''}`;

  sendLocalNotification(title, body, {
    senderId: senderId.toString(),
    senderName,
    conversationId: conversationId?.toString() || '',
    type: 'new_message',
  });
};

// PT Form session tracker update notification
export const sendSessionTrackerUpdateNotification = (
  sessionId: string | number,
  status: string,
  trainerName: string,
  message?: string
) => {
  const title = 'Session Tracker Updated';
  const body = message || `${trainerName} updated your session tracker to ${status}`;

  sendLocalNotification(title, body, {
    sessionId: sessionId.toString(),
    status,
    trainerName,
    type: 'session_tracker_update',
  });
};

// PT Form completion notification
export const sendPTFormCompletionNotification = (
  formId: string | number,
  status: string,
  trainerName: string,
  message?: string
) => {
  const title = 'PT Form Status Updated';
  const body = message || `Your PT form #${formId} is ${status}`;

  sendLocalNotification(title, body, {
    formId: formId.toString(),
    status,
    trainerName,
    type: 'pt_form_status',
  });
};

// ============================================
// TRAINER NOTIFICATIONS
// ============================================

// User assigned to trainer notification
export const sendUserAssignedNotification = (
  userId: string | number,
  userName: string,
  message?: string
) => {
  const title = 'New User Assigned';
  const body = message || `${userName} has been assigned to you`;

  sendLocalNotification(title, body, {
    userId: userId.toString(),
    userName,
    type: 'user_assigned',
  });
};

// User updated PT form notification
export const sendUserUpdatedPTFormNotification = (
  userId: string | number,
  userName: string,
  formType: string,
  message?: string
) => {
  const title = `User Updated ${formType}`;
  const body = message || `${userName} updated their ${formType} form`;

  sendLocalNotification(title, body, {
    userId: userId.toString(),
    userName,
    formType,
    type: 'user_updated_pt_form',
  });
};

// Session tracker updated by user notification
export const sendSessionTrackerUpdatedByUserNotification = (
  userId: string | number,
  userName: string,
  sessionId: string | number,
  message?: string
) => {
  const title = 'Session Tracker Updated';
  const body = message || `${userName} updated their session tracker`;

  sendLocalNotification(title, body, {
    userId: userId.toString(),
    userName,
    sessionId: sessionId.toString(),
    type: 'user_session_tracker_update',
  });
};

// Session tracker completed notification
export const sendSessionCompletedNotification = (
  userId: string | number,
  userName: string,
  sessionId: string | number,
  message?: string
) => {
  const title = 'Session Completed';
  const body = message || `${userName} completed their session`;

  sendLocalNotification(title, body, {
    userId: userId.toString(),
    userName,
    sessionId: sessionId.toString(),
    type: 'session_completed',
  });
};

// ============================================
// ADMIN NOTIFICATIONS
// ============================================

// New order placed notification (for admin)
export const sendAdminNewOrderNotification = (
  orderId: string | number,
  userName: string,
  totalAmount?: string,
  message?: string
) => {
  const title = 'New Order Placed';
  const body = message || `Order #${orderId} from ${userName}${totalAmount ? ` - ₹${totalAmount}` : ''}`;

  sendLocalNotification(title, body, {
    orderId: orderId.toString(),
    userName,
    totalAmount: totalAmount || '',
    type: 'admin_new_order',
  });
};

// User updated by trainer notification (for admin)
export const sendAdminUserUpdatedNotification = (
  userId: string | number,
  userName: string,
  trainerName: string,
  updateType: string,
  message?: string
) => {
  const title = `User ${updateType} Updated`;
  const body = message || `${trainerName} updated ${userName}'s ${updateType}`;

  sendLocalNotification(title, body, {
    userId: userId.toString(),
    userName,
    trainerName,
    updateType,
    type: 'admin_user_updated',
  });
};

// Trainer assignment notification (for admin)
export const sendAdminTrainerAssignmentNotification = (
  userId: string | number,
  userName: string,
  trainerName: string,
  message?: string
) => {
  const title = 'User Assigned to Trainer';
  const body = message || `${userName} assigned to trainer ${trainerName}`;

  sendLocalNotification(title, body, {
    userId: userId.toString(),
    userName,
    trainerName,
    type: 'admin_trainer_assignment',
  });
};

// New user registration notification (for admin)
export const sendAdminNewUserNotification = (
  userId: string | number,
  userName: string,
  userRole: string,
  message?: string
) => {
  const title = 'New User Registered';
  const body = message || `${userName} registered as ${userRole}`;

  sendLocalNotification(title, body, {
    userId: userId.toString(),
    userName,
    userRole,
    type: 'admin_new_user',
  });
};
