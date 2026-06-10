const Notification = require('../models/Notification');

exports.createNotification = async (userId, title, message) => {
  try {
    await Notification.create({
      userId,
      title,
      message
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
