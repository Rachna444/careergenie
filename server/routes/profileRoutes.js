const express = require('express');
const { getProfile, updateProfile } = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, authorize('student'), updateProfile);

module.exports = router;
