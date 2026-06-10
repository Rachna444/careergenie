const express = require('express');
const {
  getApplicants,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/v1/recruiter/jobs/:jobId/applicants
router.get('/jobs/:jobId/applicants', protect, authorize('recruiter'), getApplicants);

// PUT /api/v1/recruiter/applications/:applicationId/status
router.put('/applications/:applicationId/status', protect, authorize('recruiter'), updateApplicationStatus);

module.exports = router;
