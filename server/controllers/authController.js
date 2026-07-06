/**
 * @file server/controllers/authController.js
 * @description Authentication controller handling user registration, login, and forgot password.
 * Generates JWT tokens upon successful authentication.
 * All passwords are hashed via the User model's pre-save hook.
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendPasswordResetEmail } = require('../services/emailService');

/** JWT token expiration time */
const JWT_EXPIRES_IN = '7d';

/**
 * Generates a JWT token for a given user ID.
 * @param {String} userId - MongoDB ObjectId of the user
 * @returns {String} Signed JWT token
 */
const generateToken = (userId, role = 'user') => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account
 * @access  Public
 *
 * @param {Object} req.body - { name, email, password }
 * @returns {Object} { success, message, data: { user, token } }
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ── Validation ───────────────────────────────────────────────────
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // ── Check for existing user ──────────────────────────────────────
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // ── Create new user ──────────────────────────────────────────────
    // Password will be hashed automatically by the pre-save hook in User model
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    // ── Generate JWT token ───────────────────────────────────────────
    const token = generateToken(user._id, user.role);

    // ── Return success response (password excluded via toJSON method) ─
    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to K_M_Cart.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Registration error:', error.message);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. '),
      });
    }

    // Handle duplicate key error (duplicate email)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.',
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT token
 * @access  Public
 *
 * @param {Object} req.body - { email, password }
 * @returns {Object} { success, message, data: { user, token } }
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── Validation ───────────────────────────────────────────────────
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    // ── Find user (include password for comparison) ──────────────────
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // ── Compare password ─────────────────────────────────────────────
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // ── Generate JWT token ───────────────────────────────────────────
    const token = generateToken(user._id, user.role);

    // ── Return success response ──────────────────────────────────────
    res.status(200).json({
      success: true,
      message: 'Login successful! Welcome back.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.',
    });
  }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Generate a password reset token and log the reset URL (dev mode)
 * @access  Public
 *
 * @param {Object} req.body - { email }
 * @returns {Object} { success, message }
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // SECURITY: Always return same message whether user exists or not
    // (prevents email enumeration attack)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If this email exists, a reset link has been sent.',
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Save hashed token to user with 15-minute expiration
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    // Construct reset URL
    const resetURL = (process.env.CLIENT_URL || 'http://localhost:5173') + '/reset-password/' + resetToken;

    // Attempt to send email (don't expose errors to user for anti-enumeration)
    try {
      await sendPasswordResetEmail(user.email, resetURL);
      console.log(`[AUTH] Password reset email sent successfully to ${user.email}`);
    } catch (emailError) {
      // Log the error server-side but don't expose it to the user
      console.error('[AUTH] Failed to send password reset email:', emailError.message);
      // Continue and return success to maintain anti-enumeration
    }

    return res.status(200).json({
      success: true,
      message: 'If this email exists, a reset link has been sent.',
      // Only in development — include reset URL for testing:
      ...(process.env.NODE_ENV === 'development' && { devResetUrl: resetURL }),
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Reset password using token from email
 * @access  Public
 *
 * @param {String} req.params.token - Reset token from email link
 * @param {String} req.body.password - New password
 * @returns {Object} { success, message }
 */
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Validate inputs
    if (!password) {
      return res.status(400).json({ success: false, message: 'Password is required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Hash the token to match the stored hash
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid, non-expired token
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token. Please request a new password reset.',
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    console.log(`[AUTH] Password reset successful for user: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};


/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user profile
 * @access  Private (requires JWT)
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id || req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('getMe error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile (name, phone, address)
 * @access  Private (requires JWT)
 */
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, profilePhoto } = req.body;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;

    const user = await User.findByIdAndUpdate(
      req.user._id || req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('updateProfile error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password (requires current password)
 * @access  Private (requires JWT)
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id || req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword; // Pre-save hook will hash it
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('changePassword error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route   POST /api/auth/google
 * @desc    Login or register via Google OAuth
 * @access  Public
 */
const googleLogin = async (req, res) => {
  try {
    const { name, email, photo, googleId } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required from Google' });
    }

    // Check if user already exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Create new user with a hashed pseudo-password
      user = await User.create({
        name: name || 'Google User',
        email: email.toLowerCase().trim(),
        password: googleId + crypto.randomBytes(16).toString('hex'), // Will be hashed by pre-save hook
        profilePhoto: photo || '',
        googleId,
      });
    }

    // Check if banned
    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'This account has been suspended.' });
    }

    // Generate JWT with role
    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'Google login successful!',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePhoto: user.profilePhoto,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Google login error:', error.message);
    res.status(500).json({ success: false, message: 'Google login failed. Please try again.' });
  }
};

/**
 * @route   POST /api/auth/github
 * @desc    Login or register via GitHub OAuth
 * @access  Public
 */
const githubLogin = async (req, res) => {
  try {
    const { name, email, photo, githubId } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email not found in GitHub account. Make your email public on GitHub.',
      });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({
        name: name || 'GitHub User',
        email: email.toLowerCase().trim(),
        password: githubId + crypto.randomBytes(16).toString('hex'),
        profilePhoto: photo || '',
        githubId,
      });
    }

    if (user.isBanned) {
      return res.status(403).json({ success: false, message: 'This account has been suspended.' });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      message: 'GitHub login successful!',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePhoto: user.profilePhoto,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error('GitHub login error:', error.message);
    res.status(500).json({ success: false, message: 'GitHub login failed. Please try again.' });
  }
};

module.exports = { register, login, forgotPassword, resetPassword, getMe, updateProfile, changePassword, googleLogin, githubLogin };


