/**
 * @file server/models/Product.js
 * @description Mongoose model for Product collection.
 * K_M_Cart Grocery Store — supports 17 grocery categories with Tamil names.
 */

const mongoose = require('mongoose');

/** Valid unit types for grocery products */
const UNIT_OPTIONS = ['Kg', 'Liter', 'Pack', 'Piece'];

/**
 * Sub-schema for product reviews.
 */
const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userName: {
      type: String,
      required: [true, 'Reviewer name is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => v.length <= 3,
        message: 'A review can have at most 3 images',
      },
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

/**
 * Product Schema — K_M_Cart Grocery Store
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    nameTamil: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    originalPrice: {
      type: Number,
      default: 0,
      min: [0, 'Original price cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [90, 'Discount cannot exceed 90%'],
    },
    unit: {
      type: String,
      enum: {
        values: UNIT_OPTIONS,
        message: `Unit must be one of: ${UNIT_OPTIONS.join(', ')}`,
      },
      required: [true, 'Product unit is required'],
      default: 'Kg',
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
    },
    image: {
      type: String,
      default: 'https://placehold.co/300x300/16A34A/FFFFFF?text=Product',
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => v.length <= 10,
        message: 'A product can have at most 10 images',
      },
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      default: 100,
      min: [0, 'Stock cannot be negative'],
    },
    rating: {
      type: Number,
      default: 4.0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot exceed 5'],
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: [0, 'Review count cannot be negative'],
    },
    brand: {
      type: String,
      trim: true,
      default: 'K_M_Cart Fresh',
    },
    sizes: {
      type: [String],
      default: [],
    },
    colors: {
      type: [String],
      default: [],
    },
    reviews: {
      type: [reviewSchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    gender: {
      type: String,
      default: 'all',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

/** Compound index on category and price for efficient filtering */
productSchema.index({ category: 1, price: 1 });

/** Index on brand for brand-based queries */
productSchema.index({ brand: 1 });

/** Index on tags for tag-based search */
productSchema.index({ tags: 1 });

/** Text index on name, nameTamil, and description for keyword search */
productSchema.index({ name: 'text', nameTamil: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
