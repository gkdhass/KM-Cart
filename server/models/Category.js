/**
 * @file server/models/Category.js
 * @description Mongoose model for Category collection.
 * K_M_Cart Grocery Store — dynamic category management.
 */

const mongoose = require('mongoose');

/**
 * Category Schema — K_M_Cart Grocery Store
 */
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/** Index on name for unique lookups */
categorySchema.index({ name: 1 });

/** Index on order for sorted queries */
categorySchema.index({ order: 1 });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
