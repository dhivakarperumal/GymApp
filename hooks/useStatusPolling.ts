import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import * as statusTracker from '../services/statusTracker';

const POLLING_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const useStatusPolling = () => {
  const { user, token } = useAuth();
  const pollingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkForUpdates = async () => {
    if (!user?.id || !token) return;

    try {
      const [
        ordersRes,
        dietPlansRes,
        workoutsRes,
        sessionTrackersRes,
        ptFormsRes,
        assignmentsRes,
      ] = await Promise.all([
        api.get(`/orders/user/${user.id}`, token).catch(() => ({ data: [] })),
        api.get(`/diet-plans?userId=${user.id}`, token).catch(() => ({ data: [] })),
        api.get(`/workouts?userId=${user.id}`, token).catch(() => ({ data: [] })),
        api.get(`/session-trackers?userId=${user.id}`, token).catch(() => ({ data: [] })),
        api.get(`/pt-forms?userId=${user.id}`, token).catch(() => ({ data: [] })),
        api.get(`/assignments?trainerUserId=${user.id}`, token).catch(() => ({ data: [] })),
      ]);

      const orders = Array.isArray(ordersRes.data)
        ? ordersRes.data
        : ordersRes.data?.orders || ordersRes.data?.data || [];
      const dietPlans = Array.isArray(dietPlansRes.data)
        ? dietPlansRes.data
        : dietPlansRes.data?.dietPlans || dietPlansRes.data?.data || [];
      const workouts = Array.isArray(workoutsRes.data)
        ? workoutsRes.data
        : workoutsRes.data?.workouts || workoutsRes.data?.data || [];
      const sessionTrackers = Array.isArray(sessionTrackersRes.data)
        ? sessionTrackersRes.data
        : sessionTrackersRes.data?.sessionTrackers || sessionTrackersRes.data?.data || [];
      const ptForms = Array.isArray(ptFormsRes.data)
        ? ptFormsRes.data
        : ptFormsRes.data?.ptForms || ptFormsRes.data?.data || [];
      const assignments = Array.isArray(assignmentsRes.data)
        ? assignmentsRes.data
        : assignmentsRes.data?.assignments || assignmentsRes.data?.data || [];

      const allStatuses: statusTracker.CachedStatus[] = [];

      orders.forEach((item: any) => allStatuses.push(statusTracker.createCachedStatus(item, 'order')));
      dietPlans.forEach((item: any) => allStatuses.push(statusTracker.createCachedStatus(item, 'diet_plan')));
      workouts.forEach((item: any) => allStatuses.push(statusTracker.createCachedStatus(item, 'workout')));
      sessionTrackers.forEach((item: any) => allStatuses.push(statusTracker.createCachedStatus(item, 'session_tracker')));
      ptForms.forEach((item: any) => allStatuses.push(statusTracker.createCachedStatus(item, 'pt_form')));

      await statusTracker.checkStatusChanges(allStatuses);
      await statusTracker.checkTrainerAssignmentChanges(assignments);
    } catch (error) {
      console.error('Error checking for status updates:', error);
    }
  };

  useEffect(() => {
    if (!user?.id || !token) {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
      return;
    }

    checkForUpdates();
    pollingInterval.current = setInterval(checkForUpdates, POLLING_INTERVAL);

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
        pollingInterval.current = null;
      }
    };
  }, [user?.id, token]);
};
