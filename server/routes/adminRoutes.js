const express = require('express');
const {
  getStats,
  getUsers,
  updateUserRole,
  approveJob,
  deleteJob
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth and admin role check to all routes in this router
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:userId/role', updateUserRole);
router.put('/jobs/:jobId/approve', approveJob);
router.delete('/jobs/:jobId', deleteJob);

module.exports = router;
