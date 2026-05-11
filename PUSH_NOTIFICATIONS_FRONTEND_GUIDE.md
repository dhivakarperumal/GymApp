# GymApp Push Notifications - Frontend Implementation Guide

This guide shows how to integrate push notifications into your GymApp screens and components.

## 📋 Quick Setup Summary

### 1. Install Required Packages

```bash
npx expo install expo-notifications expo-device expo-constants expo-background-fetch expo-task-manager
```

### 2. Update app.json

Already done - includes notifications plugin.

### 3. Use in App Root

Already configured in `app/_layout.tsx` - notifications are automatically initialized when user logs in.

## 🎯 Usage Examples by Feature

### 1. Order Status Notifications (Shop)

**In your Shop/Orders screen:**

```typescript
import { useStatusCheck } from '../hooks/useStatusPolling';
import { useFocusEffect } from '@react-navigation/native';

export default function OrdersScreen() {
  const { checkAll } = useStatusCheck();
  const [orders, setOrders] = useState([]);

  // Check for status changes when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const loadOrders = async () => {
        try {
          // Fetch orders from API
          const response = await api.get('/orders?userId=' + user.id, token);
          setOrders(response.data);
          
          // Check for status changes and send notifications
          await checkAll();
        } catch (error) {
          console.error('Error loading orders:', error);
        }
      };

      loadOrders();
    }, [user.id, token])
  );

  return (
    <View>
      {/* Render your orders */}
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </View>
  );
}
```

**To manually send an order notification:**

```typescript
import { sendOrderStatusNotification } from '../services/notificationService';

// Call this when order status changes
sendOrderStatusNotification(orderId, 'Processing');
```

### 2. Diet Plan Notifications

**When loading diet plans:**

```typescript
import { checkNewDietPlans } from '../services/statusTracker';
import { useFocusEffect } from '@react-navigation/native';

export default function DietScreen() {
  const { user, token } = useAuth();
  const [dietPlans, setDietPlans] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const loadDietPlans = async () => {
        try {
          const response = await api.get(`/diet-plans?userId=${user.id}`, token);
          setDietPlans(response.data);
          
          // Check for new diet plans and send notifications
          await checkNewDietPlans(response.data);
        } catch (error) {
          console.error('Error loading diet plans:', error);
        }
      };

      loadDietPlans();
    }, [user.id, token])
  );

  return (
    <ScrollView>
      {/* Render diet plans */}
      {dietPlans.map(plan => (
        <DietCard key={plan.id} plan={plan} />
      ))}
    </ScrollView>
  );
}
```

**To manually send diet plan notification:**

```typescript
import { sendDietPlanAddedNotification } from '../services/notificationService';

sendDietPlanAddedNotification(
  dietPlanId,
  'Your Trainer Name',
  'Your custom message (optional)'
);
```

### 3. Workout Notifications

**When loading workouts:**

```typescript
import { checkNewWorkouts } from '../services/statusTracker';

export default function WorkoutsScreen() {
  const { user, token } = useAuth();
  const [workouts, setWorkouts] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const loadWorkouts = async () => {
        try {
          const response = await api.get(`/workouts?userId=${user.id}`, token);
          setWorkouts(response.data);
          
          // Check for new workouts
          await checkNewWorkouts(response.data);
        } catch (error) {
          console.error('Error loading workouts:', error);
        }
      };

      loadWorkouts();
    }, [user.id, token])
  );

  return (
    <ScrollView>
      {workouts.map(workout => (
        <WorkoutCard key={workout.id} workout={workout} />
      ))}
    </ScrollView>
  );
}
```

### 4. Session Tracker Notifications (PT Form)

**In Session Tracker/PT Form screen:**

```typescript
import { checkSessionTrackerUpdates } from '../services/statusTracker';

export default function SessionTrackerScreen() {
  const { user, token } = useAuth();
  const [sessions, setSessions] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const loadSessions = async () => {
        try {
          const response = await api.get(
            `/session-trackers?userId=${user.id}`,
            token
          );
          setSessions(response.data);
          
          // Check for updates
          await checkSessionTrackerUpdates(response.data);
        } catch (error) {
          console.error('Error loading sessions:', error);
        }
      };

      loadSessions();
    }, [user.id, token])
  );

  const handleSessionComplete = async (sessionId) => {
    try {
      // Call API to complete session
      await api.put(`/session-trackers/${sessionId}/complete`, { status: 'completed' });
      
      // Manually send notification
      import { sendSessionCompletedNotification } from '../services/notificationService';
      sendSessionCompletedNotification(sessionId, user.name, sessionId);
      
      // Reload sessions
      loadSessions();
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  return (
    <ScrollView>
      {sessions.map(session => (
        <SessionCard 
          key={session.id} 
          session={session}
          onComplete={() => handleSessionComplete(session.id)}
        />
      ))}
    </ScrollView>
  );
}
```

### 5. Trainer Side - User Assigned

**In Trainer Dashboard:**

```typescript
import { checkNewUserAssignments } from '../services/statusTracker';

export default function TrainerDashboard() {
  const { user, token } = useAuth();
  const [assignedUsers, setAssignedUsers] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const loadAssignments = async () => {
        try {
          const response = await api.get(
            `/trainer-assignments?trainerId=${user.id}`,
            token
          );
          setAssignedUsers(response.data);
          
          // Check for new assignments
          await checkNewUserAssignments(response.data);
        } catch (error) {
          console.error('Error loading assignments:', error);
        }
      };

      loadAssignments();
    }, [user.id, token])
  );

  return (
    <View>
      <Text>Assigned Users: {assignedUsers.length}</Text>
      {assignedUsers.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </View>
  );
}
```

### 6. Trainer Side - PT Form Updates from Users

**In Trainer Session Tracking:**

```typescript
import { checkUserPTFormUpdates } from '../services/statusTracker';

export default function TrainerSessionTracking() {
  const { user, token } = useAuth();
  const [userUpdates, setUserUpdates] = useState([]);

  useFocusEffect(
    useCallback(() => {
      const loadUserUpdates = async () => {
        try {
          const response = await api.get(
            `/user-pt-form-updates?trainerId=${user.id}`,
            token
          );
          setUserUpdates(response.data);
          
          // Check for PT form updates
          await checkUserPTFormUpdates(response.data);
        } catch (error) {
          console.error('Error loading updates:', error);
        }
      };

      loadUserUpdates();
    }, [user.id, token])
  );

  return (
    <ScrollView>
      <Text>Recent User Updates</Text>
      {userUpdates.map(update => (
        <UpdateCard key={update.id} update={update} />
      ))}
    </ScrollView>
  );
}
```

### 7. Manual Notification Triggers

**Send notifications when user performs actions:**

```typescript
import { sendMessageNotification } from '../services/notificationService';

// When sending a message to a trainer
const handleSendMessage = async (message) => {
  try {
    // Send to API
    await api.post('/messages/send', {
      senderId: user.id,
      receiverId: trainer.id,
      message,
    });

    // Manually trigger notification (in real app, backend would do this)
    if (shouldNotify) {
      sendMessageNotification(
        user.id,
        user.name,
        message,
        conversationId
      );
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
};
```

## 🔔 Notification Types Summary

### For Members
- **Order Status**: `sendOrderStatusNotification()`
- **Diet Plan Added**: `sendDietPlanAddedNotification()`
- **Workout Added**: `sendWorkoutAddedNotification()`
- **Message**: `sendMessageNotification()`
- **Session Tracker Update**: `sendSessionTrackerUpdateNotification()`
- **PT Form Status**: `sendPTFormCompletionNotification()`

### For Trainers
- **User Assigned**: `sendUserAssignedNotification()`
- **User Updated PT Form**: `sendUserUpdatedPTFormNotification()`
- **Session Tracker Update**: `sendSessionTrackerUpdatedByUserNotification()`
- **Session Completed**: `sendSessionCompletedNotification()`

### For Admins
- **New Order**: `sendAdminNewOrderNotification()`
- **User Updated**: `sendAdminUserUpdatedNotification()`
- **Trainer Assignment**: `sendAdminTrainerAssignmentNotification()`
- **New User**: `sendAdminNewUserNotification()`

## 🔧 Advanced Usage

### Manual Status Cache Management

```typescript
import { clearStatusCache, getCacheSummary } from '../services/statusTracker';

// Clear cache (useful for testing)
await clearStatusCache();

// Get cache summary
const summary = await getCacheSummary();
console.log('Cached items:', summary);
```

### Enable/Disable Polling

```typescript
import { useStatusPolling } from '../hooks/useStatusPolling';

// Polling enabled when user is logged in
const { refresh } = useStatusPolling(!!user?.id);

// Manually refresh
const handleRefresh = async () => {
  await refresh();
};
```

### Test Notifications

```typescript
import { sendLocalNotification } from '../services/notificationService';

// Send test notification immediately
sendLocalNotification(
  'Test Title',
  'Test body message',
  { type: 'test', data: 'value' }
);
```

## 🎯 Key Integration Points in Your App

1. **app/_layout.tsx** - Initialization (already done)
2. **app/(tabs)/shop** - Order notifications
3. **app/(tabs)/diet** - Diet plan notifications
4. **app/(tabs)/workouts** - Workout notifications
5. **app/(tabs)/more** - PT form/session tracker
6. **app/(trainers)/dashboard** - User assignment notifications
7. **app/(trainers)/session-tracking** - User PT form updates
8. **app/(trainers)/messages** - Message notifications
9. **Header.jsx** - Optional: Check statuses on each screen

## 📝 Important Notes

- **Polling**: Set to 5 minutes by default. Adjust in `useStatusPolling.ts` if needed
- **Local Notifications**: Always work when app is open
- **Push Notifications**: Require Expo Go on physical device or production build
- **EAS Project ID**: Required for push notifications. Update in `app.json` with your actual ID
- **Backend Required**: All notifications require corresponding backend endpoints

## ✅ Complete Implementation Checklist

- [ ] Install notifications packages
- [ ] Update app.json with notifications plugin and EAS ID
- [ ] Set up notification service in app/_layout.tsx
- [ ] Add status checking to each screen using hooks
- [ ] Integrate manual notification triggers in action handlers
- [ ] Configure backend endpoints (see backend guide)
- [ ] Test local notifications in Expo Go
- [ ] Test push notifications with development build
- [ ] Verify notification navigation works

---

For more details on backend setup, see `PUSH_NOTIFICATIONS_BACKEND_GUIDE.md`
