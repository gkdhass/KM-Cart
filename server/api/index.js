/**
 * @file server/api/index.js
 * @description Vercel Serverless entry point for K_M_Cart backend.
 * Converts the Express app into a serverless function with cached
 * MongoDB connection to minimize cold-start latency.
 *
 * This file mirrors server.js but:
 * - Does NOT call app.listen()
 * - Exports a default serverless handler
 * - Caches the MongoDB connection across warm invocations
 * - Handles CORS preflight explicitly (required for Vercel)
 */

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load .env for local testing (Vercel ignores this in production)
dotenv.config();

// ─────────────────────────────────────────────────────────────────────
// Import route modules (relative to server/ directory)
// ─────────────────────────────────────────────────────────────────────
const authRoutes = require('../routes/authRoutes');
const chatbotRoutes = require('../routes/chatbotRoutes');
const productRoutes = require('../routes/productRoutes');
const orderRoutes = require('../routes/orderRoutes');
const paymentRoutes = require('../routes/paymentRoutes');
const adminRoutes = require('../routes/adminRoutes');
const categoryRoutes = require('../routes/categoryRoutes');

// ─────────────────────────────────────────────────────────────────────
// EXPRESS APP SETUP
// ─────────────────────────────────────────────────────────────────────
const app = express();

// ── CORS Configuration ──────────────────────────────────────────────
// Allow all origins — Vercel headers in vercel.json handle CORS at
// the infrastructure level. Express just needs to not block anything.
// This avoids origin mismatch issues between different Vercel subdomains
// (e.g., kmcart.vercel.app vs km-cart.vercel.app).
app.use(cors({
  origin: true, // Reflect the request origin (allows any origin)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle OPTIONS preflight explicitly — CRITICAL for Vercel serverless
app.options('*', cors());

// ── Body Parsers ────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────────────────────────
// CACHED MONGODB CONNECTION (Critical for Serverless Performance)
// ─────────────────────────────────────────────────────────────────────
// Vercel serverless functions are stateless, but the runtime may reuse
// the same container across invocations ("warm starts"). We cache the
// connection to avoid reconnecting on every single request.

let cachedConnection = null;

const connectDB = async () => {
  // Return early if already connected
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return;
  }

  // Verify the env var exists before attempting connection
  if (!process.env.MONGODB_URI) {
    throw new Error(
      'MONGODB_URI environment variable is not set. ' +
      'Add it in Vercel Dashboard → Project Settings → Environment Variables.'
    );
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    cachedConnection = conn;
    console.log('✅ MongoDB Connected:', conn.connection.host);
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    cachedConnection = null;
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────────────────────────────

/**
 * Root endpoint — API overview with available endpoints.
 * Visit: https://your-server.vercel.app/
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: "KM Cart API is running 🚀",
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/api/health",
      auth: "/api/auth",
      products: "/api/products",
      orders: "/api/orders",
      payment: "/api/payment",
      chatbot: "/api/chatbot",
      admin: "/api/admin",
      categories: "/api/categories",
    }
  });
});

/**
 * Root health check — works even if DB is down.
 * Visit: https://your-server.vercel.app/api
 */
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'K_M_Cart API is running on Vercel! 🚀',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    dbConnected: mongoose.connection.readyState === 1,
  });
});

/**
 * Full health check including DB status.
 * Visit: https://your-server.vercel.app/api/health
 */
app.get('/api/health', async (req, res) => {
  try {
    await connectDB();
    res.status(200).json({
      success: true,
      message: 'K_M_Cart API + Database are healthy! ✅',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

/** Authentication routes (register, login, forgot-password) */
app.use('/api/auth', authRoutes);

/** Chatbot routes (AI chat endpoint) */
app.use('/api/chatbot', chatbotRoutes);

/** Product routes (listing, search, details) */
app.use('/api/products', productRoutes);

/** Order routes (place order, my-orders, order lookup) */
app.use('/api/orders', orderRoutes);

/** Payment routes (Razorpay create-order, verify) */
app.use('/api/payment', paymentRoutes);

/** Category routes (public — product filters) */
app.use('/api/categories', categoryRoutes);

/** Admin routes (dashboard, stats, manage products/users/orders) */
app.use('/api/admin', adminRoutes);

// ─────────────────────────────────────────────────────────────────────
// ERROR HANDLING
// ─────────────────────────────────────────────────────────────────────

/** 404 handler for undefined routes */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

/** Global error handler */
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ─────────────────────────────────────────────────────────────────────
// SERVERLESS HANDLER EXPORT
// ─────────────────────────────────────────────────────────────────────
// Vercel calls this function for every incoming request.
// We connect to MongoDB first (cached), then delegate to Express.

module.exports = async (req, res) => {
  try {
    // Skip DB connection for basic health checks and root endpoint
    if ((req.url === '/api' || req.url === '/') && req.method === 'GET') {
      return app(req, res);
    }

    // Skip DB connection for OPTIONS preflight
    if (req.method === 'OPTIONS') {
      return app(req, res);
    }

    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('❌ Serverless handler error:', error.message);
    console.error('Stack:', error.stack);

    // Return detailed error for debugging
    res.status(500).json({
      success: false,
      message: 'Server initialization failed. Please try again.',
      error: error.message,
      hint: getErrorHint(error.message),
    });
  }
};

/**
 * Returns a human-readable hint based on common error patterns.
 */
function getErrorHint(errorMsg) {
  const msg = (errorMsg || '').toLowerCase();

  if (msg.includes('mongodb_uri') || msg.includes('not set')) {
    return 'Add MONGODB_URI in Vercel Dashboard → Project Settings → Environment Variables, then redeploy.';
  }
  if (msg.includes('authentication failed') || msg.includes('auth')) {
    return 'Check your MongoDB username/password in the MONGODB_URI connection string. Avoid special characters in password.';
  }
  if (msg.includes('getaddrinfo') || msg.includes('network') || msg.includes('timed out')) {
    return 'MongoDB Atlas IP whitelist issue. Go to Atlas → Network Access → Add 0.0.0.0/0 to allow all IPs.';
  }
  if (msg.includes('econnrefused')) {
    return 'Cannot reach MongoDB server. Make sure you are using mongodb+srv:// (Atlas) not localhost.';
  }
  return 'Check Vercel function logs: Vercel Dashboard → Deployments → Latest → Functions tab → Click function → View logs.';
}
