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
let isConnecting = false; // Prevents race condition on concurrent requests

/**
 * Connects to MongoDB database.
 * Uses MONGODB_URI from environment variables.
 * Safe for both traditional servers (Render) and serverless (Vercel).
 *
 * Features:
 * - Connection caching (reuses existing connection)
 * - Race condition protection (prevents multiple simultaneous connections)
 * - Configurable timeouts for cloud environments
 * - No process.exit() — lets the caller handle failures
 *
 * @returns {Promise<mongoose.Connection>} The mongoose connection
 * @throws {Error} If connection fails (caller should handle)
 */
const connectDB = async () => {
  // 1. Return cached connection if already connected
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('✅ Using cached MongoDB connection');
    return cachedConnection;
  }

  // 2. If another request is currently connecting, wait for it
  if (isConnecting) {
    console.log('⏳ Waiting for in-progress connection...');
    const maxWaitTime = 15000;
    const startTime = Date.now();
    while (isConnecting && Date.now() - startTime < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, 100));
      if (mongoose.connection.readyState === 1) {
        console.log('✅ In-progress connection completed');
        return mongoose.connection;
      }
    }
    console.warn('⚠️ Connection wait timeout, attempting new connection');
  }

  // 3. Validate env var before attempting connection
  if (!process.env.MONGODB_URI) {
    throw new Error(
      'MONGODB_URI environment variable is not set. ' +
      'Add it in your hosting dashboard (Render/Vercel) → Environment Variables.'
    );
  }

  try {
    isConnecting = true;
    console.log('🔄 Establishing new MongoDB connection...');

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Performance: buffer commands while connecting (wait for connection)
      bufferCommands: true,
      // Connection pool settings
      maxPoolSize: 10,
      minPoolSize: 2,
      // Timeouts for cloud environments (Atlas can be slow on first connect)
      serverSelectionTimeoutMS: 15000,  // Increased to 15s for initial connection
      socketTimeoutMS: 45000,
      // Heartbeat to keep connection alive
      heartbeatFrequencyMS: 30000,
    });

    // Wait for connection to fully establish before accessing properties
    await mongoose.connection.asPromise();

    cachedConnection = conn;
    isConnecting = false;

    // Access connection properties AFTER connection is fully established
    const host = mongoose.connection.host || 'unknown';
    const dbName = mongoose.connection.name || mongoose.connection.db?.databaseName || 'unknown';

    console.log(`✅ MongoDB Connected: ${host}`);
    console.log(`📦 Database: ${dbName}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Mongoose will auto-reconnect.');
      cachedConnection = null;
      isConnecting = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected successfully');
    });

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    cachedConnection = null;
    isConnecting = false;
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
