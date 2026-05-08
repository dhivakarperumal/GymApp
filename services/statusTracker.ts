import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    sendAdminNewOrderNotification,
    sendAdminUserUpdatedNotification,
    sendDietPlanAddedNotification,
    sendOrderStatusNotification,
    sendSessionCompletedNotification,
    sendSessionTrackerUpdateNotification,
    sendUserAssignedNotification,
    sendUserUpdatedPTFormNotification,
    sendWorkoutAddedNotification
} from './notificationService';

const STORAGE_KEY = '@status_cache';

// Cache structure
export interface StatusCache {
  orders: Record<string, any>;
  dietPlans: Record<string, any>;
  workouts: Record<string, any>;
  sessionTrackers: Record<string, any>;
  ptForms: Record<string, any>;
  trainerAssignments: Record<string, any>;
  userUpdates: Record<string, any>;
}

// Load cached statuses
export const loadStatusCache = async (): Promise<StatusCache> => {
  try {
    const cached = await AsyncStorage.getItem(STORAGE_KEY);
    return cached ? JSON.parse(cached) : {
      orders: {},
      dietPlans: {},
      workouts: {},
      sessionTrackers: {},
      ptForms: {},
      trainerAssignments: {},
      userUpdates: {},
    };
  } catch (error) {
    console.warn('Error loading status cache:', error);
    return {
      orders: {},
      dietPlans: {},
      workouts: {},
      sessionTrackers: {},
      ptForms: {},
      trainerAssignments: {},
      userUpdates: {},
    };
  }
};

// Save status cache
export const saveStatusCache = async (cache: StatusCache) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('Error saving status cache:', error);
  }
};

// ============================================
// MEMBER/USER NOTIFICATIONS
// ============================================

// Check for order status changes
export const checkOrderStatusChanges = async (
  currentOrders: any[]
) => {
  const cache = await loadStatusCache();
  let hasChanges = false;

  currentOrders.forEach(order => {
    const id = order.id.toString();
    const oldOrder = cache.orders[id];

    if (oldOrder && oldOrder.status !== order.status) {
      // Status changed
      sendOrderStatusNotification(id, order.status);
      hasChanges = true;
    }

    cache.orders[id] = {
      status: order.status,
      lastUpdated: new Date().toISOString(),
    };
  });

  if (hasChanges) {
    await saveStatusCache(cache);
  }

  return hasChanges;
};

// Check for new diet plans
export const checkNewDietPlans = async (
  currentDietPlans: any[]
) => {
  const cache = await loadStatusCache();
  let hasNewPlans = false;

  currentDietPlans.forEach(dietPlan => {
    const id = dietPlan.id.toString();
    const oldPlan = cache.dietPlans[id];

    if (!oldPlan) {
      // New diet plan added
      sendDietPlanAddedNotification(
        id,
        dietPlan.trainerName || 'Your Trainer',
        dietPlan.message
      );
      hasNewPlans = true;
    }

    cache.dietPlans[id] = {
      createdAt: new Date().toISOString(),
      trainerName: dietPlan.trainerName,
    };
  });

  if (hasNewPlans) {
    await saveStatusCache(cache);
  }

  return hasNewPlans;
};

// Check for new workouts
export const checkNewWorkouts = async (
  currentWorkouts: any[]
) => {
  const cache = await loadStatusCache();
  let hasNewWorkouts = false;

  currentWorkouts.forEach(workout => {
    const id = workout.id.toString();
    const oldWorkout = cache.workouts[id];

    if (!oldWorkout) {
      // New workout added
      sendWorkoutAddedNotification(
        id,
        workout.trainerName || 'Your Trainer',
        workout.message
      );
      hasNewWorkouts = true;
    }

    cache.workouts[id] = {
      createdAt: new Date().toISOString(),
      trainerName: workout.trainerName,
    };
  });

  if (hasNewWorkouts) {
    await saveStatusCache(cache);
  }

  return hasNewWorkouts;
};

// Check for session tracker updates
export const checkSessionTrackerUpdates = async (
  currentSessions: any[]
) => {
  const cache = await loadStatusCache();
  let hasUpdates = false;

  currentSessions.forEach(session => {
    const id = session.id.toString();
    const oldSession = cache.sessionTrackers[id];

    if (oldSession && oldSession.status !== session.status) {
      // Status changed
      sendSessionTrackerUpdateNotification(
        id,
        session.status,
        session.trainerName || 'Your Trainer',
        session.message
      );
      hasUpdates = true;
    }

    cache.sessionTrackers[id] = {
      status: session.status,
      lastUpdated: new Date().toISOString(),
    };
  });

  if (hasUpdates) {
    await saveStatusCache(cache);
  }

  return hasUpdates;
};

// Check for PT form status updates
export const checkPTFormStatusUpdates = async (
  currentForms: any[]
) => {
  const cache = await loadStatusCache();
  let hasUpdates = false;

  currentForms.forEach(form => {
    const id = form.id.toString();
    const oldForm = cache.ptForms[id];

    if (oldForm && oldForm.status !== form.status) {
      // Status changed
      sendSessionTrackerUpdateNotification(
        id,
        form.status,
        form.trainerName || 'Your Trainer'
      );
      hasUpdates = true;
    }

    cache.ptForms[id] = {
      status: form.status,
      lastUpdated: new Date().toISOString(),
    };
  });

  if (hasUpdates) {
    await saveStatusCache(cache);
  }

  return hasUpdates;
};

// ============================================
// TRAINER NOTIFICATIONS
// ============================================

// Check for new user assignments
export const checkNewUserAssignments = async (
  currentAssignments: any[]
) => {
  const cache = await loadStatusCache();
  let hasNewAssignments = false;

  currentAssignments.forEach(assignment => {
    const id = assignment.userId.toString();
    const oldAssignment = cache.trainerAssignments[id];

    if (!oldAssignment) {
      // New user assigned
      sendUserAssignedNotification(
        id,
        assignment.userName || 'New User',
        assignment.message
      );
      hasNewAssignments = true;
    }

    cache.trainerAssignments[id] = {
      assignedAt: new Date().toISOString(),
      userName: assignment.userName,
    };
  });

  if (hasNewAssignments) {
    await saveStatusCache(cache);
  }

  return hasNewAssignments;
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
