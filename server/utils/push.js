const { Expo } = require('expo-server-sdk');
const Notification = require('../models/Notification');
const User = require('../models/User');

const expo = new Expo();

/**
 * Send an Expo Push Notification to a user and save it to their notification inbox
 */
const sendPushNotification = async ({ userId, title, body, type = 'system', data = {} }) => {
  try {
    // 1. Save Notification document in DB
    const notification = new Notification({
      userId,
      title,
      body,
      type,
      data,
      read: false,
    });
    await notification.save();

    // 2. Fetch user's registered push token
    const user = await User.findById(userId);
    if (!user || !user.pushToken) {
      return notification; // User has no push token registered; DB notification saved
    }

    if (!Expo.isExpoPushToken(user.pushToken)) {
      console.warn(`[Push] Invalid Expo push token for user ${user.name}: ${user.pushToken}`);
      return notification;
    }

    // 3. Construct push message payload
    const messages = [
      {
        to: user.pushToken,
        sound: 'default',
        title,
        body,
        data: { ...data, type },
        priority: 'high',
        channelId: 'carequeue-alerts',
      },
    ];

    // 4. Send chunks via Expo push service
    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        await expo.sendPushNotificationsAsync(chunk);
      } catch (err) {
        console.error('[Push Transmission Error]', err);
      }
    }

    return notification;
  } catch (error) {
    console.error('[Push Notification Error]', error.message);
    return null;
  }
};

module.exports = {
  sendPushNotification,
  isExpoPushToken: Expo.isExpoPushToken,
};
