const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    extractedText: String,
    resumeScore: Number,
    atsScore: Number,
    strengths: [String],
    weaknesses: [String],
    missingSkills: [String],
    aiFeedback: [String],
    projectSuggestions: [String],
    careerRecommendations: [String],
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Resume', resumeSchema);
