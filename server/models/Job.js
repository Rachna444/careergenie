const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a job title'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Please add a company name'],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      trim: true,
    },
    salary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a job description'],
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    eligibility: {
      type: String,
    },
    deadline: {
      type: Date,
      required: [true, 'Please add an application deadline'],
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'closed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Job', jobSchema);
