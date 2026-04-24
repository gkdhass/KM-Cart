/**
 * @file server/controllers/productController.js
 * @description Product controller for handling product listing and detail endpoints.
 * Supports filtering by category, price range, search, sorting, and pagination.
 */

const Product = require('../models/Product');

/**
 * @route   GET /api/products
 * @desc    Get all products with advanced filtering, search, sort, pagination
 * @access  Public
 * @query   search, category, minPrice, maxPrice, minRating, brand, sort, page, limit
 */
const getProducts = async (req, res) => {
  try {
    const {
      search    = '',
      category  = '',
      minPrice  = '',
      maxPrice  = '',
      minRating = '',
      brand     = '',
      sort      = 'rating',
      page      = 1,
      limit     = 12
    } = req.query;

    const andConditions = [];

    // ── SEARCH (name + brand + description + tags) ───────────────
    if (search && search.trim().length > 0) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      andConditions.push({
        $or: [
          { name:        searchRegex },
          { brand:       searchRegex },
          { description: searchRegex },
          { tags:        { $elemMatch: { $regex: search.trim(), $options: 'i' } } }
        ]
      });
    }

    // ── CATEGORY ─────────────────────────────────────────────────
    if (category && category.trim() && category.trim() !== 'all') {
      andConditions.push({ category: { $regex: new RegExp(`^${category.trim()}$`, 'i') } });
    }

    // ── PRICE RANGE ───────────────────────────────────────────────
    if (minPrice || maxPrice) {
      const priceQ = {};
      if (minPrice && !isNaN(minPrice)) priceQ.$gte = Number(minPrice);
      if (maxPrice && !isNaN(maxPrice)) priceQ.$lte = Number(maxPrice);
      if (Object.keys(priceQ).length) andConditions.push({ price: priceQ });
    }

    // ── RATING FILTER ─────────────────────────────────────────────
    if (minRating && !isNaN(minRating)) {
      andConditions.push({ rating: { $gte: Number(minRating) } });
    }

    // ── BRAND FILTER ──────────────────────────────────────────────
    if (brand && brand.trim()) {
      // Support comma-separated brands: "samsung,apple"
      const brands = brand.split(',').map(b => b.trim()).filter(Boolean);
      if (brands.length === 1) {
        andConditions.push({ brand: { $regex: brands[0], $options: 'i' } });
      } else {
        andConditions.push({
          $or: brands.map(b => ({ brand: { $regex: b, $options: 'i' } }))
        });
      }
    }

    // ── COMBINE ALL CONDITIONS ────────────────────────────────────
    const query = andConditions.length > 0 ? { $and: andConditions } : {};

    // ── SORT ──────────────────────────────────────────────────────
    const sortMap = {
      rating:     { rating: -1, reviewCount: -1 },
      price_asc:  { price:  1 },
      price_desc: { price: -1 },
      reviews:    { reviewCount: -1 },
      discount:   { discount: -1 },
      newest:     { createdAt: -1 },
      featured:   { rating: -1 }
    };
    const sortObj = sortMap[sort] || { rating: -1 };

    // ── PAGINATION ────────────────────────────────────────────────
    const pageNum   = Math.max(1, parseInt(page)  || 1);
    const limitNum  = Math.min(50, parseInt(limit) || 12);
    const skip      = (pageNum - 1) * limitNum;

    const [products, totalCount] = await Promise.all([
      Product.find(query).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(query)
    ]);

    return res.json({
      success:     true,
      products,
      totalCount,
      page:        pageNum,
      totalPages:  Math.ceil(totalCount / limitNum),
      hasNextPage: pageNum < Math.ceil(totalCount / limitNum)
    });

  } catch (error) {
    console.error('[getProducts] Error:', error);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

/**
 * @route   GET /api/products/:id
 * @desc    Get a single product by its MongoDB ObjectId (includes reviews)
 * @access  Public
 *
 * @param {String} req.params.id - Product MongoDB ObjectId
 * @returns {Object} { success, data: product }
 */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Get product by ID error:', error.message);

    // Handle invalid ObjectId format
    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch product details.',
    });
  }
};

/**
 * @route   POST /api/products/:id/reviews
 * @desc    Add a review to a product
 * @access  Private (requires auth)
 *
 * @body {Number} rating   - 1–5 star rating (required)
 * @body {String} comment  - Review text (required, min 10 chars)
 * @body {Array}  images   - Optional array of Base64 data-URI strings (max 3)
 */
const addReview = async (req, res) => {
  try {
    const { rating, comment, images } = req.body;

    // ── Validation ─────────────────────────────────────────────────
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5.',
      });
    }

    if (!comment || comment.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Review comment must be at least 10 characters.',
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Prevent duplicate reviews from the same user
    const alreadyReviewed = product.reviews.find(
      (r) => r.userId?.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product.',
      });
    }

    // ── Build review object ────────────────────────────────────────
    const review = {
      userId: req.user._id,
      userName: req.user.name,
      rating: Number(rating),
      comment: comment.trim(),
      images: Array.isArray(images) ? images.slice(0, 3) : [],
      likes: [],
    };

    product.reviews.push(review);

    // ── Recalculate aggregate rating ───────────────────────────────
    product.reviewCount = product.reviews.length;
    product.rating =
      product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviewCount;

    await product.save();

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      data: product.reviews[product.reviews.length - 1],
    });
  } catch (error) {
    console.error('[addReview] Error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid product ID.' });
    }
    return res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
};

/**
 * @route   PUT /api/products/:id/reviews/:reviewId/like
 * @desc    Toggle like (helpful) on a review
 * @access  Private (requires auth)
 */
const toggleReviewLike = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const review = product.reviews.id(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    const userId = req.user._id.toString();
    const likeIndex = review.likes.findIndex((id) => id.toString() === userId);

    if (likeIndex > -1) {
      // Already liked → remove
      review.likes.splice(likeIndex, 1);
    } else {
      // Not liked → add
      review.likes.push(req.user._id);
    }

    await product.save();

    return res.json({
      success: true,
      liked: likeIndex === -1, // true if just added
      likeCount: review.likes.length,
    });
  } catch (error) {
    console.error('[toggleReviewLike] Error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to toggle like.' });
  }
};

module.exports = { getProducts, getProductById, addReview, toggleReviewLike };
