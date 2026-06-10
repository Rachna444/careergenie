const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Test route for role-based middleware
router.get('/admin', protect, authorize('admin'), (req, res) => {
  res.status(200).json({ success: true, message: 'Admin access granted' });
});

module.exports = router;
