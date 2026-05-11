# GymApp Push Notifications - Quick Start Guide

This guide will get you set up with push notifications in 10 minutes.

## 🚀 Quick Start (5 steps)

### Step 1: Install Packages

```bash
cd d:\Thenuga\GymApp
npx expo install expo-notifications expo-device expo-constants expo-background-fetch expo-task-manager
```

### Step 2: Verify Setup Files

The following files have already been created and configured:

✅ `services/notificationService.ts` - Core notification functions  
✅ `services/statusTracker.ts` - Status change detection  
✅ `hooks/useNotifications.ts` - Notification listeners  
✅ `hooks/useStatusPolling.ts` - Auto polling for status updates  
✅ `app/_layout.tsx` - Already configured with notification setup  
✅ `app.json` - Already updated with notifications plugin  

### Step 3: Get EAS Project ID (Important!)

1. Sign up at https://expo.dev
2. Create a new project
3. Copy your Project ID
4. Open `app.json` and replace:
   ```json
   "projectId": "your-eas-project-id-here"
   ```
   with your actual project ID

### Step 4: Test Locally

```bash
# Start Expo
npx expo start

# On your phone, open Expo Go and scan the QR code

# Login with a test account

# You should see notifications working when order/diet/workout status changes
```

### Step 5: Backend Integration

See `PUSH_NOTIFICATIONS_BACKEND_GUIDE.md` for backend setup.

## 📱 Features Included

### ✅ Member/User Notifications
- 📦 Order status changes
- 🥗 New diet plans added
- 💪 New workouts added
- 💬 Messages from trainers
- 📊 Session tracker updates
- 📋 PT form status updates

### ✅ Trainer Notifications
- 👥 New users assigned
- 📝 User PT form updates
- ⏱️ Session tracker completion
- 👤 User updates

### ✅ Admin Notifications
- 🆕 New orders
- 👤 User updates
- 🏋️ Trainer assignments
- 📊 System updates

## 🧪 Testing

### Test Local Notifications (Expo Go)

```typescript
// Add this to any screen or component
import { sendOrderStatusNotification } from '../services/notificationService';

// Call this function to test
sendOrderStatusNotification('TEST-001', 'Completed', 'Test notification');
```

### Test Push Notifications (Physical Device)

1. Build development APK:
   ```bash
   eas build --platform android --profile development
   ```

2. Install on device:
   ```bash
   eas build:run --platform android
   ```

3. Update order status from your backend and notification should arrive

## 📋 Implementation Checklist

### Frontend (Already Done ✅)
- [x] Packages installed
- [x] app.json configured
- [x] Notification service created
- [x] Status tracker implemented
- [x] Hooks created
- [x] App layout updated

### Backend (Todo)
- [ ] Create push_tokens table
- [ ] Create notification_logs table
- [ ] Implement POST /users/push-tokens endpoint
- [ ] Integrate order status updates
- [ ] Integrate diet plan creation
- [ ] Integrate workout creation
- [ ] Integrate session tracker updates
- [ ] Integrate PT form submission
- [ ] Integrate trainer assignment
- [ ] Install expo-server-sdk

### Integration (Todo)
- [ ] Update shop.js - order notifications
- [ ] Update diet.js - diet notifications
- [ ] Update workouts.js - workout notifications
- [ ] Update trainer screens - user assignment
- [ ] Update session tracker - session updates
- [ ] Add Header.jsx - status checks
- [ ] Test end-to-end

## 🔗 File Structure

```
app/
├── _layout.tsx (✅ Updated with notification setup)
├── Header.jsx (Todo: Add status checking)
├── (tabs)/
│   ├── shop.js (Todo: Add order notifications)
│   ├── diet.js (Todo: Add diet notifications)
│   ├── workouts.js (Todo: Add workout notifications)
│   └── more.js (Todo: Add PT form notifications)
└── (trainers)/
    ├── dashboard.jsx (Todo: Add user assignment)
    └── session-tracking.jsx (Todo: Add user updates)

services/
├── notificationService.ts (✅ Created)
├── statusTracker.ts (✅ Created)
└── api.js (Existing)

hooks/
├── useNotifications.ts (✅ Created)
└── useStatusPolling.ts (✅ Created)
```

## 🎯 Next Steps

### 1. Update Screen Components

Add to each relevant screen:

```typescript
import { useStatusCheck } from '../hooks/useStatusPolling';
import { useFocusEffect } from '@react-navigation/native';

useFocusEffect(
  useCallback(() => {
    // Check status when screen comes into focus
    checkAll();
  }, [])
);
```

### 2. Set Up Backend Endpoints

Refer to `PUSH_NOTIFICATIONS_BACKEND_GUIDE.md` for complete backend setup.

### 3. Test End-to-End

1. Login on device
2. Create/update order/diet/workout from backend
3. Verify notification appears on device
4. Tap notification and verify navigation

## ⚠️ Common Issues & Solutions

### Issue: "No Expo projectId found"
**Solution**: Update `app.json` with your EAS project ID

### Issue: Notifications not appearing in Expo Go (Android)
**Solution**: Push notifications don't work in Expo Go on Android. Use development build instead.

### Issue: Token not registered on backend
**Solution**: 
1. Check device has internet connection
2. Verify `/users/push-tokens` endpoint is working
3. Check console logs for errors

### Issue: Notification arrives but doesn't navigate
**Solution**: Check `useNotifications.ts` notification type matches the data sent

## 📞 Support

### Documentation Files
- `PUSH_NOTIFICATIONS_FRONTEND_GUIDE.md` - Detailed frontend implementation
- `PUSH_NOTIFICATIONS_BACKEND_GUIDE.md` - Complete backend setup
- `services/notificationService.ts` - Core functions and their usage

### Console Logs
Enable console logging to debug:
```typescript
// In notificationService.ts, you'll see:
// "Push token: ExponentPushToken[...]"
// "Push token sent to server"
// "Notification received (app in foreground):"
// "Notification tapped:"
```

## ✅ Verification Checklist

Once everything is set up, verify:

- [ ] App starts without errors
- [ ] Login works and notifications register
- [ ] Test notification appears when app is open
- [ ] Notification navigates to correct screen when tapped
- [ ] Status changes trigger notifications automatically
- [ ] Notifications appear even when app is closed (push)
- [ ] No duplicate notifications sent

## 🎉 You're Ready!

Your push notification system is now set up and ready to use. 

**Next**: Implement the screen updates as shown in `PUSH_NOTIFICATIONS_FRONTEND_GUIDE.md` and set up your backend as shown in `PUSH_NOTIFICATIONS_BACKEND_GUIDE.md`.

For questions or issues, check the documentation files for detailed examples and troubleshooting.
