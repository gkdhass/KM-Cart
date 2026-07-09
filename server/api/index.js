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
const path = require('path');

// Load .env for local testing (Vercel ignores this in production)
// Adjust path to point to parent directory where .env is located
dotenv.config({ path: path.resolve(__dirname, '../.env') });

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
// Production-ready CORS setup for Vercel
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
  : [];

// Development fallback
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:5173', 'http://localhost:3000');
}

// CRITICAL: Always allow both frontend Vercel domains explicitly
// (handles case where CLIENT_URL might not be set or is pointing at wrong domain)
const vercelFrontendDomains = [
  'https://kmcart.vercel.app',      // Frontend domain (no hyphen)
  'https://km-cart.vercel.app'      // Backend domain (with hyphen) - allow for testing
];

allowedOrigins.push(...vercelFrontendDomains);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, health checks)
    if (!origin) return callback(null, true);
    
    // Check against whitelist (includes CLIENT_URL + Vercel domains)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Fallback: Allow any *.vercel.app subdomain (dev/preview deployments)
    if (origin && origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    console.warn(`⚠️ CORS blocked: ${origin}`);
    console.warn(`   Allowed origins: ${allowedOrigins.join(', ')}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Handle OPTIONS preflight explicitly — CRITICAL for Vercel serverless
app.options('*', cors(corsOptions));

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
let isConnecting = false; // Prevents race condition on concurrent requests

const connectDB = async () => {
  // 1. Return early if already connected
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('[DB] ✅ Using cached MongoDB connection');
    return cachedConnection;
  }

  // 2. If another request is currently connecting, wait for it
  if (isConnecting) {
    console.log('[DB] ⏳ Waiting for in-progress connection...');
    // Wait for the connection to complete (max 15 seconds)
    const maxWaitTime = 15000;
    const startTime = Date.now();
    while (isConnecting && Date.now() - startTime < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, 100));
      if (mongoose.connection.readyState === 1) {
        console.log('[DB] ✅ In-progress connection completed');
        return mongoose.connection;
      }
    }
    // If still connecting after timeout, proceed with new connection attempt
    console.warn('[DB] ⚠️ Connection wait timeout, attempting new connection');
  }

  // 3. Verify the env var exists before attempting connection
  if (!process.env.MONGODB_URI) {
    throw new Error(
      'MONGODB_URI environment variable is not set. ' +
      'Add it in Vercel Dashboard → Project Settings → Environment Variables.'
    );
  }

  try {
    isConnecting = true;
    console.log('[DB] 🔄 Establishing new MongoDB connection...');

    // Mongoose connection options optimized for serverless
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // CRITICAL: Don't buffer commands during connection
      bufferCommands: false,
      
      // Connection pool settings (smaller for serverless)
      maxPoolSize: 10,
      minPoolSize: 1,
      
      // Timeout settings for serverless (faster failures)
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000,
      
      // Connection management
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
      
      // Automatically retry initial connection
      retryWrites: true,
      retryReads: true,
    });

    // Wait for connection to fully establish before accessing properties
    await mongoose.connection.asPromise();

    cachedConnection = conn;
    isConnecting = false;

    // Access connection properties AFTER connection is fully established
    const host = mongoose.connection.host || 'unknown';
    const dbName = mongoose.connection.name || mongoose.connection.db?.databaseName || 'unknown';
    
    console.log(`[DB] ✅ MongoDB Connected: ${host}`);
    console.log(`[DB] 📦 Database: ${dbName}`);
    
    return conn;
  } catch (error) {
    console.error('[DB ERROR] ❌ MongoDB Connection Failed:', error.message);
    cachedConnection = null;
    isConnecting = false;
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
    message: "KM Cart API is running",
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
    message: 'K_M_Cart API is running on Vercel!',
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
    // Set serverless-specific headers
    res.setHeader('X-Powered-By', 'Vercel');
    
    // Skip DB connection for basic health checks and root endpoint
    const skipDBRoutes = ['/', '/api', '/api/health'];
    const isHealthCheck = skipDBRoutes.includes(req.url) && req.method === 'GET';
    
    // Skip DB connection for OPTIONS preflight
    const isPreflight = req.method === 'OPTIONS';

    // Connect to MongoDB for all other requests
    if (!isHealthCheck && !isPreflight) {
      await connectDB();
    }
    
    // Delegate request to Express app
    return app(req, res);
    
  } catch (error) {
    console.error('❌ Serverless handler error:', error.message);
    console.error('Stack:', error.stack);

    // Return detailed error for debugging
    return res.status(500).json({
      success: false,
      message: 'Server initialization failed. Please try again.',
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      hint: getErrorHint(error.message),
      timestamp: new Date().toISOString()
    });
  }
};

// Also export the app for local testing
module.exports.app = app;

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
