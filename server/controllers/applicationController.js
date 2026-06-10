const Application = require('../models/Application');
const Job = require('../models/Job');
const StudentProfile = require('../models/StudentProfile');
const Resume = require('../models/Resume');
const { calculateMatchScore } = require('../services/matchingService');
const { createNotification } = require('../services/notificationService');

// @desc    Apply for a job
// @route   POST /api/v1/applications
// @access  Private (Student)
exports.applyForJob = async (req, res, next) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Please provide a jobId' });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({ studentId: req.user.id, jobId });
    if (existingApplication) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    }

    // Calculate match percentage dynamically
    const profile = await StudentProfile.findOne({ userId: req.user.id });
    const resume = await Resume.findOne({ studentId: req.user.id }).sort({ uploadedAt: -1 });
    const matchPercentage = calculateMatchScore(job, profile, resume);

    const application = await Application.create({
      studentId: req.user.id,
      jobId,
      matchPercentage
    });

    // Fire Notification
    await createNotification(
      req.user.id,
      'Job Application Submitted',
      `You have successfully applied for the job: ${job.title} at ${job.company}.`
    );

    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all applications for the student
// @route   GET /api/v1/applications
// @access  Private (Student)
exports.getApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ studentId: req.user.id })
      .populate('jobId')
      .sort({ appliedAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Withdraw application
// @route   DELETE /api/v1/applications/:applicationId
// @access  Private (Student)
exports.withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.applicationId);

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.studentId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to withdraw this application' });
    }

    await application.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// ======================== RECRUITER APIs ========================= //

// @desc    Get applicants for a job
// @route   GET /api/v1/recruiter/jobs/:jobId/applicants
// @access  Private (Recruiter)
exports.getApplicants = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.recruiterId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view applicants for this job' });
    }

    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('studentId', 'name email profileImage')
      .sort({ matchPercentage: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update application status
// @route   PUT /api/v1/recruiter/applications/:applicationId/status
// @access  Private (Recruiter)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ['applied', 'under_review', 'shortlisted', 'interview', 'selected', 'rejected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    let application = await Application.findById(req.params.applicationId).populate('jobId');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Verify the recruiter owns the job this application is for
    if (application.jobId.recruiterId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this application' });
    }

    application.status = status;
    await application.save();

    // Fire Notification to the Student
    await createNotification(
      application.studentId._id || application.studentId,
      'Application Status Updated',
      `Your application for ${application.jobId.title} is now: ${status}.`
    );

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    next(error);
  }
};
