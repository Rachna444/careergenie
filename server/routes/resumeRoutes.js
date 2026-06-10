const express = require('express');
const { uploadResume, analyzeResume, getResumeReport } = require('../controllers/resumeController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post(
  '/upload',
  protect,
  authorize('student'),
  upload.single('file'), // Multer middleware
  uploadResume
);

router.post('/analyze/:resumeId', protect, authorize('student'), analyzeResume);
router.get('/report/:resumeId', protect, authorize('student'), getResumeReport);

module.exports = router;
