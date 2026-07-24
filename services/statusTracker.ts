import AsyncStorage from '@react-native-async-storage/async-storage';
import * as notificationService from './notificationService';

const STATUS_CACHE_KEY = '@status_cache';
const STATUS_TRACKER_CACHE_KEY = '@status_tracker_cache';

export interface CachedStatus {
  itemId: string | number;
  type: 'order' | 'diet_plan' | 'workout' | 'session_tracker' | 'pt_form' | 'message';
  status: string;
  updatedAt?: string;
  details?: Record<string, any>;
}

export interface StatusCache {
  orders: Record<string, any>;
  dietPlans: Record<string, any>;
  workouts: Record<string, any>;
  sessionTrackers: Record<string, any>;
  ptForms: Record<string, any>;
  trainerAssignments: Record<string, any>;
  userUpdates: Record<string, any>;
}

const DEFAULT_STATUS_CACHE: StatusCache = {
  orders: {},
  dietPlans: {},
  workouts: {},
  sessionTrackers: {},
  ptForms: {},
  trainerAssignments: {},
  userUpdates: {},
};

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

export const loadStatusCache = async (): Promise<StatusCache> => {
  try {
    const cached = await AsyncStorage.getItem(STATUS_TRACKER_CACHE_KEY);
    return cached ? JSON.parse(cached) : DEFAULT_STATUS_CACHE;
  } catch (error) {
    console.error('Error loading status cache:', error);
    return DEFAULT_STATUS_CACHE;
  }
};

export const saveStatusCache = async (cache: StatusCache) => {
  try {
    await AsyncStorage.setItem(STATUS_TRACKER_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error saving status cache:', error);
  }
};

const sendUserUpdatedPTFormNotification = (
  userId: string | number,
  userName: string,
  formType: string,
  message?: string
) => {
  console.log('DEBUG sendUserUpdatedPTFormNotification', { userId, userName, formType, message });
  // PT Form Update notification disabled as per request
  /*
  notificationService.sendLocalNotification(
    'PT Form Update',
    message || `${userName}'s ${formType} form was updated.`,
    {
      userId: userId.toString(),
      type: 'user_pt_form_update',
      formType,
    }
  );
  */
};

const sendSessionCompletedNotification = (
  sessionId: string | number,
  userName: string,
  id: string,
  message?: string
) => {
  notificationService.sendLocalNotification(
    'Session Completed',
    message || `${userName}'s session is now completed.`,
    {
      sessionId: sessionId.toString(),
      type: 'session_completed',
      id,
    }
  );
};

const sendAdminNewOrderNotification = (
  orderId: string | number,
  userName: string,
  totalAmount?: string,
  message?: string
) => {
  notificationService.sendLocalNotification(
    'New Order Received',
    message || `New order #${orderId} placed by ${userName}${totalAmount ? ` for ₹${totalAmount}` : ''}.`,
    {
      orderId: orderId.toString(),
      type: 'admin_new_order',
      userName,
      totalAmount,
    }
  );
};

const normalizeArray = (value: any): any[] =>
  Array.isArray(value) ? value.filter((item) => item && typeof item === 'object') : [];

const sendAdminUserUpdatedNotification = (
  userId: string | number,
  userName: string,
  trainerName: string,
  updateType: string,
  message?: string
) => {
  notificationService.sendLocalNotification(
    'User Updated',
    message || `${userName} was updated by ${trainerName} (${updateType}).`,
    {
      userId: userId.toString(),
      type: 'admin_user_update',
      trainerName,
      updateType,
    }
  );
};

export const checkStatusChanges = async (newStatuses: CachedStatus[]) => {
  try {
    const ptForms = newStatuses.filter(s => s.type === 'pt_form');
    const messages = newStatuses.filter(s => s.type === 'message');
    
    if (ptForms.length > 0) {
      console.log(`📋 PT FORMS DETECTED (${ptForms.length}):`, ptForms.map(p => ({ id: p.itemId, status: p.status })));
    }
    if (messages.length > 0) {
      console.log(`💬 MESSAGES DETECTED (${messages.length}):`, messages.map(m => ({ id: m.itemId, status: m.status })));
    }

    const cachedStatuses = await getCachedStatuses();
    const cachedMap = new Map(cachedStatuses.map((s) => [`${s.type}-${s.itemId}`, s]));
    const updatedStatuses: CachedStatus[] = [];
    
    // Prevent blast of notifications on first login/sync
    const isFirstRun = cachedStatuses.length === 0;

    for (const newStatus of newStatuses) {
      const key = `${newStatus.type}-${newStatus.itemId}`;
      const cached = cachedMap.get(key);
      const isUpdated =
        !cached ||
        cached.status !== newStatus.status ||
        cached.updatedAt !== newStatus.updatedAt;

      if (isUpdated) {
        const isNew = !cached;
        console.log(`Status change detected: ${key} => ${newStatus.status}`);

        if (!isFirstRun) {
          switch (newStatus.type) {
            case 'order':
              notificationService.sendOrderNotification(newStatus.itemId, newStatus.status);
              break;
            case 'diet_plan':
              notificationService.sendDietPlanNotification(
                newStatus.itemId,
                newStatus.status,
                newStatus.details,
                isNew
              );
              break;
            case 'workout':
              notificationService.sendWorkoutNotification(
                newStatus.itemId,
                newStatus.status,
                newStatus.details,
                isNew
              );
              break;
            case 'session_tracker':
              notificationService.sendSessionTrackerNotification(newStatus.itemId, newStatus.status);
              break;
            case 'pt_form':
              console.log('🏋️ PT FORM NOTIFICATION:', { itemId: newStatus.itemId, status: newStatus.status, details: newStatus.details, isNew });
              // PT Form Update notification disabled as per request
              /*
              notificationService.sendPTFormNotification(
                newStatus.itemId,
                newStatus.status,
                newStatus.details,
                isNew
              );
              */
              break;
            case 'message':
              notificationService.sendMessageNotification(
                newStatus.itemId,
                newStatus.status,
                newStatus.details,
                isNew
              );
              break;
          }
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
  type: 'order' | 'diet_plan' | 'workout' | 'session_tracker' | 'pt_form' | 'message'
): CachedStatus => {
  item = item && typeof item === 'object' ? item : {};
  if (type === 'pt_form') {
    console.log('DEBUG createCachedStatus(pt_form)', {
      rawItem: item,
      idCandidates: {
        order_id: item.order_id,
        orderId: item.orderId,
        id: item.id,
        form_id: item.form_id,
        formId: item.formId,
      },
      statusCandidates: {
        status: item.status,
        formStatus: item.formStatus,
        form_status: item.form_status,
        ptFormStatus: item.ptFormStatus,
        pt_form_status: item.pt_form_status,
      },
    });
  }

  const rawFormData = item.form_data;
  let parsedFormData: any = rawFormData;
  if (typeof rawFormData === 'string') {
    try {
      parsedFormData = JSON.parse(rawFormData);
    } catch {
      parsedFormData = rawFormData;
    }
  }

  const nestedStatus =
    parsedFormData?.status ||
    parsedFormData?.formStatus ||
    parsedFormData?.form_status ||
    parsedFormData?.pt_form_status ||
    (parsedFormData?.completed ? 'Completed' : undefined);

  const id =
    item.order_id ||
    item.orderId ||
    item.id ||
    item.form_id ||
    item.formId ||
    item.member_id ||
    item.memberId ||
    item.u_id ||
    item.user_id ||
    parsedFormData?.member_id ||
    parsedFormData?.memberId ||
    parsedFormData?.u_id ||
    parsedFormData?.user_id ||
    item.dietPlanId ||
    item.workoutId ||
    item.sessionId ||
    item.bookingId ||
    item.appointmentId ||
    item.vehicleBookingId ||
    item._id ||
    'unknown';

  const status =
    item.status ||
    nestedStatus ||
    item.orderStatus ||
    item.paymentStatus ||
    item.sessionStatus ||
    item.formStatus ||
    item.form_status ||
    item.pt_form_status ||
    item.ptFormStatus ||
    item.dietStatus ||
    item.workoutStatus ||
    'Unknown';

  const updatedAt =
    item.updatedAt ||
    item.updated_at ||
    item.lastUpdated ||
    item.last_updated ||
    item.modifiedAt ||
    item.modified_at ||
    item.updated?.toString?.();

  const trainerName =
    item.trainer_name || item.trainerName || item.trainer || item.assignedBy || 'Trainer';

  const title =
    item.title || item.name || item.planName || item.dietTitle || item.dietName || undefined;

  const duration =
    item.duration ||
    item.duration_days ||
    item.durationDays ||
    item.planDuration ||
    item.numberOfDays ||
    item.days ||
    undefined;

  const calories =
    item.calories || item.dailyCalories || item.caloriesPerDay || item.kcal || undefined;

  const workoutDays = item.days != null
    ? typeof item.days === 'object'
      ? Object.keys(item.days).length
      : item.days
    : item.dayCount || item.daysCount || undefined;

  const workoutDurationWeeks = item.duration_weeks || item.weeks || item.duration || undefined;

  const formType = item.form_type || item.formType || item.type || undefined;

  // Extract message-specific fields
const subject = item.subject || item.messageSubject || item.subjectLine || undefined;
  const messageContent = item.message || item.messageContent || item.body || undefined;
  const senderName = item.senderName || item.from || item.senderUserName || trainerName;

  const details: Record<string, any> = {
    trainerName,
    title,
    duration,
    calories,
    workoutDays,
    workoutDurationWeeks,
    level: item.level || item.fitnessLevel || item.difficulty,
    formType,
    updatedBy: item.updatedBy || item.updated_by,
    subject,
    message: messageContent,
    senderName,
  };

  return {
    itemId: id,
    type,
    status: status?.toString?.() || 'Unknown',
    updatedAt,
    details,
  };
};

// Check for trainer assignment changes
export const checkTrainerAssignmentChanges = async (
  currentAssignments: any[]
) => {
  const assignments = normalizeArray(currentAssignments);
  console.log(`👥 TRAINER ASSIGNMENTS DETECTED (${assignments.length}):`, assignments.map(a => ({ id: a.id, member: a.username, plan: a.planName })));
  
  if (assignments.length === 0) {
    console.log('⚠️ No assignments found in polling result');
    return false;
  }

  const cache = await loadStatusCache();
  console.log(`📦 LOADED CACHE with ${Object.keys(cache.trainerAssignments).length} cached assignments`);
  
  let hasChanges = false;

  for (const assignment of assignments) {
    if (!assignment || typeof assignment !== 'object') {
      console.warn('Skipping invalid trainer assignment item:', assignment);
      continue;
    }

    try {
      const id = assignment.id != null ? String(assignment.id) : `${assignment.userId ?? 'unknown'}-${assignment.planId ?? 'unknown'}`;
      const oldAssignment = cache.trainerAssignments[id];
      const memberName = assignment.username || assignment.memberName || 'Member';
      const trainerName = assignment.trainerName || 'Trainer';
      const planName = assignment.planName || 'Plan';

      console.log(`🔍 Checking assignment ${id}:`, { memberName, oldAssignment: !!oldAssignment });

      if (!oldAssignment) {
        console.log(`🆕 NEW ASSIGNMENT DETECTED: ${memberName} assigned to trainer for plan "${planName}"`);
        notificationService.sendAssignmentNotification(memberName, trainerName, planName);
        hasChanges = true;
      } else {
        let changeType: string | null = null;

        if (oldAssignment.trainerId !== assignment.trainerId) {
          changeType = 'trainer_change';
        } else if (oldAssignment.planId !== assignment.planId || oldAssignment.planName !== assignment.planName) {
          changeType = 'plan_change';
        } else if (oldAssignment.status !== assignment.status) {
          changeType = 'status_change';
        }

        if (changeType) {
          console.log(`🔄 ASSIGNMENT UPDATED: ${memberName} - ${changeType}`);
          notificationService.sendAssignmentUpdateNotification(memberName, trainerName, changeType);
          hasChanges = true;
        }
      }

      cache.trainerAssignments[id] = {
        userId: assignment.userId,
        trainerId: assignment.trainerId,
        planId: assignment.planId,
        planName: planName,
        status: assignment.status,
        memberName,
        trainerName,
        updatedAt: assignment.updatedAt || new Date().toISOString(),
      };
    } catch (error) {
      console.warn('Error processing trainer assignment item:', assignment, error);
    }
  }

  if (hasChanges) {
    console.log(`💾 SAVING ASSIGNMENT CACHE with ${Object.keys(cache.trainerAssignments).length} assignments`);
    await saveStatusCache(cache);
  }

  return hasChanges;
};

// Check for user PT form updates
export const checkUserPTFormUpdates = async (
  currentUpdates: any[]
) => {
  const updates = normalizeArray(currentUpdates);
  if (updates.length === 0) return false;

  const cache = await loadStatusCache();
  let hasUpdates = false;

  updates.forEach(update => {
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
  const sessions = normalizeArray(currentSessions);
  if (sessions.length === 0) return false;

  const cache = await loadStatusCache();
  let hasCompletions = false;

  sessions.forEach(session => {
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
    await AsyncStorage.removeItem(STATUS_CACHE_KEY);
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
