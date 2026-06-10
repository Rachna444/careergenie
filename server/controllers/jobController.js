const Job = require('../models/Job');
const StudentProfile = require('../models/StudentProfile');
const Resume = require('../models/Resume');
const { calculateMatchScore } = require('../services/matchingService');
const { createNotification } = require('../services/notificationService');

// @desc    Create new job
// @route   POST /api/v1/jobs
// @access  Private (Recruiter)
exports.createJob = async (req, res, next) => {
  try {
    req.body.recruiterId = req.user.id;

    // Optional: Add default status if not provided
    if (!req.body.status) {
      req.body.status = 'pending';
    }

    const job = await Job.create(req.body);

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all jobs
// @route   GET /api/v1/jobs
// @access  Public
exports.getJobs = async (req, res, next) => {
  try {
    let query = {};
    
    // Parse query params for filtering
    const reqQuery = { ...req.query };

    // Example of filtering by status or other fields if provided
    if (reqQuery.status) {
      query.status = reqQuery.status;
    }

    const jobs = await Job.find(query).populate('recruiterId', 'name email');

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single job
// @route   GET /api/v1/jobs/:id
// @access  Public
exports.getJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('recruiterId', 'name email');

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update job
// @route   PUT /api/v1/jobs/:id
// @access  Private (Recruiter)
exports.updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Make sure user is job owner
    if (job.recruiterId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'User not authorized to update this job' });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete job
// @route   DELETE /api/v1/jobs/:id
// @access  Private (Recruiter)
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Make sure user is job owner
    if (job.recruiterId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'User not authorized to delete this job' });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get matched jobs for student
// @route   GET /api/v1/jobs/matches
// @access  Private (Student)
exports.getJobMatches = async (req, res, next) => {
  try {
    // 1. Fetch Student Profile and latest Resume
    const profile = await StudentProfile.findOne({ userId: req.user.id });
    const resume = await Resume.findOne({ studentId: req.user.id }).sort({ uploadedAt: -1 });

    // 2. Fetch active jobs (we'll show pending and approved jobs for demonstration)
    const jobs = await Job.find({ status: { $in: ['pending', 'approved'] } });

    // 3. Calculate match score for each job
    const matchedJobs = jobs.map(job => {
      const matchPercentage = calculateMatchScore(job, profile, resume);
      return {
        _id: job._id,
        title: job.title,
        company: job.company,
        matchPercentage
      };
    });

    // 4. Sort by highest match score
    matchedJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);

    // If top match is strong, fire a notification
    if (matchedJobs.length > 0 && matchedJobs[0].matchPercentage >= 70) {
      await createNotification(
        req.user.id,
        'New Job Matches Found',
        `We found ${matchedJobs.filter(j => j.matchPercentage >= 70).length} highly matching jobs based on your profile!`
      );
    }

    res.status(200).json({
      success: true,
      count: matchedJobs.length,
      data: matchedJobs
    });
  } catch (error) {
    next(error);
  }
};
