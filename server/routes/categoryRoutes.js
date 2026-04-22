/**
 * @file server/routes/categoryRoutes.js
 * @description Public category API route.
 * Returns all active categories for product listing filters.
 * Prefixed with /api/categories (configured in server.js).
 */

const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

/**
 * @route   GET /api/categories
 * @desc    Get all active categories (public, for product filters)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error('[getCategories] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
});

module.exports = router;
