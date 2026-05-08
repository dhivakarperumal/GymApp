import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const BASE_URL = "https://dap.qtechx.com/api";

// Check if running in Expo Go
const isExpoGo = (): boolean => {
  return Constants.appOwnership === 'expo';
};

// Configure notification handling
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

// Get push token
export const registerForPushNotificationsAsync = async (): Promise<string | undefined> => {
  let token;

  // Skip push notifications in Expo Go on Android
  if (isExpoGo() && Platform.OS === 'android') {
    console.log('Expo Go detected on Android - Push notifications not supported. Using local notifications only.');
    return undefined;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    });
  }

  if (!Device.isDevice) {
    console.log('Must use a physical device for push notifications');
    return undefined;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return undefined;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ||
                   Constants.easConfig?.projectId ||
                   Constants.expoConfig?.extra?.projectId;

  if (!projectId) {
    console.warn('No Expo projectId found. Local notifications still work, but Expo push token registration is disabled.');
    return undefined;
  }

  token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  console.log('Push token:', token);
  return token;
};

// Send push token to server
export const sendPushTokenToServer = async (userId: number, pushToken: string) => {
  try {
    const res = await fetch(`${BASE_URL}/users/push-tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        pushToken,
        platform: Platform.OS,
        app: 'dap-fitness-studio',
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    console.log('Push token sent to server');
  } catch (error) {
    console.warn('Failed to send push token to server:', error);
  }
};

// Register device for push notifications
export const registerDeviceForPushNotifications = async (userId: number) => {
  const token = await registerForPushNotificationsAsync();
  if (!token) {
    console.log('No push token available (possibly Expo Go) - local notifications will still work');
    return undefined;
  }

  await sendPushTokenToServer(userId, token);
  return token;
};

// Send local notification
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
    trigger: null, // Immediate notification
  });
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
