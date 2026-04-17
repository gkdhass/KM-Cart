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
 */

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// ─────────────────────────────────────────────────────────────────────
// Import route modules (relative to server/ directory)
// ─────────────────────────────────────────────────────────────────────
const authRoutes = require('../routes/authRoutes');
const chatbotRoutes = require('../routes/chatbotRoutes');
const productRoutes = require('../routes/productRoutes');
const orderRoutes = require('../routes/orderRoutes');
const paymentRoutes = require('../routes/paymentRoutes');
const adminRoutes = require('../routes/adminRoutes');

// ─────────────────────────────────────────────────────────────────────
// EXPRESS APP SETUP
// ─────────────────────────────────────────────────────────────────────
const app = express();

// ── CORS Configuration ──────────────────────────────────────────────
// Allow requests from the frontend domain in production.
// Also allow requests with no origin (Postman, curl, mobile apps).
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman, health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // In production, still allow if CLIENT_URL isn't set yet (first deploy)
    if (!process.env.CLIENT_URL) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body Parsers ────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────────────────────────
// CACHED MONGODB CONNECTION (Critical for Serverless Performance)
// ─────────────────────────────────────────────────────────────────────
// Vercel serverless functions are stateless, but the runtime may reuse
// the same container across invocations ("warm starts"). We cache the
// connection to avoid reconnecting on every single request.

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
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
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = conn.connections[0].readyState === 1;
    console.log('✅ MongoDB Connected:', conn.connection.host);
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    // Reset so next invocation retries
    isConnected = false;
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
      admin: "/api/admin"
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
    dbConnected: isConnected,
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

    await connectDB();
    return app(req, res);
  } catch (error) {
    console.error('❌ Serverless handler error:', error.message);
    console.error('Stack:', error.stack);

    // Return detailed error in non-production for debugging
    res.status(500).json({
      success: false,
      message: 'Server initialization failed. Please try again.',
      // Show real error details to help debug (remove in production later)
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
