import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import * as statusTracker from '../services/statusTracker';

const POLLING_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const useStatusPolling = () => {
  const { user, token } = useAuth();
  const pollingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchPtFormsForTrainer = async (assignments: any[]) => {
    const memberIds = Array.from(
      new Set(
        assignments
          .map((assignment) => assignment.gymMemberId || assignment.memberId || assignment.userId || assignment.user_id)
          .filter(Boolean)
      )
    );

    if (memberIds.length === 0) {
      console.log('DEBUG useStatusPolling: no member IDs available for trainer PT form fallback');
      return [];
    }

    console.log('DEBUG useStatusPolling: fetching trainer PT forms for member IDs', memberIds);

    const fetchedPtForms = await Promise.all(
      memberIds.map(async (memberId) => {
        try {
          const res = await api.get(`/pt-forms/${memberId}`, token);
          return res.data;
        } catch (err) {
          console.warn('DEBUG useStatusPolling: trainer PT form fetch failed', {
            memberId,
            error: err?.message || err,
          });
          return null;
        }
      })
    );

    return fetchedPtForms.filter((item) => item && typeof item === 'object');
  };

  const checkForUpdates = async () => {
    if (!user?.id || !token) {
      console.log('DEBUG useStatusPolling: skipping because no user or token', { userId: user?.id, hasToken: !!token });
      return;
    }

    try {
      console.log('DEBUG useStatusPolling: polling for updates', { userId: user.id });
      const [
        ordersRes,
        dietPlansRes,
        workoutsRes,
        sessionTrackersRes,
        ptFormsRes,
        assignmentsRes,
        messagesRes,
      ] = await Promise.all([
        api.get(`/orders/user/${user.id}`, token).catch(() => ({ data: [] })),
        api.get(`/diet-plans?memberId=${user.id}`, token).catch(() => ({ data: [] })),
        api.get(`/workouts?memberId=${user.id}`, token).catch(() => ({ data: [] })),
        api.get(`/session-trackers?memberId=${user.id}`, token).catch(() => ({ data: [] })),
        api.get(`/pt-forms?memberId=${user.id}`, token).catch(() => ({ data: [] })),
        api.get(`/assignments?trainerUserId=${user.id}`, token).catch(() => ({ data: [] })),
        api.get(`/send-message/history`, token).catch(() => ({ data: [] })),
      ]);

      const normalizeArray = (value: any) =>
        Array.isArray(value) ? value.filter((item) => item && typeof item === 'object') : [];

      const orders = normalizeArray(
        Array.isArray(ordersRes.data)
          ? ordersRes.data
          : ordersRes.data?.orders || ordersRes.data?.data
      );
      const dietPlans = normalizeArray(
        Array.isArray(dietPlansRes.data)
          ? dietPlansRes.data
          : dietPlansRes.data?.dietPlans || dietPlansRes.data?.data
      );
      const workouts = normalizeArray(
        Array.isArray(workoutsRes.data)
          ? workoutsRes.data
          : workoutsRes.data?.workouts || workoutsRes.data?.data
      );
      const sessionTrackers = normalizeArray(
        Array.isArray(sessionTrackersRes.data)
          ? sessionTrackersRes.data
          : sessionTrackersRes.data?.sessionTrackers || sessionTrackersRes.data?.data
      );
      let ptForms = normalizeArray(
        Array.isArray(ptFormsRes.data)
          ? ptFormsRes.data
          : ptFormsRes.data?.ptForms || ptFormsRes.data?.pt_forms || ptFormsRes.data?.data
      );
      const assignments = normalizeArray(
        Array.isArray(assignmentsRes.data)
          ? assignmentsRes.data
          : assignmentsRes.data?.assignments || assignmentsRes.data?.data
      );
      const messages = normalizeArray(
        Array.isArray(messagesRes.data)
          ? messagesRes.data
          : messagesRes.data?.messages || messagesRes.data?.data
      );

      if (!ptForms.length) {
        console.log('DEBUG useStatusPolling: ptForms response shape', {
          raw: ptFormsRes.data,
          normalizedLength: ptForms.length,
        });
      }

      if (user.role === 'trainer' && assignments.length > 0) {
        const trainerPtForms = await fetchPtFormsForTrainer(assignments);
        if (trainerPtForms.length > 0) {
          console.log('DEBUG useStatusPolling: trainer PT forms fallback returned', { count: trainerPtForms.length });
          ptForms = ptForms.concat(trainerPtForms);
        }
      }

      if (!ptForms.length && user.role !== 'trainer') {
        const fallbackKeys = ['memberId', 'u_id'];
        for (const key of fallbackKeys) {
          const fallbackRes = await api.get(`/pt-forms?${key}=${user.id}`, token).catch(() => ({ data: [] }));
          let fallbackItems = normalizeArray(
            Array.isArray(fallbackRes.data)
              ? fallbackRes.data
              : fallbackRes.data?.ptForms || fallbackRes.data?.pt_forms || fallbackRes.data?.data
          );

          if (!fallbackItems.length && fallbackRes.data && typeof fallbackRes.data === 'object' && !Array.isArray(fallbackRes.data)) {
            fallbackItems = [fallbackRes.data];
          }

          if (fallbackItems.length) {
            console.log('DEBUG useStatusPolling: ptForms fallback succeeded for key', key, { count: fallbackItems.length });
            ptForms = fallbackItems;
            break;
          }
        }
      }

      console.log('📊 POLLING RESULTS:', {
        orders: orders.length,
        dietPlans: dietPlans.length,
        workouts: workouts.length,
        sessionTrackers: sessionTrackers.length,
        ptForms: ptForms.length,
        messages: messages.length,
      });

      const allStatuses: statusTracker.CachedStatus[] = [];

      orders.forEach((item: any) => allStatuses.push(statusTracker.createCachedStatus(item, 'order')));
      dietPlans.forEach((item: any) => allStatuses.push(statusTracker.createCachedStatus(item, 'diet_plan')));
      workouts.forEach((item: any) => allStatuses.push(statusTracker.createCachedStatus(item, 'workout')));
      sessionTrackers.forEach((item: any) => allStatuses.push(statusTracker.createCachedStatus(item, 'session_tracker')));
      ptForms.forEach((item: any) => allStatuses.push(statusTracker.createCachedStatus(item, 'pt_form')));
      messages.forEach((item: any) => allStatuses.push(statusTracker.createCachedStatus(item, 'message')));

      console.log('DEBUG useStatusPolling: built status items', {
        orders: orders.length,
        dietPlans: dietPlans.length,
        workouts: workouts.length,
        sessionTrackers: sessionTrackers.length,
        ptForms: ptForms.length,
        messages: messages.length,
      });
      if (ptForms.length > 0) {
        console.log('DEBUG useStatusPolling: first ptForm item', ptForms[0]);
      }
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
