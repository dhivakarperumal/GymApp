import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
    checkAdminUserUpdates,
    checkNewAdminOrders,
    checkNewDietPlans,
    checkNewUserAssignments,
    checkNewWorkouts,
    checkOrderStatusChanges,
    checkPTFormStatusUpdates,
    checkSessionTrackerUpdates,
    checkUserPTFormUpdates,
    checkUserSessionCompletion,
} from '../services/statusTracker';

const POLLING_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const useStatusPolling = (enabled: boolean = true) => {
  const intervalRef = useRef<NodeJS.Timeout>();
  const { user, token } = useAuth();

  const pollMemberStatuses = useCallback(async () => {
    try {
      if (!user?.id || !token) return;

      // Fetch all required data
      const [
        ordersRes,
        dietPlansRes,
        workoutsRes,
        sessionTrackersRes,
        ptFormsRes,
      ] = await Promise.all([
        api.get(`/orders?userId=${user.id}`, token).catch(() => ({ data: [] })),
        api.get(`/diet-plans?userId=${user.id}`, token).catch(() => ({ data: [] })),
        api.get(`/workouts?userId=${user.id}`, token).catch(() => ({ data: [] })),
        api.get(`/session-trackers?userId=${user.id}`, token).catch(() => ({ data: [] })),
        api.get(`/pt-forms?userId=${user.id}`, token).catch(() => ({ data: [] })),
      ]);

      // Check for changes
      await Promise.all([
        checkOrderStatusChanges(ordersRes.data || []),
        checkNewDietPlans(dietPlansRes.data || []),
        checkNewWorkouts(workoutsRes.data || []),
        checkSessionTrackerUpdates(sessionTrackersRes.data || []),
        checkPTFormStatusUpdates(ptFormsRes.data || []),
      ]);
    } catch (error) {
      console.warn('Error polling member statuses:', error);
    }
  }, [user?.id, token]);

  const pollTrainerStatuses = useCallback(async () => {
    try {
      if (!user?.id || !token) return;

      // Fetch trainer-specific data
      const [
        assignmentsRes,
        userUpdatesRes,
        sessionCompletionsRes,
      ] = await Promise.all([
        api.get(`/trainer-assignments?trainerId=${user.id}`, token).catch(() => ({ data: [] })),
        api.get(`/user-pt-form-updates?trainerId=${user.id}`, token).catch(() => ({ data: [] })),
        api.get(`/session-completions?trainerId=${user.id}`, token).catch(() => ({ data: [] })),
      ]);

      // Check for changes
      await Promise.all([
        checkNewUserAssignments(assignmentsRes.data || []),
        checkUserPTFormUpdates(userUpdatesRes.data || []),
        checkUserSessionCompletion(sessionCompletionsRes.data || []),
      ]);
    } catch (error) {
      console.warn('Error polling trainer statuses:', error);
    }
  }, [user?.id, token]);

  const pollAdminStatuses = useCallback(async () => {
    try {
      if (!token) return;

      // Fetch admin-specific data
      const [
        ordersRes,
        userUpdatesRes,
      ] = await Promise.all([
        api.get('/orders', token).catch(() => ({ data: [] })),
        api.get('/user-updates', token).catch(() => ({ data: [] })),
      ]);

      // Check for changes
      await Promise.all([
        checkNewAdminOrders(ordersRes.data || []),
        checkAdminUserUpdates(userUpdatesRes.data || []),
      ]);
    } catch (error) {
      console.warn('Error polling admin statuses:', error);
    }
  }, [token]);

  const pollStatuses = useCallback(async () => {
    if (!user?.id) return;

    // Poll based on user role
    if (user.role === 'admin') {
      await pollAdminStatuses();
    } else if (user.role === 'trainer') {
      await pollTrainerStatuses();
    } else if (user.role === 'member') {
      await pollMemberStatuses();
    }
  }, [user?.id, user?.role, pollMemberStatuses, pollTrainerStatuses, pollAdminStatuses]);

  useEffect(() => {
    if (!enabled || !user?.id) return;

    // Initial check
    pollStatuses();

    // Set up polling
    intervalRef.current = setInterval(pollStatuses, POLLING_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, user?.id, pollStatuses]);

  // Return a manual refresh function for on-demand checks
  return { refresh: pollStatuses };
};

// Simpler hook for checking statuses without auto-polling
export const useStatusCheck = () => {
  const { user, token } = useAuth();

  const checkMemberStatuses = useCallback(async () => {
    try {
      if (!user?.id || !token) return;

      const [
        ordersRes,
        dietPlansRes,
        workoutsRes,
        sessionTrackersRes,
        ptFormsRes,
      ] = await Promise.all([
        api.get(`/orders?userId=${user.id}`, token).catch(() => ({ data: [] })),
        api.get(`/diet-plans?userId=${user.id}`, token).catch(() => ({ data: [] })),
        api.get(`/workouts?userId=${user.id}`, token).catch(() => ({ data: [] })),
        api.get(`/session-trackers?userId=${user.id}`, token).catch(() => ({ data: [] })),
        api.get(`/pt-forms?userId=${user.id}`, token).catch(() => ({ data: [] })),
      ]);

      await Promise.all([
        checkOrderStatusChanges(ordersRes.data || []),
        checkNewDietPlans(dietPlansRes.data || []),
        checkNewWorkouts(workoutsRes.data || []),
        checkSessionTrackerUpdates(sessionTrackersRes.data || []),
        checkPTFormStatusUpdates(ptFormsRes.data || []),
      ]);

      return true;
    } catch (error) {
      console.warn('Error checking statuses:', error);
      return false;
    }
  }, [user?.id, token]);

  const checkTrainerStatuses = useCallback(async () => {
    try {
      if (!user?.id || !token) return;

      const [
        assignmentsRes,
        userUpdatesRes,
        sessionCompletionsRes,
      ] = await Promise.all([
        api.get(`/trainer-assignments?trainerId=${user.id}`, token).catch(() => ({ data: [] })),
        api.get(`/user-pt-form-updates?trainerId=${user.id}`, token).catch(() => ({ data: [] })),
        api.get(`/session-completions?trainerId=${user.id}`, token).catch(() => ({ data: [] })),
      ]);

      await Promise.all([
        checkNewUserAssignments(assignmentsRes.data || []),
        checkUserPTFormUpdates(userUpdatesRes.data || []),
        checkUserSessionCompletion(sessionCompletionsRes.data || []),
      ]);

      return true;
    } catch (error) {
      console.warn('Error checking trainer statuses:', error);
      return false;
    }
  }, [user?.id, token]);

  const checkAll = useCallback(async () => {
    if (user?.role === 'trainer') {
      return await checkTrainerStatuses();
    } else {
      return await checkMemberStatuses();
    }
  }, [user?.role, checkMemberStatuses, checkTrainerStatuses]);

  return { checkAll, checkMemberStatuses, checkTrainerStatuses };
};
