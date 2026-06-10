const express = require('express');
const {
  applyForJob,
  getApplications,
  withdrawApplication
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, authorize('student'), getApplications)
  .post(protect, authorize('student'), applyForJob);

router.route('/:applicationId')
  .delete(protect, authorize('student'), withdrawApplication);

module.exports = router;
