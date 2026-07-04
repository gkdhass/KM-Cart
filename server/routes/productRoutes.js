/**
 * @file server/routes/productRoutes.js
 * @description Product routes for listing, detail, and review endpoints.
 * Prefixed with /api/products (configured in server.js).
 */

const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  addReview,
  toggleReviewLike,
} = require('../controllers/productController');
const { imageSearch } = require('../controllers/imageSearchController');
const { protect } = require('../middleware/authMiddleware');
const { upload, handleMulterError } = require('../middleware/upload');

/**
 * @route   POST /api/products/image-search
 * @desc    Search products by uploading product image (OCR-based)
 * @access  Public
 */
router.post('/image-search', upload.single('image'), handleMulterError, imageSearch);

/**
 * @route   GET /api/products
 * @desc    Get all products with optional filters
 * @access  Public
 * @query   category, maxPrice, search, page, limit
 */
router.get('/', getProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by MongoDB ObjectId
 * @access  Public
 */
router.get('/:id', getProductById);

/**
 * @route   POST /api/products/:id/reviews
 * @desc    Submit a review for a product
 * @access  Private
 */
router.post('/:id/reviews', protect, addReview);

/**
 * @route   PUT /api/products/:id/reviews/:reviewId/like
 * @desc    Toggle like/helpful on a review
 * @access  Private
 */
router.put('/:id/reviews/:reviewId/like', protect, toggleReviewLike);

module.exports = router;
