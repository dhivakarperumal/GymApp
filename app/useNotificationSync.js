import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { useAuth } from "../context/AuthContext";
import {
    getAllOrders,
    getDietPlans,
    getMessageHistory,
    getTrainerWorkouts,
} from "../services/api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const STORAGE_KEY = "notification_sync_snapshot_v1";
const POLL_INTERVAL_MS = 60 * 1000;

const normalizeString = (value) => String(value || "").toLowerCase().trim();

const registerForPushNotificationsAsync = async () => {
  if (Platform.OS === "web") return null;
  if (!Device.isDevice) {
    console.log("Push notifications require a physical device");
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Push notification permission not granted");
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync();
    return tokenData.data;
  } catch (err) {
    console.log("Unable to get push token", err);
    return null;
  }
};

const loadSnapshot = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.log("notification sync snapshot load error", err);
    return null;
  }
};

const saveSnapshot = async (snapshot) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (err) {
    console.log("notification sync snapshot save error", err);
  }
};

const presentLocalNotification = async (title, body) => {
  try {
    await Notifications.presentNotificationAsync({
      content: {
        title,
        body,
      },
    });
  } catch (err) {
    console.log("present notification error", err);
  }
};

const getMessageArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.results)) return payload.results;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
};

const getOrderArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
};

const getPlanArray = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
};

const filterByUserId = (items, userId) =>
  (items || []).filter(
    (item) =>
      Number(item.user_id || item.userId || item.user_id || 0) === Number(userId) ||
      Number(item.member_id || item.memberId || 0) === Number(userId)
  );

const normalizeStatus = (status) => normalizeString(status || "");

export default function useNotificationSync() {
  const { user } = useAuth();
  const snapshotRef = useRef(null);
  const pollingRef = useRef(null);
  const isStartedRef = useRef(false);

  useEffect(() => {
    if (Platform.OS === "web") return;

    let mounted = true;

    const initSync = async () => {
      if (!user || !user.id || isStartedRef.current) return;
      isStartedRef.current = true;

      await registerForPushNotificationsAsync();
      const savedSnapshot = await loadSnapshot();
      snapshotRef.current = savedSnapshot && savedSnapshot.userId === Number(user.id) ? savedSnapshot : null;

      const fetchAndNotify = async () => {
        if (!mounted || !user || !user.id) return;

        try {
          const [ordersPayload, messagesPayload, dietPayload, workoutPayload] =
            await Promise.all([
              getAllOrders(),
              getMessageHistory(),
              getDietPlans(),
              getTrainerWorkouts(),
            ]);

          const orders = filterByUserId(getOrderArray(ordersPayload), user.id);
          const messages = getMessageArray(messagesPayload).filter(
            (msg) =>
              Number(msg.userId || msg.user_id || 0) === Number(user.id) ||
              Number(msg.memberId || msg.member_id || 0) === Number(user.id)
          );
          const diets = filterByUserId(getPlanArray(dietPayload), user.id);
          const workouts = filterByUserId(getPlanArray(workoutPayload), user.id);

          const previous = snapshotRef.current || {};
          const notifications = [];

          if (previous.orders) {
            const previousStatusMap = previous.orders;
            orders.forEach((order) => {
              const orderId = String(order.id || order.order_id || "");
              const currentStatus = normalizeStatus(order.status);
              const previousStatus = normalizeStatus(previousStatusMap[orderId] || "");

              if (previousStatus && previousStatus !== currentStatus) {
                notifications.push({
                  title: `Order ${order.order_id || orderId} status updated`,
                  body: `Status changed to ${order.status || currentStatus}`,
                });
              }
            });
          }

          if (previous.messageCount != null) {
            if (messages.length > previous.messageCount) {
              const diff = messages.length - previous.messageCount;
              notifications.push({
                title: "New message received",
                body: diff === 1 ? "You have 1 new message." : `You have ${diff} new messages.`,
              });
            }
          }

          const getLatestUpdatedAt = (items) =>
            items
              .map((item) => item.updated_at || item.updatedAt || "")
              .filter(Boolean)
              .sort()
              .pop();

          const workoutsUpdated = getLatestUpdatedAt(workouts);
          const dietsUpdated = getLatestUpdatedAt(diets);

          if (previous.workoutsUpdatedAt && workoutsUpdated && workoutsUpdated !== previous.workoutsUpdatedAt) {
            notifications.push({
              title: "Workout plan updated",
              body: "Your workout plan has been updated.",
            });
          }

          if (previous.dietsUpdatedAt && dietsUpdated && dietsUpdated !== previous.dietsUpdatedAt) {
            notifications.push({
              title: "Diet plan updated",
              body: "Your diet plan has been updated.",
            });
          }

          for (const note of notifications) {
            await presentLocalNotification(note.title, note.body);
          }

          const nextSnapshot = {
            userId: Number(user.id),
            orders: orders.reduce((map, order) => {
              const orderId = String(order.id || order.order_id || "");
              map[orderId] = normalizeStatus(order.status);
              return map;
            }, {}),
            messageCount: messages.length,
            workoutsUpdatedAt: workoutsUpdated,
            dietsUpdatedAt: dietsUpdated,
          };

          snapshotRef.current = nextSnapshot;
          await saveSnapshot(nextSnapshot);
        } catch (err) {
          console.log("notification sync error", err);
        }
      };

      await fetchAndNotify();
      pollingRef.current = setInterval(fetchAndNotify, POLL_INTERVAL_MS);
    };

    initSync();

    return () => {
      mounted = false;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [user]);
}
