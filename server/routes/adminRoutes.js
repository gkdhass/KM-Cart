/**
 * @file server/routes/adminRoutes.js
 * @description Admin API routes for dashboard, products, orders, users, analytics.
 * All routes are protected by JWT auth + admin role check.
 * Prefixed with /api/admin (configured in server.js).
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const {
  getDashboardStats,
  getChartPieData,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  updateUserRole,
  toggleBanUser,
  deleteUser,
  getUserOrders,
  getAnalyticsData,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/adminController');

// Apply auth + admin middleware to ALL routes in this router
router.use(protect, adminOnly);

/* ── Dashboard ─────────────────────────────────────────────────────── */
router.get('/stats', getDashboardStats);
router.get('/charts/piedata', getChartPieData);

/* ── Categories ────────────────────────────────────────────────────── */
router.get('/categories', getAdminCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

/* ── Products ──────────────────────────────────────────────────────── */
router.get('/products', getAllProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

/* ── Orders ────────────────────────────────────────────────────────── */
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

/* ── Users ─────────────────────────────────────────────────────────── */
router.get('/users', getAllUsers);
router.get('/users/:id/orders', getUserOrders);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/ban', toggleBanUser);
router.delete('/users/:id', deleteUser);

/* ── Analytics ─────────────────────────────────────────────────────── */
router.get('/analytics', getAnalyticsData);

module.exports = router;
