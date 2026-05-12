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

export type DietPlanNotificationDetails = {
  trainerName?: string;
  title?: string;
  duration?: string | number;
  calories?: string | number;
};

export type WorkoutNotificationDetails = {
  trainerName?: string;
  durationWeeks?: string | number;
  workoutDays?: string | number;
  level?: string;
};

export type PTFormNotificationDetails = {
  trainerName?: string;
  formType?: string;
};

export const sendDietPlanNotification = (
  dietPlanId: string | number,
  status: string,
  details?: DietPlanNotificationDetails,
  isNew = false,
  message?: string
) => {
  const title = 'Diet Plan Update';
  const action = isNew ? 'assigned' : 'updated';
  let body = message || '';

  if (!body) {
    if (details?.trainerName && details?.title && details?.duration) {
      body = `Your trainer ${details.trainerName} ${action} a diet plan "${details.title}" for ${details.duration} days.`;
      if (details.calories) {
        body += ` ${details.calories} calories per day.`;
      }
    } else if (details?.trainerName && details?.title) {
      body = `Your trainer ${details.trainerName} ${action} your diet plan "${details.title}".`;
    } else {
      body = `Your diet plan #${dietPlanId} is now ${status}`;
    }
  }

  sendLocalNotification(title, body, {
    dietPlanId: dietPlanId.toString(),
    status,
    type: 'diet_plan',
  });
};

export const sendWorkoutNotification = (
  workoutId: string | number,
  status: string,
  details?: WorkoutNotificationDetails,
  isNew = false,
  message?: string
) => {
  const title = 'Workout Update';
  const action = isNew ? 'assigned' : 'updated';
  let body = message || '';

  if (!body) {
    if (details?.trainerName) {
      const parts: string[] = [];
      if (details.workoutDays) {
        parts.push(`for ${details.workoutDays} day${details.workoutDays === 1 ? '' : 's'}`);
      } else if (details.durationWeeks) {
        parts.push(`for ${details.durationWeeks} week${details.durationWeeks === 1 ? '' : 's'}`);
      }
      if (details.level) {
        parts.push(`at ${details.level} level`);
      }

      const durationText = parts.length ? ` ${parts.join(' ')}.` : '.';
      body = `Your trainer ${details.trainerName} ${action} a workout${durationText}`;
    } else {
      body = `Your workout #${workoutId} is now ${status}`;
    }
  }

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
  details?: PTFormNotificationDetails,
  isNew = false,
  message?: string
) => {
  const title = 'PT Form Update';
  let body = message || '';

  if (!body) {
    if (details?.trainerName && details?.formType) {
      const verb = isNew ? 'created' : 'updated';
      body = `Your trainer ${details.trainerName} ${verb} your ${details.formType} form.`;
    } else if (details?.trainerName) {
      body = `Your trainer ${details.trainerName} ${isNew ? 'created' : 'updated'} your PT form.`;
    } else {
      body = `Your PT form #${formId} is now ${status}`;
    }
  }

  sendLocalNotification(title, body, {
    formId: formId.toString(),
    status,
    type: 'pt_form',
  });
};

export const sendDirectPTFormNotification = (
  memberName?: string,
  trainerName?: string
) => {
  const title = 'PT Form Saved';
  const body = trainerName && memberName
    ? `Your trainer ${trainerName} saved a PT form for ${memberName}.`
    : trainerName
    ? `Your trainer ${trainerName} saved a PT form.`
    : 'PT Form has been saved successfully.';

  sendLocalNotification(title, body, {
    type: 'pt_form_saved',
  });
};

export const sendMessageNotification = (
  recipientCount: number,
  senderName?: string,
  subject?: string
) => {
  const title = 'Message Sent';
  let body = '';

  if (senderName) {
    body = `Your message from ${senderName} was sent to ${recipientCount} recipient${recipientCount !== 1 ? 's' : ''}.`;
    if (subject) {
      body += ` Subject: ${subject}`;
    }
  } else {
    body = `Your message was successfully sent to ${recipientCount} recipient${recipientCount !== 1 ? 's' : ''}.`;
  }

  sendLocalNotification(title, body, {
    type: 'message_sent',
    recipientCount: recipientCount.toString(),
  });
};

export const sendAssignmentNotification = (
  memberName?: string,
  trainerName?: string,
  planName?: string
) => {
  const title = 'New Assignment';
  let body = '';

  if (trainerName && memberName && planName) {
    body = `Your trainer ${trainerName} assigned you to the "${planName}" plan.`;
  } else if (trainerName && memberName) {
    body = `You have been assigned to trainer ${trainerName}.`;
  } else if (memberName && planName) {
    body = `${memberName} has been assigned the "${planName}" plan.`;
  } else {
    body = 'You have been assigned a new training plan.';
  }

  sendLocalNotification(title, body, {
    type: 'assignment_new',
  });
};

export const sendAssignmentUpdateNotification = (
  memberName?: string,
  trainerName?: string,
  changeType?: string
) => {
  const title = 'Assignment Updated';
  let body = '';

  if (changeType === 'trainer_change') {
    body = trainerName && memberName
      ? `${memberName} has been reassigned to trainer ${trainerName}.`
      : 'Your trainer assignment has been updated.';
  } else if (changeType === 'plan_change') {
    body = memberName
      ? `${memberName}'s training plan has been updated.`
      : 'Your training plan has been updated.';
  } else if (changeType === 'status_change') {
    body = memberName
      ? `${memberName}'s assignment status has changed.`
      : 'Your assignment status has been updated.';
  } else {
    body = 'Your assignment has been updated.';
  }

  sendLocalNotification(title, body, {
    type: 'assignment_updated',
  });
};

