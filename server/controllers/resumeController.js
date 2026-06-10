const Resume = require('../models/Resume');
const { streamUpload } = require('../utils/cloudinary');
const { extractTextFromResume } = require('../services/resumeParser');
const { analyzeResumeWithAI } = require('../services/aiService');
const { createNotification } = require('../services/notificationService');

// @desc    Upload resume
// @route   POST /api/v1/resume/upload
// @access  Private (Student)
exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    // Upload to Cloudinary
    let result;
    try {
      result = await streamUpload(req);
    } catch (uploadError) {
      console.error(uploadError);
      return res.status(500).json({ success: false, message: 'File upload to cloud failed' });
    }

    // Create Resume record
    const resume = await Resume.create({
      studentId: req.user.id,
      fileUrl: result.secure_url,
    });

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: resume
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze resume
// @route   POST /api/v1/resume/analyze/:resumeId
// @access  Private (Student)
exports.analyzeResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.resumeId);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // Ensure the student owns the resume
    if (resume.studentId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to analyze this resume' });
    }

    // Extract text from the uploaded file buffer URL
    const extractedText = await extractTextFromResume(resume.fileUrl);

    // Analyze with Gemini AI
    const analysis = await analyzeResumeWithAI(extractedText);

    // Update Resume record
    resume.extractedText = extractedText;
    resume.resumeScore = analysis.resumeScore;
    resume.atsScore = analysis.atsScore;
    resume.strengths = analysis.strengths;
    resume.weaknesses = analysis.weaknesses;
    resume.missingSkills = analysis.missingSkills;
    resume.aiFeedback = analysis.aiFeedback;
    resume.projectSuggestions = analysis.projectSuggestions;
    resume.careerRecommendations = analysis.careerRecommendations;

    await resume.save();

    // Fire Notification
    await createNotification(
      req.user.id,
      'Resume Analysis Completed',
      `Your resume has been successfully analyzed by AI. Score: ${analysis.resumeScore}, ATS Score: ${analysis.atsScore}.`
    );

    res.status(200).json({
      success: true,
      message: 'Resume analyzed successfully',
      data: {
        resumeScore: resume.resumeScore,
        atsScore: resume.atsScore,
        strengths: resume.strengths,
        weaknesses: resume.weaknesses,
        missingSkills: resume.missingSkills,
        aiFeedback: resume.aiFeedback,
        projectSuggestions: resume.projectSuggestions,
        careerRecommendations: resume.careerRecommendations
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get resume report
// @route   GET /api/v1/resume/report/:resumeId
// @access  Private (Student)
exports.getResumeReport = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.resumeId);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // Ensure the student owns the resume
    if (resume.studentId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this report' });
    }

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    next(error);
  }
};
