/**
 * @file server/server.js
 * @description Main Express server entry point for K_M_Cart backend.
 * Configures middleware, connects to MongoDB, registers all API routes,
 * and starts the HTTP server.
 *
 * Works for both local development and Render deployment.
 * For Vercel serverless, see server/api/index.js instead.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

// Import database connection
const connectDB = require('./config/db');

// Import route modules
const authRoutes = require('./routes/authRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

// ─────────────────────────────────────────────────────────────────────
// APP INITIALIZATION
// ─────────────────────────────────────────────────────────────────────

const app = express();
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────

/**
 * CORS Configuration
 * - Production: restrict to CLIENT_URL origins (comma-separated)
 * - Development: allow all origins
 * - Always allow requests with no origin (mobile apps, curl, Postman)
 */
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
  : [];

// Always include localhost for development
if (!allowedOrigins.includes('http://localhost:5173')) {
  allowedOrigins.push('http://localhost:5173');
}
if (!allowedOrigins.includes('http://localhost:3000')) {
  allowedOrigins.push('http://localhost:3000');
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman, health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    console.warn(`⚠️ CORS blocked origin: ${origin}`);
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

/** Parse incoming JSON request bodies (limit to 10mb) */
app.use(express.json({ limit: '10mb' }));

/** Parse URL-encoded form data */
app.use(express.urlencoded({ extended: true }));

/** Request logging middleware (development only) */
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// ─────────────────────────────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────────────────────────────

/** Health check endpoint */
app.get('/api/health', (req, res) => {
  const { getConnectionState } = require('./config/db');
  res.status(200).json({
    success: true,
    message: 'K_M_Cart API is running! 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: getConnectionState(),
  });
});

/** Authentication routes (register, login) */
app.use('/api/auth', authRoutes);

/** Chatbot routes (main AI chat endpoint) */
app.use('/api/chatbot', chatbotRoutes);

/** Product routes (listing, details) */
app.use('/api/products', productRoutes);

/** Order routes (my-orders, order lookup) */
app.use('/api/orders', orderRoutes);

/** Payment routes (Razorpay create-order, verify) */
app.use('/api/payment', paymentRoutes);

/** Category routes (public — product filters) */
app.use('/api/categories', categoryRoutes);

/** Admin routes (dashboard, products, orders, users, categories, analytics) */
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
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ─────────────────────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────────────────────

/**
 * Validate required environment variables on startup.
 * Logs warnings for missing vars instead of crashing.
 */
function validateEnv() {
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  const optional = ['CLIENT_URL', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];
  const missing = required.filter((key) => !process.env[key]);
  const missingOptional = optional.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`❌ FATAL: Missing required env vars: ${missing.join(', ')}`);
    console.error('   Add them to .env (local) or hosting dashboard (production)');
  }

  if (missingOptional.length > 0) {
    console.warn(`⚠️  Missing optional env vars: ${missingOptional.join(', ')}`);
  }

  return missing.length === 0;
}

/**
 * Connect to MongoDB and start the Express server.
 * WAITS for MongoDB connection before accepting requests.
 * Exits with clear error if connection fails.
 */
const startServer = async () => {
  // Validate environment
  const envValid = validateEnv();
  if (!envValid) {
    console.error('❌ Fix environment variables before deploying to production.');
    process.exit(1);
  }

  console.log('🔄 Connecting to MongoDB...');
  
  try {
    // Connect to MongoDB with timeout
    const connectionPromise = connectDB();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout after 15 seconds')), 15000)
    );
    
    await Promise.race([connectionPromise, timeoutPromise]);
    
    console.log('✅ MongoDB connection established');

    // Seed default categories if none exist (non-blocking)
    seedDefaultCategories().catch((err) =>
      console.warn('⚠️  Category seeding skipped:', err.message)
    );

    // Start Express server ONLY AFTER DB connected
    app.listen(PORT, () => {
      console.log('\n═══════════════════════════════════════════════');
      console.log('  🚀 K_M_Cart Server is running!');
      console.log('═══════════════════════════════════════════════');
      console.log(`  🌐 URL:         http://localhost:${PORT}`);
      console.log(`  📡 API Base:    http://localhost:${PORT}/api`);
      console.log(`  🏥 Health:      http://localhost:${PORT}/api/health`);
      console.log(`  🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  🔗 Client URL:  ${process.env.CLIENT_URL || 'not set'}`);
      console.log('═══════════════════════════════════════════════\n');
    });

  } catch (error) {
    console.error('\n❌ FATAL: Failed to connect to MongoDB');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`   Error: ${error.message}`);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (error.message?.includes('IP') || error.message?.includes('whitelist')) {
      console.error('   🔧 FIX: Whitelist your IP in MongoDB Atlas');
      console.error('   1. Go to: https://cloud.mongodb.com');
      console.error('   2. Click "Network Access" (left sidebar)');
      console.error('   3. Click "+ ADD IP ADDRESS"');
      console.error('   4. Click "ADD CURRENT IP ADDRESS"');
      console.error('   5. Click "Confirm" and wait 2-3 minutes\n');
    } else if (error.message?.includes('timeout')) {
      console.error('   🔧 FIX: Connection timeout - check your internet connection');
      console.error('   Or: MongoDB Atlas may be slow - try again in a moment\n');
    } else if (error.message?.includes('authentication') || error.message?.includes('credentials')) {
      console.error('   🔧 FIX: Check your MONGODB_URI credentials in .env');
      console.error('   Format: mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/\n');
    } else {
      console.error('   🔧 FIX: Check your MONGODB_URI in .env file');
      console.error('   Current URI: ' + (process.env.MONGODB_URI ? '[set]' : '[not set]') + '\n');
    }
    
    console.error('   Server will NOT start until MongoDB connection succeeds.');
    console.error('   Fix the issue above and restart the server.\n');
    process.exit(1);
  }
};

/**
 * Seed default grocery categories if the Category collection is empty.
 * Runs once on first server start.
 */
async function seedDefaultCategories() {
  try {
    const Category = require('./models/Category');
    const count = await Category.countDocuments();
    if (count > 0) return; // Already seeded

    const defaultCategories = [
      { name: 'Oil', description: 'Cooking oils and ghee', order: 1 },
      { name: 'Masala', description: 'Ground spice mixes and masala powders', order: 2 },
      { name: 'Rice & Grains', description: 'Rice, wheat, millets and grains', order: 3 },
      { name: 'Pulses & Dal', description: 'Lentils, chickpeas and dals', order: 4 },
      { name: 'Spices', description: 'Whole spices and seasonings', order: 5 },
      { name: 'Sugar & Sweeteners', description: 'Sugar, jaggery and sweeteners', order: 6 },
      { name: 'Beverages', description: 'Tea, coffee and drink mixes', order: 7 },
      { name: 'Household & Cleaning', description: 'Cleaning supplies and household items', order: 8 },
      { name: 'Packaged & Ready', description: 'Ready-to-eat and packaged foods', order: 9 },
      { name: 'Dairy', description: 'Milk, curd, paneer and dairy products', order: 10 },
      { name: 'Snacks', description: 'Chips, namkeen and snack items', order: 11 },
      { name: 'Biscuits & Cookies', description: 'Biscuits, cookies and crackers', order: 12 },
      { name: 'Chocolates', description: 'Chocolates and confectionery', order: 13 },
      { name: 'Juices & Drinks', description: 'Fruit juices and soft drinks', order: 14 },
      { name: 'Dry Fruits & Nuts', description: 'Almonds, cashews, raisins and nuts', order: 15 },
      { name: 'Pickles & Sauces', description: 'Pickles, sauces, jams and condiments', order: 16 },
      { name: 'Personal Care', description: 'Soaps, shampoo and personal hygiene', order: 17 },
    ];

    await Category.insertMany(defaultCategories);
    console.log(`  📦 Seeded ${defaultCategories.length} default categories`);
  } catch (error) {
    console.error('⚠️  Category seeding failed (non-fatal):', error.message);
  }
}

startServer();
