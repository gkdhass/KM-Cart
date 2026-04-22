/**
 * @file server/server.js
 * @description Main Express server entry point for K_M_Cart backend.
 * Configures middleware, connects to MongoDB, registers all API routes,
 * and starts the HTTP server.
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

/** Enable CORS — production: restrict to CLIENT_URL origins, dev: allow all */
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((url) => url.trim())
  : [];

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
      }
    : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

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
  res.status(200).json({
    success: true,
    message: 'K_M_Cart API is running! 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
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
 * Connect to MongoDB and start the Express server.
 * Server only starts after successful DB connection.
 */
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Seed default categories if none exist
    await seedDefaultCategories();

    // Start Express server
    app.listen(PORT, () => {
      console.log('\n═══════════════════════════════════════════════');
      console.log('  🚀 K_M_Cart Server is running!');
      console.log('═══════════════════════════════════════════════');
      console.log(`  🌐 URL:         http://localhost:${PORT}`);
      console.log(`  📡 API Base:    http://localhost:${PORT}/api`);
      console.log(`  🏥 Health:      http://localhost:${PORT}/api/health`);
      console.log(`  🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('═══════════════════════════════════════════════\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
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
