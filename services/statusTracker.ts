import AsyncStorage from '@react-native-async-storage/async-storage';
import * as notificationService from './notificationService';

const STATUS_CACHE_KEY = '@status_cache';

export interface CachedStatus {
  itemId: string | number;
  type: 'order' | 'diet_plan' | 'workout' | 'session_tracker' | 'pt_form';
  status: string;
}

export const getCachedStatuses = async (): Promise<CachedStatus[]> => {
  try {
    const cached = await AsyncStorage.getItem(STATUS_CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch (error) {
    console.error('Error reading cached statuses:', error);
    return [];
  }
};

export const saveCachedStatuses = async (statuses: CachedStatus[]) => {
  try {
    await AsyncStorage.setItem(STATUS_CACHE_KEY, JSON.stringify(statuses));
  } catch (error) {
    console.error('Error saving cached statuses:', error);
  }
};

export const checkStatusChanges = async (newStatuses: CachedStatus[]) => {
  try {
    const cachedStatuses = await getCachedStatuses();
    const cachedMap = new Map(cachedStatuses.map((s) => [`${s.type}-${s.itemId}`, s]));
    const updatedStatuses: CachedStatus[] = [];

    for (const newStatus of newStatuses) {
      const key = `${newStatus.type}-${newStatus.itemId}`;
      const cached = cachedMap.get(key);

      if (!cached || cached.status !== newStatus.status) {
        console.log(`Status change detected: ${key} => ${newStatus.status}`);

        switch (newStatus.type) {
          case 'order':
            notificationService.sendOrderNotification(newStatus.itemId, newStatus.status);
            break;
          case 'diet_plan':
            notificationService.sendDietPlanNotification(newStatus.itemId, newStatus.status);
            break;
          case 'workout':
            notificationService.sendWorkoutNotification(newStatus.itemId, newStatus.status);
            break;
          case 'session_tracker':
            notificationService.sendSessionTrackerNotification(newStatus.itemId, newStatus.status);
            break;
          case 'pt_form':
            notificationService.sendPTFormNotification(newStatus.itemId, newStatus.status);
            break;
        }
      }

      updatedStatuses.push(newStatus);
    }

    await saveCachedStatuses(updatedStatuses);
    return updatedStatuses;
  } catch (error) {
    console.error('Error checking status changes:', error);
    return newStatuses;
  }
};

export const createCachedStatus = (
  item: any,
  type: 'order' | 'diet_plan' | 'workout' | 'session_tracker' | 'pt_form'
): CachedStatus => {
  const id =
    item.order_id ||
    item.orderId ||
    item.id ||
    item.dietPlanId ||
    item.workoutId ||
    item.sessionId ||
    item.formId ||
    item.bookingId ||
    item.appointmentId ||
    item.vehicleBookingId ||
    item._id ||
    'unknown';

  const status =
    item.status ||
    item.orderStatus ||
    item.paymentStatus ||
    item.sessionStatus ||
    item.formStatus ||
    item.dietStatus ||
    item.workoutStatus ||
    'Unknown';

  return {
    itemId: id,
    type,
    status: status?.toString?.() || 'Unknown',
  };
};

// Check for user PT form updates
export const checkUserPTFormUpdates = async (
  currentUpdates: any[]
) => {
  const cache = await loadStatusCache();
  let hasUpdates = false;

  currentUpdates.forEach(update => {
    const id = `${update.userId}-${update.formType}`;
    const oldUpdate = cache.userUpdates[id];

    if (!oldUpdate || oldUpdate.updatedAt !== update.updatedAt) {
      // Form updated
      sendUserUpdatedPTFormNotification(
        update.userId,
        update.userName || 'User',
        update.formType,
        update.message
      );
      hasUpdates = true;
    }

    cache.userUpdates[id] = {
      formType: update.formType,
      updatedAt: update.updatedAt,
      userName: update.userName,
    };
  });

  if (hasUpdates) {
    await saveStatusCache(cache);
  }

  return hasUpdates;
};

// Check for user session tracker completion
export const checkUserSessionCompletion = async (
  currentSessions: any[]
) => {
  const cache = await loadStatusCache();
  let hasCompletions = false;

  currentSessions.forEach(session => {
    const id = session.id.toString();
    const oldSession = cache.sessionTrackers[id];

    if (oldSession && oldSession.status !== 'completed' && session.status === 'completed') {
      // Session completed
      sendSessionCompletedNotification(
        session.userId,
        session.userName || 'User',
        id,
        session.message
      );
      hasCompletions = true;
    }

    cache.sessionTrackers[id] = {
      status: session.status,
      userId: session.userId,
      lastUpdated: new Date().toISOString(),
    };
  });

  if (hasCompletions) {
    await saveStatusCache(cache);
  }

  return hasCompletions;
};

// ============================================
// ADMIN NOTIFICATIONS
// ============================================

// Check for new orders
export const checkNewAdminOrders = async (
  currentOrders: any[]
) => {
  const cache = await loadStatusCache();
  let hasNewOrders = false;

  currentOrders.forEach(order => {
    const id = order.id.toString();
    const oldOrder = cache.orders[id];

    if (!oldOrder) {
      // New order
      sendAdminNewOrderNotification(
        id,
        order.userName || 'User',
        order.totalAmount?.toString(),
        order.message
      );
      hasNewOrders = true;
    }

    cache.orders[id] = {
      status: order.status,
      createdAt: new Date().toISOString(),
      userName: order.userName,
    };
  });

  if (hasNewOrders) {
    await saveStatusCache(cache);
  }

  return hasNewOrders;
};

// Check for admin user updates
export const checkAdminUserUpdates = async (
  currentUpdates: any[]
) => {
  const cache = await loadStatusCache();
  let hasUpdates = false;

  currentUpdates.forEach(update => {
    const id = update.userId.toString();
    const oldUpdate = cache.userUpdates[id];

    if (!oldUpdate || oldUpdate.lastUpdate !== update.timestamp) {
      // User updated
      sendAdminUserUpdatedNotification(
        id,
        update.userName || 'User',
        update.trainerName || 'Trainer',
        update.updateType || 'Profile',
        update.message
      );
      hasUpdates = true;
    }

    cache.userUpdates[id] = {
      lastUpdate: update.timestamp,
      userName: update.userName,
      trainerName: update.trainerName,
    };
  });

  if (hasUpdates) {
    await saveStatusCache(cache);
  }

  return hasUpdates;
};

// Clear cache (useful for testing)
export const clearStatusCache = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('Status cache cleared');
  } catch (error) {
    console.warn('Error clearing cache:', error);
  }
};

// Get cache summary
export const getCacheSummary = async () => {
  const cache = await loadStatusCache();
  return {
    ordersCount: Object.keys(cache.orders).length,
    dietPlansCount: Object.keys(cache.dietPlans).length,
    workoutsCount: Object.keys(cache.workouts).length,
    sessionTrackersCount: Object.keys(cache.sessionTrackers).length,
    ptFormsCount: Object.keys(cache.ptForms).length,
    trainerAssignmentsCount: Object.keys(cache.trainerAssignments).length,
    userUpdatesCount: Object.keys(cache.userUpdates).length,
  };
};
