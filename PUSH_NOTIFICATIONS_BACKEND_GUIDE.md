# GymApp Push Notifications - Backend Integration Guide

This guide provides the necessary backend implementation for the push notification system integrated into GymApp.

## 📋 Table of Contents

- [Database Setup](#database-setup)
- [API Endpoints](#api-endpoints)
- [Push Notification Service](#push-notification-service)
- [Integration Points](#integration-points)
- [Testing](#testing)

## 🗄️ Database Setup

### 1. Create Push Tokens Table

```sql
CREATE TABLE push_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  push_token VARCHAR(500) NOT NULL,
  platform VARCHAR(50) DEFAULT 'expo',
  app VARCHAR(100) DEFAULT 'dap-fitness-studio',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_token (push_token),
  INDEX idx_user_id (user_id),
  INDEX idx_is_active (is_active)
);
```

### 2. Create Notification Log Table (Optional - for tracking)

```sql
CREATE TABLE notification_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  notification_type VARCHAR(100) NOT NULL,
  title VARCHAR(255),
  body VARCHAR(500),
  data JSON,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_sent_at (sent_at)
);
```

## 🔌 API Endpoints

### 1. POST `/users/push-tokens` - Register Push Token

**Purpose**: Store device push token when app initializes

**Request**:
```json
{
  "userId": 123,
  "pushToken": "ExponentPushToken[xxxxx...]",
  "platform": "android|ios",
  "app": "dap-fitness-studio"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Push token stored successfully",
  "tokenId": 456
}
```

**Implementation** (Node.js/Express):
```javascript
app.post('/users/push-tokens', async (req, res) => {
  try {
    const { userId, pushToken, platform, app } = req.body;

    if (!userId || !pushToken) {
      return res.status(400).json({ error: 'userId and pushToken are required' });
    }

    // Check if token already exists
    const existing = await db.query(
      'SELECT id FROM push_tokens WHERE push_token = ?',
      [pushToken]
    );

    if (existing.length > 0) {
      // Update existing token
      await db.query(
        'UPDATE push_tokens SET updated_at = NOW(), is_active = TRUE WHERE push_token = ?',
        [pushToken]
      );
    } else {
      // Insert new token
      await db.query(
        'INSERT INTO push_tokens (user_id, push_token, platform, app) VALUES (?, ?, ?, ?)',
        [userId, pushToken, platform, app]
      );
    }

    res.json({ success: true, message: 'Push token stored' });
  } catch (error) {
    console.error('Error storing push token:', error);
    res.status(500).json({ error: 'Failed to store push token' });
  }
});
```

### 2. GET `/users/push-tokens/:userId` - Get User's Tokens

**Purpose**: Retrieve all push tokens for a user

**Implementation**:
```javascript
app.get('/users/push-tokens/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const tokens = await db.query(
      'SELECT push_token, platform FROM push_tokens WHERE user_id = ? AND is_active = TRUE',
      [userId]
    );

    res.json({ success: true, tokens });
  } catch (error) {
    console.error('Error fetching push tokens:', error);
    res.status(500).json({ error: 'Failed to fetch push tokens' });
  }
});
```

## 🚀 Push Notification Service

### 1. Install Expo Server SDK

```bash
npm install expo-server-sdk
```

### 2. Create Push Notification Service Class

```javascript
const { Expo } = require('expo-server-sdk');

class PushNotificationService {
  constructor() {
    this.expo = new Expo({
      accessToken: process.env.EXPO_ACCESS_TOKEN, // Optional but recommended
    });
  }

  async sendToUser(userId, title, body, data = {}) {
    try {
      // Get user's push tokens
      const tokens = await db.query(
        'SELECT push_token FROM push_tokens WHERE user_id = ? AND push_token IS NOT NULL AND is_active = TRUE',
        [userId]
      );

      if (tokens.length === 0) {
        console.log(`No active push tokens found for user ${userId}`);
        return [];
      }

      // Create messages
      const messages = tokens.map(token => ({
        to: token.push_token,
        sound: 'default',
        title: title,
        body: body,
        data: data,
        priority: 'default',
      }));

      // Send notifications
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
          
          // Log notification
          await this.logNotification(userId, data.type || 'unknown', title, body, data);
        } catch (error) {
          console.error('Error sending push notification chunk:', error);
        }
      }

      return tickets;
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  async sendToMultipleUsers(userIds, title, body, data = {}) {
    try {
      const notifications = userIds.map(userId =>
        this.sendToUser(userId, title, body, data)
      );

      return Promise.all(notifications);
    } catch (error) {
      console.error('Error sending notifications to multiple users:', error);
      throw error;
    }
  }

  async sendToAdmins(title, body, data = {}) {
    try {
      const adminUserIds = await this.getAdminUserIds();

      if (adminUserIds.length === 0) {
        console.log('No admin users found');
        return [];
      }

      return this.sendToMultipleUsers(adminUserIds, title, body, data);
    } catch (error) {
      console.error('Error sending notification to admins:', error);
      throw error;
    }
  }

  async sendToTrainerUsers(trainerId, title, body, data = {}) {
    try {
      // Get all users assigned to this trainer
      const users = await db.query(
        'SELECT id FROM users WHERE trainer_id = ?',
        [trainerId]
      );

      const userIds = users.map(u => u.id);

      if (userIds.length === 0) {
        console.log(`No users assigned to trainer ${trainerId}`);
        return [];
      }

      return this.sendToMultipleUsers(userIds, title, body, data);
    } catch (error) {
      console.error('Error sending notifications to trainer users:', error);
      throw error;
    }
  }

  async getAdminUserIds() {
    try {
      const admins = await db.query('SELECT id FROM users WHERE role = ?', ['admin']);
      return admins.map(admin => admin.id);
    } catch (error) {
      console.error('Error getting admin user IDs:', error);
      return [];
    }
  }

  async logNotification(userId, type, title, body, data) {
    try {
      await db.query(
        'INSERT INTO notification_logs (user_id, notification_type, title, body, data) VALUES (?, ?, ?, ?, ?)',
        [userId, type, title, body, JSON.stringify(data)]
      );
    } catch (error) {
      console.warn('Error logging notification:', error);
    }
  }
}

module.exports = new PushNotificationService();
```

## 🔗 Integration Points

### 1. Order Status Update

Update your order status endpoint:

```javascript
const pushService = require('../services/pushNotificationService');

app.put('/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { newStatus } = req.body;

    // Update order in database
    await db.query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [newStatus, orderId]
    );

    // Get order details with user_id
    const order = await db.query(
      'SELECT user_id, id FROM orders WHERE id = ?',
      [orderId]
    );

    if (order.length > 0) {
      // Send push notification to user
      await pushService.sendToUser(
        order[0].user_id,
        'Order Status Updated',
        `Your order #${order[0].id} is now ${newStatus}`,
        {
          type: 'order_status',
          orderId: order[0].id.toString(),
          status: newStatus,
        }
      );

      // Notify admins of status change
      if (['completed', 'failed', 'shipped'].includes(newStatus)) {
        await pushService.sendToAdmins(
          'Order Status Changed',
          `Order #${order[0].id} status changed to ${newStatus}`,
          {
            type: 'admin_order_update',
            orderId: order[0].id.toString(),
            status: newStatus,
          }
        );
      }
    }

    res.json({ success: true, message: 'Order status updated' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});
```

### 2. Diet Plan Added

```javascript
app.post('/diet-plans', async (req, res) => {
  try {
    const { userId, trainerName, message } = req.body;

    // Create diet plan
    const result = await db.query(
      'INSERT INTO diet_plans (user_id, trainer_name, created_at) VALUES (?, ?, NOW())',
      [userId, trainerName]
    );

    // Send notification to user
    await pushService.sendToUser(
      userId,
      'New Diet Plan Added',
      `${trainerName} added a new diet plan for you`,
      {
        type: 'diet_plan_added',
        dietPlanId: result.insertId.toString(),
        trainerName,
      }
    );

    res.json({ success: true, dietPlanId: result.insertId });
  } catch (error) {
    console.error('Error creating diet plan:', error);
    res.status(500).json({ error: 'Failed to create diet plan' });
  }
});
```

### 3. Workout Added

```javascript
app.post('/workouts', async (req, res) => {
  try {
    const { userId, trainerName, message } = req.body;

    // Create workout
    const result = await db.query(
      'INSERT INTO workouts (user_id, trainer_name, created_at) VALUES (?, ?, NOW())',
      [userId, trainerName]
    );

    // Send notification to user
    await pushService.sendToUser(
      userId,
      'New Workout Added',
      `${trainerName} added a new workout for you`,
      {
        type: 'workout_added',
        workoutId: result.insertId.toString(),
        trainerName,
      }
    );

    res.json({ success: true, workoutId: result.insertId });
  } catch (error) {
    console.error('Error creating workout:', error);
    res.status(500).json({ error: 'Failed to create workout' });
  }
});
```

### 4. Session Tracker Update

```javascript
app.put('/session-trackers/:sessionId/status', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { newStatus, trainerName } = req.body;

    // Update session
    await db.query(
      'UPDATE session_trackers SET status = ?, updated_at = NOW() WHERE id = ?',
      [newStatus, sessionId]
    );

    // Get session details
    const session = await db.query(
      'SELECT user_id FROM session_trackers WHERE id = ?',
      [sessionId]
    );

    if (session.length > 0) {
      // Send notification to user
      await pushService.sendToUser(
        session[0].user_id,
        'Session Tracker Updated',
        `Your session tracker has been updated to ${newStatus}`,
        {
          type: 'session_tracker_update',
          sessionId: sessionId.toString(),
          status: newStatus,
        }
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating session tracker:', error);
    res.status(500).json({ error: 'Failed to update session tracker' });
  }
});
```

### 5. PT Form Submission

```javascript
app.post('/pt-forms/submit', async (req, res) => {
  try {
    const { userId, formData, trainerName } = req.body;

    // Save PT form
    const result = await db.query(
      'INSERT INTO pt_forms (user_id, form_data, status, created_at) VALUES (?, ?, ?, NOW())',
      [userId, JSON.stringify(formData), 'submitted']
    );

    // Send notification to user
    await pushService.sendToUser(
      userId,
      'PT Form Submitted',
      `Your PT form has been submitted successfully`,
      {
        type: 'pt_form_status',
        formId: result.insertId.toString(),
        status: 'submitted',
      }
    );

    // Send notification to assigned trainer
    if (trainerName) {
      const trainer = await db.query(
        'SELECT id FROM users WHERE name = ? AND role = ?',
        [trainerName, 'trainer']
      );

      if (trainer.length > 0) {
        await pushService.sendToUser(
          trainer[0].id,
          'User PT Form Submitted',
          `User #${userId} submitted their PT form`,
          {
            type: 'user_updated_pt_form',
            userId: userId.toString(),
            formType: 'PT Form',
            formId: result.insertId.toString(),
          }
        );
      }
    }

    res.json({ success: true, formId: result.insertId });
  } catch (error) {
    console.error('Error submitting PT form:', error);
    res.status(500).json({ error: 'Failed to submit PT form' });
  }
});
```

### 6. Trainer Assignment

```javascript
app.post('/trainers/:trainerId/assign-user', async (req, res) => {
  try {
    const { trainerId } = req.params;
    const { userId, userName } = req.body;

    // Update user trainer assignment
    await db.query(
      'UPDATE users SET trainer_id = ? WHERE id = ?',
      [trainerId, userId]
    );

    // Send notification to user
    const trainer = await db.query(
      'SELECT name FROM users WHERE id = ?',
      [trainerId]
    );

    if (trainer.length > 0) {
      await pushService.sendToUser(
        userId,
        'Trainer Assigned',
        `You have been assigned to trainer ${trainer[0].name}`,
        {
          type: 'trainer_assigned',
          trainerId: trainerId.toString(),
          trainerName: trainer[0].name,
        }
      );
    }

    // Send notification to trainer
    await pushService.sendToUser(
      trainerId,
      'New User Assigned',
      `${userName} has been assigned to you`,
      {
        type: 'user_assigned',
        userId: userId.toString(),
        userName,
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error assigning trainer:', error);
    res.status(500).json({ error: 'Failed to assign trainer' });
  }
});
```

### 7. Message Sent (Optional)

```javascript
app.post('/messages/send', async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;

    // Save message
    const result = await db.query(
      'INSERT INTO messages (sender_id, receiver_id, content, created_at) VALUES (?, ?, ?, NOW())',
      [senderId, receiverId, message]
    );

    // Get sender info
    const sender = await db.query(
      'SELECT name FROM users WHERE id = ?',
      [senderId]
    );

    if (sender.length > 0) {
      // Send notification to receiver
      await pushService.sendToUser(
        receiverId,
        'New Message',
        `${sender[0].name}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
        {
          type: 'new_message',
          senderId: senderId.toString(),
          senderName: sender[0].name,
          messageId: result.insertId.toString(),
        }
      );
    }

    res.json({ success: true, messageId: result.insertId });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});
```

## 🧪 Testing

### Test Push Token Registration

```bash
curl -X POST http://localhost:3000/users/push-tokens \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "pushToken": "ExponentPushToken[test-token-123]",
    "platform": "android",
    "app": "dap-fitness-studio"
  }'
```

### Test Sending Notification

Create a manual test endpoint:

```javascript
app.post('/test/send-notification', async (req, res) => {
  try {
    const { userId, title, body } = req.body;

    await pushService.sendToUser(
      userId,
      title || 'Test Notification',
      body || 'This is a test notification',
      { type: 'test' }
    );

    res.json({ success: true, message: 'Test notification sent' });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});
```

## 📊 Monitoring

### Check Notification Logs

```javascript
app.get('/notifications/logs/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const logs = await db.query(
      'SELECT * FROM notification_logs WHERE user_id = ? ORDER BY sent_at DESC LIMIT ? OFFSET ?',
      [userId, limit, offset]
    );

    res.json({ success: true, logs });
  } catch (error) {
    console.error('Error fetching notification logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});
```

---

## ✅ Implementation Checklist

### Database
- [ ] Created `push_tokens` table
- [ ] Created `notification_logs` table (optional)
- [ ] Set up indexes for performance

### API Endpoints
- [ ] Implemented `POST /users/push-tokens`
- [ ] Implemented `GET /users/push-tokens/:userId`
- [ ] Implemented notification endpoints for each feature

### Push Service
- [ ] Installed `expo-server-sdk`
- [ ] Created push notification service class
- [ ] Configured with Expo access token

### Integration
- [ ] Integrated order status updates
- [ ] Integrated diet plan creation
- [ ] Integrated workout creation
- [ ] Integrated session tracker updates
- [ ] Integrated PT form submission
- [ ] Integrated trainer assignment
- [ ] Integrated message notifications
- [ ] Set up admin notifications

### Testing
- [ ] Tested token registration
- [ ] Tested push notifications with test endpoint
- [ ] Verified notifications appear on device
- [ ] Tested notification navigation

---

This backend implementation works seamlessly with the frontend notification system. All notifications are sent through Expo's push service and will be delivered to users' devices in real-time.
