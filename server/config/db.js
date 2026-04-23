/**
 * @file server/config/db.js
 * @description MongoDB connection configuration using Mongoose.
 * Connects to MongoDB using the URI from environment variables.
 * Includes connection caching for serverless, retry logic, and
 * proper error handling (no process.exit — safe for serverless + Render).
 */

const mongoose = require('mongoose');

/** Cache the connection promise to avoid duplicate connections */
let cachedConnection = null;

/**
 * Connects to MongoDB database.
 * Uses MONGODB_URI from environment variables.
 * Safe for both traditional servers (Render) and serverless (Vercel).
 *
 * Features:
 * - Connection caching (reuses existing connection)
 * - Configurable timeouts for cloud environments
 * - No process.exit() — lets the caller handle failures
 *
 * @returns {Promise<mongoose.Connection>} The mongoose connection
 * @throws {Error} If connection fails (caller should handle)
 */
const connectDB = async () => {
  // Return cached connection if already connected
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  // Validate env var before attempting connection
  if (!process.env.MONGODB_URI) {
    throw new Error(
      'MONGODB_URI environment variable is not set. ' +
      'Add it in your hosting dashboard (Render/Vercel) → Environment Variables.'
    );
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Performance: disable command buffering for serverless
      bufferCommands: false,
      // Connection pool settings
      maxPoolSize: 10,
      minPoolSize: 2,
      // Timeouts for cloud environments (Atlas can be slow on first connect)
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      // Heartbeat to keep connection alive
      heartbeatFrequencyMS: 30000,
    });

    cachedConnection = conn;

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Mongoose will auto-reconnect.');
      cachedConnection = null;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected successfully');
    });

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    cachedConnection = null;
    // DO NOT call process.exit() — let the caller handle the error
    // In serverless: the request will get a 500 response
    // In Render: the server will retry on next request
    throw error;
  }
};

/**
 * Returns the current MongoDB connection state.
 * Useful for health check endpoints.
 * @returns {'connected'|'connecting'|'disconnected'|'disconnecting'}
 */
const getConnectionState = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] || 'unknown';
};

module.exports = connectDB;
module.exports.getConnectionState = getConnectionState;
