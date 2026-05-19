# Push Notifications - Complete Debugging Guide

## 🔍 Current Configuration Status

### ✅ What's Configured
- **Expo Project ID**: `347b991e-229c-4481-9a45-19b55a06e24e` (found in app.json)
- **API Base URLs**: 
  - `https://dapfitt.com/api` (member assignments)
  - `https://dapfitt.com/api` (push token storage)
- **Notification Channels**: Android notification channel configured
- **Notification Handler**: Configured to show alerts, sound, badge

### ⚠️ Current Limitations
- **Expo Go on Android**: Remote push notifications NOT supported (SDK 53 limitation)
- **Local notifications only** in Expo Go
- **Full support** in development builds and APK

---

## 🧪 How to Test Push Notifications

### Option 1: Test with Local Notifications (Works in Expo Go)
1. Open the app in Expo Go
2. New members assigned → Local notification appears
3. Check console logs for `🔔 [PUSH NOTIFICATIONS]` messages

### Option 2: Test with Development Build (Full Push Support)
```bash
eas build --platform android --profile preview
```
Then install and run the preview build.

### Option 3: Test with EAS Secrets (Production)
For production APK, you need to configure EAS secrets.

---

## 📊 Notification Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    NEW MEMBER ASSIGNED                          │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│  TrainerHeader.jsx                                              │
│  - Polls /api/assignments every 30 seconds                     │
│  - Detects NEW members (compares with previous list)          │
└─────────────────────────────────────────────────────────────────┘
                           ↓
                  [Split into 2 paths]
                  ↙                  ↘
    ┌──────────────────────┐    ┌──────────────────────┐
    │  Push Notification   │    │  Local Notification │
    │  (via Server API)    │    │  (Client-side)       │
    └──────────────────────┘    └──────────────────────┘
             ↓                           ↓
    Try endpoints:             Immediate display
    1. /trainers/:id/send-      (even in Expo Go)
       notification
    2. /notifications/send
    3. dapfitt.com endpoints
             ↓
    Server sends via
    Expo Push Service
             ↓
    Device receives
    push notification
```

---

## 🔧 What Each Component Does

### 1. **notificationService.ts**
- `registerForPushNotificationsAsync()`: Gets push token from Expo
- `sendPushTokenToServer()`: Tries 3 endpoints to store token
- `triggerServerPushNotification()`: Calls backend to send push
- `sendLocalNotification()`: Local notification fallback

### 2. **TrainerHeader.jsx**
- Fetches new member assignments every 30 seconds
- Detects newly added members (tracking with useRef)
- Sends push notification for each new member
- Falls back to local notification if server fails

### 3. **useNotifications.ts**
- Listens for notifications when app is open
- Handles notification taps
- Navigates to correct screen based on notification type

### 4. **app._layout.tsx**
- Registers device for push notifications on app startup
- Logs all push notification activity

---

## 🐛 Debugging Steps

### Step 1: Check Push Token Registration
**Expected logs in console:**
```
🔔 [PUSH NOTIFICATIONS] Registering device for user ID: 1303
📱 [PUSH NOTIFICATIONS] Platform: android
✅ Push token obtained: ExponentPushToken[...]
📤 Attempting to send push token to mygym: https://mygym.qtechx.com/api/users/push-tokens
✅ Push token sent successfully to mygym
✅ [PUSH NOTIFICATIONS] Device registered successfully
```

**If you see:**
- ❌ "Expo Go detected on Android" → This is NORMAL for Expo Go
- ❌ "No projectId found" → Check app.json has projectId in extra.eas

### Step 2: Check Member Assignment Detection
**Expected logs in console:**
```
🔔 Found 1 new members assigned
📤 Sending push notification for John Doe to trainer 1303
📤 Triggering push notification via mygym: https://mygym.qtechx.com/api/trainers/1303/send-notification
✅ Push notification triggered successfully via mygym
```

**If you see:**
- ⚠️ "Server notification failed, sending local notification instead"
  → Backend endpoint doesn't exist, local notification will work

### Step 3: Verify API Endpoints

#### Check push token storage:
```bash
curl https://mygym.qtechx.com/api/users/push-tokens -X GET
```

#### Check trainer notifications endpoint:
```bash
curl https://mygym.qtechx.com/api/trainers/1303/send-notification -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "body": "Test notification",
    "data": {"type": "user_assigned"}
  }'
```

---

## ✅ Push Notifications Checklist

- [ ] **Project ID configured** → Check app.json for `extra.eas.projectId`
- [ ] **Push token received** → Check console for `✅ Push token obtained:`
- [ ] **Push token sent to server** → Check console for `✅ Push token sent successfully`
- [ ] **Backend endpoint exists** → Test endpoints above
- [ ] **Expo account linked** → For Expo Push Service integration
- [ ] **Development build** → For Android SDK 53 full support
- [ ] **Device permissions** → Notification permissions granted

---

## 🚀 Production Setup Checklist

### For APK/AAB Builds:
1. Build with EAS: `eas build --platform android`
2. Configure environment variables:
   ```bash
   eas secret create --name PUSH_NOTIFICATION_TOKEN --value "your_expo_token"
   ```
3. Update app.json with secret reference
4. Backend must have Expo Push Service integration

### Expo Push Service Setup:
1. Get Expo account token:
   ```bash
   expo login
   expo build:ios (or android)
   ```
2. Backend should integrate:
   ```javascript
   const Expo = require('expo-server-sdk').default;
   const client = new Expo();
   await client.sendPushNotificationsAsync([{
     to: pushToken,
     sound: 'default',
     title: 'New Member',
     body: 'Member assigned'
   }]);
   ```

---

## 📱 Testing in Different Environments

| Environment | Push Notifications | Local Notifications | Status |
|-------------|------------------|-------------------|--------|
| Expo Go (Android) | ❌ Not supported | ✅ Works | Use local only |
| Expo Go (iOS) | ✅ Works | ✅ Works | Fully working |
| Dev Build (Android) | ✅ Works | ✅ Works | Fully working |
| APK (Android) | ✅ Works | ✅ Works | Fully working |

---

## 🎯 Real-time Monitoring

To see all push notification activity in real-time:
1. Open app in development mode
2. Open Expo DevTools
3. Filter console logs for `[PUSH NOTIFICATIONS]` or `🔔`
4. Monitor the "Notifications" tab

---

## 💡 Common Issues & Solutions

### Issue: No push token received
**Solution:**
- Check if running on physical device (not simulator)
- Check notification permissions are granted
- Check app.json has projectId

### Issue: "Expo Go detected on Android"
**Solution:**
- This is expected behavior
- Use development build or APK for remote push
- Local notifications will still work

### Issue: Backend endpoint returns 404
**Solution:**
- Check if `/trainers/:id/send-notification` endpoint exists on backend
- Verify base URL is correct (mygym.qtechx.com)
- Local notification fallback will handle this

### Issue: Push token not sent to server
**Solution:**
- Check network connectivity
- Verify base URL endpoints are accessible
- Check server logs for incoming requests

---

## 📞 Support

For issues, check:
1. Console logs for `🔔 [PUSH NOTIFICATIONS]` messages
2. Ensure backend is running and endpoints exist
3. Verify Expo project ID is correct in app.json
4. Try with development build if using Expo Go
