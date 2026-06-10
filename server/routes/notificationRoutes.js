const express = require('express');
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getNotifications);

router.route('/:notificationId/read')
  .put(protect, markAsRead);

module.exports = router;
