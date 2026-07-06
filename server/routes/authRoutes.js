/**
 * @file server/routes/authRoutes.js
 * @description Authentication routes for registration, login, profile, Google auth, and password management.
 * All routes are prefixed with /api/auth (configured in server.js).
 */

const express = require('express');
const router = express.Router();
const {
  register, login, forgotPassword, resetPassword,
  getMe, updateProfile, changePassword, googleLogin, githubLogin,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

/* ── Public routes ─────────────────────────────────────────────────── */
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/google', googleLogin);
router.post('/github', githubLogin);

/* ── Protected routes (require JWT) ────────────────────────────────── */
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;

