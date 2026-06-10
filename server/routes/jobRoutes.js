const express = require('express');
const {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  getJobMatches
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(getJobs)
  .post(protect, authorize('recruiter'), createJob);

// This must go BEFORE /:id
router.route('/matches')
  .get(protect, authorize('student'), getJobMatches);

router.route('/:id')
  .get(getJob)
  .put(protect, authorize('recruiter'), updateJob)
  .delete(protect, authorize('recruiter'), deleteJob);

module.exports = router;
