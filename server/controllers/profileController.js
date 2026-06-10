const StudentProfile = require('../models/StudentProfile');

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ userId: req.user.id }).populate('userId', 'name email role profileImage');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private (Student)
exports.updateProfile = async (req, res, next) => {
  try {
    const {
      university,
      degree,
      branch,
      graduationYear,
      skills,
      experience,
      linkedinUrl,
      githubUrl,
      portfolioUrl
    } = req.body;

    const profileFields = {
      userId: req.user.id,
      university,
      degree,
      branch,
      graduationYear,
      skills,
      experience,
      linkedinUrl,
      githubUrl,
      portfolioUrl
    };

    // Remove undefined fields
    Object.keys(profileFields).forEach(key => profileFields[key] === undefined && delete profileFields[key]);

    // Check if profile exists
    let profile = await StudentProfile.findOne({ userId: req.user.id });

    if (profile) {
      // Update existing profile
      profile = await StudentProfile.findOneAndUpdate(
        { userId: req.user.id },
        { $set: profileFields },
        { new: true, runValidators: true }
      ).populate('userId', 'name email role profileImage');

      return res.status(200).json({
        success: true,
        data: profile
      });
    }

    // Create new profile
    profile = await StudentProfile.create(profileFields);
    
    // Using populate after create
    profile = await StudentProfile.findById(profile._id).populate('userId', 'name email role profileImage');

    res.status(201).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};
