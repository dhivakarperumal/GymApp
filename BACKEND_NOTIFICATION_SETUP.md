# Backend Notification Setup for PT Forms & Messages

This guide shows how to wire PT form submissions and message sends to send push notifications to trainee users.

## 1. PT Form Controller - Add Notification Trigger

Update `controllers/ptFormController.js`:

```javascript
const db = require('../config/db');
const pushService = require('../services/pushService'); // Your push notification service

async function savePTForm(req, res) {
  const { member_id, user_id, formData, completed = false } = req.body;

  if (!member_id) {
    return res.status(400).json({ error: 'Member ID is required' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Save or update PT form data
    const [existing] = await connection.query(
      'SELECT id FROM pt_forms WHERE member_id = ?',
      [member_id]
    );

    if (existing.length > 0) {
      await connection.query(
        'UPDATE pt_forms SET form_data = ?, user_id = ? WHERE member_id = ?',
        [JSON.stringify(formData), user_id || null, member_id]
      );
    } else {
      await connection.query(
        'INSERT INTO pt_forms (member_id, user_id, form_data) VALUES (?, ?, ?)',
        [member_id, user_id || null, JSON.stringify(formData)]
      );
    }

    // 2. Update gym_members table status and basic info
    await connection.query(
      `UPDATE gym_members SET 
        pt_form_completed = CASE WHEN ? THEN 1 ELSE pt_form_completed END,
        pt_form_completed_at = CASE WHEN ? THEN NOW() ELSE pt_form_completed_at END,
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        gender = COALESCE(?, gender),
        height = COALESCE(?, height),
        weight = COALESCE(?, weight),
        bmi = COALESCE(?, bmi),
        address = COALESCE(?, address),
        dob = COALESCE(?, dob),
        age = COALESCE(?, age),
        occupation = COALESCE(?, occupation),
        fitness_goal = COALESCE(?, fitness_goal),
        blood_group = COALESCE(?, blood_group)
       WHERE id = ? OR member_id = ?`,
      [
        completed ? 1 : 0,
        completed ? 1 : 0,
        formData.name || null,
        formData.email || null,
        formData.phone || null,
        formData.gender || null,
        formData.height || null,
        formData.weight || null,
        formData.bmi || null,
        formData.address || null,
        formData.dob || null,
        formData.age || null,
        formData.occupation || null,
        formData.fitness_goal || null,
        formData.blood_group || null,
        member_id,
        member_id
      ]
    );

    // 3. SEND NOTIFICATION TO TRAINEE if form is completed
    if (completed) {
      try {
        // Get trainee member info
        const [memberRows] = await connection.query(
          'SELECT id, name, email FROM gym_members WHERE id = ?',
          [member_id]
        );
        
        // Get trainer info
        const [trainerRows] = await connection.query(
          'SELECT id, name, username FROM users WHERE id = ?',
          [user_id]
        );

        const memberName = memberRows?.[0]?.name || 'Member';
        const trainerName = trainerRows?.[0]?.name || trainerRows?.[0]?.username || 'Trainer';

        // Send notification to trainee
        if (memberRows?.length > 0) {
          const memberId = memberRows[0].id;
          
          await pushService.sendToUser(
            memberId,
            'PT Form Submitted',
            `Your trainer ${trainerName} submitted your PT form.`,
            {
              type: 'pt_form_status',
              formId: member_id.toString(),
              status: 'completed',
              trainerName,
              memberName,
            }
          );
          
          console.log(`✅ PT Form notification sent to member ${memberId}`);
        }
      } catch (notificationError) {
        console.warn('Failed to send PT form notification:', notificationError.message);
        // Don't fail the request if notification fails
      }
    }

    await connection.commit();
    res.json({ success: true, message: 'PT Form saved successfully' });
  } catch (err) {
    await connection.rollback();
    console.error('savePTForm error:', err);
    res.status(500).json({ error: 'Failed to save PT Form' });
  } finally {
    connection.release();
  }
}

async function getPTForm(req, res) {
  const { member_id } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT * FROM pt_forms WHERE member_id = ?',
      [member_id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Form not found' });
    }
    const record = rows[0];
    if (record.form_data && typeof record.form_data === 'string') {
      try {
        record.form_data = JSON.parse(record.form_data);
      } catch (parseError) {
        console.warn('Failed to parse pt_forms.form_data', parseError);
      }
    }
    res.json(record);
  } catch (err) {
    console.error('getPTForm error:', err);
    res.status(500).json({ error: 'Query failed' });
  }
}

module.exports = { savePTForm, getPTForm };
```

---

## 2. Message Controller - Add Notification Trigger

Update `controllers/messageController.js`:

```javascript
const db = require('../config/db');
const pushService = require('../services/pushService'); // Your push notification service

async function sendMessages(req, res) {
  const { subject, message, recipients } = req.body;

  if (!message || !recipients || recipients.length === 0) {
    return res.status(400).json({ error: 'Message and recipients are required' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Save message to database
    for (const recipient of recipients) {
      await connection.query(
        `INSERT INTO messages (subject, message, recipients_json, sent_at) 
         VALUES (?, ?, ?, NOW())`,
        [
          subject || 'No Subject',
          message,
          JSON.stringify(recipients),
        ]
      );
    }

    await connection.commit();

    // 2. SEND NOTIFICATIONS TO EACH RECIPIENT
    try {
      for (const recipient of recipients) {
        const recipientId = recipient.id || recipient.userId;
        
        // Get trainer info (sender)
        const sender = req.body.senderId ? 
          await db.query('SELECT name, username FROM users WHERE id = ?', [req.body.senderId])
          : { name: 'Trainer', username: 'Trainer' };
        
        const senderName = sender?.[0]?.name || sender?.[0]?.username || 'Trainer';

        // Send notification to trainee
        await pushService.sendToUser(
          recipientId,
          'New Message',
          `You have a new message from ${senderName}. Subject: ${subject || 'No Subject'}`,
          {
            type: 'new_message',
            senderId: req.body.senderId?.toString() || 'unknown',
            senderName,
            subject: subject || '',
            messagePreview: message.substring(0, 100),
          }
        );

        console.log(`✅ Message notification sent to member ${recipientId}`);
      }
    } catch (notificationError) {
      console.warn('Failed to send message notification:', notificationError.message);
      // Don't fail the request if notification fails
    }

    res.json({ 
      success: true, 
      message: 'Message sent successfully to all recipients',
      recipientCount: recipients.length 
    });
  } catch (err) {
    await connection.rollback();
    console.error('sendMessages error:', err);
    res.status(500).json({ error: 'Failed to send messages' });
  } finally {
    connection.release();
  }
}

async function sendSingleMessage(req, res) {
  const { recipient_id, subject, message, senderId } = req.body;

  if (!recipient_id || !message) {
    return res.status(400).json({ error: 'Recipient and message are required' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Save message to database
    const [result] = await connection.query(
      `INSERT INTO messages (sender_id, recipient_id, subject, message, sent_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [senderId || null, recipient_id, subject || 'No Subject', message]
    );

    await connection.commit();

    // 2. SEND NOTIFICATION TO RECIPIENT
    try {
      // Get sender info
      const [senderRows] = await connection.query(
        'SELECT name, username FROM users WHERE id = ?',
        [senderId]
      );
      
      const senderName = senderRows?.[0]?.name || senderRows?.[0]?.username || 'Trainer';

      // Send notification to recipient
      await pushService.sendToUser(
        recipient_id,
        'New Message',
        `You have a new message from ${senderName}. Subject: ${subject || 'No Subject'}`,
        {
          type: 'new_message',
          senderId: senderId?.toString() || 'unknown',
          senderName,
          subject: subject || '',
          messagePreview: message.substring(0, 100),
        }
      );

      console.log(`✅ Single message notification sent to member ${recipient_id}`);
    } catch (notificationError) {
      console.warn('Failed to send message notification:', notificationError.message);
      // Don't fail the request if notification fails
    }

    res.json({ 
      success: true, 
      message: 'Message sent successfully',
      messageId: result.insertId 
    });
  } catch (err) {
    await connection.rollback();
    console.error('sendSingleMessage error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  } finally {
    connection.release();
  }
}

async function getMessageHistory(req, res) {
  try {
    const [messages] = await db.query(
      `SELECT * FROM messages ORDER BY sent_at DESC LIMIT 100`
    );

    // Parse recipients_json for each message
    const parsedMessages = messages.map(msg => ({
      ...msg,
      recipients: msg.recipients_json ? 
        (typeof msg.recipients_json === 'string' ? 
          JSON.parse(msg.recipients_json) : 
          msg.recipients_json) 
        : []
    }));

    res.json(parsedMessages);
  } catch (err) {
    console.error('getMessageHistory error:', err);
    res.status(500).json({ error: 'Query failed' });
  }
}

module.exports = { sendMessages, sendSingleMessage, getMessageHistory };
```

---

## Key Points

### PT Form Notifications
- ✅ Sent when `completed = true` in the request
- ✅ Notification type: `pt_form_status`
- ✅ Includes trainer name and form ID
- ✅ Sent to the trainee user (gym_members table)

### Message Notifications
- ✅ Sent immediately after message is saved
- ✅ Notification type: `new_message`
- ✅ Includes sender name and message subject
- ✅ Sent to each recipient individually

### Notification Routing (Frontend)
Both notification types are already handled in `hooks/useNotifications.ts`:
- `pt_form_status` → routes to `/(tabs)/more`
- `new_message` → routes to `/(trainers)/messages`

### How It Works (Full Flow)

**PT Form:**
1. Trainer submits PT form from app with `completed: true`
2. Backend saves to database
3. Backend calls `pushService.sendToUser(memberId, ...)`
4. Trainee receives notification
5. Trainee taps notification → app routes to `/(tabs)/more`

**Message:**
1. Trainer sends message from app to 1+ recipients
2. Backend saves message to database
3. Backend loops through recipients
4. Backend calls `pushService.sendToUser(recipientId, ...)` for each
5. Each trainee receives notification
6. Each taps notification → app routes to `/(trainers)/messages`

---

## Testing

### Test PT Form Notification
```bash
curl -X POST http://localhost:3000/api/pt-forms \
  -H "Content-Type: application/json" \
  -d '{
    "member_id": 123,
    "user_id": 456,
    "formData": {"name": "John", "age": 30},
    "completed": true
  }'
```

### Test Message Notification
```bash
curl -X POST http://localhost:3000/api/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Workout Update",
    "message": "Your new workout is ready",
    "recipients": [
      {"id": 123, "name": "John", "email": "john@example.com"}
    ],
    "senderId": 456
  }'
```

---

## Summary

Both PT forms and messages now follow the same notification pattern as orders/diets/workouts:
- **Web trainer actions** → Backend sends notification via `pushService`
- **App trainee sees notification** → Can tap to view details
- **Notification type** is consistent and properly routed

No further client-side changes needed—the app already has all the routing in place!
