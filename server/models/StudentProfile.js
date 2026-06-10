const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    university: {
      type: String,
      trim: true,
    },
    degree: {
      type: String,
      trim: true,
    },
    branch: {
      type: String,
      trim: true,
    },
    graduationYear: {
      type: Number,
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: String,
      trim: true,
    },
    linkedinUrl: {
      type: String,
      match: [/^https?:\/\/(www\.)?linkedin\.com\/.*$/, 'Please provide a valid LinkedIn URL'],
    },
    githubUrl: {
      type: String,
      match: [/^https?:\/\/(www\.)?github\.com\/.*$/, 'Please provide a valid GitHub URL'],
    },
    portfolioUrl: {
      type: String,
      match: [/^https?:\/\/.*/, 'Please provide a valid URL'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
